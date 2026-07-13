from __future__ import annotations
from datetime import date
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Certification, Education, Experience, Profile, Project, Skill

# Seed content is derived from the English CV (frontend/public/resume-en.pdf),
# which is the source of truth.

PROFILE = {
    "id": 1,
    "name": "Aloute Sana",
    "headline": "Senior AI Fullstack Engineer",
    "tagline": "Building agentic AI platforms and production-grade full-stack products from natural language to deployment.",
    "bio": (
        "I'm Aloute Sana, a Senior AI Fullstack Engineer based in Beijing. I architect AI code generation "
        "platforms with LangGraph and Pydantic, build RAG-powered LLM products with safety guardrails, and "
        "ship end-to-end systems spanning Next.js/React frontends, FastAPI/NestJS backends, and Supabase "
        "infrastructure. I hold a Master's in Computer Science from Beihang University (BUAA), speak English, "
        "French and Chinese, and love turning cutting-edge AI research into reliable, user-facing products."
    ),
    "avatar_url": None,  # set via admin ProfileEditor (e.g. /uploads/<file>) once a photo is uploaded
    "resume_url": None,  # locale-aware PDFs in frontend/public (resume-en.pdf / resume-zh.pdf) are the default
    "phone": "+86 131 4139 2484",
    "location": "Beijing, China",
    "email": "elsone121617@outlook.com",
    "github": "https://github.com/sanaaloute",
    "linkedin": "https://www.linkedin.com/in/aloute-sana",
    "twitter": None,
    "hero_stats": [
        {"label": "Years Experience", "value": "3+"},
        {"label": "Languages Spoken", "value": "EN · FR · ZH"},
        {"label": "Focus", "value": "Agentic AI · Full-Stack"},
    ],
    "focus_areas": [
        {"title": "Agentic AI & LLMs", "description": "LangGraph multi-agent orchestration, RAG, guardrails, MCP, AI code generation."},
        {"title": "Full-Stack Engineering", "description": "Next.js/React, FastAPI, NestJS, Supabase, PostgreSQL, Docker, CI/CD."},
        {"title": "Machine Learning", "description": "NLP, computer vision, time-series forecasting, model deployment."},
    ],
    "socials": [],
}

EXPERIENCES = [
    {
        "company": "Shenzhen Depei Open Source Data Technology Co., Ltd",
        "role": "Senior AI Fullstack Engineer",
        "location": "Shenzhen, China",
        "start_date": date(2026, 1, 1),
        "end_date": None,
        "description": "Architecting an AI code generation platform that produces production-ready websites from natural language prompts.",
        "highlights": [
            "Architected an AI code generation platform using LangGraph and Pydantic to produce production-ready websites from natural language prompts.",
            "Designed end-to-end system architecture spanning frontend, backend, and AI pipelines for scalability and reliability.",
            "Built frontend with Next.js/React and backend with Supabase (auth, database, real-time features).",
            "Implemented interactive AI editing allowing users to modify generated UI components via natural language.",
            "Enabled one-click GitHub push, Supabase integration, and Vercel deployment from the platform.",
            "Established CI/CD pipelines for automated testing and seamless multi-environment deployments.",
            "Led technical decisions on AI orchestration and platform scalability, aligning engineering with product strategy.",
            "Built daacoo, an e-commerce website selling AI conversation devices (www.daacoo.com, www.lovecode.com, www.dpqq.com, www.gitcc.com).",
        ],
        "stack": [
            "LangGraph", "Pydantic", "Python", "Next.js", "React", "Supabase", "TypeScript", "Vercel", "CI/CD"
        ],
        "position": 0,
    },
    {
        "company": "Algento (北京奥金拓网络科技有限公司)",
        "role": "AI/ML Engineer",
        "location": "Beijing, China",
        "start_date": date(2024, 6, 1),
        "end_date": date(2025, 12, 31),
        "description": "Built and deployed enterprise LLM systems: RAG chatbots, safety guardrails, multimodal pipelines, and predictive models.",
        "highlights": [
            "Built RAG-powered employee service chatbots using LLMs, improving response relevance and user satisfaction.",
            "Deployed LLM guardrails reducing safety violations (violence, sexual content, hate speech) by 80%.",
            "Developed a FastAPI-based voice-to-text chatbot with audio transcription, reducing user input time and increasing engagement by 20%.",
            "Created agentic image generation/editing pipelines (Qwen-Image, Nano Banana, Kolors) for ad banner production, reducing manual design time by 90%.",
            "Built a nationality prediction model with 98% accuracy, improving recommendation system performance by 60%.",
        ],
        "stack": [
            "Python", "LLMs", "RAG", "FastAPI", "Qwen-Image", "Kolors", "Whisper", "Docker"
        ],
        "position": 1,
    },
    {
        "company": "SFEM (北京钢流电磁技术有限公司)",
        "role": "Algorithm Engineer (Internship)",
        "location": "Beijing, China",
        "start_date": date(2024, 1, 1),
        "end_date": date(2024, 6, 30),
        "description": "Developed time-series forecasting models for renewable energy infrastructure.",
        "highlights": [
            "Developed a time series forecasting model for wind turbine power prediction with 80% forecast precision.",
            "Led data collection, preprocessing, and feature engineering to optimize model accuracy.",
            "Conducted model validation and performance evaluation to ensure production reliability.",
        ],
        "stack": ["Python", "PyTorch", "Scikit-learn", "Pandas", "NumPy"],
        "position": 2,
    },
    {
        "company": "VMware",
        "role": "Algorithm Engineer (Internship)",
        "location": "Beijing, China",
        "start_date": date(2023, 10, 1),
        "end_date": date(2024, 1, 31),
        "description": "Designed intelligent UX automation within graduate R&D initiatives.",
        "highlights": [
            "Designed and developed page recognition algorithms for end-to-end user experiences.",
            "Collaborated with cross-functional design teams throughout the full development lifecycle.",
            "Contributed to company-wide graduate program initiatives and technical projects.",
        ],
        "stack": ["Python", "TensorFlow", "OpenCV", "Scikit-learn"],
        "position": 3,
    },
]

