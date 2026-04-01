from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.utils.database import get_db
from app.utils.logger import get_logger
from app.models.models import Problem, DifficultyLevel
from app.schemas.schemas import ProblemListOut, ProblemOut

router = APIRouter()
logger = get_logger(__name__)


# ─── GET /api/problems ────────────────────────────────────────────────────────

@router.get("", response_model=list[ProblemListOut], summary="List Problems")
def list_problems(
    difficulty: Optional[str] = Query(None, description="Filter by difficulty: easy, medium, hard"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    db: Session = Depends(get_db),
):
    """
    List all coding problems.
    Optionally filter by difficulty and/or topic.
    Returns lightweight problem data (no descriptions or test cases).
    """
    logger.info("Listing problems (difficulty=%s, topic=%s)", difficulty, topic)

    query = db.query(Problem)

    if difficulty:
        try:
            diff_enum = DifficultyLevel(difficulty.lower())
            query = query.filter(Problem.difficulty == diff_enum)
        except ValueError:
            logger.warning("Invalid difficulty filter: '%s'", difficulty)
            pass  # Invalid difficulty — ignore filter

    if topic:
        query = query.filter(Problem.topic.ilike(f"%{topic}%"))

    problems = query.order_by(Problem.id).all()
    logger.info("Returning %d problems", len(problems))
    return problems


# ─── GET /api/problems/{slug} ────────────────────────────────────────────────

@router.get("/{slug}", response_model=ProblemOut, summary="Get Problem Detail")
def get_problem(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get full problem detail by slug.
    Returns description, examples, constraints, starter code.
    Does NOT return hidden test cases.
    """
    logger.info("Fetching problem detail (slug=%s)", slug)
    problem = db.query(Problem).filter(Problem.slug == slug).first()
    if not problem:
        logger.warning("Problem not found (slug=%s)", slug)
        raise HTTPException(status_code=404, detail="Problem not found")
    logger.info("Problem found: '%s' (id=%d, difficulty=%s)", problem.title, problem.id, problem.difficulty.value)
    return problem
