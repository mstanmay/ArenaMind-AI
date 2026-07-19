"""AI Conversation model — stores agent conversation history."""

from sqlalchemy import String, Text, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    session_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user, assistant, system
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    tokens: Mapped[int | None] = mapped_column(nullable=True)

    __table_args__ = (
        Index("ix_ai_conv_session_created", "session_id", "created_at"),
    )
