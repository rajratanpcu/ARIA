-- V1__initial_schema.sql
-- ARIA (Agentic Release Intelligence Architecture) Initial PostgreSQL Schema

CREATE TABLE projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    repository_url VARCHAR(256),
    default_branch VARCHAR(64) DEFAULT 'main',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    path VARCHAR(256) NOT NULL,
    language VARCHAR(64) NOT NULL,
    loc INTEGER NOT NULL DEFAULT 0,
    current_risk_weight NUMERIC(4,3) NOT NULL DEFAULT 0.300,
    baseline_risk_weight NUMERIC(4,3) NOT NULL DEFAULT 0.300,
    cache_policy VARCHAR(32) NOT NULL DEFAULT 'standard',
    cache_status VARCHAR(32) NOT NULL DEFAULT 'hit',
    test_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE module_dependencies (
    module_id VARCHAR(64) REFERENCES modules(id) ON DELETE CASCADE,
    depends_on_module_id VARCHAR(64) REFERENCES modules(id) ON DELETE CASCADE,
    PRIMARY KEY (module_id, depends_on_module_id)
);

CREATE TABLE commits (
    hash VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE CASCADE,
    author_name VARCHAR(128) NOT NULL,
    author_email VARCHAR(128),
    message TEXT NOT NULL,
    lines_added INTEGER DEFAULT 0,
    lines_deleted INTEGER DEFAULT 0,
    committed_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE commit_touched_modules (
    commit_hash VARCHAR(64) REFERENCES commits(hash) ON DELETE CASCADE,
    module_id VARCHAR(64) REFERENCES modules(id) ON DELETE CASCADE,
    PRIMARY KEY (commit_hash, module_id)
);

CREATE TABLE builds (
    id VARCHAR(64) PRIMARY KEY,
    commit_hash VARCHAR(64) REFERENCES commits(hash),
    status VARCHAR(32) NOT NULL,
    cache_hit_rate NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    bia_confidence NUMERIC(4,3) NOT NULL DEFAULT 0.850,
    cache_recommendation VARCHAR(64),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    finished_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE test_cases (
    id VARCHAR(64) PRIMARY KEY,
    module_id VARCHAR(64) REFERENCES modules(id) ON DELETE CASCADE,
    name VARCHAR(256) NOT NULL,
    suite VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL,
    historical_failure_rate NUMERIC(4,3) NOT NULL DEFAULT 0.0,
    cost_ms INTEGER NOT NULL DEFAULT 100,
    priority_score NUMERIC(5,3) NOT NULL DEFAULT 0.0,
    is_selected BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE release_candidates (
    id VARCHAR(64) PRIMARY KEY,
    version VARCHAR(32) NOT NULL,
    build_id VARCHAR(64) REFERENCES builds(id),
    status VARCHAR(32) NOT NULL DEFAULT 'draft',
    artifact_hash VARCHAR(128),
    is_signed BOOLEAN NOT NULL DEFAULT false,
    gating_passed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staged_deployments (
    id VARCHAR(64) PRIMARY KEY,
    release_id VARCHAR(64) REFERENCES release_candidates(id),
    current_stage_percentage INTEGER NOT NULL DEFAULT 2,
    status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
    active_users INTEGER NOT NULL DEFAULT 0,
    http_error_rate NUMERIC(4,2) NOT NULL DEFAULT 0.0,
    crash_rate NUMERIC(4,2) NOT NULL DEFAULT 0.0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(256) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    affected_release_id VARCHAR(64) REFERENCES release_candidates(id),
    implicated_module_id VARCHAR(64) REFERENCES modules(id),
    status VARCHAR(32) NOT NULL DEFAULT 'investigating',
    scenario_type VARCHAR(64) NOT NULL,
    ira_confidence NUMERIC(4,3) NOT NULL DEFAULT 0.0,
    afp_signal_sent BOOLEAN NOT NULL DEFAULT false,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE incident_hypotheses (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) REFERENCES incidents(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    evidence TEXT[]
);

CREATE TABLE afp_messages (
    id VARCHAR(64) PRIMARY KEY,
    type VARCHAR(32) NOT NULL,
    sender_agent VARCHAR(32) NOT NULL,
    recipients TEXT[] NOT NULL,
    module_id VARCHAR(64) REFERENCES modules(id),
    incident_id VARCHAR(64) REFERENCES incidents(id),
    confidence NUMERIC(4,3) NOT NULL,
    previous_weight NUMERIC(4,3) NOT NULL,
    new_weight NUMERIC(4,3) NOT NULL,
    formula_applied TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'accepted',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE approvals (
    id VARCHAR(64) PRIMARY KEY,
    action_type VARCHAR(64) NOT NULL,
    title VARCHAR(256) NOT NULL,
    requested_by VARCHAR(32) NOT NULL,
    rationale TEXT NOT NULL,
    confidence NUMERIC(4,3) NOT NULL,
    autonomy_level INTEGER NOT NULL DEFAULT 4,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    reviewer_notes TEXT,
    resolved_by VARCHAR(128),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE audit_events (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    agent VARCHAR(32),
    severity VARCHAR(32) NOT NULL DEFAULT 'info',
    autonomy_level INTEGER NOT NULL DEFAULT 1,
    details JSONB NOT NULL,
    is_simulated BOOLEAN NOT NULL DEFAULT false,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_modules_project ON modules(project_id);
CREATE INDEX idx_builds_commit ON builds(commit_hash);
CREATE INDEX idx_test_cases_module ON test_cases(module_id);
CREATE INDEX idx_incidents_implicated ON incidents(implicated_module_id);
CREATE INDEX idx_afp_module ON afp_messages(module_id);
CREATE INDEX idx_audit_category ON audit_events(category);
CREATE INDEX idx_audit_timestamp ON audit_events(timestamp DESC);
