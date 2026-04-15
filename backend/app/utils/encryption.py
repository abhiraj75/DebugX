"""
Fernet-based encryption for storing user API keys at rest.
Derives the encryption key from the app's SECRET_KEY.
"""

import base64
import hashlib
from cryptography.fernet import Fernet, InvalidToken
from app.utils.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def _get_fernet() -> Fernet:
    """Derive a Fernet key from SECRET_KEY (must be consistent across restarts)."""
    # SHA-256 hash → 32 bytes → base64-encode → valid Fernet key
    digest = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_api_key(plain_key: str) -> str:
    """Encrypt an API key string. Returns a base64-encoded ciphertext string."""
    f = _get_fernet()
    encrypted = f.encrypt(plain_key.encode())
    return encrypted.decode()


def decrypt_api_key(encrypted_key: str) -> str:
    """Decrypt an encrypted API key. Returns the original plaintext key."""
    try:
        f = _get_fernet()
        decrypted = f.decrypt(encrypted_key.encode())
        return decrypted.decode()
    except InvalidToken:
        logger.error("Failed to decrypt API key — invalid token or corrupted data")
        raise ValueError("Could not decrypt the stored API key")
