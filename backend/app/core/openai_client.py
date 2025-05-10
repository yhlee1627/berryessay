from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import List
import json
from ..models.correction import CorrectionCreate, CorrectionCategory
from bs4 import BeautifulSoup
import re

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# HTML을 plain text로 변환하는 함수
def html_to_plain_text(html: str) -> str:
    # HTML 파싱
    soup = BeautifulSoup(html, 'html.parser')
    
    # 텍스트 추출
    text = soup.get_text()
    # 연속된 공백을 하나로 통일
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

async def get_correction(plain_text: str) -> List[CorrectionCreate]:
    # HTML 태그를 제거하고 순수 텍스트로 변환
    clean_text = html_to_plain_text(plain_text)
    
    # 디버깅을 위한 로그 추가
    print("=== 텍스트 변환 디버깅 ===")
    print("원본 텍스트:", plain_text)
    print("변환된 텍스트:", clean_text)
    print("원본 길이:", len(plain_text))
    print("변환 길이:", len(clean_text))
    
    prompt = f"""
    당신은 엄격한 한국어 에세이 첨삭자입니다.
    아래 에세이에 대해 다음 두 가지를 작성하세요:

    1. corrections: 글의 흐름, 논리, 구조, 명백한 문법 오류 등에서 개선이 필요한 점을 최대한 많이 제안하세요. 각 문제마다 별도의 correction을 만들어주세요.
    2. overall_feedback: 이 글의 전체적인 강점, 부족한 점, 조언 등 총평을 한 문단으로 작성하세요.

    각 첨삭은 아래 정보를 포함해야 합니다:
    - category: 'structure' 또는 'grammar' 중 하나
    - original_text: 원본 텍스트
    - suggested_text: 수정 제안
    - explanation: 수정 이유

    응답은 반드시 다음과 같은 JSON 형식이어야 합니다:
    {{
        "corrections": [
            {{
                "category": "structure",
                "original_text": "문제가 있는 텍스트",
                "suggested_text": "수정된 텍스트",
                "explanation": "수정 이유"
            }}
        ],
        "overall_feedback": "이 글은 ... (총평)"
    }}

    텍스트:
    {clean_text}
    """
    
    print(f"Sending prompt to OpenAI: {prompt}")
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a strict Korean essay editor. Always suggest improvements, even for minor issues."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    try:
        print(f"OpenAI response: {response.choices[0].message.content}")
        response_data = json.loads(response.choices[0].message.content)
        corrections_data = response_data.get("corrections", [])
        overall_feedback = response_data.get("overall_feedback", "")
            
        corrections = []
        for data in corrections_data:
            correction = CorrectionCreate(
                essay_id="",  # Will be set in the router
                category=CorrectionCategory(data["category"]),
                original_text=data["original_text"],
                suggested_text=data["suggested_text"],
                explanation=data["explanation"]
            )
            corrections.append(correction)
            
        # corrections와 overall_feedback을 함께 반환
        return {"corrections": corrections, "overall_feedback": overall_feedback}
    except Exception as e:
        print(f"Error parsing AI response: {str(e)}")
        print(f"Raw response: {response.choices[0].message.content}")
        raise ValueError(f"Failed to parse AI response: {str(e)}")