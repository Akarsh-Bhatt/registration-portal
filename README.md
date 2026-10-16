# NEXUS CLUB — UPES Student Chapter Registration & Payment Portal

A complete club registration and checkout portal built with **React**, **Tailwind CSS**, **Python (FastAPI)**, and **MongoDB Atlas**.

---

## 🚀 Application Flow

### 1. Participant Registration Form
Captures all required student credentials with real-time validation:
- **Name**: e.g., `Aarav Singh`
- **SAPID**: Exactly 9 digits (e.g., `590012345`) with real-time duplicate check
- **College Email**: e.g., `aarav.12345@stu.upes.ac.in` with 1-click `+ @stu.upes.ac.in` assistant
- **Phone Number**: 10-digit mobile number with `+91` prefix validation
- **Current Year**: Interactive pill selector (`1st Year`, `2nd Year`, `3rd Year`, `4th Year`, `5th Year / PG`)
- **⚡ 1-Click Quick Fill**: Demo button to populate `Aarav Singh`'s credentials with 1 click.

---

### 2. Integrated Payment Gateway Page
Opens immediately upon submitting credentials with verified order summary:
- **Order ID**: e.g., `ORD-590012345-XXXXX` with live session countdown timer
- **Credentials Review**: Confirms the student's Name, SAP ID, Email, Phone, and Academic Year
- **Fee Breakdown**:
  - Annual Club Membership Fee: ₹250.00
  - Chapter Badge & ID Kit: ₹49.00
  - Platform / Gateway Fee: FREE (₹0.00)
  - **Total Payable: ₹299.00**
- **Payment Methods Supported**:
  1. **UPI / Dynamic QR Code**: Scan & Pay with GPay, PhonePe, Paytm, BHIM, or enter UPI ID
  2. **Credit / Debit Cards**: Visa, Mastercard, RuPay support with CVV and expiry
  3. **Net Banking**: HDFC, SBI, ICICI, Axis, and UPES Campus Branch
- **Simulate Payment**: 1-click test button to simulate instant bank authorization and update MongoDB Atlas
- **Official Payment Receipt**:
  - Unique Transaction ID (e.g. `TXN-UPES-XXXXXXXX`)
  - Payment status verified & recorded in MongoDB Atlas
  - **Print / Save as PDF** tax receipt option.

---

### 3. MongoDB Atlas Online Storage
- Direct persistence into **MongoDB Atlas** cloud database using PyMongo and SRV DNS protocol
- Stores registration status (`Pending` -> `Paid`), transaction ID, and timestamp
- Dynamic configuration via UI modal or `.env`
- Graceful in-memory fallback cache so the portal is testable out-of-the-box before adding cloud credentials.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti, Vite 8 |
| **Backend** | Python 3, FastAPI, Uvicorn, Pydantic v2 |
| **Database** | MongoDB Atlas (Cloud) via `pymongo[srv]` & `dnspython` |

---

## 🏁 Quick Start

### 1. Launch with 1 Command

On Windows:
```bash
./start.bat
```
or in PowerShell:
```powershell
./start.ps1
```
or via npm:
```bash
npm start
```

### 2. Or Run Separately

**Backend (Python FastAPI):**
```bash
cd backend
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
API Documentation (Swagger UI) is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

**Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌐 Connecting your MongoDB Atlas Database

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. In **Database Access**, create a user with a password.
3. In **Network Access**, whitelist IP `0.0.0.0/0` (Allow access from anywhere).
4. Click **Connect** > **Drivers (Python)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```
5. Paste it in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   DB_NAME=upes_club_portal
   ```
   *Alternatively, click the **"Atlas Ready"** badge in the top-right corner of the website and paste it directly into the modal!*
