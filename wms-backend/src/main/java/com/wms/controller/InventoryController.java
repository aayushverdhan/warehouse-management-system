package com.wms.controller;

import com.wms.dto.WmsDto.*;
import com.wms.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    public ResponseEntity<InventoryResponse> create(@Valid @RequestBody InventoryRequest req) {
        return ResponseEntity.ok(inventoryService.createItem(req));
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll() {
        return ResponseEntity.ok(inventoryService.getAllItems());
    }

    @GetMapping("/sku/{sku}")
    public ResponseEntity<InventoryResponse> getBySku(@PathVariable String sku) {
        return ResponseEntity.ok(inventoryService.getItemBySku(sku));
    }

    @PatchMapping("/adjust")
    public ResponseEntity<InventoryResponse> adjust(@Valid @RequestBody StockAdjustRequest req) {
        return ResponseEntity.ok(inventoryService.adjustStock(req));
    }

    @GetMapping("/qr/{sku}")
    public ResponseEntity<String> getQr(@PathVariable String sku) {
        return ResponseEntity.ok(inventoryService.getQrCode(sku));
    }
}
