package com.aria.devops.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "approvals")
public class ApprovalEntity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "action_type", nullable = false, length = 64)
    private String actionType; // ROLLBACK, BROAD_CACHE_INVALIDATION, RELEASE_HOLD

    @Column(nullable = false, length = 256)
    private String title;

    @Column(name = "requested_by", nullable = false, length = 32)
    private String requestedBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String rationale;

    @Column(precision = 4, scale = 3, nullable = false)
    private BigDecimal confidence;

    @Column(name = "autonomy_level", nullable = false)
    private Integer autonomyLevel = 4;

    @Column(nullable = false, length = 32)
    private String status = "pending"; // pending, approved, rejected

    @Column(name = "reviewer_notes", columnDefinition = "TEXT")
    private String reviewerNotes;

    @Column(name = "resolved_by", length = 128)
    private String resolvedBy;

    @Column(name = "requested_at")
    private OffsetDateTime requestedAt = OffsetDateTime.now();

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    public ApprovalEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getActionType() { return actionType; }
    public void setActionType(String actionType) { this.actionType = actionType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }

    public BigDecimal getConfidence() { return confidence; }
    public void setConfidence(BigDecimal confidence) { this.confidence = confidence; }

    public Integer getAutonomyLevel() { return autonomyLevel; }
    public void setAutonomyLevel(Integer autonomyLevel) { this.autonomyLevel = autonomyLevel; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReviewerNotes() { return reviewerNotes; }
    public void setReviewerNotes(String reviewerNotes) { this.reviewerNotes = reviewerNotes; }

    public String getResolvedBy() { return resolvedBy; }
    public void setResolvedBy(String resolvedBy) { this.resolvedBy = resolvedBy; }

    public OffsetDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(OffsetDateTime requestedAt) { this.requestedAt = requestedAt; }

    public OffsetDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(OffsetDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
