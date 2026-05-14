package com.wms.controller;

import com.wms.dto.WmsDto.DashboardStats;
import com.wms.entity.Warehouse;
import com.wms.repository.WarehouseRepository;
import com.wms.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class WarehouseDashboardController {

    private final WarehouseRepository warehouseRepo;
    private final DashboardService dashboardService;

    @Transactional(readOnly = true)
    @GetMapping("/api/warehouses")
    public ResponseEntity<List<Warehouse>> getAll() {
        return ResponseEntity.ok(warehouseRepo.findAll());
    }

    @Transactional
    @PostMapping("/api/warehouses")
    public ResponseEntity<Warehouse> create(@RequestBody Warehouse warehouse) {
        return ResponseEntity.ok(warehouseRepo.save(warehouse));
    }

    @GetMapping("/api/dashboard")
    public ResponseEntity<DashboardStats> dashboard() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}
