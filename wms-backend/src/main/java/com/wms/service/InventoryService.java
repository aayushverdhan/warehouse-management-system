package com.wms.service;

import com.wms.dto.WmsDto.*;
import com.wms.entity.InventoryItem;
import com.wms.repository.BinRepository;
import com.wms.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository itemRepo;
    private final BinRepository binRepo;
    private final BarcodeService barcodeService;

    @Transactional
    public InventoryResponse createItem(InventoryRequest req) {
        if (itemRepo.findBySku(req.getSku()).isPresent()) {
            throw new IllegalArgumentException("SKU already exists: " + req.getSku());
        }
        InventoryItem item = new InventoryItem();
        item.setSku(req.getSku());
        item.setName(req.getName());
        item.setQuantity(req.getQuantity());
        item.setBarcodeData("SKU:" + req.getSku());
        itemRepo.save(item);
        return toResponse(item);
    }

    @Transactional
    public InventoryResponse adjustStock(StockAdjustRequest req) {
        InventoryItem item = itemRepo.findByIdForUpdate(req.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Item not found: " + req.getItemId()));
        int newQty = item.getQuantity() + req.getDelta();
        if (newQty < 0) throw new IllegalStateException("Insufficient stock for item: " + item.getSku());
        item.setQuantity(newQty);
        return toResponse(itemRepo.save(item));
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getAllItems() {
        return itemRepo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponse getItemBySku(String sku) {
        return itemRepo.findBySku(sku)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalArgumentException("SKU not found: " + sku));
    }

    public String getQrCode(String sku) {
        itemRepo.findBySku(sku).orElseThrow(() -> new IllegalArgumentException("SKU not found: " + sku));
        return barcodeService.generateQrBase64("SKU:" + sku);
    }

    private InventoryResponse toResponse(InventoryItem item) {
        InventoryResponse r = new InventoryResponse();
        r.setId(item.getId());
        r.setSku(item.getSku());
        r.setName(item.getName());
        r.setQuantity(item.getQuantity());
        r.setBarcodeData(item.getBarcodeData());
        if (item.getBin() != null) r.setBinLabel(item.getBin().getLabel());
        return r;
    }
}
