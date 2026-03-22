# 🏡 Aisville – Real Estate Mobile Application

A modern, mobile-first real estate platform built with **React Native**, enabling users to discover properties, schedule inspections, and manage bookings seamlessly.

---

## 📱 Overview

Aisville is designed to simplify the property discovery and inspection process by providing a streamlined user experience for browsing listings, saving favorites, and booking property inspections.

The application focuses on **performance, usability, and scalable backend integration**, making it suitable for real-world real estate workflows.

---

## ✨ Key Features

### 🔍 Property Discovery
- Browse curated real estate listings  
- View detailed property information and images  

### 📅 Book Inspection
- Schedule property visits directly from the app  
- Persistent booking system integrated with backend  

### ❤️ Favorites System
- Save and manage preferred properties  
- Optimized toggle logic with backend sync  

### 👤 Authentication
- Secure user authentication (OAuth / Appwrite)  

### 📊 User Dashboard (My Bookings)
- View and manage all scheduled inspections  
- Real-time data synchronization  

---

## 🧠 Architecture & Design Decisions

### 📱 Mobile Architecture
- Built with **React Native** for cross-platform performance  
- Component-driven structure for scalability and reuse  

### ⚙️ Backend
- Powered by **Appwrite**
  - Authentication  
  - Database (bookings, favorites, properties)  
  - API-driven architecture  

### 🔄 State Management
- Lightweight and modular state handling  
- Optimized for async data fetching and UI responsiveness  

---

## ⚙️ Tech Stack

- **Frontend:** React Native, Expo  
- **Backend:** Appwrite  
- **Language:** TypeScript / JavaScript  
- **API Handling:** REST / SDK-based integration  
- **Version Control:** Git + GitHub  

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js  
- Expo CLI (if applicable)  
- Appwrite instance (local or cloud)  

---

## 🎥 Demo

- 👉 Add your Loom / screen recording here  
- 👉 Add APK or TestFlight link if available  

---

## 🧩 Challenges & Solutions

### 1. Appwrite Document ID Constraints
- **Challenge:** Invalid `documentId` errors due to strict format requirements  
- **Solution:** Implemented sanitized ID generation and validation before writes  

### 2. Real-Time Booking Sync
- **Challenge:** Keeping booking data consistent across screens  
- **Solution:** Centralized data fetching with optimized refresh logic  

### 3. UX Flow for Booking
Designed a frictionless flow:  
**Property → Book Inspection → Confirmation → My Bookings**

---

## 📈 Future Improvements

- 💳 Payment integration (e.g., Paystack)  
- 💬 Real-time chat (buyer ↔ agent)  
- 🗺️ Map-based property discovery  
- 🔔 Push notifications for booking updates  

---

## 🧑‍💻 Author

**Zakari Adamu**  
Frontend / Mobile Engineer  

- GitHub: https://github.com/ZakariAdamu  
- LinkedIn: https://www.linkedin.com/in/zakari-adamu  

---

## 📄 License

MIT License

---

### 📦 Installation

```bash
git clone https://github.com/ZakariAdamu/aisville.git
cd aisville
npm install
