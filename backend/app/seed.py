from __future__ import annotations
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Experience, Profile, Skill

PROFILE = {
    "id": 1,
    "name": "Aloute Sana",
    "headline": "AI/ML Engineer & Full-Stack Developer",
    "tagline": "Turning cutting-edge AI research into production-grade software that ships.",
    "bio": (
        "I'm Aloute Sana, an AI/ML Engineer and Full-Stack Developer with a passion for building "
        "intelligent systems end-to-end. Over the years I've shipped LLM-powered chatbots, agentic "
        "workflows, multimodal products, predictive models, and scalable web applications. I thrive "
        "at the intersection of research and engineering — turning complex ideas into reliable, "
        "user-facing products."
    ),
    "avatar_url": "/profile_pic.jpg",
    "resume_url": None,
    "location": "Beijing, China",
    "email": "elsone121617@outlook.com",
    "github": "https://github.com/sanaaloute",
    "linkedin": "https://www.linkedin.com/in/aloute-sana",
    "twitter": None,
    "hero_stats": [
        {"label": "Years Experience", "value": "5+"},
        {"label": "Projects Shipped", "value": "20+"},
        {"label": "Industries", "value": "AI · Energy · EdTech"},
    ],
    "focus_areas": [
        {"title": "LLMs & Agentic AI", "description": "RAG, guardrails, MCP workflows, multimodal chatbots."},
        {"title": "Full-Stack Engineering", "description": "FastAPI, React, TypeScript, PostgreSQL, Docker."},
        {"title": "Machine Learning", "description": "Time-series forecasting, NLP, computer vision, MLOps."},
    ],
    "socials": [],
}

EXPERIENCES = [
    {
        "company": "Algento (北京奥金拓网络科技有限公司)",
        "role": "AI/ML Engineer",
        "location": "Beijing, China",
        "start_date": date(2024, 1, 1),
        "end_date": None,
        "description": "Designing and shipping enterprise-grade AI systems that automate employee experiences and unlock new revenue.",
        "highlights": [
            "Led the deployment of LLM chatbots automating employee service access and improving query resolution efficiency.",
            "Implemented RAG using vector databases and semantic search to enhance factual accuracy and user satisfaction.",
            "Built safety guardrails for content moderation and compliance, reducing unsafe outputs by 98%.",
            "Developed a FastAPI multimodal chatbot with speech-to-text and text generation, increasing engagement by 20%.",
            "Created agentic AI workflows with MCP to automate ad banner generation via Qwen-Image, Nano Banana, and Kolors, cutting design time by 90%.",
            "Delivered a nationality prediction model achieving 98% accuracy, improving recommendation precision by 60%.",
        ],
        "stack": [
            "Python", "PyTorch", "LangChain", "FastAPI", "Hugging Face", "Qwen-Image",
            "Kolors", "Whisper", "Weaviate", "FAISS", "Docker"
        ],
        "position": 0,
    },
    {
        "company": "Université Virtuelle du Burkina Faso (UV-BF)",
        "role": "Part-Time Instructor – Microservices & DevOps",
        "location": "Remote",
        "start_date": date(2023, 4, 1),
        "end_date": date(2023, 10, 1),
        "description": "Designed and delivered applied training programs to help students master modern backend and DevOps practices.",
        "highlights": [
            "Delivered live online lectures on microservice architecture, containerization, and DevOps workflows.",
            "Authored project-based labs covering Docker, FastAPI, CI/CD pipelines, RESTful APIs, and cloud deployment.",
            "Mentored cohorts on scalable software design patterns, boosting career readiness for industry roles.",
        ],
        "stack": ["Docker", "FastAPI", "Git", "CI/CD", "Python", "Cloud Architecture"],
        "position": 1,
    },
    {
        "company": "SFEM (北京钢流电磁技术有限公司)",
        "role": "Algorithm Engineer",
        "location": "Beijing, China",
        "start_date": date(2022, 3, 1),
        "end_date": date(2023, 3, 1),
        "description": "Built predictive models powering smarter decisions for renewable energy infrastructure.",
        "highlights": [
            "Developed LSTM/GRU wind turbine power forecast models for accurate time-series predictions.",
            "Engineered preprocessing and feature pipelines to improve data quality and model robustness.",
            "Achieved 80% forecast precision, supporting intelligent power grid management.",
        ],
        "stack": ["Python", "PyTorch", "Scikit-learn", "Pandas", "NumPy"],
        "position": 2,
    },
    {
        "company": "VMware",
        "role": "Algorithm Engineer",
        "location": "Beijing, China",
        "start_date": date(2021, 4, 1),
        "end_date": date(2022, 1, 1),
        "description": "Explored intelligent UX automation concepts within graduate R&D initiatives.",
        "highlights": [
            "Developed models to recognize and classify web interface components for AI-driven UX automation.",
            "Collaborated with design and engineering teams to prototype intelligent UI systems.",
            "Contributed to iterative development of end-to-end ML pipelines.",
        ],
        "stack": ["Python", "TensorFlow", "OpenCV", "Scikit-learn", "Flask"],
        "position": 3,
    },
    {
        "company": "Embassy of Burkina Faso",
        "role": "Freelance Software Developer",
        "location": "Beijing, China",
        "start_date": date(2021, 1, 1),
        "end_date": date(2021, 4, 1),
        "description": "Delivered secure identity management tools for a diplomatic mission.",
        "highlights": [
            "Built a desktop application for ID card generation with QR encryption and AI-based OCR.",
            "Automated form filling and card printing workflows, reducing administrative workload by 70%.",
            "Managed the full lifecycle from UX design through deployment.",
        ],
        "stack": ["Python", "Tkinter", "OpenCV", "Tesseract OCR", "SQLite"],
        "position": 4,
    },
]

