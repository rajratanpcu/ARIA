package com.aria.devops.repository;

import com.aria.devops.model.ModuleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, String> {
    Optional<ModuleEntity> findByName(String name);
}
