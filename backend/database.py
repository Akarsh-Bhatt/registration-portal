import os
import json
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, DuplicateKeyError, ServerSelectionTimeoutError

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("club_database")

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("DB_NAME", "club_portal_db")
COLLECTION_NAME = "registrations"

client: Optional[MongoClient] = None
db = None
collection = None
is_connected_to_atlas = False
connection_error_detail = ""

# Local in-memory fallback list for instant local demo or offline testing
_local_storage: List[Dict[str, Any]] = [
    {
        "_id": "demo-seed-1",
        "id": "demo-seed-1",
        "registration_id": "HYPE4192",
        "name": "Priya Patel",
        "sapid": "590099001",
        "college_email": "priya.99001@stu.upes.ac.in",
        "phone": "9812398123",
        "current_year": "3rd Year",
        "branch": "B.Tech CSE - Cloud & Big Data",
        "interest": "Web Development",
        "domain_interest": "Web Development",
        "linkedin": "https://linkedin.com/in/priya-patel",
        "github": "https://github.com/priya-patel",
        "why_join": "Excited to mentor juniors and collaborate on club hackathons.",
        "github_or_portfolio": "https://github.com/priya-patel",
        "created_at": datetime.now().isoformat(),
        "status": "Confirmed"
    }
]

def init_db(uri: Optional[str] = None):
    """
    Initializes connection to MongoDB Atlas.
    """
    global client, db, collection, is_connected_to_atlas, connection_error_detail
    target_uri = uri or os.getenv("MONGODB_URI", "")

    if not target_uri or target_uri.strip() == "" or "username:password" in target_uri:
        is_connected_to_atlas = False
        connection_error_detail = "MONGODB_URI not configured or contains placeholder. Running in high-performance local demo mode."
        logger.warning(connection_error_detail)
        return

    try:
        logger.info("Attempting connection to MongoDB Atlas...")
        client = MongoClient(target_uri, serverSelectionTimeoutMS=4000)
        # Verify connection
        client.admin.command('ping')
        db = client[DB_NAME]
        collection = db[COLLECTION_NAME]
        
        # Create unique indexes
        collection.create_index("sapid", unique=True)
        collection.create_index("college_email")
        collection.create_index("order_id", unique=True, sparse=True)
        try:
            indexes = collection.index_information()
            if "registration_id_1" in indexes:
                if not indexes["registration_id_1"].get("sparse", False):
                    collection.drop_index("registration_id_1")
                    collection.create_index("registration_id", unique=True, sparse=True)
            else:
                collection.create_index("registration_id", unique=True, sparse=True)
        except Exception as e:
            logger.warning(f"Could not configure sparse registration_id index: {e}")

        is_connected_to_atlas = True
        connection_error_detail = ""
        logger.info(f"Successfully connected to MongoDB Atlas database: {DB_NAME}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        is_connected_to_atlas = False
        connection_error_detail = f"Could not connect to Atlas: {str(e)}"
        logger.error(connection_error_detail)
    except Exception as e:
        is_connected_to_atlas = False
        connection_error_detail = f"MongoDB initialization error: {str(e)}"
        logger.error(connection_error_detail)

# Try initial connection
init_db()

def get_status() -> Dict[str, Any]:
    return {
        "connected_to_atlas": is_connected_to_atlas,
        "database_name": DB_NAME,
        "collection_name": COLLECTION_NAME,
        "has_uri_set": bool(os.getenv("MONGODB_URI", "")),
        "error_detail": connection_error_detail,
        "mode": "MongoDB Atlas (Cloud)" if is_connected_to_atlas else "Local In-Memory Cache (Ready for Atlas URI)"
    }

def find_by_sapid(sapid: str) -> Optional[Dict[str, Any]]:
    clean_sapid = sapid.strip()
    if is_connected_to_atlas and collection is not None:
        doc = collection.find_one({"sapid": clean_sapid})
        if doc:
            doc["id"] = str(doc.get("_id"))
            return doc
        return None
    else:
        for item in _local_storage:
            if item.get("sapid") == clean_sapid:
                return item
        return None

def find_by_email(email: str) -> Optional[Dict[str, Any]]:
    clean_email = email.strip().lower()
    if is_connected_to_atlas and collection is not None:
        doc = collection.find_one({"college_email": clean_email})
        if doc:
            doc["id"] = str(doc.get("_id"))
            return doc
        return None
    else:
        for item in _local_storage:
            if item.get("college_email", "").lower() == clean_email:
                return item
        return None

def insert_registration(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Inserts participant registration into MongoDB Atlas or fallback store.
    Raises ValueError if SAPID or email already exists.
    """
    # Check duplicates
    if find_by_sapid(data["sapid"]):
        raise ValueError(f"SAPID {data['sapid']} is already registered in the club portal.")
    if find_by_email(data["college_email"]):
        raise ValueError(f"College Email {data['college_email']} is already registered.")

    if is_connected_to_atlas and collection is not None:
        try:
            insert_result = collection.insert_one(data.copy())
            data["id"] = str(insert_result.inserted_id)
            return data
        except DuplicateKeyError:
            raise ValueError(f"A registration with SAPID {data['sapid']} or Email already exists.")
    else:
        doc = data.copy()
        doc["id"] = f"loc-{len(_local_storage)+1}"
        doc["_id"] = doc["id"]
        _local_storage.insert(0, doc)
        return doc

def get_all_registrations(search: Optional[str] = None, year: Optional[str] = None, domain: Optional[str] = None) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []

    if is_connected_to_atlas and collection is not None:
        query: Dict[str, Any] = {}
        if year and year != "All":
            query["current_year"] = year
        if domain and domain != "All":
            query["domain_interest"] = domain
        if search and search.strip():
            s = search.strip()
            query["$or"] = [
                {"name": {"$regex": s, "$options": "i"}},
                {"sapid": {"$regex": s, "$options": "i"}},
                {"college_email": {"$regex": s, "$options": "i"}},
                {"branch": {"$regex": s, "$options": "i"}},
            ]
        cursor = collection.find(query).sort("created_at", -1)
        for doc in cursor:
            doc["id"] = str(doc.get("_id"))
            # remove raw mongo _id if needed
            doc["_id"] = str(doc.get("_id"))
            results.append(doc)
    else:
        items = list(_local_storage)
        for item in items:
            match = True
            if year and year != "All" and item.get("current_year") != year:
                match = False
            if domain and domain != "All" and item.get("domain_interest") != domain:
                match = False
            if search and search.strip():
                s = search.strip().lower()
                in_name = s in item.get("name", "").lower()
                in_sapid = s in item.get("sapid", "")
                in_email = s in item.get("college_email", "").lower()
                in_branch = s in item.get("branch", "").lower()
                if not (in_name or in_sapid or in_email or in_branch):
                    match = False
            if match:
                results.append(item)

    return results

def get_stats() -> Dict[str, Any]:
    all_regs = get_all_registrations()
    by_year: Dict[str, int] = {}
    by_domain: Dict[str, int] = {}

    for r in all_regs:
        y = r.get("current_year", "Unspecified")
        by_year[y] = by_year.get(y, 0) + 1

        d = r.get("domain_interest", "General")
        by_domain[d] = by_domain.get(d, 0) + 1

    return {
        "total_registrations": len(all_regs),
        "by_year": by_year,
        "by_domain": by_domain,
        "atlas_connected": is_connected_to_atlas,
        "database_name": DB_NAME
    }

def find_by_registration_id(reg_id: str) -> Optional[Dict[str, Any]]:
    if not reg_id:
        return None
    if is_connected_to_atlas and collection is not None:
        doc = collection.find_one({"registration_id": reg_id})
        if doc:
            doc["id"] = str(doc.get("_id"))
            return doc
        return None
    else:
        for item in _local_storage:
            if item.get("registration_id") == reg_id or item.get("id") == reg_id:
                return item
        return None

def find_by_order_id(order_id: str) -> Optional[Dict[str, Any]]:
    if not order_id:
        return None
    clean_order_id = order_id.strip()
    if is_connected_to_atlas and collection is not None:
        doc = collection.find_one({"order_id": clean_order_id})
        if doc:
            doc["id"] = str(doc.get("_id"))
            return doc
        return None
    else:
        for item in _local_storage:
            if item.get("order_id") == clean_order_id:
                return item
        return None

def update_payment_record(identifier: str, payment_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Updates the registration record with payment status, transaction ID, assigned registration_id, and timestamp.
    Accepts identifier which can be order_id, registration_id, or internal id.
    """
    update_fields = {
        "payment_status": "Paid",
        "status": "Confirmed",
        "order_id": payment_info.get("order_id"),
        "transaction_id": payment_info.get("transaction_id"),
        "amount_paid": payment_info.get("amount", 150.0),
        "payment_method": payment_info.get("payment_method", "UPI"),
        "paid_at": payment_info.get("paid_at", datetime.now().isoformat())
    }
    if "registration_id" in payment_info and payment_info["registration_id"]:
        update_fields["registration_id"] = payment_info["registration_id"]

    if is_connected_to_atlas and collection is not None:
        from bson import ObjectId
        query_conditions = [
            {"order_id": identifier},
            {"registration_id": identifier}
        ]
        try:
            if ObjectId.is_valid(identifier):
                query_conditions.append({"_id": ObjectId(identifier)})
        except Exception:
            pass

        query = {"$or": query_conditions}
        collection.update_one(query, {"$set": update_fields})
        doc = collection.find_one(query)
        if doc:
            doc["id"] = str(doc.get("_id"))
            return doc
        return None
    else:
        for item in _local_storage:
            if (
                item.get("order_id") == identifier or 
                item.get("registration_id") == identifier or 
                item.get("id") == identifier or
                item.get("_id") == identifier
            ):
                item.update(update_fields)
                return item
        return None

def delete_registration(identifier: str) -> bool:
    """
    Deletes a registration record by registration_id, order_id, or internal ID.
    """
    if is_connected_to_atlas and collection is not None:
        from bson import ObjectId
        query_conditions = [
            {"registration_id": identifier},
            {"order_id": identifier}
        ]
        try:
            if ObjectId.is_valid(identifier):
                query_conditions.append({"_id": ObjectId(identifier)})
        except Exception:
            pass

        res = collection.delete_one({"$or": query_conditions})
        return res.deleted_count > 0
    else:
        global _local_storage
        initial_len = len(_local_storage)
        _local_storage = [
            item for item in _local_storage
            if item.get("registration_id") != identifier and
               item.get("order_id") != identifier and
               item.get("id") != identifier and
               item.get("_id") != identifier
        ]
        return len(_local_storage) < initial_len

def get_all_registration_ids() -> List[str]:
    """
    Returns all registered unique IDs across MongoDB Atlas or local store.
    """
    ids: List[str] = []
    if is_connected_to_atlas and collection is not None:
        try:
            cursor = collection.find({"registration_id": {"$ne": None}}, {"registration_id": 1})
            for doc in cursor:
                rid = doc.get("registration_id")
                if rid:
                    ids.append(rid)
        except Exception as e:
            logger.error(f"Error fetching registration IDs: {e}")
    else:
        for item in _local_storage:
            rid = item.get("registration_id")
            if rid:
                ids.append(rid)
    return ids

def sync_bloom_filter():
    """
    Synchronizes the Bloom Filter with all IDs currently in the database.
    """
    from bloom_filter import unique_id_generator
    all_ids = get_all_registration_ids()
    unique_id_generator.sync_with_existing(all_ids)

# Trigger initial sync
sync_bloom_filter()

