# CV3 올인원 업무 자동화 API 스위트

## 1) 디렉토리 구조 (Controller / Service / Route 분리)

```text
codex_repo/
├── .env.example
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── server.js
    ├── controllers/
    │   ├── marketingController.js
    │   └── productivityController.js
    ├── routes/
    │   ├── marketingRoutes.js
    │   └── productivityRoutes.js
    ├── services/
    │   ├── marketingService.js
    │   └── productivityService.js
    └── utils/
        ├── claudeClient.js
        └── jsonUtils.js
```

## 2) 프로젝트 셋업

```bash
npm init -y
npm install fastify dotenv @anthropic-ai/sdk
cp .env.example .env
# .env 파일의 ANTHROPIC_API_KEY 값을 실제 키로 교체
npm run start
```

## 3) 엔드포인트

### Marketing (`/api/marketing`)
- `POST /ad-copy`
- `POST /sentiment`
- `POST /competitor`

### Productivity (`/api/productivity`)
- `POST /cs-reply`
- `POST /proposal`
- `POST /code-review`

## 4) 설계 포인트

- `utils/claudeClient.js`에서 Claude API 호출 로직을 공통화했습니다.
- 각 서비스(`marketingService`, `productivityService`)에:
  - System Prompt 뼈대
  - 테스트용 더미 데이터
  - 실제 비즈니스 로직
  을 포함했습니다.
- JSON 응답이 깨지더라도 fallback 값을 반환하도록 `safeJsonParse`를 적용했습니다.
- Fastify schema validation으로 입력값 누락을 사전에 차단합니다.

## 5) 샘플 요청

### 5-1. 광고 카피 생성

```bash
curl -X POST http://localhost:3000/api/marketing/ad-copy \
  -H "Content-Type: application/json" \
  -d '{
    "productInfo": "AI 기반 세일즈 자동화 SaaS",
    "targetCustomer": "B2B 마케팅 매니저",
    "previousPerformanceData": "지난 CTR 2.4%"
  }'
```

### 5-2. 코드 리뷰

```bash
curl -X POST http://localhost:3000/api/productivity/code-review \
  -H "Content-Type: application/json" \
  -d '{
    "codeSnippet": "function add(a,b){return a+b}"
  }'
```

