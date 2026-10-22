package com.aria.devops.repository;

import com.aria.devops.model.IncidentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<IncidentEntity, String> {
    List<IncidentEntity> findByStatus(String status);
}
