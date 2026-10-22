package com.aria.devops.service;

import com.aria.devops.model.*;
import com.aria.devops.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AfpEngineService {

    private final ModuleRepository moduleRepository;
    private final IncidentRepository incidentRepository;
    private final AfpMessageRepository afpMessageRepository;
    private final AuditEventRepository auditEventRepository;

    @Value("${aria.afp.baseline-risk-weight:0.300}")
    private BigDecimal baselineRisk;

    @Value("${aria.afp.confidence-threshold:0.750}")
    private BigDecimal confidenceThreshold;

    @Value("${aria.afp.alpha:0.400}")
    private BigDecimal alpha;

    @Value("${aria.afp.max-weight:1.000}")
    private BigDecimal maxWeight;

    @Value("${aria.afp.lambda-decay:0.100}")
    private BigDecimal lambdaDecay;

    public AfpEngineService(
            ModuleRepository moduleRepository,
            IncidentRepository incidentRepository,
            AfpMessageRepository afpMessageRepository,
            AuditEventRepository auditEventRepository) {
        this.moduleRepository = moduleRepository;
        this.incidentRepository = incidentRepository;
        this.afpMessageRepository = afpMessageRepository;
        this.auditEventRepository = auditEventRepository;
    }

    /**
     * Calculates updated risk weight according to:
     * w_new = min(1.0, w_current + c * alpha) when c >= threshold
     */
    public BigDecimal calculateUpdatedWeight(BigDecimal currentWeight, BigDecimal confidence) {
        if (confidence.compareTo(confidenceThreshold) < 0) {
            return currentWeight;
        }
        BigDecimal delta = confidence.multiply(alpha);
        BigDecimal sum = currentWeight.add(delta);
        return sum.min(maxWeight).setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Calculates exponential decay toward baseline according to:
     * w(t) = w_baseline + (w_current - w_baseline) * e^(-lambda * t)
     */
    public BigDecimal calculateDecayedWeight(BigDecimal currentWeight, int elapsedDays) {
        if (currentWeight.compareTo(baselineRisk) <= 0) {
            return baselineRisk;
        }
        double wCurrent = currentWeight.doubleValue();
        double wBase = baselineRisk.doubleValue();
        double lambda = lambdaDecay.doubleValue();
        double decayed = wBase + (wCurrent - wBase) * Math.exp(-lambda * elapsedDays);
        return BigDecimal.valueOf(Math.max(wBase, decayed)).setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Dispatches an attributable AFP-INCIDENT signal, propagating risk to upstream module.
     */
    @Transactional
    public AfpMessageEntity dispatchIncidentSignal(String incidentId) {
        IncidentEntity incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        if (Boolean.TRUE.equals(incident.getAfpSignalSent())) {
            throw new IllegalStateException("AFP-INCIDENT signal already dispatched for incident: " + incidentId);
        }

        ModuleEntity module = incident.getImplicatedModule();
        if (module == null) {
            throw new IllegalStateException("Incident has no implicated module: " + incidentId);
        }

        BigDecimal confidence = incident.getIraConfidence();
        BigDecimal prevWeight = module.getCurrentRiskWeight();

        // Gating Check: c >= 0.750
        if (confidence.compareTo(confidenceThreshold) < 0) {
            createAuditLog("AFP", "AFP-INCIDENT Rejected (Gated)", "IRA", "warning", 3,
                    String.format("Confidence %s < threshold %s", confidence, confidenceThreshold));
            throw new IllegalArgumentException(String.format("Confidence %s below threshold %s", confidence, confidenceThreshold));
        }

        BigDecimal newWeight = calculateUpdatedWeight(prevWeight, confidence);

        // Update module risk & policy
        module.setCurrentRiskWeight(newWeight);
        module.setCachePolicy("strict_invalidation");
        module.setUpdatedAt(OffsetDateTime.now());
        moduleRepository.save(module);

        incident.setAfpSignalSent(true);
        incident.setStatus("mitigating");
        incidentRepository.save(incident);

        // Record AFP Message
        AfpMessageEntity afpMessage = new AfpMessageEntity();
        afpMessage.setId("afp-" + UUID.randomUUID().toString().substring(0, 8));
        afpMessage.setType("AFP-INCIDENT");
        afpMessage.setSenderAgent("IRA");
        afpMessage.setModuleId(module.getId());
        afpMessage.setIncidentId(incident.getId());
        afpMessage.setConfidence(confidence);
        afpMessage.setPreviousWeight(prevWeight);
        afpMessage.setNewWeight(newWeight);
        afpMessage.setFormulaApplied(String.format("min(1.0, %s + %s * %s) = %s", prevWeight, confidence, alpha, newWeight));
        afpMessage.setStatus("accepted");
        afpMessageRepository.save(afpMessage);

        createAuditLog("AFP", "AFP-INCIDENT Signal Dispatched", "IRA", "alert", 3,
                String.format("Elevated module %s risk from %s to %s (c=%s)", module.getName(), prevWeight, newWeight, confidence));

        return afpMessage;
    }

    /**
     * Applies exponential decay across all elevated modules.
     */
    @Transactional
    public void applyDecaySimulation(int days) {
        List<ModuleEntity> modules = moduleRepository.findAll();
        for (ModuleEntity mod : modules) {
            if (mod.getCurrentRiskWeight().compareTo(mod.getBaselineRiskWeight()) > 0) {
                BigDecimal decayed = calculateDecayedWeight(mod.getCurrentRiskWeight(), days);
                mod.setCurrentRiskWeight(decayed);
                if (decayed.compareTo(BigDecimal.valueOf(0.500)) <= 0) {
                    mod.setCachePolicy("standard");
                }
                mod.setUpdatedAt(OffsetDateTime.now());
                moduleRepository.save(mod);
            }
        }
        createAuditLog("AFP", "AFP-DECAY Applied", "ORCHESTRATOR", "info", 1,
                String.format("Decayed risk weights across modules for %d incident-free days", days));
    }

    private void createAuditLog(String category, String action, String agent, String severity, int autonomyLevel, String details) {
        AuditEventEntity event = new AuditEventEntity();
        event.setId("aud-" + System.currentTimeMillis());
        event.setCategory(category);
        event.setAction(action);
        event.setAgent(agent);
        event.setSeverity(severity);
        event.setAutonomyLevel(autonomyLevel);
        event.setDetails(details);
        auditEventRepository.save(event);
    }
}
