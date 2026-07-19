import asyncio
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import create_app
from app.core.database import Base, get_db_session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

async def debug():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        app = create_app()
        app.dependency_overrides[get_db_session] = lambda: session
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://testserver") as client:
            print("--- Registering ---")
            reg_res = await client.post(
                "/api/v1/auth/register",
                json={
                    "email": "rotation@arenamind.ai",
                    "password": "SuperSecureP@ss1234",
                    "full_name": "Rotation Test"
                }
            )
            print("Register status:", reg_res.status_code)
            print("Register body:", reg_res.json())
            
            print("--- Logging in ---")
            login_res = await client.post(
                "/api/v1/auth/login",
                data={"username": "rotation@arenamind.ai", "password": "SuperSecureP@ss1234"}
            )
            print("Login status:", login_res.status_code)
            print("Login body:", login_res.json())

if __name__ == "__main__":
    asyncio.run(debug())
