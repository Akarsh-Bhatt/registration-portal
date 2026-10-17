import os
import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("smtp_service")

# Official Hypervision Email & SMTP Configuration
OFFICIAL_EMAIL = "upes.hypervision@stu.upes.ac.in"
OFFICIAL_SENDER_NAME = "UPES Hypervision Chapter"

def get_smtp_config() -> Dict[str, Any]:
    """
    Dynamically reloads and returns the current SMTP configuration from .env.
    """
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        load_dotenv(env_path, override=True)
    
    host = os.getenv("SMTP_HOST", "smtp.gmail.com").strip()
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER", "").strip()
    pwd = os.getenv("SMTP_PASSWORD", "").strip()
    from_email = os.getenv("SMTP_FROM_EMAIL", user or OFFICIAL_EMAIL).strip()
    from_name = os.getenv("SMTP_FROM_NAME", OFFICIAL_SENDER_NAME).strip()
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")

    # If Gmail is used, automatically strip spaces and underscores from App Password
    if "gmail.com" in host.lower() and pwd:
        pwd = pwd.replace(" ", "").replace("_", "")

    return {
        "host": host,
        "port": port,
        "user": user,
        "password": pwd,
        "from_email": from_email,
        "from_name": from_name,
        "use_tls": use_tls,
        "is_configured": bool(pwd and user)
    }

def get_smtp_status() -> Dict[str, Any]:
    """
    Returns current configuration status of the SMTP service.
    """
    cfg = get_smtp_config()
    return {
        "official_email": OFFICIAL_EMAIL,
        "sender_name": cfg["from_name"],
        "host": cfg["host"],
        "port": cfg["port"],
        "user": cfg["user"],
        "from_email": cfg["from_email"],
        "is_configured": cfg["is_configured"],
        "mode": "Live SMTP Dispatch" if cfg["is_configured"] else "Simulation / Ready for Password"
    }