PROJECTS = [
    {
        "title": "AI Web Builder",
        "summary": "AI-powered platform that generates full-stack websites from natural language prompts using multi-agent orchestration.",
        "body": (
            "<p>AI Web Builder turns plain-language descriptions into production-ready full-stack websites. "
            "A LangGraph/LangChain-based agentic workflow coordinates 20+ specialized agents — planner, designer, "
            "debugger, executor, reviewer — to automate the entire website generation pipeline.</p>"
            "<ul>"
            "<li>User prompts trigger agent orchestration, dynamically routing tasks to the most appropriate agents based on intent detection.</li>"
            "<li>Visual component editing lets users select UI elements in-browser and modify them via natural language commands.</li>"
            "<li>Multi-export capabilities: Supabase persistence, GitHub push, Coolify deployment, plus ZIP downloads for code portability.</li>"
            "<li>AI-driven debugging: users can request automated error fixes directly through the interface.</li>"
            "</ul>"
            "<p>Live at <a href=\"https://www.ai-web-builder.com\" target=\"_blank\" rel=\"noreferrer\">www.ai-web-builder.com</a>.</p>"
        ),
        "period": "2025 – Present",
        "location": None,
        "stack": ["LangGraph", "LangChain", "Python", "Supabase", "React", "Next.js", "Coolify"],
        "cover_url": None,
        "demo_url": None,
        "images": [],
        "featured": True,
        "position": 0,
    },
    {
        "title": "BRVM RealTimeStock AI Agent",
        "summary": "AI-driven Telegram bot (@BrvmBot) for monitoring and analyzing BRVM stock market portfolios with multi-agent intelligence.",
        "body": (
            "<p>A LangGraph-based agentic system featuring one master agent orchestrating 6 specialized subagents "
            "for distinct financial analysis tasks on the BRVM (West African stock exchange).</p>"
            "<ul>"
            "<li>Stock price plotting across custom date ranges.</li>"
            "<li>P&amp;L calculations per stock and across entire portfolios.</li>"
            "<li>Multi-stock price comparisons for informed investment decisions.</li>"
            "<li>Chroma vector database for efficient static data storage; SQLite for structured portfolio data.</li>"
            "<li>Natural-language CRUD over stock information, deployed as the Telegram bot @BrvmBot.</li>"
            "</ul>"
        ),
        "period": "2025",
        "location": None,
        "stack": ["LangGraph", "LangChain", "Python", "ChromaDB", "SQLite", "Telegram Bot API"],
        "cover_url": None,
        "demo_url": None,
        "images": [],
        "featured": True,
        "position": 1,
    },
    {
        "title": "Barkosem",
        "summary": "Cross-platform e-commerce marketplace connecting Chinese suppliers with African B2B buyers.",
        "body": (
            "<p>Barkosem is a full-stack marketplace ecosystem for cross-border bulk trade between Chinese suppliers "
            "and African B2B buyers.</p>"
            "<ul>"
            "<li>Cross-platform mobile apps built with Flutter (Android/iOS).</li>"
            "<li>Vendor management panel, admin console, landing page, and customer-facing web interface (Next.js).</li>"
            "<li>Microservices architecture with a NestJS API Gateway orchestrating backend services.</li>"
            "<li>Supabase as the primary database for real-time data synchronization across platforms.</li>"
            "</ul>"
            "<p>Live at <a href=\"https://www.barkosem.com\" target=\"_blank\" rel=\"noreferrer\">www.barkosem.com</a>.</p>"
        ),
        "period": "2024 – Present",
        "location": None,
        "stack": ["Next.js", "Flutter", "NestJS", "Supabase", "REST APIs", "Microservices"],
        "cover_url": None,
        "demo_url": None,
        "images": [],
        "featured": True,
        "position": 2,
    },
]

