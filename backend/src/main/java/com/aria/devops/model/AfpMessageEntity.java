package com.aria.devops.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "afp_messages")
public class AfpMessageEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 32)
    private String type; // AFP-INCIDENT, AFP-ACK, AFP-DECAY, AFP-AUDIT

    @Column(name = "sender_agent", nullable = false, length = 32)
    private String senderAgent;

    @Column(name = "module_id", length = 64)
    private String moduleId;

    @Column(name = "incident_id", length = 64)
    private String incidentId;

    @Column(precision = 4, scale = 3, nullable = false)
    private BigDecimal confidence;

    @Column(name = "previous_weight", precision = 4, scale = 3, nullable = false)
    private BigDecimal previousWeight;

    @Column(name = "new_weight", precision = 4, scale = 3, nullable = false)
    private BigDecimal newWeight;

    @Column(name = "formula_applied", nullable = false, columnDefinition = "TEXT")
    private String formulaApplied;

    @Column(nullable = false, length = 32)
    private String status = "accepted";

    @Column(name = "timestamp")
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public AfpMessageEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSenderAgent() { return senderAgent; }
    public void setSenderAgent(String senderAgent) { this.senderAgent = senderAgent; }

    public String getModuleId() { return moduleId; }
    public void setModuleId(String moduleId) { this.moduleId = moduleId; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }

    public BigDecimal getPreviousWeight() { return previousWeight; }
    public void setPreviousWeight(BigDecimal previousWeight) { this.previousWeight = previousWeight; }

    public BigDecimal getNewWeight() { return newWeight; }
    public void setNewWeight(BigDecimal newWeight) { this.newWeight = newWeight; }

    public String getFormulaApplied() { return formulaApplied; }
    public void setFormulaApplied(String formulaApplied) { this.formulaApplied = formulaApplied; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
