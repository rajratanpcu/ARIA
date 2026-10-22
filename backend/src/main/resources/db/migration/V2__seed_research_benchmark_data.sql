-- V2__seed_research_benchmark_data.sql
-- Seeds initial dataset reproducing the ARIA research paper canonical scenario

INSERT INTO projects (id, name, repository_url, default_branch)
VALUES ('proj-mobile-retailgo', 'RetailGo Mobile SuperApp', 'https://github.com/retailgo/mobile-app.git', 'main');

INSERT INTO modules (id, project_id, name, path, language, loc, current_risk_weight, baseline_risk_weight, cache_policy, cache_status, test_count)
VALUES
('mod-checkout-cart', 'proj-mobile-retailgo', 'checkout-cart', 'packages/checkout-cart', 'TypeScript/Kotlin', 14200, 0.300, 0.300, 'standard', 'stale', 2450),
('mod-payment-gateway', 'proj-mobile-retailgo', 'payment-gateway', 'packages/payment-gateway', 'Kotlin/Swift', 9800, 0.300, 0.300, 'standard', 'hit', 1820),
('mod-analytics-sdk', 'proj-mobile-retailgo', 'analytics-sdk', 'packages/analytics-sdk', 'TypeScript', 6400, 0.300, 0.300, 'standard', 'hit', 890),
('mod-user-auth', 'proj-mobile-retailgo', 'user-auth', 'packages/user-auth', 'Kotlin/Swift', 8100, 0.300, 0.300, 'standard', 'hit', 1540),
('mod-security-vault', 'proj-mobile-retailgo', 'security-vault', 'packages/security-vault', 'C++/Rust', 4300, 0.300, 0.300, 'standard', 'hit', 940),
('mod-catalog-browse', 'proj-mobile-retailgo', 'catalog-browse', 'packages/catalog-browse', 'React Native', 18500, 0.300, 0.300, 'standard', 'hit', 4700);

-- Dependencies
INSERT INTO module_dependencies (module_id, depends_on_module_id) VALUES
('mod-checkout-cart', 'mod-payment-gateway'),
('mod-checkout-cart', 'mod-analytics-sdk'),
('mod-payment-gateway', 'mod-security-vault'),
('mod-user-auth', 'mod-security-vault'),
('mod-catalog-browse', 'mod-analytics-sdk');

-- Initial Commit
INSERT INTO commits (hash, project_id, author_name, author_email, message, lines_added, lines_deleted, committed_at)
VALUES ('7a9e4f2', 'proj-mobile-retailgo', 'Elena Vance', 'elena.vance@retailgo.com', 'feat(checkout): optimize cart state sync and coupon recalculation pipeline', 342, 89, CURRENT_TIMESTAMP - INTERVAL '1 day');

INSERT INTO commit_touched_modules (commit_hash, module_id) VALUES
('7a9e4f2', 'mod-checkout-cart'),
('7a9e4f2', 'mod-payment-gateway'),
('7a9e4f2', 'mod-analytics-sdk');

-- Initial Build
INSERT INTO builds (id, commit_hash, status, cache_hit_rate, duration_seconds, bia_confidence, cache_recommendation, started_at, finished_at)
VALUES ('bld-8491', '7a9e4f2', 'success', 85.70, 384, 0.880, 'Cache hit reused for checkout-cart artifact', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '384 seconds');

-- Release Candidate
INSERT INTO release_candidates (id, version, build_id, status, artifact_hash, is_signed, gating_passed, created_at)
VALUES ('rc-3.2.1-4', 'v3.2.1-rc4', 'bld-8491', 'approved', 'sha256:7f9a2b8e4c1d', true, true, CURRENT_TIMESTAMP - INTERVAL '20 hours');

-- Staged Deployment
INSERT INTO staged_deployments (id, release_id, current_stage_percentage, status, active_users, http_error_rate, crash_rate, started_at)
VALUES ('dep-321', 'rc-3.2.1-4', 50, 'in_progress', 1100000, 7.80, 0.42, CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- Canonical Incident INC-7402
INSERT INTO incidents (id, title, severity, affected_release_id, implicated_module_id, status, scenario_type, ira_confidence, afp_signal_sent, detected_at)
VALUES ('INC-7402', 'Checkout Payment Recalculation Failure Spikes at 50% Rollout', 'critical', 'rc-3.2.1-4', 'mod-checkout-cart', 'investigating', 'stale_cache_failure', 0.870, false, CURRENT_TIMESTAMP - INTERVAL '3 hours');

INSERT INTO incident_hypotheses (id, incident_id, description, confidence, is_primary, evidence) VALUES
('hyp-1', 'INC-7402', 'Stale build cache reused across cart serialization schema migration', 0.870, true, ARRAY['Commit #7a9e4f2 altered CartItem schema with non-optional couponMetadata field', 'BIA build report indicated cache HIT on module checkout-cart', 'HTTP 502 deserialization errors matched mutated schema hash']),
('hyp-2', 'INC-7402', 'Payment Gateway upstream webhook rate limiting during flash-sale surge', 0.220, false, ARRAY['Payment gateway latency was nominal (142ms)', 'Zero upstream 429 status codes recorded']);

-- Level 4 Approvals Queue
INSERT INTO approvals (id, action_type, title, requested_by, rationale, confidence, autonomy_level, status, requested_at)
VALUES
('appr-01', 'ROLLBACK', 'Level 4 Rollback: Roll back v3.2.1 rollout from 50% to stable v3.2.0', 'DCA', 'Checkout failure rate (7.8%) exceeds safety threshold (3.0%). High customer checkout failure impact.', 0.930, 4, 'pending', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('appr-02', 'BROAD_CACHE_INVALIDATION', 'Level 4 Broad Cache Invalidation: Purge Gradle/Bazel build cache across Tier-1 modules', 'BIA', 'Prevent subsequent builds from inheriting stale checkout-cart or payment-gateway serialized schemas.', 0.890, 4, 'pending', CURRENT_TIMESTAMP - INTERVAL '1 hour');
