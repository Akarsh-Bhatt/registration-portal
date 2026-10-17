from datetime import datetime
from typing import Optional, List
import re
from pydantic import BaseModel, Field, field_validator

class ParticipantCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Full Name of participant, e.g., Aarav Singh")
    sapid: str = Field(..., description="UPES Student SAP ID, e.g., 590012345")
    college_email: str = Field(..., description="College email, e.g., aarav.12345@stu.upes.ac.in")
    phone: str = Field(..., description="10-digit mobile number")
    current_year: str = Field(..., description="Current Year of study, e.g., 1st Year, 2nd Year")
    branch: Optional[str] = Field(default="B.Tech Computer Science", description="Degree and branch of study")
    domain_interest: Optional[str] = Field(default="Technical & Web Development", description="Primary domain interest")
    why_join: Optional[str] = Field(default="", max_length=500, description="Brief statement on why you want to join")
    github_or_portfolio: Optional[str] = Field(default="", max_length=200, description="Portfolio or GitHub profile link")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        clean = v.strip()
        if len(clean) < 2:
            raise ValueError("Name must be at least 2 characters long")
        return clean

    @field_validator("sapid")
    @classmethod
    def validate_sapid(cls, v: str) -> str:
        clean = re.sub(r"\s+", "", str(v).strip())
        if not re.match(r"^\d{9}$", clean):
            raise ValueError("SAPID must be exactly 9 digits (e.g., 590012345)")
        return clean

    @field_validator("college_email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        email_regex = r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$"
        if not re.match(email_regex, clean):
            raise ValueError("Invalid email format")
        return clean

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean = re.sub(r"[\s\-\(\)\+]", "", v.strip())
        if clean.startswith("91") and len(clean) == 12:
            clean = clean[2:]
        if not re.match(r"^[6-9]\d{9}$", clean):
            raise ValueError("Phone number must be a valid 10-digit Indian mobile number")
        return clean

    @field_validator("current_year")
    @classmethod
    def validate_year(cls, v: str) -> str:
        valid_years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year / Integrated", "Postgraduate (M.Tech/MBA/MCA)"]
        clean = v.strip()
        if clean not in valid_years:
            if "1" in clean: return "1st Year"
            if "2" in clean: return "2nd Year"
            if "3" in clean: return "3rd Year"
            if "4" in clean: return "4th Year"
            if "5" in clean: return "5th Year / Integrated"
            return clean
        return clean

class ParticipantRecord(ParticipantCreate):
    id: str
    registration_id: str
    created_at: datetime
    status: str = "Confirmed"
    payment_status: str = "Pending"
    order_id: Optional[str] = None
    transaction_id: Optional[str] = None
    amount_paid: Optional[float] = None
    paid_at: Optional[str] = None
    payment_method: Optional[str] = None

class RegistrationResponse(BaseModel):
    success: bool
    message: str
    registration_id: str
    order_id: str
    amount: float = 150.0
    participant: Optional[ParticipantRecord] = None

class PaymentVerificationRequest(BaseModel):
    registration_id: str
    order_id: str
    payment_method: str = "UPI"
    amount: float = 150.0
    transaction_id: Optional[str] = None

class PaymentVerificationResponse(BaseModel):
    success: bool
    message: str
    transaction_id: str
    registration_id: str
    paid_at: str
    amount: float
    participant: Optional[dict] = None
    email_dispatched: Optional[bool] = True
    email_sender: Optional[str] = "upes.hypervision@stu.upes.ac.in"

class StatsResponse(BaseModel):
    total_registrations: int
    by_year: dict[str, int]
    by_domain: dict[str, int]
    atlas_connected: bool
    database_name: str
