from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel

# Use google-auth (already installed via firebase-admin) to verify tokens
# This works WITHOUT a service account key — uses Google's public JWKS endpoint
import requests as http_requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from app.utils.database import get_db
from app.utils.config import settings
from app.utils.logger import get_logger
from app.models.models import User, UserRole
from app.schemas.schemas import UserUpdate
from app.utils.encryption import encrypt_api_key, decrypt_api_key

router = APIRouter()
logger = get_logger(__name__)

# ─── Token Verification ───────────────────────────────────────────────────────

def verify_firebase_token(authorization: str = Header(...)) -> dict:
    """
    Verify Firebase ID token from Authorization: Bearer <token> header.
    Uses Google's public JWKS — no service account key needed.
    """
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid auth header format received")
        raise HTTPException(status_code=401, detail="Invalid auth header. Use: Bearer <token>")
    id_token_str = authorization.split("Bearer ")[1].strip()
    try:
        request = google_requests.Request()
        decoded = id_token.verify_firebase_token(
            id_token_str,
            request,
            audience=settings.FIREBASE_PROJECT_ID,
        )
        uid = decoded.get("uid") or decoded.get("user_id")
        logger.info("Token verified successfully (uid=%s)", uid)
        return decoded
    except Exception as e:
        logger.warning("Token verification failed: %s", str(e))
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/sync", summary="Sync User")
def sync_user(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """
    Called after Firebase login/signup.
    Upserts the user into SQLite and returns their DB profile.
    """
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    email = decoded_token.get("email", "")
    name = decoded_token.get("name", "") or (email.split("@")[0] if email else "User")
    picture = decoded_token.get("picture", "")

    user = db.query(User).filter(User.firebase_uid == uid).first()

    if user:
        logger.info("Existing user synced (uid=%s, email=%s)", uid, email)
        user.last_login = datetime.utcnow()
        if picture and not user.avatar_url:
            user.avatar_url = picture
        if name and not user.display_name:
            user.display_name = name
    else:
        # Generate unique username from email
        base_username = email.split("@")[0].lower().replace(".", "_") if email else uid[:12]
        username = base_username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            firebase_uid=uid,
            email=email,
            username=username,
            display_name=name,
            avatar_url=picture,
            role=UserRole.STUDENT,
            last_login=datetime.utcnow(),
        )
        db.add(user)
        logger.info("New user created (uid=%s, username=%s, email=%s)", uid, username, email)

    db.commit()
    db.refresh(user)
    return _user_response(user)


@router.get("/me/{firebase_uid}", summary="Get User By Firebase Uid")
def get_user_by_firebase_uid(
    firebase_uid: str,
    db: Session = Depends(get_db),
):
    """Get a user's profile using their Firebase UID."""
    logger.info("Fetching user by firebase_uid=%s", firebase_uid)
    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        logger.warning("User not found (firebase_uid=%s)", firebase_uid)
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


@router.get("/{user_id}", summary="Get User By Id")
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get a user's profile using their DB integer ID."""
    logger.info("Fetching user by id=%d", user_id)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.warning("User not found (id=%d)", user_id)
        raise HTTPException(status_code=404, detail="User not found")
    return _user_response(user)


@router.get("/activity/{firebase_uid}", summary="Get User Activity")
def get_user_activity(
    firebase_uid: str,
    db: Session = Depends(get_db),
):
    """
    Get submission activity for the past year, grouped by date.
    Returns dict of {date_string: count} for the contribution graph.
    """
    from app.models.models import Submission
    from sqlalchemy import func
    from datetime import timedelta

    logger.info("Fetching activity for user (firebase_uid=%s)", firebase_uid)

    user = db.query(User).filter(User.firebase_uid == firebase_uid).first()
    if not user:
        logger.warning("User not found for activity fetch (firebase_uid=%s)", firebase_uid)
        raise HTTPException(status_code=404, detail="User not found")

    one_year_ago = datetime.utcnow() - timedelta(days=365)

    results = (
        db.query(
            func.date(Submission.created_at).label("date"),
            func.count(Submission.id).label("count"),
        )
        .filter(Submission.user_id == user.id)
        .filter(Submission.created_at >= one_year_ago)
        .group_by(func.date(Submission.created_at))
        .all()
    )

    activity = {str(row.date): row.count for row in results}
    logger.info("Activity fetched: %d active days found", len(activity))
    return {"activity": activity}


@router.patch("/update", summary="Update User Profile")
def update_user(
    update_data: UserUpdate,
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """Update the current user's profile information."""
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        logger.warning("User not found for profile update (uid=%s)", uid)
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.username:
        # Check if username is already taken by another user
        existing = db.query(User).filter(User.username == update_data.username).first()
        if existing and existing.id != user.id:
            logger.warning("Username '%s' already taken (requested by uid=%s)", update_data.username, uid)
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = update_data.username

    if update_data.display_name is not None:
        user.display_name = update_data.display_name
    
    if update_data.bio is not None:
        user.bio = update_data.bio

    db.commit()
    db.refresh(user)
    logger.info("User profile updated (uid=%s, username=%s)", uid, user.username)
    return _user_response(user)


# ─── API Key Management ───────────────────────────────────────────────────────

class ApiKeyBody(BaseModel):
    api_key: str


@router.post("/api-key", summary="Save Gemini API Key")
def save_api_key(
    body: ApiKeyBody,
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """Save or update the user's Gemini API key (stored encrypted)."""
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    key = body.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    # Encrypt and store
    user.gemini_api_key = encrypt_api_key(key)
    db.commit()
    logger.info("Gemini API key saved (uid=%s)", uid)
    return {"saved": True, "has_gemini_key": True}


@router.get("/api-key/status", summary="Check API Key Status")
def get_api_key_status(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """Check if the user has a Gemini API key configured. Never reveals the key."""
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    has_key = bool(user.gemini_api_key)
    logger.info("API key status check (uid=%s, has_key=%s)", uid, has_key)
    return {"has_key": has_key}


@router.delete("/api-key", summary="Remove Gemini API Key")
def delete_api_key(
    decoded_token: dict = Depends(verify_firebase_token),
    db: Session = Depends(get_db),
):
    """Remove the user's stored Gemini API key."""
    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    user = db.query(User).filter(User.firebase_uid == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.gemini_api_key = None
    db.commit()
    logger.info("Gemini API key removed (uid=%s)", uid)
    return {"deleted": True, "has_gemini_key": False}


@router.post("/api-key/validate", summary="Validate Gemini API Key")
def validate_user_api_key(
    body: ApiKeyBody,
    decoded_token: dict = Depends(verify_firebase_token),
):
    """Test whether a Gemini API key is valid by making a lightweight call."""
    from app.utils.gemini import validate_api_key

    key = body.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")

    uid = decoded_token.get("uid") or decoded_token.get("user_id")
    logger.info("Validating API key (uid=%s)", uid)

    is_valid = validate_api_key(key)
    logger.info("API key validation result (uid=%s, valid=%s)", uid, is_valid)
    return {"valid": is_valid}


# ─── Helper ───────────────────────────────────────────────────────────────────

def _user_response(user: User) -> dict:
    return {
        "id": user.id,
        "firebase_uid": user.firebase_uid,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "avatar_url": user.avatar_url,
        "bio": user.bio,
        "role": user.role,
        "total_score": user.total_score,
        "problems_solved": user.problems_solved,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "has_gemini_key": bool(user.gemini_api_key),
        "created_at": user.created_at.isoformat(),
        "last_login": user.last_login.isoformat() if user.last_login else None,
    }
