# HYPERVISION — UPES Student Chapter Registration & Payment Portal

A club registration and checkout portal built with **React**, **Tailwind CSS**, **Python (FastAPI)**, and **MongoDB Atlas**, featuring the **Cosmic Lumina** design system.

---

## 🚀 Application Flow

### 1. Participant Registration Form (`pages/pg1`)
Captures all required student credentials with real-time validation:
- **Name**: e.g., `Aarav Sharma`
- **SAPID**: Exactly 9 digits (e.g., `590012345`) with real-time duplicate check
- **College Email**: e.g., `aarav.12345@stu.upes.ac.in` with 1-click `+ @stu.upes.ac.in` assistant
- **Phone Number**: 10-digit mobile number with validation
- **Current Year**: Selection (`1st Year`, `2nd Year`, `3rd Year`, `4th Year`)
- **⚡ 1-Click Quick Fill**: Demo button to populate `Aarav Sharma`'s credentials with 1 click.
- **HYP-XXXX Unique ID with Bloom Filter**:
  - Every registered participant is allocated a unique identifier formatted as `HYP-XXXX` (where `XXXX` is a 4-digit number, e.g. `HYP-4600`, `HYP-8155`).
  - Utilizes an in-memory **Bloom Filter** ($m = 65536$ bits, $k = 5$ hash functions) to check for duplicacy with zero false negatives prior to database persistence.

---

### 2. Integrated Payment Gateway Page (`pages/pg2`)
Opens immediately upon submitting credentials with verified order summary:
- **Unique Member ID**: Bloom Filter-verified `HYP-XXXX` displayed on order & receipt
- **Order ID**: e.g., `ORD-HYP-XXXX-XXXXX`
- **Credentials Review**: Confirms the student's Name, SAP ID, Email, Phone, and Academic Year
- **Total Payable**: ₹150.00
- **Payment Methods Supported**:
  1. **UPI / Dynamic QR Code**: Official Admin UPI handle (`hypervision.upes@okhdfcbank`) with 1-click COPY & QR code
  2. **Credit / Debit Cards**: Card entry with expiry and CVV
  3. **Net Banking**: HDFC, SBI, ICICI, Axis
- **12-Digit Transaction / UTR Ref Number**: Input with instant validation
- **Confirm & Submit Transaction**: Updates MongoDB Atlas with verified status.

---

### 3. Registration Complete (`pages/pg3`)
- Displays celebratory hero with "Registration complete!! Welcome to Hypervision"
- Verified Member Holographic Showcase showing `HYP-XXXX` Unique ID and confirmation badge
- Print / Save Receipt and "Register Another Member" actions.

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
