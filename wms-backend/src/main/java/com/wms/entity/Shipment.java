package com.wms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "shipments")
public class Shipment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String referenceNumber;

    private String supplier;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status = ShipmentStatus.RECEIVED;

    private LocalDateTime receivedAt = LocalDateTime.now();

    @JsonIgnore
    @OneToMany(mappedBy = "shipment", cascade = CascadeType.ALL)
    private List<ShipmentLine> lines;

    public enum ShipmentStatus {
        RECEIVED, PUTAWAY_IN_PROGRESS, PUTAWAY_COMPLETE
    }
}
