package com.aria.devops.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "incidents")
public class IncidentEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 256)
    private String title;

    @Column(nullable = false, length = 32)
    private String severity;

    @Column(name = "affected_release_id", length = 64)
    private String affectedReleaseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "implicated_module_id")
    private ModuleEntity implicatedModule;

    @Column(nullable = false, length = 32)
    private String status = "investigating";

    @Column(name = "scenario_type", nullable = false, length = 64)
    private String scenarioType;

    @Column(name = "ira_confidence", precision = 4, scale = 3, nullable = false)
    private BigDecimal iraConfidence = BigDecimal.ZERO;

    @Column(name = "afp_signal_sent", nullable = false)
    private Boolean afpSignalSent = false;

    @Column(name = "detected_at")
    private OffsetDateTime detectedAt = OffsetDateTime.now();

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    public IncidentEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getAffectedReleaseId() { return affectedReleaseId; }
    public void setAffectedReleaseId(String affectedReleaseId) { this.affectedReleaseId = affectedReleaseId; }

    public ModuleEntity getImplicatedModule() { return implicatedModule; }
    public void setImplicatedModule(ModuleEntity implicatedModule) { this.implicatedModule = implicatedModule; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getScenarioType() { return scenarioType; }
    public void setScenarioType(String scenarioType) { this.scenarioType = scenarioType; }

    public BigDecimal getIraConfidence() { return iraConfidence; }
    public void setIraConfidence(BigDecimal iraConfidence) { this.iraConfidence = iraConfidence; }

    public Boolean getAfpSignalSent() { return afpSignalSent; }
    public void setAfpSignalSent(Boolean afpSignalSent) { this.afpSignalSent = afpSignalSent; }

    public OffsetDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(OffsetDateTime detectedAt) { this.detectedAt = detectedAt; }

    public OffsetDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(OffsetDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
