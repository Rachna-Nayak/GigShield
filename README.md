# 🛡️ GigShield  
## Hyperlocal Parametric Insurance for Quick-Commerce Delivery Workers  

*Your income, protected. Automatically.*


## 1. The Problem

India’s quick-commerce ecosystem (Blinkit, Zepto, Instamart) promises **10-minute delivery**, powered by thousands of gig workers.

But these workers operate in **highly fragile environments**:

* Flood-prone urban zones
* Severe traffic congestion
* Dark-store dependency (single point of failure)
* No income protection during disruptions

A single 4–6 hour disruption can wipe out **₹400–₹800**, and over a monsoon season, riders lose **₹3,000–₹5,000** — nearly **25% of monthly income**.

Existing platform insurance only covers **medical risks**, not **income loss**.

---

## 2. Our Persona — Meet Arjun

**Arjun Mehra (24)** is a Blinkit rider in **HSR Layout Sector 2, Bangalore**.

* Works: 7 AM – 7 PM, 6 days/week
* Orders/day: 35–40
* Net daily income: ₹700–₹900
* Weekly income: ₹4,500–₹5,500

### Normal Day

38 orders → ₹965 net income

### Disrupted Day (Flooding)

* Deliveries paused for 4.25 hours
* Total income drops to ₹485

**Loss: ₹480 in a single day**

This happens **6–10 times each monsoon season**.

---

## 3. A Real-World Scenario

**Location:** HSR Layout Sector 2
**Event:** Heavy rainfall (85mm/hr)

* Roads flood within 30 minutes
* Blinkit pauses deliveries
* Riders wait idle for hours

Arjun loses:

```text
4 hours × ₹100/hour = ₹400+
```

No compensation. No recovery.

---

## 4. The Solution — GigShield

GigShield is a **hyperlocal parametric insurance platform** that:

* Detects disruptions in real-time
* Validates them using multiple data sources
* Automatically compensates riders
* Requires **zero claims paperwork**

---

## 5. Key Innovation — Hyperlocal Risk Intelligence

Unlike traditional insurance which is City-level, GigShield is **Zone-level (1–3 km radius).**

Why this matters:

* Riders are tied to **one dark store**
* Disruptions are **localized (street-level flooding, store shutdowns)**

### Multi-Source Data Fusion

GigShield uses:

* Weather signals
* Traffic signals
* Store status
* Platform signals

To compute a **composite confidence score**.

---

## 6. Parametric Trigger System

| Trigger               | Data Source         | Threshold                    | Confidence |
| --------------------- | ------------------- | ---------------------------- | ---------- |
| Heavy Rainfall        | OpenWeatherMap      | > 40 mm/hr                   | 0.85       |
| Flood Zone Activation | Weather + flood map | Rain > 60mm + high-risk zone | 0.92       |
| AQI Spike             | WAQI/OpenAQ         | AQI > 350 (4 hrs)            | 0.80       |
| Dark Store Shutdown   | Mock API            | Offline > 60 min             | 0.95       |
| Traffic Gridlock      | Maps API            | Speed < 5 km/h               | 0.75       |
| Platform Outage       | Mock API            | > 30 min downtime            | 0.95       |
| Local Disruption      | News/Admin          | > 2 hours                    | 0.90       |

---

### Composite Confidence

```text
Composite Score = Σ(weight × confidence) / Σ weights
```

Example:

```text
Rain: 0.85
Flood zone: 0.92
Traffic: 0.75
Store offline: 0.95

Final score = 0.88 → CLAIM TRIGGERED
```

---

## 7. AI/ML Architecture

### 7.1 Hyperlocal Risk Intelligence Engine (HRIE)

**Model:** XGBoost

**Inputs:**

* Historical rainfall
* Flood zone classification
* AQI levels
* Traffic patterns
* Zone density

**Output:**

```text
Risk Score (0–1)
```

---

