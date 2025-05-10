from pydantic import BaseModel, UUID4, ConfigDict
from datetime import date, datetime
from typing import Optional, List

class EssayBase(BaseModel):
    title: str
    content: str
    daily_essay_date: date
    plain_text: Optional[str] = None
    topic_id: str

    model_config = ConfigDict(json_encoders={date: lambda d: d.isoformat()})

class EssayCreate(EssayBase):
    pass

class EssayUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_submitted: Optional[bool] = None
    plain_text: Optional[str] = None
    topic_id: Optional[str] = None

class Essay(EssayBase):
    id: str
    user_id: str
    word_count: int
    created_at: datetime
    updated_at: datetime
    is_submitted: bool
    plain_text: Optional[str] = None
    topic_id: str

    model_config = ConfigDict(from_attributes=True) 