def generate_email_html(
    recipient_name: str,
    unique_id: str,
    sapid: str,
    current_year: str,
    txn_id: str
) -> str:
    """
    Generates a Cosmic Lumina styled HTML email congratulating the member.
    """
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Hypervision</title>
  <style>
    body {{
      margin: 0;
      padding: 0;
      background-color: #0A071B;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #E7DFF3;
    }}
    .email-container {{
      max-width: 600px;
      margin: 30px auto;
      background: #0F0C19;
      border: 1px solid rgba(153, 0, 255, 0.3);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
    }}
    .accent-bar {{
      height: 6px;
      background: linear-gradient(90deg, #6823C3 0%, #007BFF 50%, #00EEFC 100%);
    }}
    .header {{
      padding: 35px 30px 20px;
      text-align: center;
      background: radial-gradient(circle at top, rgba(153, 0, 255, 0.15) 0%, transparent 70%);
    }}
    .brand-title {{
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #FFFFFF;
      margin: 0;
      text-shadow: 0 0 20px rgba(0, 238, 252, 0.4);
    }}
    .brand-subtitle {{
      color: #deb7ff;
      font-size: 13px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin-top: 6px;
      font-weight: 600;
    }}
    .content {{
      padding: 20px 30px 35px;
    }}
    .greeting {{
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 12px;
    }}
    .congrats-banner {{
      background: rgba(0, 238, 252, 0.08);
      border: 1px solid rgba(0, 238, 252, 0.3);
      border-radius: 14px;
      padding: 16px 20px;
      margin: 20px 0;
      color: #E7DFF3;
      font-size: 14px;
      line-height: 1.6;
    }}
    .id-box {{
      background: #15111F;
      border: 2px solid #00EEFC;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
      box-shadow: 0 0 30px rgba(0, 238, 252, 0.2);
    }}
    .id-label {{
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #deb7ff;
      margin-bottom: 6px;
      font-weight: 600;
    }}
    .id-value {{
      font-size: 32px;
      font-weight: 900;
      color: #FFFFFF;
      letter-spacing: 4px;
      font-family: 'Courier New', Courier, monospace;
    }}
    .details-table {{
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      font-size: 13px;
    }}
    .details-table td {{
      padding: 10px 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }}
    .details-table td.label {{
      color: #A098B5;
      font-weight: 600;
      width: 40%;
    }}
    .details-table td.value {{
      color: #FFFFFF;
      font-weight: 600;
      font-family: 'Courier New', Courier, monospace;
    }}
    .benefits-section {{
      background: rgba(21, 17, 31, 0.6);
      border-radius: 14px;
      padding: 18px 20px;
      margin: 20px 0;
      font-size: 13px;
      line-height: 1.7;
    }}
    .benefits-title {{
      font-weight: 700;
      color: #00EEFC;
      margin-bottom: 8px;
      font-size: 14px;
    }}
    .footer {{
      padding: 24px 30px;
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background: #0A071B;
      font-size: 12px;
      color: #8C82A2;
    }}
    .footer a {{
      color: #00EEFC;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="accent-bar"></div>
    
    <div class="header">
      <h1 class="brand-title">HYPERVISION</h1>
      <div class="brand-subtitle">Innovate &bull; Collaborate &bull; Elevate</div>
    </div>

    <div class="content">
      <div class="greeting">Dear {recipient_name},</div>

      <div class="congrats-banner">
        <strong>Congratulations on becoming an official part of the Hypervision family!</strong><br>
        Your registration and membership payment for the UPES Student Chapter have been successfully verified and confirmed.
      </div>

      <div class="id-box">
        <div class="id-label">Official Unique Member ID</div>
        <div class="id-value">{unique_id}</div>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">Candidate Name</td>
          <td class="value">{recipient_name}</td>
        </tr>
        <tr>
          <td class="label">SAP ID</td>
          <td class="value">{sapid}</td>
        </tr>
        <tr>
          <td class="label">Academic Year</td>
          <td class="value">{current_year}</td>
        </tr>
        <tr>
          <td class="label">Membership Status</td>
          <td class="value" style="color: #10B981;">Active Member</td>
        </tr>
        <tr>
          <td class="label">Transaction Reference</td>
          <td class="value">{txn_id}</td>
        </tr>
        <tr>
          <td class="label">Official Sender</td>
          <td class="value" style="font-size: 11px;">{OFFICIAL_EMAIL}</td>
        </tr>
      </table>

      <div class="benefits-section">
        <div class="benefits-title">✦ What Lies Ahead:</div>
        &bull; Priority access to flagship hackathons, technical bootcamps & astronomy labs.<br>
        &bull; Project mentorship and collaboration with core team leads.<br>
        &bull; Exclusive workshop materials and student chapter certificates.
      </div>

      <p style="font-size: 13px; line-height: 1.6; color: #A098B5; margin-top: 20px;">
        Please keep your <strong>Unique ID ({unique_id})</strong> handy for event check-ins, orientation sessions, and workshop registrations.
      </p>

      <p style="font-size: 13px; color: #E7DFF3; margin-top: 25px;">
        Warm regards,<br>
        <strong>Executive Board, Hypervision Chapter</strong><br>
        <span style="color: #8C82A2; font-size: 12px;">University of Petroleum and Energy Studies (UPES)</span>
      </p>
    </div>

    <div class="footer">
      This is an official communication from <strong>Hypervision Student Chapter</strong>.<br>
      Inquiries? Contact us at <a href="mailto:{OFFICIAL_EMAIL}">{OFFICIAL_EMAIL}</a>.<br>
      &copy; 2026 Hypervision &bull; UPES Dehradun. All rights reserved.
    </div>
  </div>
</body>
</html>
"""

def generate_email_plaintext(
    recipient_name: str,
    unique_id: str,
    sapid: str,
    current_year: str,
    txn_id: str
) -> str:
    """
    Plaintext fallback for email clients that do not render HTML.
    """
    return f"""HYPERVISION — UPES Student Chapter
Innovate | Collaborate | Elevate

Dear {recipient_name},

Congratulations on becoming an official part of the Hypervision family!
Your registration and membership payment have been verified successfully.

==================================================
OFFICIAL UNIQUE MEMBER ID: {unique_id}
==================================================

Registration Summary:
- Candidate: {recipient_name}
- SAP ID: {sapid}
- Year of Study: {current_year}
- Membership Status: Active
- Transaction Reference: {txn_id}
- Official Club Contact: {OFFICIAL_EMAIL}

What's Next:
- Please preserve your Unique Member ID ({unique_id}) for event check-ins and orientation.
- You will receive calendar invites and WhatsApp orientation links shortly.

Warm regards,
Executive Board, Hypervision
University of Petroleum and Energy Studies (UPES)
Email: {OFFICIAL_EMAIL}
"""

def send_welcome_email(
    recipient_email: str,
    recipient_name: str,
    unique_id: str,
    sapid: str,
    current_year: str,
    txn_id: str = "TXN-UPES-CONFIRMED"
) -> Dict[str, Any]:
    """
    Sends the official congratulatory welcome email with the Unique ID.
    If live SMTP credentials are not yet configured in .env, operates in
    simulation mode with detailed logging so no user flow is blocked.
    """
    subject = f"Welcome to Hypervision! Official Member ID: {unique_id}"
    
    cfg = get_smtp_config()
    
    # Check if credentials are ready
    if not cfg["is_configured"]:
        logger.info(
            f"[SMTP Simulation] Welcome email simulated for {recipient_name} ({recipient_email}).\n"
            f"  Unique ID: {unique_id}\n"
            f"  From: {OFFICIAL_EMAIL}\n"
            f"  Status: Ready (Provide SMTP_PASSWORD in backend/.env for live dispatch)"
        )
        return {
            "success": True,
            "mode": "simulation",
            "message": "Welcome email simulated (Configure SMTP_PASSWORD in backend/.env for live transmission).",
            "recipient": recipient_email,
            "unique_id": unique_id,
            "sender": OFFICIAL_EMAIL
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{cfg['from_name']} <{cfg['from_email']}>"
        msg["To"] = recipient_email
        msg["Reply-To"] = OFFICIAL_EMAIL

        # Plaintext and HTML parts
        text_content = generate_email_plaintext(recipient_name, unique_id, sapid, current_year, txn_id)
        html_content = generate_email_html(recipient_name, unique_id, sapid, current_year, txn_id)

        msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        logger.info(f"Connecting to SMTP server {cfg['host']}:{cfg['port']} via {'TLS' if cfg['use_tls'] else 'Standard'}...")
        
        server = smtplib.SMTP(cfg["host"], cfg["port"], timeout=12)
        if cfg["use_tls"]:
            server.starttls()
        
        server.login(cfg["user"], cfg["password"])
        server.sendmail(cfg["from_email"], [recipient_email], msg.as_string())
        server.quit()

        logger.info(f"Welcome email successfully sent to {recipient_email} for Unique ID: {unique_id}")
        return {
            "success": True,
            "mode": "live",
            "message": f"Welcome email successfully sent to {recipient_email} from {cfg['from_email']}.",
            "recipient": recipient_email,
            "unique_id": unique_id,
            "sender": cfg["from_email"]
        }

    except Exception as e:
        logger.error(f"Failed to send email to {recipient_email} via SMTP: {str(e)}")
        return {
            "success": False,
            "mode": "error",
            "error": str(e),
            "message": f"SMTP delivery failed: {str(e)}",
            "recipient": recipient_email,
            "unique_id": unique_id
        }
