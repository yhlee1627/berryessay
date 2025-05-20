from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class EssayTopicBase(BaseModel):
    topic: str
    reading_material: str
    is_active: bool = True

class EssayTopicCreate(EssayTopicBase):
    pass

class EssayTopic(EssayTopicBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 

class EssayTopicUpdate(BaseModel):
    id: str
    topic: str
    reading_material: str
    is_active: bool 