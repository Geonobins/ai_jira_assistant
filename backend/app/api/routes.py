from fastapi import APIRouter
from .github import connect_github  # and other handlers

router = APIRouter()
router.post("/connect")(connect_github)
# Later:
# router.post("/analyze")(analyze_bug)
