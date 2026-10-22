package com.aria.devops.repository;

import com.aria.devops.model.AuditEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditEventRepository extends JpaRepository<AuditEventEntity, String> {
    List<AuditEventEntity> findAllByOrderByTimestampDesc();
    List<AuditEventEntity> findByCategoryOrderByTimestampDesc(String category);
}
