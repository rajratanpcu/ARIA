package com.aria.devops.controller;

import com.aria.devops.model.*;
import com.aria.devops.repository.*;
import com.aria.devops.service.AfpEngineService;
import com.aria.devops.service.GovernanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AriaApiController {

    private final ModuleRepository moduleRepository;
    private final IncidentRepository incidentRepository;
    private final AfpMessageRepository afpMessageRepository;
    private final AuditEventRepository auditEventRepository;
    private final AfpEngineService afpEngineService;
    private final GovernanceService governanceService;

    public AriaApiController(
            ModuleRepository moduleRepository,
            IncidentRepository incidentRepository,
            AfpMessageRepository afpMessageRepository,
            AuditEventRepository auditEventRepository,
            AfpEngineService afpEngineService,
            GovernanceService governanceService) {
        this.moduleRepository = moduleRepository;
        this.incidentRepository = incidentRepository;
        this.afpMessageRepository = afpMessageRepository;
        this.auditEventRepository = auditEventRepository;
        this.afpEngineService = afpEngineService;
        this.governanceService = governanceService;
    }

    // Health & System Info
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        return ResponseEntity.ok(Map.of(
                "system", "ARIA - Autonomous Mobile DevOps Platform",
                "version", "1.0.0",
                "stage", "Stage 2 Full-Stack Backend",
                "status", "healthy",
                "autonomyLevel", 3
        ));
    }

    // Modules
    @GetMapping("/modules")
    public ResponseEntity<List<ModuleEntity>> getModules() {
        return ResponseEntity.ok(moduleRepository.findAll());
    }

    @GetMapping("/modules/{id}")
    public ResponseEntity<ModuleEntity> getModule(@PathVariable String id) {
        return moduleRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Incidents
    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentEntity>> getIncidents() {
        return ResponseEntity.ok(incidentRepository.findAll());
    }

    // AFP Protocol Engine
    @PostMapping("/afp/dispatch/{incidentId}")
    public ResponseEntity<AfpMessageEntity> dispatchAfpSignal(@PathVariable String incidentId) {
        AfpMessageEntity message = afpEngineService.dispatchIncidentSignal(incidentId);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/afp/decay")
    public ResponseEntity<Map<String, Object>> applyDecay(@RequestParam(defaultValue = "7") int days) {
        afpEngineService.applyDecaySimulation(days);
        return ResponseEntity.ok(Map.of("status", "success", "decayDays", days));
    }

    @PostMapping("/afp/calculate")
    public ResponseEntity<Map<String, Object>> calculateAfp(
            @RequestParam BigDecimal currentWeight,
            @RequestParam BigDecimal confidence,
            @RequestParam(defaultValue = "7") int decayDays) {
        BigDecimal updated = afpEngineService.calculateUpdatedWeight(currentWeight, confidence);
        BigDecimal decayed = afpEngineService.calculateDecayedWeight(updated, decayDays);
        return ResponseEntity.ok(Map.of(
                "currentWeight", currentWeight,
                "confidence", confidence,
                "gatingAccepted", confidence.compareTo(BigDecimal.valueOf(0.750)) >= 0,
                "updatedWeight", updated,
                "decayDays", decayDays,
                "decayedWeight", decayed
        ));
    }

    @GetMapping("/afp/messages")
    public ResponseEntity<List<AfpMessageEntity>> getAfpMessages() {
        return ResponseEntity.ok(afpMessageRepository.findAllByOrderByTimestampDesc());
    }

    // Governance & Approvals
    @GetMapping("/governance/approvals")
    public ResponseEntity<List<ApprovalEntity>> getApprovals() {
        return ResponseEntity.ok(governanceService.getAllApprovals());
    }

    @PostMapping("/governance/approvals/{id}/resolve")
    public ResponseEntity<ApprovalEntity> resolveApproval(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String decision = body.getOrDefault("decision", "approved");
        String notes = body.get("notes");
        String operator = body.get("operator");
        ApprovalEntity resolved = governanceService.resolveApproval(id, decision, notes, operator);
        return ResponseEntity.ok(resolved);
    }

    // Audit Trail
    @GetMapping("/audit")
    public ResponseEntity<List<AuditEventEntity>> getAuditEvents(
            @RequestParam(required = false) String category) {
        if (category != null && !category.equalsIgnoreCase("all")) {
            return ResponseEntity.ok(auditEventRepository.findByCategoryOrderByTimestampDesc(category));
        }
        return ResponseEntity.ok(auditEventRepository.findAllByOrderByTimestampDesc());
    }
}
