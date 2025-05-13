from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import essays, corrections, essay_topics, auth

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # 로컬 개발 환경
        "https://berryessay-pd0qm59y4-josephs-projects-c828ff47.vercel.app",  # Vercel 배포 환경
        "https://berryessay.vercel.app",  # 프로덕션 도메인
        "https://www.berryessay.com",  # 새로운 프로덕션 도메인
        "https://berryessay.com",  # www 없는 도메인
    ],
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