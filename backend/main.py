from fastapi import FastAPI, HTTPException, Query, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import random
import os

from models import (
    ParticipantCreate, ParticipantRecord, RegistrationResponse, 
    PaymentVerificationRequest, PaymentVerificationResponse, StatsResponse
)
import database
from smtp_service import send_welcome_email, get_smtp_status, OFFICIAL_EMAIL

app = FastAPI(
    title="UPES Student Club Registration Portal API",
    description="Backend API powered by Python, FastAPI, and MongoDB Atlas with Payment Gateway & SMTP Integration",
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
        "database": database.get_status(),
        "smtp": get_smtp_status()
    }

@app.get("/api/health")
def health_check():
    from bloom_filter import unique_id_generator
    status_info = database.get_status()
    status_info["bloom_filter"] = unique_id_generator.bloom_filter.get_stats()
    status_info["smtp"] = get_smtp_status()
    return status_info

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

@app.get("/api/bloom-filter-stats")
def get_bloom_stats():
    """
    Returns Bloom Filter metrics and status for HYPEXXXX ID generation.
    """
    from bloom_filter import unique_id_generator
    return {
        "status": "active",
        "id_format": "HYPEXXXX (4-digit numerical)",
        "stats": unique_id_generator.bloom_filter.get_stats()
    }

@app.post("/api/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_participant(data: ParticipantCreate):
    """
    Registers a new club participant into MongoDB Atlas and initiates payment order.
    The official Unique Hypervision ID (HYPEXXXX) will be assigned after payment confirmation.
    """
    order_suffix = random.randint(100000, 999999)
    order_id = f"ORD-HYP-{order_suffix}"
    membership_fee = 150.0
    
    doc = data.model_dump()
    doc["registration_id"] = None  # Assigned ONLY after payment confirmation from gateway
    doc["order_id"] = order_id
    doc["payment_status"] = "Pending"
    doc["amount_due"] = membership_fee
    doc["created_at"] = datetime.now().isoformat()
    doc["status"] = "Pending Payment"

    try:
        inserted = database.insert_registration(doc)
        return RegistrationResponse(
            success=True,
            message=f"Details verified for {data.name}! Please complete payment to receive your official Hypervision ID.",
            registration_id=None,
            order_id=order_id,
            amount=membership_fee,
            participant=ParticipantRecord(**inserted)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/api/verify-payment", response_model=PaymentVerificationResponse)
def verify_payment(req: PaymentVerificationRequest, background_tasks: BackgroundTasks):
    """
    Verifies payment gateway transaction, assigns verified Unique Hypervision ID (HYPEXXXX)
    via Bloom Filter upon payment confirmation, updates participant record in MongoDB Atlas,
    and dispatches the official Hypervision welcome email from upes.hypervision@stu.upes.ac.in.
    """
    from bloom_filter import unique_id_generator

    # 1. Look up existing registration by order_id or registration_id
    record = None
    if req.order_id:
        record = database.find_by_order_id(req.order_id)
    if not record and req.registration_id:
        record = database.find_by_registration_id(req.registration_id)

    if not record:
        raise HTTPException(
            status_code=404, 
            detail=f"Registration record not found for Order ID: {req.order_id}"
        )

    # 2. Assign Unique Hypervision ID ONLY AFTER payment confirmation from gateway!
    unique_id = record.get("registration_id")
    if not unique_id:
        unique_id = unique_id_generator.generate_unique_id(
            exists_in_db_fn=lambda cid: database.find_by_registration_id(cid) is not None
        )

    # Generate simulated transaction ID if none provided
    txn_id = req.transaction_id or f"TXN-UPES-{random.randint(10000000, 99999999)}"
    now_iso = datetime.now().isoformat()

    updated = database.update_payment_record(
        req.order_id or req.registration_id,
        {
            "order_id": req.order_id,
            "registration_id": unique_id,
            "transaction_id": txn_id,
            "amount": req.amount,
            "payment_method": req.payment_method,
            "paid_at": now_iso
        }
    )

    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update registration record after payment")

    # Queue welcome email to be dispatched in background via official email
    recipient_email = updated.get("college_email")
    recipient_name = updated.get("name", "Hypervision Member")
    sapid = updated.get("sapid", "")
    current_year = updated.get("current_year", "1st Year")

    if recipient_email:
        background_tasks.add_task(
            send_welcome_email,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            unique_id=unique_id,
            sapid=sapid,
            current_year=current_year,
            txn_id=txn_id
        )

    return PaymentVerificationResponse(
        success=True,
        message=f"Payment verified successfully! Welcome to Hypervision! Assigned Member ID: {unique_id}. Welcome email sent to {recipient_email}.",
        transaction_id=txn_id,
        registration_id=unique_id,
        order_id=req.order_id,
        paid_at=now_iso,
        amount=req.amount,
        participant=updated,
        email_dispatched=True,
        email_sender=OFFICIAL_EMAIL
    )

@app.get("/api/smtp-status")
def smtp_status():
    """
    Returns SMTP configuration details and whether live dispatch or simulation mode is active.
    """
    return get_smtp_status()

@app.post("/api/resend-confirmation-email/{reg_id}")
def resend_confirmation_email(reg_id: str):
    """
    Manually triggers / tests sending the welcome email for a specific registered member.
    """
    record = database.find_by_registration_id(reg_id) or database.find_by_order_id(reg_id)
    if not record:
        raise HTTPException(status_code=404, detail=f"Member with ID '{reg_id}' not found.")
    
    unique_id = record.get("registration_id")
    if not unique_id:
        raise HTTPException(
            status_code=400, 
            detail="Cannot send welcome email: Member has not completed payment and has no Unique ID assigned."
        )

    result = send_welcome_email(
        recipient_email=record.get("college_email"),
        recipient_name=record.get("name"),
        unique_id=unique_id,
        sapid=record.get("sapid"),
        current_year=record.get("current_year", "1st Year"),
        txn_id=record.get("transaction_id", "TXN-UPES-CONFIRMED")
    )
    return result

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
