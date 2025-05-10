from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List
from ..models.essay import Essay, EssayCreate, EssayUpdate
from ..core.supabase import supabase
from datetime import date, datetime
from uuid import UUID
import json

router = APIRouter(prefix="/essays", tags=["essays"])

@router.post("/", response_model=Essay)
async def create_essay(
    essay: EssayCreate,
    user_id: UUID = Query(..., description="User ID")
):
    try:
        # 단어 수 계산 (공백으로 구분)
        word_count = len(essay.content.split())
        
        # daily_essay_date가 date 타입이면 ISO 포맷 문자열로 변환
        daily_essay_date = essay.daily_essay_date
        if isinstance(daily_essay_date, date):
            daily_essay_date = daily_essay_date.isoformat()
        
        data = {
            "title": essay.title,
            "content": essay.content,
            "daily_essay_date": daily_essay_date,
            "user_id": str(user_id),
            "word_count": word_count,
            "is_submitted": False,
            "topic_id": essay.topic_id
        }
        print("Inserting data:", data)  # 디버깅을 위한 로그 추가
        
        result = supabase.table("essays").insert(data).execute()
        return result.data[0]
    except Exception as e:
        print("Error creating essay:", str(e))  # 에러 로깅 추가
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Essay])
async def get_essays(user_id: UUID = Query(..., description="User ID")):
    try:
        result = supabase.table("essays").select("*").eq("user_id", str(user_id)).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{essay_id}", response_model=Essay)
async def get_essay(
    essay_id: str,
    user_id: UUID = Query(..., description="User ID")
):
    try:
        # 먼저 에세이가 존재하는지 확인
        result = supabase.table("essays").select("*").eq("id", essay_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Essay with id {essay_id} not found")
            
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching essay {essay_id}:", str(e))  # 에러 로깅 추가
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{essay_id}", response_model=Essay)
async def update_essay(
    essay_id: str,
    essay: EssayUpdate,
    user_id: UUID = Query(..., description="User ID")
):
    try:
        data = essay.model_dump(exclude_unset=True)
        if "content" in data:
            data["word_count"] = len(data["content"].split())
        print("[PATCH] essay_id:", essay_id)
        print("[PATCH] user_id:", user_id)
        print("[PATCH] data:", data)
        result = supabase.table("essays").update(data).eq("id", essay_id).eq("user_id", str(user_id)).execute()
        print("[PATCH] update result:", result.data)
        if not result.data:
            raise HTTPException(status_code=404, detail="Essay not found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{essay_id}")
async def delete_essay(
    essay_id: str,
    user_id: UUID = Query(..., description="User ID")
):
    try:
        result = supabase.table("essays").delete().eq("id", essay_id).eq("user_id", str(user_id)).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Essay not found")
        return {"message": "Essay deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 