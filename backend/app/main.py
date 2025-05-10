from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import essays, corrections, essay_topics, auth

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(essays.router)
app.include_router(corrections.router)
app.include_router(essay_topics.router)
# 어드민용 essay-topic 라우터 등록
app.include_router(essay_topics.admin_router)

@app.get("/")
async def root():
    return {"message": "Welcome to BerryEssay API"} 