"""Development-only demo login that establishes a signed server session token."""
from fastapi import APIRouter, HTTPException
from src.config.settings import get_settings
from src.security import DemoLogin, issue_demo_token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/demo-login")
async def demo_login(payload: DemoLogin) -> dict[str, str]:
    settings = get_settings()
    if settings.is_production:
        raise HTTPException(status_code=404, detail="Not available")
    if payload.password != settings.demo_customer_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": issue_demo_token(payload.role), "token_type": "bearer"}
