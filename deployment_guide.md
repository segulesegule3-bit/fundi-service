# DevOps Operations, Deployment & Disaster Recovery Playbook

Hili ni mwongozo rasmi wa jinsi ya kuandaa, kuendesha na kulinda mfumo wa "Fundi Service System" katika mazingira ya uzalishaji (Production Environment).

---

## 🐋 1. Staging & Local Orchestration (Docker Compose)
Mfumo mzima unaweza kuendeshwa kwa kutumia Docker Compose ili kurahisisha kazi ya majaribio (Staging/Local testing):
1. Hakikisha una Docker na Docker Compose zilizowekwa kwenye kompyuta/server yako.
2. Endesha amri ifuatayo ili kuanzisha database, cache, na backend:
   ```bash
   docker-compose up --build -d
   ```
3. Nginx reverse proxy itaanza kusikiliza kwenye **Port 80** kiotomatiki na kurudisha trafiki kwenye backend container.

---

## ☸️ 2. Production Deployment (Kubernetes)
Kwa ajili ya scalability na high availability ya kuhudumia mamilioni ya watumiaji, tunatumia Kubernetes cluster:
1. Pakia siri (secrets) na vigezo vya mazingira (ConfigMaps):
   ```bash
   kubectl apply -f k8s/k8s-deployment.yml
   ```
2. Kubernetes Horizontal Pod Autoscaler (HPA) itakagua matumizi ya CPU na kuongeza idadi ya backend pods kiotomatiki kutoka pods **2 hadi 10** kulingana na mzigo wa trafiki.
3. Ingress controller itashughulikia SSL/TLS termination kwa usalama zaidi.

---

## 💾 3. Database Backup & Disaster Recovery (DR) Plan
Ili kuzuia upotevu wa data za miamala na wallet za watumiaji, tunatekeleza mkakati ufuatao wa usalama wa database:

### DR Goals & Limits:
- **Recovery Time Objective (RTO):** < 15 minutes (muda wa juu wa kurudisha mfumo hewani baada ya hitilafu).
- **Recovery Point Objective (RPO):** < 5 minutes (kiwango cha juu cha data kinachoweza kupotea baada ya hitilafu).

### Backup Execution Strategy:
- **Daily Automated Backups:** Amri ya `pg_dump` inaendeshwa kiotomatiki kila siku saa 8:00 usiku na kuhifadhi nakala kwenye AWS S3 bucket iliyolindwa (encrypted at rest).
- **Point-in-Time Recovery (PITR):** PostgreSQL Write-Ahead Logs (WAL) zinarushwa kila baada ya sekunde 60 kwenye block storage ili kuruhusu kurudisha data (recovery) hadi sekunde chache kabla ya hitilafu kutokea.

---

## 📈 4. Enterprise Monitoring & SRE Alerts
Tumesanidi Prometheus kusoma metric endpoints kutoka kwenye backend service:
- **Metrics Endpoint:** `/metrics` (Inaonyesha matumizi ya kumbukumbu, CPU, na idadi ya active sockets).
- **Grafana Dashboard:** Inawasha alerts kwa wataalamu wa SRE/DevOps iwapo:
  - Server ipo chini (Down alert).
  - Matumizi ya CPU yamezidi 85% kwa dakika 5 mfululizo.
  - Asilimia ya malipo yaliyofeli (Failed transactions) inapanda ghafla.
