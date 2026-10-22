package com.aria.devops.service;

import com.aria.devops.model.ApprovalEntity;
import com.aria.devops.model.AuditEventEntity;
import com.aria.devops.repository.ApprovalRepository;
import com.aria.devops.repository.AuditEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class GovernanceService {

    private final ApprovalRepository approvalRepository;
    private final AuditEventRepository auditEventRepository;

    public GovernanceService(ApprovalRepository approvalRepository, AuditEventRepository auditEventRepository) {
        this.approvalRepository = approvalRepository;
        this.auditEventRepository = auditEventRepository;
    }

    public List<ApprovalEntity> getPendingApprovals() {
        return approvalRepository.findByStatus("pending");
    }

    public List<ApprovalEntity> getAllApprovals() {
        return approvalRepository.findAll();
    }

    @Transactional
    public ApprovalEntity resolveApproval(String approvalId, String decision, String reviewerNotes, String operator) {
        ApprovalEntity approval = approvalRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("Approval not found: " + approvalId));

        if (!"pending".equals(approval.getStatus())) {
            throw new IllegalStateException("Approval is already resolved: " + approval.getStatus());
        }

        approval.setStatus(decision);
        approval.setReviewerNotes(reviewerNotes);
        approval.setResolvedBy(operator != null ? operator : "Raj Ratan (DevOps Lead)");
        approval.setResolvedAt(OffsetDateTime.now());
        approvalRepository.save(approval);

        AuditEventEntity event = new AuditEventEntity();
        event.setId("aud-" + System.currentTimeMillis());
        event.setCategory("GOVERNANCE");
        event.setAction("Approval Decision: " + decision.toUpperCase());
        event.setAgent("HUMAN");
        event.setSeverity("approved".equalsIgnoreCase(decision) ? "alert" : "warning");
        event.setAutonomyLevel(4);
        event.setDetails(String.format("Action %s (%s) %s by %s. Notes: %s",
                approval.getActionType(), approval.getId(), decision, approval.getResolvedBy(), reviewerNotes));
        auditEventRepository.save(event);

        return approval;
    }
}
