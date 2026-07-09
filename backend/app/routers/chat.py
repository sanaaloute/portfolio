from __future__ import annotations
import re
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.deps import get_db
from app.models import Blog, Experience, Profile, Project
from app.schemas import ChatQuery, ChatResponse

router = APIRouter()


def _tokenize(text: str) -> set[str]:
    return set(re.findall(r"[a-z0-9+#]+", text.lower()))


def _score(query: str, text: str) -> float:
    q = _tokenize(query)
    t = _tokenize(text)
    if not q:
        return 0.0
    overlap = q & t
    # Weight multi-word matches more
    return len(overlap) / len(q)


async def build_knowledge(db: AsyncSession):
    profile = (await db.execute(select(Profile).where(Profile.id == 1))).scalar_one_or_none()
    projects = (await db.execute(select(Project).order_by(Project.position))).scalars().all()
    experiences = (await db.execute(select(Experience).order_by(Experience.position))).scalars().all()
    blogs = (await db.execute(
        select(Blog).where(Blog.published == True).order_by(Blog.created_at.desc()).limit(5)
    )).scalars().all()
    return profile, projects, experiences, blogs


@router.post("/query", response_model=ChatResponse)
async def chat(payload: ChatQuery, db: AsyncSession = Depends(get_db)):
    query = payload.query
    profile, projects, experiences, blogs = await build_knowledge(db)

    # General profile fallback text
    profile_text = ""
    if profile:
        profile_text = f"{profile.name}. {profile.headline}. {profile.tagline}. {profile.bio}"

    candidates: list[tuple[str, float]] = []

    # Profile score
    if profile_text:
        candidates.append(("profile", _score(query, profile_text)))

    # Experience scores
    best_experience = None
    best_exp_score = 0.0
    for exp in experiences:
        text = f"{exp.role} {exp.company} {exp.description} {' '.join(exp.highlights or [])} {' '.join(exp.stack or [])}"
        s = _score(query, text)
        if s > best_exp_score:
            best_exp_score = s
            best_experience = exp

    # Project scores
    best_project = None
    best_proj_score = 0.0
    for proj in projects:
        text = f"{proj.title} {proj.summary} {proj.body} {' '.join(proj.stack or [])}"
        s = _score(query, text)
        if s > best_proj_score:
            best_proj_score = s
            best_project = proj

    # Blog scores
    best_blog = None
    best_blog_score = 0.0
    for blog in blogs:
        text = f"{blog.title} {blog.summary} {blog.body}"
        s = _score(query, text)
        if s > best_blog_score:
            best_blog_score = s
            best_blog = blog

    # Confidence thresholds
    best_type = "profile"
    best_score = candidates[0][1] if candidates else 0.0
    if best_exp_score > best_score:
        best_type, best_score = "experience", best_exp_score
    if best_proj_score > best_score:
        best_type, best_score = "project", best_proj_score
    if best_blog_score > best_score:
        best_type, best_score = "blog", best_blog_score

    if best_score < 0.05 or not profile:
        return ChatResponse(
            answer="I don't have enough information to answer that. Feel free to reach out via email for more details.",
            confidence=0.0,
        )

    # Build answer
    answer = ""
    q_lower = query.lower()

    # Special-cased intents
    if any(w in q_lower for w in ["contact", "email", "reach", "phone"]):
        answer = f"You can reach {profile.name} at {profile.email}." + (
            f" LinkedIn: {profile.linkedin}" if profile.linkedin else ""
        )
    elif any(w in q_lower for w in ["skill", "tech", "stack", "technologies"]):
        answer = f"{profile.name}'s core expertise spans AI/ML (LLMs, RAG, agentic systems, guardrails), Python, FastAPI, React, TypeScript, Docker, PostgreSQL, and cloud/DevOps workflows."
    elif best_type == "experience" and best_experience:
        e = best_experience
        period = f"{e.start_date.strftime('%b %Y')} – Present" if not e.end_date else f"{e.start_date.strftime('%b %Y')} – {e.end_date.strftime('%b %Y')}"
        answer = (
            f"At {e.company}, {profile.name} worked as {e.role} ({period}). "
            f"{e.description} Key highlights include: {', '.join(e.highlights[:3])}."
        )
    elif best_type == "project" and best_project:
        p = best_project
        answer = f"Project '{p.title}' ({p.period}): {p.summary} Built with {', '.join(p.stack[:6])}."
    elif best_type == "blog" and best_blog:
        b = best_blog
        answer = f"In the article '{b.title}': {b.summary or 'See the blog post for details.'}"
    else:
        answer = (
            f"{profile.name} is {profile.headline}. {profile.tagline} "
            f"Currently based in {profile.location or 'the tech industry'}, you can explore projects, experience, and blog posts on this site."
        )

    # Optional LLM polish (non-blocking; requires OPENAI_API_KEY)
    if settings.OPENAI_API_KEY:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            system = (
                "You are a concise, helpful portfolio assistant. Answer in 1-2 sentences using only the provided facts. "
                "If the question is unrelated to the portfolio, politely direct the user to email the owner."
            )
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": f"Question: {query}\n\nDraft answer: {answer}\n\nPolish the draft answer."},
                ],
                max_tokens=200,
                temperature=0.3,
            )
            answer = response.choices[0].message.content.strip() or answer
        except Exception:
            pass

    return ChatResponse(answer=answer, confidence=round(min(best_score + 0.2, 1.0), 2))
