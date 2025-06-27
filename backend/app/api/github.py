from pydantic import BaseModel
from fastapi import HTTPException

class GitHubConnectPayload(BaseModel):
    repo_url: str
    github_token: str

async def connect_github(payload: GitHubConnectPayload):
    print(f"🔐 Repo: {payload.repo_url}, Token: {payload.github_token[:4]}...")

    # Mock validation
    if not payload.repo_url.startswith("https://github.com/"):
        raise HTTPException(status_code=400, detail="Invalid GitHub repo URL")

    return {"message": f"Connected to {payload.repo_url} successfully"}