### 7.2 Dynamic Premium Calculator

```python
Premium = Base × Zone Risk × Season × Rider Factor × Coverage Tier
```

---

### 7.3 Disruption Forecast Engine

Predicts disruptions **24–72 hours in advance**.

Example:

```text
HSR Layout → 80% flood probability tomorrow
```

---

### 7.4 Fraud Detection AI

3-layer system:

1. Rule-based checks
2. Isolation Forest anomaly detection
3. Cross-rider validation

Detects:

* fake claims
* duration inflation
* GPS mismatch

---

## 8. Weekly Premium Model

### Formula

```text
Premium = ₹12 × Zone Risk × Seasonal Factor × Rider Factor × Tier
```

### Example

| Rider | Zone        | Risk | Premium  |
| ----- | ----------- | ---- | -------- |
| Arjun | HSR         | 0.72 | ₹36/week |
| Priya | Koramangala | 0.55 | ₹31/week |
| Rahul | Indiranagar | 0.30 | ₹14/week |

---

### Coverage Tiers

| Tier     | Coverage    | Premium |
| -------- | ----------- | ------- |
| Basic    | ₹800/week   | ₹10–₹20 |
| Standard | ₹2,000/week | ₹20–₹40 |
| Premium  | ₹3,500/week | ₹35–₹50 |

---

## 9. Fraud Detection Framework

### Layer 1 — Rules

* duplicate claims
* policy validity
* time window checks

### Layer 2 — ML

Isolation Forest detects anomalies

### Layer 3 — Cross Validation

* compare riders in same zone
* GPS verification

---

## 10. System Architecture

```text
External APIs (Weather, AQI, Traffic, Store)
        ↓
Data Ingestion Service
        ↓
Event Stream (Redis/Kafka)
        ↓
-----------------------------------
| Risk Engine | Trigger Engine |
-----------------------------------
        ↓
Claims Engine → Fraud Detection
        ↓
Payment Service (Razorpay)
        ↓
Database (PostgreSQL + Redis)
        ↓
Frontend (Rider App + Admin Dashboard)
```

---

## 11. End-to-End Workflow

1. Rider registers
2. Zone risk calculated
3. Policy activated
4. System monitors disruptions
5. Trigger detected
6. Claim auto-generated
7. Fraud check
8. Instant payout

---

## 12. Technology Stack

| Layer       | Tech                    |
| ----------- | ----------------------- |
| Frontend    | React + Vite (PWA)      |
| Backend     | Node.js + Express       |
| AI          | Python + XGBoost        |
| Database    | PostgreSQL              |
| Cache/Event | Redis                   |
| Maps        | Leaflet + OpenStreetMap |
| Weather     | OpenWeatherMap          |
| AQI         | OpenAQ / WAQI           |
| Payments    | Razorpay Sandbox        |

---

## 13. Database Design

Core tables:

* riders
* zones
* policies
* trigger_events
* claims
* payouts

---

## 14. Development Roadmap

### Phase 1

* README + persona + prototype

### Phase 2

* trigger engine + claims

### Phase 3

* AI models + fraud detection + dashboard

---

## 15. Demo Plan

### Phase 1 (2 min)

* Register rider
* Select zone
* Show risk score
* Show premium

---

### Phase 3 (5 min)

* Simulate rainfall
* Trigger detection
* Claim generation
* Instant payout

---

## 16. Business Viability

* Premium pool vs payout modeled
* Target loss ratio: **60–70%**
* Large TAM: India’s gig workforce

---

## 17. Platform Choice — Web (PWA)

* Works on low-end phones
* No app install required
* Offline capable

---

## &#x20;Vision

GigShield transforms gig work from **high-risk, unpredictable income**
to a **financially protected livelihood**.

> *No claims. No paperwork. Just protection.*



## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.


## Acknowledgements

Built as part of **Guidewire DEVTrails 2026 Hackathon**.
