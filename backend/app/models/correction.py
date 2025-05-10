from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class CorrectionCategory(str, Enum):
    GRAMMAR = "grammar"
    STRUCTURE = "structure"
    VOCABULARY = "vocabulary"
    FLOW = "flow"

class CorrectionCreate(BaseModel):
    essay_id: str
    category: CorrectionCategory
    original_text: str
    suggested_text: str
    explanation: str

class Correction(CorrectionCreate):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 