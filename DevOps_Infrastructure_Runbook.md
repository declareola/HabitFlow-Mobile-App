Here is the second foundational document from the Technical & Engineering category.

### **DevOps & Infrastructure Runbook**

This runbook outlines the deployment, monitoring, and disaster recovery strategies for HabitFlow AI. Because the platform will be used globally, the infrastructure is designed for high availability and low latency, ensuring a user in Okene experiences the exact same real-time AI coaching and timer synchronization as a user in Tokyo or New York.

**Cloud Provider:** AWS (Amazon Web Services)
**Infrastructure as Code (IaC):** Terraform

---

### **1. Global Deployment & Edge Strategy**

To support a worldwide user base without timer drift or slow AI responses, we use a distributed architecture:

* **Primary Compute:** AWS ECS (Elastic Container Service) running Dockerized Node.js/NestJS containers.
* **Database:** Amazon Aurora PostgreSQL (Serverless v2) for automated scaling and read replicas across regions.
* **Edge Caching & CDN:** Cloudflare. We will utilize Cloudflare Workers to cache static assets and handle lightweight API routing at the edge. This ensures sub-50ms latency for users globally, routing traffic through regional data centers (e.g., routing West African traffic through Lagos edge nodes) before hitting the core servers.

---

### **2. CI/CD Pipeline (GitHub Actions)**

Every code commit goes through a strict, automated pipeline to prevent downtime.

* **1. Pull Request (PR) Stage:**
* Runs unit tests (Jest).
* Runs ESLint and Prettier for code formatting.
* Spins up an ephemeral preview environment for the product team to test UI changes.


* **2. Merge to Main (Staging):**
* Builds the Docker image.
* Deploys automatically to the Staging environment.
* Runs end-to-end (E2E) tests via Cypress.


* **3. Production Release:**
* Requires manual approval from the Lead Engineer.
* Deploys using a "Blue/Green" deployment strategy to ensure zero-downtime updates. If the new (Green) environment fails health checks, traffic instantly reverts to the stable (Blue) environment.



---

### **3. Monitoring & Observability**

To proactively catch bugs before users report them, we track three distinct layers of the system:

* **Application Performance Monitoring (APM):** Datadog. Tracks database query times, AI API latency, and server CPU/memory usage.
* **Error Tracking:** Sentry. Automatically captures frontend UI crashes and backend exceptions, grouping them by frequency and severity.
* **Uptime Monitoring:** PagerDuty + BetterUptime. Pings the core API every 30 seconds. If the API fails to respond, on-call engineers are automatically called/texted.

---

### **4. Disaster Recovery (DR) & Backups**

Given that we are dealing with behavioral and wellness data, data loss is a fatal failure.

* **Recovery Point Objective (RPO):** 5 minutes. (The maximum amount of user data we are willing to lose in a catastrophic failure).
* **Recovery Time Objective (RTO):** 30 minutes. (The maximum time it should take to restore the entire platform).
* **Backup Protocol:**
* PostgreSQL performs Continuous Archiving (Point-in-Time Recovery enabled for up to 30 days).
* Daily snapshots are taken at 00:00 UTC and replicated to a geographically separate fallback region (e.g., backing up `us-east-1` data to `eu-west-1`).



---

### **5. Incident Response Matrix**

When things go wrong, the team follows this severity matrix:

* **SEV-1 (Critical):** Core app is down, or users cannot log in.
* *Action:* All available engineers mobilized. PagerDuty alerts triggered. Status page updated immediately.


* **SEV-2 (High):** A major feature is broken (e.g., AI Coach endpoints are timing out, but timers work).
* *Action:* Primary on-call engineer investigates. Fix deployed within 2 hours.


* **SEV-3 (Medium/Low):** Non-critical bugs (e.g., a chart in the analytics dashboard is rendering the wrong color).
* *Action:* Added to the top of the next sprint backlog.