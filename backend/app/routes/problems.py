from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.utils.database import get_db
from app.models.models import Problem, DifficultyLevel
from app.schemas.schemas import ProblemListOut, ProblemOut

router = APIRouter()


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
    query = db.query(Problem)

    if difficulty:
        try:
            diff_enum = DifficultyLevel(difficulty.lower())
            query = query.filter(Problem.difficulty == diff_enum)
        except ValueError:
            pass  # Invalid difficulty — ignore filter

    if topic:
        query = query.filter(Problem.topic.ilike(f"%{topic}%"))

    problems = query.order_by(Problem.id).all()
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
    problem = db.query(Problem).filter(Problem.slug == slug).first()
    if not problem:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Problem not found")
    return problem
