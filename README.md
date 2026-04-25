# 🍽️ ResQFood – Intelligent Food Redistribution System

> Every meal saved is a life touched.

ResQFood is a smart platform that connects food donors with NGOs and uses an intelligent algorithm to distribute food before it expires.

---

## 📌 Table of Contents

- Overview
- Features
- Core Concept
- Tech Stack
- Project Structure
- API Endpoints
- Matching Algorithm
- Workflow
- Setup Instructions
- Testing Guide
- Current Progress
- Future Scope
- Contributors
- Vision

---

## 🔍 Overview

Food waste and hunger exist together.  
ResQFood solves this by:

- Connecting donors with NGOs
- Using smart matching instead of random assignment
- Ensuring food is delivered before expiry

---

## 🚀 Features

### ✅ Backend Features
- NGO Registration API
- MongoDB Cloud Storage
- Matching Engine API
- Validation & error handling

### ✅ Frontend Features
- NGO Signup Page
- Form validation
- API integration using fetch
- Dashboard redirection

### 🔥 Smart Features
- Food Life Score algorithm
- NGO ranking system
- Capacity-based matching

---

## 🧠 Core Concept

Instead of random distribution, NGOs are ranked based on:

- *Urgency* → Food expiry time  
- *Distance* → Travel time  
- *Capacity* → NGO capacity  

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- HTML
- CSS
- JavaScript

### 🧩 Backend
- Node.js
- Express.js

### 🗄️ Database
- MongoDB Atlas

---

## 📁 Project Structure

ResQFood/
│
├── Backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   └── foodController.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   └── Food.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── foodRoutes.js
│   │
│   ├── utils/
│   │   └── matching.js
│   │
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── Frontend/
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── script.js
│   ├── auth.js
│   └── style.css
│
└── README.md

---

