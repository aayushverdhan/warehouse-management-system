package com.wms.dto;

import com.wms.entity.Order.OrderStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

public class WmsDto {

    @Data
    public static class InventoryRequest {
        @NotBlank private String sku;
        @NotBlank private String name;
        @Min(1) private int quantity;
    }

    @Data
    public static class InventoryResponse {
        private Long id;
        private String sku;
        private String name;
        private int quantity;
        private String barcodeData;
        private String binLabel;
    }

    @Data
    public static class StockAdjustRequest {
        @NotNull private Long itemId;
        @NotNull private int delta; // positive = add, negative = remove
    }

    @Data
    public static class OrderRequest {
        @NotBlank private String orderNumber;
        @NotNull private List<OrderLineRequest> lines;
    }

    @Data
    public static class OrderLineRequest {
        @NotNull private Long itemId;
        @Min(1) private int quantity;
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private String orderNumber;
        private OrderStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<OrderLineResponse> lines;
    }

    @Data
    public static class OrderLineResponse {
        private String sku;
        private String itemName;
        private int quantity;
        private String binLabel;
    }

    @Data
    public static class ShipmentRequest {
        @NotBlank private String referenceNumber;
        private String supplier;
        @NotNull private List<ShipmentLineRequest> lines;
    }

    @Data
    public static class ShipmentLineRequest {
        @NotBlank private String sku;
        @NotBlank private String itemName;
        @Min(1) private int quantity;
    }

    @Data
    public static class ShipmentResponse {
        private Long id;
        private String referenceNumber;
        private String supplier;
        private String status;
        private LocalDateTime receivedAt;
        private List<PutawayResult> putawayResults;
    }

    @Data
    public static class PutawayResult {
        private String sku;
        private int quantity;
        private String assignedBin;
    }

    @Data
    public static class DashboardStats {
        private long totalWarehouses;
        private long totalItems;
        private long totalOrders;
        private long pendingOrders;
        private long shippedOrders;
    }
}
