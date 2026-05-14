package com.wms.service;

import com.wms.dto.WmsDto.DashboardStats;
import com.wms.entity.Order.OrderStatus;
import com.wms.repository.InventoryItemRepository;
import com.wms.repository.OrderRepository;
import com.wms.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WarehouseRepository warehouseRepo;
    private final InventoryItemRepository itemRepo;
    private final OrderRepository orderRepo;

    @Transactional(readOnly = true)
    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();
        stats.setTotalWarehouses(warehouseRepo.count());
        stats.setTotalItems(itemRepo.count());
        stats.setTotalOrders(orderRepo.count());
        stats.setPendingOrders(orderRepo.countByStatus(OrderStatus.PENDING));
        stats.setShippedOrders(orderRepo.countByStatus(OrderStatus.SHIPPED));
        return stats;
    }
}
