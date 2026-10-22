package com.aria.devops.repository;

import com.aria.devops.model.AfpMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AfpMessageRepository extends JpaRepository<AfpMessageEntity, String> {
    List<AfpMessageEntity> findAllByOrderByTimestampDesc();
}
