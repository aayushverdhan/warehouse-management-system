package com.wms.service;

import com.wms.dto.WmsDto.*;
import com.wms.entity.*;
import com.wms.entity.Order.OrderStatus;
import com.wms.repository.InventoryItemRepository;
import com.wms.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final InventoryItemRepository itemRepo;

    private static final Map<OrderStatus, OrderStatus> TRANSITIONS = Map.of(
            OrderStatus.PENDING, OrderStatus.PICKING,
            OrderStatus.PICKING, OrderStatus.PACKED,
            OrderStatus.PACKED, OrderStatus.SHIPPED
    );

    @Transactional
    public OrderResponse createOrder(OrderRequest req) {
        if (orderRepo.findByOrderNumber(req.getOrderNumber()).isPresent()) {
            throw new IllegalArgumentException("Order number already exists: " + req.getOrderNumber());
        }

        Order order = new Order();
        order.setOrderNumber(req.getOrderNumber());

        List<OrderLine> lines = req.getLines().stream().map(lineReq -> {
            InventoryItem item = itemRepo.findByIdForUpdate(lineReq.getItemId())
                    .orElseThrow(() -> new IllegalArgumentException("Item not found: " + lineReq.getItemId()));
            if (item.getQuantity() < lineReq.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for SKU: " + item.getSku());
            }
            item.setQuantity(item.getQuantity() - lineReq.getQuantity());
            itemRepo.save(item);

            OrderLine line = new OrderLine();
            line.setOrder(order);
            line.setItem(item);
            line.setQuantity(lineReq.getQuantity());
            return line;
        }).toList();

        order.setLines(lines);
        return toResponse(orderRepo.save(order));
    }

    @Transactional
    public OrderResponse advanceStatus(Long orderId) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        OrderStatus next = TRANSITIONS.get(order.getStatus());
        if (next == null) throw new IllegalStateException("Order already in terminal state: " + order.getStatus());
        order.setStatus(next);
        order.setUpdatedAt(LocalDateTime.now());
        return toResponse(orderRepo.save(order));
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long id) {
        return orderRepo.findById(id).map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    private OrderResponse toResponse(Order order) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setOrderNumber(order.getOrderNumber());
        r.setStatus(order.getStatus());
        r.setCreatedAt(order.getCreatedAt());
        r.setUpdatedAt(order.getUpdatedAt());
        if (order.getLines() != null) {
            r.setLines(order.getLines().stream().map(l -> {
                OrderLineResponse lr = new OrderLineResponse();
                lr.setSku(l.getItem().getSku());
                lr.setItemName(l.getItem().getName());
                lr.setQuantity(l.getQuantity());
                if (l.getItem().getBin() != null) lr.setBinLabel(l.getItem().getBin().getLabel());
                return lr;
            }).toList());
        }
        return r;
    }
}
