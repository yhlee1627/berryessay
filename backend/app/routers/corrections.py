from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from ..models.correction import Correction, CorrectionCreate
from ..core.supabase import supabase
from ..core.openai_client import get_correction
from uuid import UUID

router = APIRouter(prefix="/corrections", tags=["corrections"])

@router.post("/sessions", response_model=Dict[str, Any])
async def create_correction_session(
    essay_id: UUID = Query(..., description="Essay ID"),
):
    try:
        # 1. 현재 세션 개수 확인
        sessions_result = supabase.table("correction_sessions").select("session_number").eq("essay_id", str(essay_id)).order("session_number").execute()
        session_numbers = [s["session_number"] for s in sessions_result.data]
        next_session = 1
        for i in range(1, 4):
            if i not in session_numbers:
                next_session = i
                break
        if len(session_numbers) >= 3:
            raise HTTPException(status_code=400, detail="최대 3회까지만 첨삭 가능합니다.")

        # 2. 에세이 조회
        essay_result = supabase.table("essays").select("*").eq("id", str(essay_id)).execute()
        if not essay_result.data:
            raise HTTPException(status_code=404, detail="Essay not found")
        essay = essay_result.data[0]

        # 3. GPT API를 사용하여 첨삭 및 총평 생성
        ai_result = await get_correction(essay["content"])
        corrections = ai_result["corrections"]
        overall_feedback = ai_result["overall_feedback"]

        # 4. 세션 저장
        session_data = {
            "essay_id": str(essay_id),
            "session_number": next_session,
            "corrections": [c.model_dump() for c in corrections],
            "overall_feedback": overall_feedback
        }
        supabase.table("correction_sessions").insert(session_data).execute()

        return {"session_number": next_session, "corrections": session_data["corrections"], "overall_feedback": overall_feedback}
    except Exception as e:
        print(f"Error creating correction session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{essay_id}", response_model=List[Dict[str, Any]])
async def get_correction_sessions(essay_id: UUID):
    try:
        result = supabase.table("correction_sessions").select("*").eq("essay_id", str(essay_id)).order("session_number").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=Dict[str, Any])
async def create_correction(
    essay_id: UUID = Query(..., description="Essay ID"),
):
    try:
        # 1. 에세이 조회
        essay_result = supabase.table("essays").select("*").eq("id", str(essay_id)).execute()
        if not essay_result.data:
            raise HTTPException(status_code=404, detail="Essay not found")
        
        essay = essay_result.data[0]
        
        # 2. GPT API를 사용하여 첨삭 및 총평 생성
        ai_result = await get_correction(essay["content"])
        corrections = ai_result["corrections"]
        overall_feedback = ai_result["overall_feedback"]
        
        # 3. 첨삭 결과를 데이터베이스에 저장
        correction_data = []
        for correction in corrections:
            data = {
                "essay_id": str(essay_id),
                "category": correction.category,
                "original_text": correction.original_text,
                "suggested_text": correction.suggested_text,
                "explanation": correction.explanation
            }
            result = supabase.table("corrections").insert(data).execute()
            correction_data.extend(result.data)
            
        return {"corrections": correction_data, "overall_feedback": overall_feedback}
    except Exception as e:
        print(f"Error creating correction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{essay_id}", response_model=List[Correction])
async def get_corrections(essay_id: UUID):
    try:
        print(f"=== 첨삭 조회 essay_id: {essay_id}")
        result = supabase.table("corrections").select("*").eq("essay_id", str(essay_id)).execute()
        print("Supabase 첨삭 응답:", result)
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 