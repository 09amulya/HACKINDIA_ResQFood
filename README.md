#  ResQFood – Time-Critical Food Allocation System

> A system designed not to *collect donations*, but to **prevent food from expiring before it is consumed**.

---

## 1.  Problem Definition 

India generates massive food waste, while millions remain food insecure.

However, existing donation systems fail due to:

*  **Latency mismatch** (food expires before pickup)
*  **Unoptimized allocation** (nearest ≠ best)
*  **No capacity awareness** (NGOs get overloaded)

 The real problem is **not donation — it is time-critical allocation under constraints**

---

## 2.  Solution Philosophy

ResQFood treats food redistribution as a:

> **constrained optimization problem under time decay**

Instead of “sending food somewhere”, we:

* Model **food as a decaying resource**
* Model **NGOs as constrained receivers**
* Compute **optimal assignment in real-time**

---

## 3.  System Design

```id="sys001"
[Donor Input]
     ↓
[Validation Layer]
     ↓
[Scoring Engine]
     ↓
[NGO Ranking System]
     ↓
[Assignment Engine]
     ↓
[Notification + Confirmation]
```

---

## 4.  Core Algorithm 

We use a **weighted scoring model**:

```id="algo001"
Score(NGO) =
  α × Freshness(food) +
  β × Proximity(NGO, food) +
  γ × Capacity(NGO)
```

### Why this works:

* Converts multi-factor decision → single comparable score
* Allows **real-time ranking**
* Easily tunable without retraining 

---

## 5.  Key Design Decisions 

###  Why NOT Machine Learning?

* No historical dataset
* No reward signal
* High risk of overengineering

Decision: **Use deterministic scoring → fast, explainable, reliable**

---

###  Why NOT First-Come-First-Serve?

* Ignores urgency
* Leads to inefficient allocation

Decision: **Priority-based ranking**

---

###  Why NOT Nearest NGO Only?

* Nearest NGO may be full
* May not handle food type

 Decision: **Multi-factor scoring**

---

## 6. Constraints Considered

* Food expiration window
* Transportation delay
* NGO storage limits
* Location availability

---

## 7. Workflow

1. Donor submits food details
2. System validates and rejects invalid/expired inputs
3. All NGOs are scored
4. Top NGO is selected
5. NGO confirms pickup

---

## 8. Failure Handling

* No NGO available → expand search radius
* NGO rejects → fallback to next best
* Expired food → auto discard

---

## 9. Implementation Stack

* **Backend:** Node.js + Express
* **Database:** MongoDB Atlas
* **Frontend:** HTML/CSS/JS

---

## 10. Scalability Outlook

Current system:

* Works for **single-city prototype**

Future upgrades:

* Geo-indexing for faster queries
* Event-driven architecture (Kafka)
* Real-time tracking (WebSockets)

---

## 11. What Makes This Different

Most solutions:

* Focus on *connecting people*

ResQFood:

* Focuses on **making correct decisions under time pressure**

---

## 12. Team
 # Algomind
* Amulya Pratap Singh
* Aashni Singh
* Aditya Upadhyay
* Abhirag Verma

---

## 13.  Vision

> Build a system where food logistics are treated with the same urgency as emergency response systems.

---
