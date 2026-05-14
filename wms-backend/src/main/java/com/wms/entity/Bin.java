package com.wms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
@Table(name = "bins")
public class Bin {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    private int capacity;
    private int currentLoad;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aisle_id", nullable = false)
    private Aisle aisle;

    @JsonIgnore
    @OneToMany(mappedBy = "bin", cascade = CascadeType.ALL)
    private List<InventoryItem> items;

    public boolean hasCapacity(int qty) {
        return (currentLoad + qty) <= capacity;
    }
}
