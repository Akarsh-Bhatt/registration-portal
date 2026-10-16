from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random
import os

from models import (
    ParticipantCreate, ParticipantRecord, RegistrationResponse, 
    PaymentVerificationRequest, PaymentVerificationResponse, StatsResponse
)
import database

app = FastAPI(
    title="UPES Student Club Registration Portal API",
    description="Backend API powered by Python, FastAPI, and MongoDB Atlas with Payment Gateway Integration",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "UPES Club Registration Portal API",
        "documentation": "/docs",
        "database": database.get_status()
    }

@app.get("/api/health")
def health_check():
    return database.get_status()

@app.post("/api/connect-atlas")
def connect_atlas(payload: dict):
    """
    Dynamically update or test MongoDB Atlas connection string from UI.
    """
    uri = payload.get("uri", "").strip()
    if not uri:
        raise HTTPException(status_code=400, detail="MongoDB URI cannot be empty")
    
    database.init_db(uri)
    status_info = database.get_status()
    if status_info["connected_to_atlas"]:
        try:
            with open(".env", "w") as f:
                f.write(f"MONGODB_URI={uri}\nDB_NAME={status_info['database_name']}\n")
        except Exception:
            pass
        return {"success": True, "message": "Successfully connected to MongoDB Atlas!", "status": status_info}
    else:
        raise HTTPException(
            status_code=400, 
            detail=f"Failed to connect to MongoDB Atlas: {status_info['error_detail']}"
        )

@app.get("/api/check-sapid/{sapid}")
def check_sapid(sapid: str):
    """
    Real-time pre-check if a SAPID is already registered.
    """
    existing = database.find_by_sapid(sapid)
    return {
        "exists": existing is not None,
        "sapid": sapid,
        "name": existing.get("name") if existing else None
    }

@app.post("/api/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_participant(data: ParticipantCreate):
    """
    Registers a new club participant into MongoDB Atlas and initiates payment order.
    """
    # Generate unique ticket / pass registration ID and Order ID
    random_suffix = random.randint(1000, 9999)
    order_suffix = random.randint(10000, 99999)
    registration_id = f"UPES-CLUB-{data.sapid}-{random_suffix}"
    order_id = f"ORD-{data.sapid}-{order_suffix}"
    membership_fee = 299.0
    
    doc = data.model_dump()
    doc["registration_id"] = registration_id
    doc["order_id"] = order_id
    doc["payment_status"] = "Pending"
    doc["amount_due"] = membership_fee
    doc["created_at"] = datetime.now().isoformat()
    doc["status"] = "Pending Payment"

    try:
        inserted = database.insert_registration(doc)
        return RegistrationResponse(
            success=True,
            message=f"Credentials verified for {data.name}! Proceeding to club fee payment.",
            registration_id=registration_id,
            order_id=order_id,
            amount=membership_fee,
            participant=ParticipantRecord(**inserted)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/verify-payment", response_model=PaymentVerificationResponse)
def verify_payment(req: PaymentVerificationRequest):
    """
    Verifies payment gateway transaction and updates participant record in MongoDB Atlas.
    """
    # Generate simulated transaction ID if none provided
    txn_id = req.transaction_id or f"TXN-UPES-{random.randint(10000000, 99999999)}"
    now_iso = datetime.now().isoformat()

    updated = database.update_payment_record(
        req.registration_id,
        {
            "order_id": req.order_id,
            "transaction_id": txn_id,
            "amount": req.amount,
            "payment_method": req.payment_method,
            "paid_at": now_iso
        }
    )

    if not updated:
        raise HTTPException(status_code=404, detail="Registration record not found for payment confirmation")

    return PaymentVerificationResponse(
        success=True,
        message="Payment verified successfully! Your club registration is now active.",
        transaction_id=txn_id,
        registration_id=req.registration_id,
        paid_at=now_iso,
        amount=req.amount,
        participant=updated
    )

@app.get("/api/registrations")
def list_registrations(
    search: str = Query(None, description="Search by name, SAPID, email, branch"),
    year: str = Query(None, description="Filter by Current Year"),
    domain: str = Query(None, description="Filter by Domain Interest")
):
    """
    Returns list of club registrations.
    """
    records = database.get_all_registrations(search=search, year=year, domain=domain)
    return {
        "count": len(records),
        "registrations": records,
        "database_mode": database.get_status()["mode"]
    }

@app.get("/api/stats")
def get_stats():
    """
    Aggregated registration statistics.
    """
    return database.get_stats()

@app.delete("/api/registrations/{reg_id}")
def delete_registration(reg_id: str):
    """
    Delete a participant registration (Admin feature).
    """
    deleted = database.delete_registration(reg_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Registration not found")
    return {"success": True, "message": "Registration deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