EDUCATION = [
    {
        "slug": "buaa-masters-computer-science",
        "institution": "Beijing University of Aeronautics and Astronautics (BUAA)",
        "degree": "Master's Degree in Computer Science and Technology",
        "location": "Beijing, China",
        "start_date": date(2021, 9, 1),
        "end_date": date(2024, 6, 30),
        "description": "Research topic: Person re-identification in panoramic view based on Transformers.",
        "position": 0,
    },
    {
        "slug": "buaa-bachelor-electronic-information-engineering",
        "institution": "Beijing University of Aeronautics and Astronautics (BUAA)",
        "degree": "Bachelor in Electronic Information Engineering",
        "location": "Beijing, China",
        "start_date": date(2018, 9, 1),
        "end_date": date(2021, 6, 30),
        "description": "Graduation project: Artificial Intelligence algorithm for fast optical data sampling processing.",
        "position": 1,
    },
]

CERTIFICATIONS = [
    {"slug": "ibm-rag-agentic-ai-capstone", "name": "RAG and Agentic AI Capstone Project", "issuer": "IBM", "year": None, "url": None, "position": 0},
    {"slug": "google-cloud-ai-infrastructure", "name": "Cloud AI Infrastructure", "issuer": "Google", "year": None, "url": None, "position": 1},
    {"slug": "ibm-develop-generative-ai-applications", "name": "Develop Generative AI Applications", "issuer": "IBM", "year": None, "url": None, "position": 2},
]

SKILL_CATEGORIES = [
    ("Machine Learning & AI", ["NLP", "Computer Vision", "LLMs", "MCP", "Agents"]),
    ("Agent Orchestration", ["LangGraph", "LangChain", "CrewAI", "BeeAI", "Pydantic"]),
    ("Languages", ["Python", "TypeScript"]),
    ("AI Coding", ["Claude", "Cursor", "Kimi Code"]),
    ("API Frameworks", ["FastAPI", "Node.js + Express", "Flask", "NestJS"]),
    ("Cloud & DevOps", ["Docker", "Git", "AWS", "CI/CD"]),
    ("Databases", ["MongoDB", "PostgreSQL", "MySQL", "Firebase", "Supabase"]),
    ("Soft Skills", ["Problem-solving", "Team collaboration", "Project management"]),
]


def _slug(*parts: str) -> str:
    from app.utils import sanitize_slug
    return sanitize_slug("-".join(parts))


async def _seed_profile(session: AsyncSession, overwrite: bool = False):
    existing = await session.execute(select(Profile).where(Profile.id == 1))
    profile = existing.scalar_one_or_none()
    if profile is None:
        session.add(Profile(**PROFILE))
    elif overwrite:
        for key, value in PROFILE.items():
            if key != "id":
                setattr(profile, key, value)


async def _seed_experiences(session: AsyncSession):
    for exp in EXPERIENCES:
        data = dict(exp)
        data["slug"] = _slug(exp["role"], exp["company"])
        session.add(Experience(**data))


async def _seed_projects(session: AsyncSession):
    for proj in PROJECTS:
        data = dict(proj)
        data["slug"] = _slug(proj["title"])
        session.add(Project(**data))


async def _seed_education(session: AsyncSession):
    for edu in EDUCATION:
        data = dict(edu)
        data["slug"] = data.get("slug") or _slug(edu["degree"], edu["institution"])
        session.add(Education(**data))


async def _seed_certifications(session: AsyncSession):
    for cert in CERTIFICATIONS:
        data = dict(cert)
        data["slug"] = data.get("slug") or _slug(cert["issuer"], cert["name"])
        session.add(Certification(**data))


async def _seed_skills(session: AsyncSession):
    position = 0
    for category, names in SKILL_CATEGORIES:
        for name in names:
            session.add(Skill(category=category, name=name, position=position))
            position += 1


async def _table_empty(session: AsyncSession, model) -> bool:
    result = await session.execute(select(model))
    return result.scalars().first() is None


async def seed_database(session: AsyncSession):
    """Idempotent seeding: only fills tables that are empty."""
    await _seed_profile(session)
    if await _table_empty(session, Experience):
        await _seed_experiences(session)
    if await _table_empty(session, Project):
        await _seed_projects(session)
    if await _table_empty(session, Education):
        await _seed_education(session)
    if await _table_empty(session, Certification):
        await _seed_certifications(session)
    if await _table_empty(session, Skill):
        await _seed_skills(session)
    await session.commit()


async def reseed_database(session: AsyncSession):
    """Reset CV-derived content (profile, experiences, projects, education,
    certifications, skills) and reseed from scratch. Blogs and uploads are kept."""
    for model in (Experience, Project, Education, Certification, Skill):
        await session.execute(delete(model))
    await _seed_profile(session, overwrite=True)
    await _seed_experiences(session)
    await _seed_projects(session)
    await _seed_education(session)
    await _seed_certifications(session)
    await _seed_skills(session)
    await session.commit()


if __name__ == "__main__":
    import asyncio
    import sys
    from app.db import AsyncSessionLocal

    async def main():
        reset = "--reset" in sys.argv
        async with AsyncSessionLocal() as session:
            if reset:
                await reseed_database(session)
                print("Reseeded profile, experiences, projects, education, certifications, skills.")
            else:
                await seed_database(session)
                print("Seeded empty tables (idempotent). Use --reset to overwrite CV-derived content.")

    asyncio.run(main())
