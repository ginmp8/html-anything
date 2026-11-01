# Illustrative architecture (synthetic sample; not deployed infrastructure)
System: Case Intake
- Browser submits a case to API Gateway over HTTPS.
- API Gateway forwards requests to Workflow Service over HTTP.
- Workflow Service writes status records to PostgreSQL.
- Workflow Service publishes a case-created event to a queue.
- Worker consumes events from that queue, reads case status from PostgreSQL, and writes attachments to Object Storage.
- Browser is outside the application trust boundary; gateway, workflow service, queue, worker, and data stores are inside it.
Unknowns: Authentication/authorization implementation, retry policy, observability, and network isolation.
