# ARIA: Agentic Release Intelligence Architecture
### Autonomous End-to-End Mobile DevOps — From Build Prediction to Incident Resolution

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Node.js Tests](https://img.shields.io/badge/Tests-6%2F6%20Passing-brightgreen.svg)]()
[![Autonomy Level](https://img.shields.io/badge/Autonomy-Level%203%20(Bounded%20Active)-emerald.svg)]()

---

## 1. Executive Summary

Mobile DevOps differs fundamentally from backend microservice deployments due to **asymmetric release friction**: client-side app store review latencies, binary immutability once downloaded to user devices, heterogeneous OS fragmentation, and high rollback costs.

**ARIA (Agentic Release Intelligence Architecture)** introduces a **closed-loop autonomous mobile DevOps control plane**. Rather than treating CI/CD and incident management as disconnected, unidirectional silos, ARIA dynamically connects post-deployment incident telemetry back to upstream build caching and continuous test selection through a formal mathematical feedback mechanism: the **ARIA Feedback Protocol (AFP)**.

---

## 2. Core Innovations

1. **Closed-Loop Feedback Propagation**: Downstream incident telemetry directly feeds upstream build compilation and continuous testing policies, converting production failures into proactive regression defenses.
2. **Confidence-Gated Risk Attribution**: High-severity incidents are attributed to specific code modules only when diagnostic confidence satisfies $c \ge 0.750$, preventing false alarms and unnecessary CI bloat.
3. **Dynamic Test Prioritization & Invalidation**: High-risk modules trigger automatic invalidation of stale build caches and expand targeted CI test suites (+57.5% test coverage in the research benchmark) while preserving an overall **91.3% execution duration reduction** relative to exhaustive testing.
4. **Graduated Autonomy & Governance (Levels 1–4)**: Routine observations and bounded cache invalidations run autonomously (Level 3), while catastrophic actions (production rollbacks, broad Tier-1 cache wipes) require explicit human authorization (Level 4).

---

## 3. The 5 Autonomous Agents

| Agent | Acronym | Lifecycle Stage | Primary Responsibilities | Autonomy Level |
|---|---|---|---|---|
| **Build Intelligence Agent** | `BIA` | Code Commit & Compilation | Analyzes AST diffs, module dependency trees, and build cache fingerprints; recommends cache reuse vs. strict invalidation. | Level 2–3 |
| **CI Orchestration Agent** | `COA` | Test Selection & Execution | Ranks test suites based on module risk weight (50%), failure history (30%), and execution cost (20%). Selects prioritized subsets. | Level 2–3 |
| **Release Coordination Agent** | `RCA` | Release Gatekeeping | Verifies release checklists, signing validation (simulated), release candidate readiness, and gating criteria. | Level 2–3 |
| **Deployment Coordination Agent** | `DCA` | Staged Rollout & Telemetry | Orchestrates staged rollouts (2% &rarr; 10% &rarr; 50% &rarr; 100%), monitors real-time crash rates, and triggers anomaly holds. | Level 3 (Holds) / Level 4 (Rollback) |
| **Incident Resolution Agent** | `IRA` | Incident Triage & Feedback | Ingests production logs, performs root-cause hypothesis evaluation, attributes fault to modules, and dispatches AFP signals. | Level 2–3 |

---

## 4. ARIA Feedback Protocol (AFP) Mathematical Model

### 4.1. Baseline Parameters
* **Baseline Risk Weight ($w_{\text{baseline}}$)**: $0.300$
* **Confidence Gating Threshold ($c_{\text{min}}$)**: $0.750$ (signals with $c < 0.750$ are rejected/gated)
* **Update Sensitivity Coefficient ($\alpha$)**: $0.400$
* **Maximum Risk Cap ($w_{\text{max}}$)**: $1.000$
* **Half-Life Decay Rate ($\lambda$)**: $0.100\text{ day}^{-1}$

### 4.2. Attributable Incident Risk Update
When IRA attributes a critical production incident to module $m$ with diagnostic confidence $c \ge 0.750$, the module risk weight updates according to:

$$w_{\text{new}} = \min\left(w_{\text{max}},\, w_{\text{current}} + c \times \alpha\right)$$

In the benchmark research scenario (`INC-7402` attributed to `checkout-cart` with $c = 0.870$):

$$w_{\text{new}} = \min\left(1.000,\, 0.300 + 0.870 \times 0.400\right) = \mathbf{0.648}$$

### 4.3. Exponential Risk Decay
As subsequent releases deploy without recurring regressions, the elevated module risk exponentially decays back toward the baseline $w_{\text{baseline}} = 0.300$:

$$w(t) = w_{\text{baseline}} + \left(w_{\text{current}} - w_{\text{baseline}}\right) \times e^{-\lambda t}$$

* After **7 days**: $w(7) = 0.300 + (0.648 - 0.300) \times e^{-0.7} = 0.300 + 0.1728 = \mathbf{0.473}$
* After **30 days**: $w(30) = 0.300 + (0.648 - 0.300) \times e^{-3.0} = 0.300 + 0.0173 = \mathbf{0.317}$
* After **60 days**: $w(60) \approx \mathbf{0.300}$ (full reversion to baseline)

### 4.4. Test Prioritization Scoring
The continuous testing selection engine ranks candidate test case $i$ for module $m$ via:

$$S_i = 0.50 \cdot w_m + 0.30 \cdot f_i + 0.20 \cdot \left(1 - \frac{\text{cost}_i}{\max(\text{cost})}\right)$$

Where:
* $w_m$ = current AFP risk weight of implicated module $m$
* $f_i$ = historical failure rate of test $i$
* $\text{cost}_i$ = execution duration in milliseconds

When `checkout-cart` elevates from $w = 0.300$ to $w = 0.648$, its regression test priority scores cross the selection threshold, expanding selected test suites from **847 tests** to **1,334 tests** (+487 cart-specific state-synchronization tests).

---

## 5. Autonomy Levels & Human Governance

ARIA adopts a 4-tier autonomy matrix ensuring safety in mission-critical mobile environments:

* **Level 1 (Observe)**: Ingests AST diffs, telemetry logs, and build statistics without intervention.
* **Level 2 (Recommend)**: Suggests test suites, flags risky commits, and suggests rollback plans for human review.
* **Level 3 (Act within Bounds)**: Autonomously enforces strict cache invalidations for elevated-risk modules and adjusts CI test selection suites up to policy bounds.
* **Level 4 (Human-in-the-Loop Gate)**: Strictly pauses execution and requires cryptographically verifiable human sign-off for:
  * Production mobile app rollbacks.
  * Broad Tier-1 build cache purges.
  * Release hold overrides.
  * Policy changes to confidence thresholds ($c_{\text{min}}$).

---

## 6. How to Run the Prototype

You have two convenient options to run and evaluate the ARIA prototype:

### Option A: Instant Zero-Setup Evaluation (Recommended)
A completely self-contained, double-clickable interactive prototype is included at:
```
C:\Users\Raj Ratan\Desktop\CEP\aria-interactive-prototype.html
```
1. Double-click `aria-interactive-prototype.html` in Windows Explorer (or open it in Chrome / Edge / Firefox).
2. The entire interactive ARIA platform loads immediately with zero dependencies, zero build steps, and full interactive support for:
   * **Enterprise Light & Dark Theme Toggle**: Instant 1-click switcher (☀️ Light / 🌙 Dark) with persistent theme synchronization.
   * **Professional Enterprise Design System**: Clean slate surface elevations, calm semantic indicators, and high-contrast typography replacing flashy AI-gimmick neon glows.
   * **9 Complete Application Views**: From real-time telemetry to mathematical simulations.
   * **8-Stage Guided Demo Walkthrough**: Interactive step-by-step paper reproduction.
   * **Interactive AFP Calculator & Exponential Decay Simulator**: Real-time formula experimentation.
   * **5-Agent Control Center**: Deep-dive into BIA, COA, RCA, DCA, and IRA contracts.
   * **Level 4 Approval Queue**: Human-in-the-loop authorization gates with reviewer notes.
   * **Searchable Immutable Audit Log**: Cryptographically traceable event trail with JSON export.
   * **Browser LocalStorage Persistence**: Preserves state across reloads with 1-click Reset.

### Option B: Full React + Vite Development Environment
To run the source TypeScript/Vite development server:

```bash
# 1. Navigate to the project directory
cd "C:\Users\Raj Ratan\Desktop\CEP"

# 2. Install dependencies (requires internet access)
npm install

# 3. Start local development server
npm run dev

# 4. Run automated test suite
npm test
```

---

## 7. Guided 8-Step Professor / Evaluator Demo Script

Click the **"▶ Run Demo Scenario"** button in the top navigation header to execute the canonical paper scenario:

1. **Step 1: Commit Trigger & Multi-Module Impact**
   * Developer Elena Vance pushes commit `#7a9e4f2` touching `checkout-cart`, `payment-gateway`, and `analytics-sdk`.
2. **Step 2: Build Intelligence Recommends Cache Reuse**
   * BIA identifies valid input hashes and reuses cached build artifacts (85.7% hit rate), cutting build duration by 6.4 minutes.
3. **Step 3: CI Orchestration Selects Targeted Tests**
   * COA selects 847 tests out of 12,340 using baseline risk weight $0.300$, pruning unimpacted cart regression suites.
4. **Step 4: Release Candidate & Staged Rollout (2% &rarr; 10%)**
   * RCA passes release criteria; DCA deploys across 2% (45k users) and 10% (220k users) with healthy telemetry.
5. **Step 5: Runtime Anomaly Manifests at 50% Rollout**
   * At 50% rollout (1.1M users), high checkout concurrency triggers a state serialization defect. HTTP error rate spikes to **7.8%** (baseline 3.2%). DCA pauses rollout.
6. **Step 6: Root-Cause Attribution & Confidence Gating**
   * IRA analyzes stack traces and attributes defect to stale cached schema in `checkout-cart` with confidence **$c = 0.870$**. Because $0.870 \ge 0.750$, gating accepts the signal.
7. **Step 7: ARIA Feedback Protocol (AFP) Weight Update**
   * AFP calculates: $w = \min(1.0, 0.300 + 0.870 \times 0.400) = \mathbf{0.648}$.
   * BIA switches cache policy from `standard` to `strict_invalidation`.
8. **Step 8: Upstream Closed Loop Protects Future Builds**
   * Subsequent commits to `checkout-cart` automatically trigger strict compilation and expand CI testing from **847 to 1,334 tests** (+487 regression tests), permanently preventing recurrence.

---

## 8. Automated Test Suite Verification

ARIA includes automated unit tests verifying the mathematical rigor and governance contracts of the AFP engine:

```bash
cd "C:\Users\Raj Ratan\Desktop\CEP"
tsx --test src/tests/afp.test.ts
```

### Verified Test Cases:
* `[PASS]` **AFP Gating**: Confirms rejection when $c < 0.750$ (e.g. $c = 0.720$, negative values, or values $> 1.0$).
* `[PASS]` **AFP Weight Update**: Exact numerical reproduction of research formula: $0.300 + 0.870 \times 0.400 = 0.648$.
* `[PASS]` **AFP Bound Capping**: Verified capping at upper bound $1.000$ when raw sum exceeds 1.0.
* `[PASS]` **AFP Exponential Decay**: Verifies half-life decay at Day 0 ($0.648$), Day 7 ($0.473$), and Day 60 ($0.300$).
* `[PASS]` **Test Prioritization**: Verifies that elevating risk from $0.300$ to $0.648$ promotes previously pruned regression tests into active execution.
* `[PASS]` **Governance Compliance**: Verifies that high-impact actions (`ROLLBACK`, `BROAD_CACHE_INVALIDATION`, `RELEASE_HOLD`) strictly enforce Level 4 human approval.

---

## 9. Stage 2 Production Target Overview

The complete academic specification outlines a production full-stack evolution:
* **Backend**: Spring Boot 3.2 with Java 21, Spring Security OAuth2, and Flyway database migrations.
* **Database**: PostgreSQL 16 schema with tables for `projects`, `modules`, `commits`, `builds`, `test_cases`, `test_runs`, `release_candidates`, `deployments`, `incidents`, `afp_messages`, `module_risks`, `approvals`, and `audit_events`.
* **Containerization**: Multi-stage `Dockerfile` and `docker-compose.yml` orchestrating API, database, and telemetry collector services.
* **AI Integration**: Spring AI / LangChain4j integration with local Ollama (`llama3:8b`) or Anthropic Claude API for dynamic log synthesis and hypothesis ranking.

---

## 10. Repository File Structure

```
C:\Users\Raj Ratan\Desktop\CEP\
├── aria-interactive-prototype.html   # Zero-setup standalone prototype with Dark/Light theme (double-clickable)
├── package.json                      # npm configuration & dependencies
├── tsconfig.json                     # TypeScript compiler configuration
├── vite.config.ts                    # Vite bundler configuration
├── tailwind.config.js                # Enterprise class-based Dark/Light theme configuration
├── index.html                        # Vite entry HTML document
├── README.md                         # Comprehensive academic & technical documentation
└── src/
    ├── types/
    │   └── index.ts                  # Domain models & TypeScript interfaces
    ├── core/
    │   └── afpEngine.ts              # Mathematical AFP equations & test selection logic
    ├── tests/
    │   └── afp.test.ts               # Automated Node.js / tsx unit tests
    ├── data/
    │   └── seedData.ts               # Research paper benchmark dataset
    ├── context/
    │   └── AriaContext.tsx           # React Context state store & Dark/Light theme synchronization
    ├── components/
    │   ├── common/                   # Status badges, Autonomy chips, Risk meters
    │   ├── layout/                   # Sidebar, Header with Theme Switcher, Pipeline visualizer
    │   └── demo/                     # Guided 8-step walkthrough modal
    └── pages/
        ├── OverviewPage.tsx          # Executive KPI dashboard
        ├── AgentsPage.tsx            # 5-Agent Control Center
        ├── BuildIntelligencePage.tsx # AST diffs & cache governance
        ├── CiOrchestrationPage.tsx   # Test selection & prioritization
        ├── ReleaseDeploymentPage.tsx # Staged rollouts (2% -> 100%)
        ├── IncidentIntelligencePage.tsx # Incident triage & AFP trigger
        ├── AfpProtocolPage.tsx       # Mathematical playground & decay
        ├── GovernancePage.tsx        # Level 4 Human Approval Queue
        └── AuditLogPage.tsx          # Searchable immutable audit trail
```

---

*ARIA Prototype developed in strict accordance with the academic research specifications for Autonomous Mobile DevOps.*
