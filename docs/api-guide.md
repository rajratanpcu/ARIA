# ARIA REST API Reference & Integration Guide

## 1. Overview
The ARIA backend exposes a production-ready REST API implemented in **Spring Boot 3.2** and **Java 21**. All endpoints are versioned under `/api/v1/*`.

When the backend is offline, the frontend automatically falls back to an in-memory/localStorage model, ensuring uninterrupted demonstration capability.

---

## 2. API Endpoints

### 2.1. System Health & Status
* **GET `/api/v1/status`**
  * Returns system health, backend readiness, and active database status.
  * **Response:**
    ```json
    {
      "status": "UP",
      "version": "1.0.0",
      "autonomyLevel": 4,
      "agentsActive": 5
    }
    ```

### 2.2. Projects & Modules
* **GET `/api/v1/projects/{projectId}/modules`**
  * Lists all registered modules, their dependencies, and current AFP risk weights.
* **GET `/api/v1/modules/{moduleId}/risk`**
  * Returns detailed risk weight history and decay parameters for a specific module.

### 2.3. ARIA Feedback Protocol (AFP)
* **POST `/api/v1/afp/messages`**
  * Ingests and processes an `AFP-INCIDENT` message.
  * **Request Body:**
    ```json
    {
      "incidentId": "INC-7402",
      "moduleId": "mod-checkout-cart",
      "confidence": 0.870,
      "summary": "Stale cache deserialization error in CartPersistenceWorker"
    }
    ```
  * **Response (Accepted):**
    ```json
    {
      "accepted": true,
      "messageId": "afp-msg-7402",
      "implicatedModule": "checkout-cart",
      "previousWeight": 0.300,
      "newWeight": 0.648,
      "reason": "Confidence 0.870 exceeds threshold 0.750. Weight elevated by 0.348."
    }
    ```

* **GET `/api/v1/afp/decay?moduleId=mod-checkout-cart&days=7`**
  * Computes projected exponential decay for an implicated module.

### 2.4. CI & Test Selection
* **POST `/api/v1/ci/select-tests`**
  * Computes prioritized test selections using module risk weights, failure rates, and execution costs.
  * **Request Body:**
    ```json
    {
      "commitId": "7a9e4f2",
      "changedModules": ["checkout-cart", "payment-gateway", "analytics-sdk"]
    }
    ```
  * **Response:**
    ```json
    {
      "totalTestsAvailable": 12340,
      "selectedTestCount": 1334,
      "durationReductionPct": 89.2,
      "selectedTests": [...]
    }
    ```

### 2.5. Governance & Level 4 Approvals
* **GET `/api/v1/governance/approvals`**
  * Lists pending Level 4 human approval requests.
* **POST `/api/v1/governance/approvals/{id}/decision`**
  * Records cryptographically signed human decision (`APPROVED` or `REJECTED`).
  * **Request Body:**
    ```json
    {
      "decision": "APPROVED",
      "operatorNotes": "Authorized rollback following 7.8% 5xx error rate surge",
      "reviewerIdentity": "raj.ratan@aria.corp",
      "cryptographicSignature": "d2f8e1..."
    }
    ```

---

## 3. Running with Docker Compose

```bash
docker compose up -d --build
```
* **Frontend**: `http://localhost:3000`
* **Spring Boot REST API**: `http://localhost:8080/api/v1/status`
* **PostgreSQL Database**: `localhost:5432` (User: `aria_user`, Password: `aria_password`, DB: `aria_db`)
