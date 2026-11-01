# Illustrative incident (synthetic sample, not a real service)
Service: Example API; time zone: UTC; status: resolved.
- 2026-10-12 09:02 UTC — Monitoring alert: elevated HTTP 5xx rate in region A. Source: ALERT-1.
- 2026-10-12 09:07 UTC — On-call acknowledged the alert. Source: TICKET-2.
- 2026-10-12 09:12 UTC — A traffic rollback began. Source: CHANGE-3.
- 2026-10-12 09:24 UTC — Error rate returned to the documented baseline. Source: ALERT-4.
- 2026-10-12 09:28 UTC — On-call marked the incident resolved. Source: TICKET-5.
Impact: Elevated 5xx rate in region A; affected request count is unknown.
Root cause: Not confirmed. Follow-up: Review deployment and traffic logs.
