package com.wms.controller;

import com.wms.dto.WmsDto.*;
import com.wms.service.ReceivingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/shipments")
@RequiredArgsConstructor
public class ReceivingController {

    private final ReceivingService receivingService;

    @PostMapping
    public ResponseEntity<ShipmentResponse> receive(@Valid @RequestBody ShipmentRequest req) {
        return ResponseEntity.ok(receivingService.receiveShipment(req));
    }

    @GetMapping
    public ResponseEntity<List<ShipmentResponse>> getAll() {
        return ResponseEntity.ok(receivingService.getAllShipments());
    }
}
