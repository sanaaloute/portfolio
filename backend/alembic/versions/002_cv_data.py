from __future__ import annotations
"""cv data: phone, project demo video, education, certifications

Revision ID: 002
Revises: 001
Create Date: 2026-07-13 00:00:00.000000

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("phone", sa.String(length=50), nullable=True))
    op.add_column("projects", sa.Column("demo_url", sa.String(length=500), nullable=True))

    op.create_table(
        "educations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("institution", sa.String(length=255), nullable=False),
        sa.Column("degree", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_educations_id"), "educations", ["id"], unique=False)
    op.create_index(op.f("ix_educations_slug"), "educations", ["slug"], unique=True)

    op.create_table(
        "certifications",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("issuer", sa.String(length=255), nullable=False),
        sa.Column("year", sa.String(length=20), nullable=True),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("position", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index(op.f("ix_certifications_id"), "certifications", ["id"], unique=False)
    op.create_index(op.f("ix_certifications_slug"), "certifications", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_certifications_slug"), table_name="certifications")
    op.drop_index(op.f("ix_certifications_id"), table_name="certifications")
    op.drop_table("certifications")
    op.drop_index(op.f("ix_educations_slug"), table_name="educations")
    op.drop_index(op.f("ix_educations_id"), table_name="educations")
    op.drop_table("educations")
    op.drop_column("projects", "demo_url")
    op.drop_column("profiles", "phone")
