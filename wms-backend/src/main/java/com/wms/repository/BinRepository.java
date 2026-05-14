package com.wms.repository;

import com.wms.entity.Bin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface BinRepository extends JpaRepository<Bin, Long> {
    @Query("SELECT b FROM Bin b WHERE (b.capacity - b.currentLoad) >= :qty ORDER BY (b.capacity - b.currentLoad) ASC")
    List<Bin> findAvailableBins(int qty);
}
