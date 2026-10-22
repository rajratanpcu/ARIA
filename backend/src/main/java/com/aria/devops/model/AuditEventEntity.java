package com.aria.devops.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_events")
public class AuditEventEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 32)
    private String category; // BUILD, TEST_SELECTION, RELEASE, DEPLOYMENT, INCIDENT, AFP, GOVERNANCE

    @Column(nullable = false, length = 128)
    private String action;

    @Column(length = 32)
    private String agent;

    @Column(nullable = false, length = 32)
    private String severity = "info";

    @Column(name = "autonomy_level", nullable = false)
    private Integer autonomyLevel = 1;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String details;

    @Column(name = "is_simulated", nullable = false)
    private Boolean isSimulated = false;

    @Column(name = "timestamp")
    private OffsetDateTime timestamp = OffsetDateTime.now();

    public AuditEventEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getAgent() { return agent; }
    public void setAgent(String agent) { this.agent = agent; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public Integer getAutonomyLevel() { return autonomyLevel; }
    public void setAutonomyLevel(Integer autonomyLevel) { this.autonomyLevel = autonomyLevel; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public Boolean getIsSimulated() { return isSimulated; }
    public void setIsSimulated(Boolean isSimulated) { this.isSimulated = isSimulated; }

    public OffsetDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(OffsetDateTime timestamp) { this.timestamp = timestamp; }
}