SKILL_CATEGORIES = [
    ("AI & ML", ["NLP & LLMs", "Agentic AI", "RAG", "Prompt Engineering", "MCP", "SFT", "Guardrails", "CV", "TTS"]),
    ("Frameworks", ["LangChain", "LangGraph", "LlamaIndex", "FAISS", "Milvus", "Elasticsearch", "OpenCV", "YOLO"]),
    ("Tools", ["PyTorch", "TensorFlow", "Keras", "Claude", "Cursor", "LM Studio"]),
    ("Programming", ["Python", "C/C++", "Java", "JavaScript", "Dart (Flutter)"]),
    ("Back-end", ["FastAPI", "Flask", "Node.js", "Express", "Spring Boot", "Django"]),
    ("Front-end", ["React", "TypeScript", "Ant Design", "HTML", "CSS", "Tailwind", "Vite", "Vue"]),
    ("Data & Visualization", ["Pandas", "NumPy", "Scikit-learn", "Matplotlib", "Seaborn"]),
    ("Cloud & DevOps", ["Docker", "Git/GitHub", "CI/CD", "Linux", "Microservices", "Kubernetes", "Jenkins"]),
    ("Databases", ["MongoDB", "PostgreSQL", "MySQL", "Firebase", "Redis"]),
]


def _slug_for_experience(role: str, company: str) -> str:
    from app.utils import sanitize_slug
    return sanitize_slug(f"{role}-{company}")


async def seed_database(session: AsyncSession):
    # Profile
    existing = await session.execute(select(Profile).where(Profile.id == 1))
    if existing.scalar_one_or_none() is None:
        session.add(Profile(**PROFILE))

    # Experiences
    exp_count = await session.execute(select(Experience))
    if not exp_count.scalars().first():
        for exp in EXPERIENCES:
            data = dict(exp)
            data["slug"] = _slug_for_experience(exp["role"], exp["company"])
            session.add(Experience(**data))

    # Skills
    skill_count = await session.execute(select(Skill))
    if not skill_count.scalars().first():
        position = 0
        for category, names in SKILL_CATEGORIES:
            for name in names:
                session.add(Skill(category=category, name=name, position=position))
                position += 1

    await session.commit()


if __name__ == "__main__":
    import asyncio
    from app.db import AsyncSessionLocal

    async def main():
        async with AsyncSessionLocal() as session:
            await seed_database(session)

    asyncio.run(main())
