package com.aria.devops.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "modules")
public class ModuleEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "project_id", length = 64)
    private String projectId;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 256)
    private String path;

    @Column(nullable = false, length = 64)
    private String language;

    @Column(nullable = false)
    private Integer loc;

    @Column(name = "current_risk_weight", precision = 4, scale = 3, nullable = false)
    private BigDecimal currentRiskWeight = new BigDecimal("0.300");

    @Column(name = "baseline_risk_weight", precision = 4, scale = 3, nullable = false)
    private BigDecimal baselineRiskWeight = new BigDecimal("0.300");

    @Column(name = "cache_policy", length = 32, nullable = false)
    private String cachePolicy = "standard";

    @Column(name = "cache_status", length = 32, nullable = false)
    private String cacheStatus = "hit";

    @Column(name = "test_count", nullable = false)
    private Integer testCount = 0;

    @ManyToMany
    @JoinTable(
        name = "module_dependencies",
        joinColumns = @JoinColumn(name = "module_id"),
        inverseJoinColumns = @JoinColumn(name = "depends_on_module_id")
    )
    private Set<ModuleEntity> dependencies = new HashSet<>();

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public ModuleEntity() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public Integer getLoc() { return loc; }
    public void setLoc(Integer loc) { this.loc = loc; }

    public BigDecimal getCurrentRiskWeight() { return currentRiskWeight; }
    public void setCurrentRiskWeight(BigDecimal currentRiskWeight) { this.currentRiskWeight = currentRiskWeight; }

    public BigDecimal getBaselineRiskWeight() { return baselineRiskWeight; }
    public void setBaselineRiskWeight(BigDecimal baselineRiskWeight) { this.baselineRiskWeight = baselineRiskWeight; }

    public String getCachePolicy() { return cachePolicy; }
    public void setCachePolicy(String cachePolicy) { this.cachePolicy = cachePolicy; }

    public String getCacheStatus() { return cacheStatus; }
    public void setCacheStatus(String cacheStatus) { this.cacheStatus = cacheStatus; }

    public Integer getTestCount() { return testCount; }
    public void setTestCount(Integer testCount) { this.testCount = testCount; }

    public Set<ModuleEntity> getDependencies() { return dependencies; }
    public void setDependencies(Set<ModuleEntity> dependencies) { this.dependencies = dependencies; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
