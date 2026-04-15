# 30-Day Implementation Roadmap (Project-Specific)

Date: 2026-04-05
Scope: Add high-impact, publication-friendly capabilities to Tally ERP.

## 1) Execution Goal

Deliver 3 production-grade additions in 30 days:

1. Explainable AI responses with evidence + confidence.
2. Demand forecasting and reorder recommendations.
3. Approval workflow + immutable audit trail for critical actions.

Expected outcome:
- Better product value for users.
- Stronger experimental evidence for conference submission.

## 2) Team and Effort Model

Assumed team: 2 full-stack engineers + 1 QA (part-time) + 1 product/research owner.

Effort units:
- 1 engineer-day = ~6 productive implementation hours.

Total estimated effort: 48-60 engineer-days.

## 3) Feature Roadmap With Estimates

## Feature A: Explainable AI (Priority P0)

Objective:
- Every AI answer includes: source records used, confidence score, and optional safe fallback when uncertain.

Estimate:
- 14-18 engineer-days.

Backend changes:
- Add explainable response envelope and validators:
  - backend/src/services/ai/ai.controller.js
  - backend/src/services/ai/ai.service.js
- Add new evidence retrieval helper for ERP context:
  - backend/src/services/ai/evidence.service.js (new)
- Add confidence and safety policy module:
  - backend/src/services/ai/safety.service.js (new)
- Extend route surface for structured response mode:
  - backend/src/services/ai/routes/ai.routes.js
- Register any new routes/middleware if needed:
  - backend/src/app.js

Frontend changes:
- Render confidence badge + evidence panel in chat bubbles:
  - frontend/src/pages/AIChatbot.jsx
- Support structured API payloads:
  - frontend/src/api/ai.js

Acceptance criteria:
- At least 80% of assistant replies include non-empty evidence references when query is data-dependent.
- Low-confidence replies return safe guidance instead of fabricated facts.

## Feature B: Forecasting and Reorder Suggestions (Priority P0)

Objective:
- Forecast 7-day and 30-day demand and recommend reorder quantities per product.

Estimate:
- 18-22 engineer-days.

Backend changes:
- Add forecasting service and endpoint:
  - backend/src/services/inventory/services/forecast.service.js (new)
  - backend/src/services/inventory/controllers/forecast.controller.js (new)
  - backend/src/services/inventory/routes/forecast.routes.js (new)
- Mount forecast route:
  - backend/src/services/inventory/routes/inventory.routes.js
  - backend/src/app.js
- Add Prisma query helpers for historical sales/stock:
  - backend/src/services/inventory/services/inventory.service.js

Frontend changes:
- New forecast view with product-level cards/charts:
  - frontend/src/pages/StockLevels.jsx (enhance) or new frontend/src/pages/Forecasting.jsx
- Add API client for forecast endpoints:
  - frontend/src/api/inventory.js
- Add dashboard widget for top reorder recommendations:
  - frontend/src/pages/Dashboard.jsx

Data/model adjustments (optional but recommended):
- Add lead-time and safety-stock fields:
  - backend/prisma/schema.prisma
- Add migration for forecast metadata.

Acceptance criteria:
- Forecast endpoint returns predictions for configurable horizon.
- Reorder suggestion includes rationale: demand forecast, lead time, safety stock.

## Feature C: Approval Workflow + Audit Trail (Priority P1)

Objective:
- Introduce maker-checker approvals and immutable logs for sensitive actions (price changes, large discounts, stock adjustments).

Estimate:
- 16-20 engineer-days.

Backend changes:
- Add approval module:
  - backend/src/services/approval/controllers/approval.controller.js (new)
  - backend/src/services/approval/services/approval.service.js (new)
  - backend/src/services/approval/routes/approval.routes.js (new)
- Add audit logging utility and middleware:
  - backend/src/middlewares/audit.middleware.js (new)
  - backend/src/utils/audit-logger.js (new)
- Register approval routes:
  - backend/src/app.js

Database changes:
- Add models for approval requests and audit events:
  - backend/prisma/schema.prisma
- Add migration for new tables/indexes.

Frontend changes:
- Add approvals inbox page:
  - frontend/src/pages/Approvals.jsx (new)
- Add approval status controls in relevant pages:
  - frontend/src/pages/Purchases.jsx
  - frontend/src/pages/Invoices.jsx
  - frontend/src/pages/Inventory.jsx
- Add approvals API client:
  - frontend/src/api/approvals.js (new)

Acceptance criteria:
- Critical actions can be submitted, approved/rejected, and tracked.
- Every critical action emits an immutable audit event.

## 4) 30-Day Delivery Sequence

Week 1 (Days 1-7): Foundation + Explainable AI Core
- Define response schema: reply, confidence, evidence, warnings, action_suggestions.
- Build evidence and safety services.
- Integrate structured AI response path.
- UI update for evidence/confidence display.
- Deliverable: explainable chat in staging.

Week 2 (Days 8-14): Forecasting MVP
- Implement forecast service (moving average/exponential smoothing baseline).
- Add forecast APIs and inventory integration.
- Build frontend forecast view and dashboard widget.
- Deliverable: product-level forecast and reorder suggestions.

Week 3 (Days 15-21): Approval + Audit MVP
- Add approval and audit models/migrations.
- Build approval endpoints and middleware hooks.
- Build approval inbox UI and action controls.
- Deliverable: end-to-end maker-checker flow.

Week 4 (Days 22-30): Hardening + Evaluation Assets
- Add integration tests for AI, forecast, and approval flows.
- Add benchmark scripts and result logging for paper evidence.
- Performance and security review.
- Deliverable: release candidate and conference evidence package.

## 5) Quality Gates Per Week

- API contract checks for all new endpoints.
- Regression test pass on existing ERP modules.
- Basic load sanity on AI and forecasting endpoints.
- Security check on approval authorization paths.

Minimum test targets:
- Backend integration coverage for new endpoints: >= 70% lines in new modules.
- Frontend smoke tests for new pages/components.

## 6) Risks and Mitigation

Risk: AI confidence score may be poorly calibrated.
- Mitigation: start with heuristic confidence + post-hoc calibration from benchmark labels.

Risk: Forecast quality weak on sparse products.
- Mitigation: fallback to rule-based reorder policy with low-data warning.

Risk: Approval flow increases operation friction.
- Mitigation: threshold-based triggers (only high-risk actions require approval).

Risk: Scope creep in 30 days.
- Mitigation: freeze P0 at end of Week 2; push extras to Phase 2.

## 7) Publication Mapping (Why These 3 Features)

- Explainable AI supports trust and hallucination analysis.
- Forecasting provides measurable operational impact metrics.
- Approval/audit provides governance and enterprise realism.

These directly strengthen conference sections:
- Method novelty.
- Evaluation depth.
- Real-world deployability.

## 8) Definition of Done (End of Day 30)

- Feature A/B/C complete with docs and tested APIs.
- Benchmark-ready logging for success/error/latency metrics.
- Updated docs for setup and reproducibility.
- Internal demo script prepared for submission videos or demo-track material.

## 9) Immediate Next Coding Tasks (Start Tomorrow)

1. Implement structured AI response object in backend AI controller/service.
2. Add evidence panel and confidence badge in chatbot UI.
3. Create forecast service skeleton and first endpoint.
4. Draft Prisma schema extension for approvals and audit events.
