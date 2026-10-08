"""Minimal JWT authentication for the existing demo portals and Z-Sentinel APIs."""
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from src.config.settings import get_settings

bearer = HTTPBearer(auto_error=False)

class DemoLogin(BaseModel):
    role: str = Field(pattern="^(customer|agent|manager)$")
    password: str = Field(min_length=8, max_length=128)

def issue_demo_token(role: str) -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": f"demo-{role}", "role": role, "iat": now, "exp": now + timedelta(minutes=settings.access_token_expire_minutes)}, settings.secret_key, algorithm=settings.algorithm)

async def current_identity(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)]) -> dict[str, str]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    settings = get_settings()
    try:
        claims = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        role, subject = claims.get("role"), claims.get("sub")
        if role not in {"customer", "agent", "manager"} or not isinstance(subject, str): raise JWTError("invalid claims")
        return {"role": role, "sub": subject}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def require_manager(identity: Annotated[dict[str, str], Depends(current_identity)]) -> dict[str, str]:
    if identity["role"] != "manager": raise HTTPException(status_code=403, detail="Manager role required")
    return identity
