package com.wms.service;

import com.wms.dto.WmsDto.*;
import com.wms.entity.*;
import com.wms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReceivingService {

    private final ShipmentRepository shipmentRepo;
    private final InventoryItemRepository itemRepo;
    private final BinRepository binRepo;

    @Transactional
    public ShipmentResponse receiveShipment(ShipmentRequest req) {
        Shipment shipment = new Shipment();
        shipment.setReferenceNumber(req.getReferenceNumber());
        shipment.setSupplier(req.getSupplier());

        List<ShipmentLine> lines = new ArrayList<>();
        List<PutawayResult> putawayResults = new ArrayList<>();

        for (ShipmentLineRequest lineReq : req.getLines()) {
            ShipmentLine line = new ShipmentLine();
            line.setShipment(shipment);
            line.setSku(lineReq.getSku());
            line.setItemName(lineReq.getItemName());
            line.setQuantity(lineReq.getQuantity());
            lines.add(line);

            String assignedBin = putaway(lineReq.getSku(), lineReq.getItemName(), lineReq.getQuantity());

            PutawayResult result = new PutawayResult();
            result.setSku(lineReq.getSku());
            result.setQuantity(lineReq.getQuantity());
            result.setAssignedBin(assignedBin);
            putawayResults.add(result);
        }

        shipment.setLines(lines);
        shipment.setStatus(Shipment.ShipmentStatus.PUTAWAY_COMPLETE);
        shipmentRepo.save(shipment);

        ShipmentResponse response = new ShipmentResponse();
        response.setId(shipment.getId());
        response.setReferenceNumber(shipment.getReferenceNumber());
        response.setSupplier(shipment.getSupplier());
        response.setStatus(shipment.getStatus().name());
        response.setReceivedAt(shipment.getReceivedAt());
        response.setPutawayResults(putawayResults);
        return response;
    }

    private String putaway(String sku, String itemName, int qty) {
        List<Bin> available = binRepo.findAvailableBins(qty);
        Bin bin = available.isEmpty() ? null : available.get(0);

        InventoryItem item = itemRepo.findBySku(sku).orElseGet(() -> {
            InventoryItem newItem = new InventoryItem();
            newItem.setSku(sku);
            newItem.setName(itemName);
            newItem.setQuantity(0);
            newItem.setBarcodeData("SKU:" + sku);
            return newItem;
        });

        item.setQuantity(item.getQuantity() + qty);

        if (bin != null) {
            bin.setCurrentLoad(bin.getCurrentLoad() + qty);
            item.setBin(bin);
            binRepo.save(bin);
            itemRepo.save(item);
            return bin.getLabel();
        }

        itemRepo.save(item);
        return "UNASSIGNED";
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepo.findAll().stream().map(s -> {
            ShipmentResponse r = new ShipmentResponse();
            r.setId(s.getId());
            r.setReferenceNumber(s.getReferenceNumber());
            r.setSupplier(s.getSupplier());
            r.setStatus(s.getStatus().name());
            r.setReceivedAt(s.getReceivedAt());
            return r;
        }).toList();
    }
}
