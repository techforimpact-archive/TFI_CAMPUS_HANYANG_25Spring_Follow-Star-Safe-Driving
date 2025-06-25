# 🚀 별따라 안전운전 - Backend

**고령 이륜차 운전자 대상 시뮬레이션 게임형 안전 교육 서비스의 Backend 서버입니다.**  
Firebase Functions 기반으로 구현되어 있으며, Firestore를 활용한 데이터 관리 및 REST API를 제공합니다.

---

## 📂 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Cloud Platform**: Firebase Functions, Firestore, Firebase Storage
- **Documentation**: Swagger (OpenAPI 3.0)
- **PL**: TypeScript

---

## ⚙️ 프로젝트 구조
```
├── functions/                  # Firebase Functions 소스
│   ├── src/
│   │   ├── index.ts            # Firebase Functions 진입점
│   │   ├── routes/             # API 라우트 모음
│   │   ├── services/           # Firestore 설정
│   │   ├── utils/              # 유틸리티 함수
│   │   ├── types/              # 타입 정의
│   │   └── swagger.ts          # Swagger 설정
│   └── package.json            # 의존성 및 스크립트
└── README.md
```


---

## 🛠️ 주요 기능

- **유저 관리**
  - 유저 생성 및 정보 관리 API
- **세션 관리**
  - 게임 세션 생성, 조회 및 점수 관리 API
- **퀘스트 기록**
  - 퀘스트 시도 기록 등록
  - 시나리오 기반 안전 점수 집계
- **랭킹 시스템**
  - 마을별 참여자 수 및 평균 점수 랭킹 제공
- **파일 관리**
  - Firebase Storage 기반 이미지/오디오 리소스 관리
- **API 문서**
  - Swagger 기반 문서 제공

