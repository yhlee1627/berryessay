from fastapi import APIRouter, HTTPException
from typing import List
from ..models.essay_topic import EssayTopic, EssayTopicCreate, EssayTopicUpdate
from ..core.supabase import supabase

router = APIRouter(prefix="/essay-topic", tags=["essay-topics"])

# 어드민용 라우터
admin_router = APIRouter(prefix="/api/admin/essay-topic", tags=["admin-essay-topic"])

@router.get("/", response_model=List[EssayTopic])
async def get_essay_topics():
    try:
        result = supabase.table("essay_topics").select("*").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=EssayTopic)
async def create_essay_topic(topic: EssayTopicCreate):
    try:
        data = topic.model_dump()
        result = supabase.table("essay_topics").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{topic_id}", response_model=dict)
async def delete_essay_topic(topic_id: str):
    try:
        # 주제가 존재하는지 확인
        check_result = supabase.table("essay_topics").select("*").eq("id", topic_id).execute()
        if not check_result.data:
            raise HTTPException(status_code=404, detail=f"Essay topic with ID {topic_id} not found")
        
        # 주제 삭제
        result = supabase.table("essay_topics").delete().eq("id", topic_id).execute()
        
        return {"message": "Essay topic deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 

@admin_router.put("", response_model=EssayTopic)
async def update_admin_essay_topic(topic: EssayTopicUpdate):
    try:
        print(f"[PUT /api/admin/essay-topic] 요청 데이터: {topic}")
        check_result = supabase.table("essay_topics").select("*").eq("id", topic.id).execute()
        print(f"[PUT /api/admin/essay-topic] 기존 데이터: {check_result.data}")
        if not check_result.data:
            raise HTTPException(status_code=404, detail="Essay topic not found")
        update_data = topic.model_dump(exclude_unset=True)
        print(f"[PUT /api/admin/essay-topic] update_data: {update_data}")
        result = supabase.table("essay_topics").update(update_data).eq("id", topic.id).execute()
        print(f"[PUT /api/admin/essay-topic] update 결과: {result.data}")
        return result.data[0]
    except Exception as e:
        print(f"[PUT /api/admin/essay-topic] 에러: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.post("", response_model=EssayTopic)
async def create_admin_essay_topic(topic: EssayTopicCreate):
    try:
        data = topic.model_dump()
        result = supabase.table("essay_topics").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current", response_model=EssayTopic)
async def get_current_essay_topic():
    try:
        result = supabase.table("essay_topics").select("*").eq("is_active", True).order("created_at", desc=True).limit(1).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="No active essay topic found")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.get("", response_model=List[EssayTopic])
async def get_admin_essay_topics(id: str = None):
    try:
        query = supabase.table("essay_topics").select("*")
        if id:
            query = query.eq("id", id)
        result = query.execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 라우터 등록은 main.py에서 app.include_router(router), app.include_router(admin_router)로 해야 함
admin_router = admin_router 