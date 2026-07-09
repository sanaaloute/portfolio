from __future__ import annotations
"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-07-09 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("headline", sa.String(length=255), nullable=False),
        sa.Column("tagline", sa.Text(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=False),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column("resume_url", sa.String(length=500), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("github", sa.String(length=255), nullable=True),
        sa.Column("linkedin", sa.String(length=255), nullable=True),
        sa.Column("twitter", sa.String(length=255), nullable=True),
        sa.Column("hero_stats", sa.JSON(), nullable=False),
        sa.Column("focus_areas", sa.JSON(), nullable=False),
        sa.Column("socials", sa.JSON(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "blogs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("cover_url", sa.String(length=500), nullable=True),
        sa.Column("published", sa.Boolean(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_blogs_id"), "blogs", ["id"], unique=False)
    op.create_index(op.f("ix_blogs_slug"), "blogs", ["slug"], unique=True)

    op.create_table(
        "experiences",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("highlights", sa.JSON(), nullable=False),
        sa.Column("stack", sa.JSON(), nullable=True),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_experiences_id"), "experiences", ["id"], unique=False)
    op.create_index(op.f("ix_experiences_slug"), "experiences", ["slug"], unique=True)

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("period", sa.String(length=100), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("stack", sa.JSON(), nullable=False),
        sa.Column("cover_url", sa.String(length=500), nullable=True),
        sa.Column("images", sa.JSON(), nullable=True),
        sa.Column("featured", sa.Boolean(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_projects_id"), "projects", ["id"], unique=False)
    op.create_index(op.f("ix_projects_slug"), "projects", ["slug"], unique=True)

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_skills_category"), "skills", ["category"], unique=False)
    op.create_index(op.f("ix_skills_id"), "skills", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_skills_id"), table_name="skills")
    op.drop_index(op.f("ix_skills_category"), table_name="skills")
    op.drop_table("skills")
    op.drop_index(op.f("ix_projects_slug"), table_name="projects")
    op.drop_index(op.f("ix_projects_id"), table_name="projects")
    op.drop_table("projects")
    op.drop_index(op.f("ix_experiences_slug"), table_name="experiences")
    op.drop_index(op.f("ix_experiences_id"), table_name="experiences")
    op.drop_table("experiences")
    op.drop_index(op.f("ix_blogs_slug"), table_name="blogs")
    op.drop_index(op.f("ix_blogs_id"), table_name="blogs")
    op.drop_table("blogs")
    op.drop_table("profiles")
