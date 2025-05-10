from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from ..core.supabase import supabase

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    user_id: str
    role: str

class UserResponse(BaseModel):
    id: str
    username: str
    name: str | None = None
    role: str

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

class UserCreateRequest(BaseModel):
    name: Optional[str] = None
    username: str
    password: str
    role: str

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    try:
        # Supabase에서 사용자 정보 조회
        response = supabase.table('user_accounts').select('*').eq('username', request.username).execute()
        
        if not response.data:
            raise HTTPException(
                status_code=401,
                detail="아이디 또는 비밀번호가 올바르지 않습니다."
            )
        
        user = response.data[0]
        
        # 비밀번호 확인
        if user['password'] != request.password:  # 실제로는 비밀번호 해싱을 사용해야 합니다
            raise HTTPException(
                status_code=401,
                detail="아이디 또는 비밀번호가 올바르지 않습니다."
            )
        
        return LoginResponse(
            user_id=str(user['id']),
            role=user['role']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/users", response_model=List[UserResponse])
async def get_users():
    try:
        print("=== 회원 목록 조회 시작 ===")
        # Supabase에서 사용자 정보 조회
        response = supabase.table('user_accounts').select('*').execute()
        print("Supabase 응답:", response)
        print("응답 데이터:", response.data)
        
        if not response.data:
            print("데이터가 없습니다.")
            return []  # 데이터가 없으면 빈 배열 반환
            
        # 응답 데이터 형식 확인 및 변환
        users = []
        for user in response.data:
            try:
                print("처리 중인 사용자 데이터:", user)
                users.append(UserResponse(
                    id=str(user['id']),
                    username=user['username'],
                    name=user.get('name'),
                    role=user['role']
                ))
            except Exception as e:
                print(f"사용자 데이터 처리 중 에러: {str(e)}")
                continue
                
        print("최종 변환된 사용자 목록:", users)
        return users
    except Exception as e:
        print(f"회원 목록 조회 중 에러 발생: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"회원 목록을 불러오는데 실패했습니다: {str(e)}"
        )

@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: str, request: UserUpdateRequest):
    try:
        # 사용자 존재 여부 확인
        check_response = supabase.table('user_accounts').select('*').eq('id', user_id).execute()
        if not check_response.data:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )

        # 업데이트할 데이터 준비
        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=400,
                detail="업데이트할 데이터가 없습니다."
            )

        # 사용자 정보 업데이트
        response = supabase.table('user_accounts').update(update_data).eq('id', user_id).execute()
        user = response.data[0]
        return UserResponse(
            id=str(user['id']),
            username=user['username'],
            name=user.get('name'),
            role=user['role']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    try:
        # 사용자 존재 여부 확인
        check_response = supabase.table('user_accounts').select('*').eq('id', user_id).execute()
        if not check_response.data:
            raise HTTPException(
                status_code=404,
                detail="사용자를 찾을 수 없습니다."
            )

        # 사용자 삭제
        response = supabase.table('user_accounts').delete().eq('id', user_id).execute()
        return {"message": "사용자가 삭제되었습니다."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.post("/users", response_model=UserResponse)
async def create_user(request: UserCreateRequest):
    try:
        # 동일한 username이 이미 존재하는지 확인
        check_response = supabase.table('user_accounts').select('*').eq('username', request.username).execute()
        if check_response.data:
            raise HTTPException(
                status_code=400,
                detail="이미 존재하는 아이디입니다."
            )
        # 회원 생성
        response = supabase.table('user_accounts').insert({
            'username': request.username,
            'name': request.name,
            'password': request.password,
            'role': request.role
        }).execute()
        user = response.data[0]
        return UserResponse(
            id=str(user['id']),
            username=user['username'],
            name=user.get('name'),
            role=user['role']
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 