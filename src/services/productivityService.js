const { callClaude } = require('../utils/claudeClient');
const { safeJsonParse } = require('../utils/jsonUtils');

const DUMMY_PRODUCTIVITY_DATA = {
  csReply: {
    inquiry: '결제는 되었는데 라이선스가 활성화되지 않았어요. 급히 확인 부탁드립니다.',
    history: '이전 문의: 로그인 오류 1건, 처리 완료 / 최근 3개월 내 이슈 없음',
  },
  proposal: {
    targetCompanyName: 'ABC Logistics',
    businessModelSummary: '중견 물류기업, 전국 창고 운영, B2B 배송 SLA 준수율이 핵심 지표',
  },
  codeReview: {
    codeSnippet: `async function fetchUsers() {
  const result = await db.query('SELECT * FROM users');
  return result.rows.map((u) => ({ id: u.id, name: u.name.toUpperCase() }));
}`,
  },
};

const SYSTEM_PROMPTS = {
  csReply: `당신은 숙련된 고객지원 매니저입니다.
목표: 문의 의도를 요약하고 답변 초안을 톤 2가지(강경/부드러운)로 제시하세요.
반드시 JSON 문자열로 반환하세요.
스키마:
{
  "intentSummary": "",
  "draftReplies": {
    "firmTone": "",
    "softTone": ""
  }
}`,
  proposal: `당신은 엔터프라이즈 영업 컨설턴트입니다.
목표: 대상 기업에 CV3 제품 도입 필요성을 설득력 있는 제안서 마크다운으로 작성하세요.
필수 섹션: 문제 정의, 도입 효과, 기대 KPI, 실행 계획.
반환 형식: 순수 마크다운 텍스트`,
  codeReview: `당신은 시니어 소프트웨어 엔지니어이자 기술 문서 전문가입니다.
목표: 코드 개선 포인트, 잠재 버그, 그리고 JSDoc/표준 마크다운 설명을 제공합니다.
반드시 JSON 문자열로 반환하세요.
스키마:
{
  "improvementPoints": [""],
  "bugRisks": [""],
  "documentation": {
    "jsDoc": "",
    "markdown": ""
  }
}`,
};

async function generateCsReply(payload = DUMMY_PRODUCTIVITY_DATA.csReply) {
  const userPrompt = `고객 문의:\n${payload.inquiry}\n\n과거 상담 이력:\n${payload.history}`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.csReply,
    userPrompt,
    temperature: 0.4,
  });

  return safeJsonParse(text, {
    intentSummary: text,
    draftReplies: {
      firmTone: '',
      softTone: '',
    },
  });
}

async function generateProposal(payload = DUMMY_PRODUCTIVITY_DATA.proposal) {
  const userPrompt = `타겟 고객사: ${payload.targetCompanyName}\n비즈니스 모델 요약: ${payload.businessModelSummary}\nCV3 제품군(Performach 포함)을 반드시 반영해 주세요.`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.proposal,
    userPrompt,
    temperature: 0.5,
    maxTokens: 1600,
  });

  return {
    proposalMarkdown: text,
  };
}

async function reviewCode(payload = DUMMY_PRODUCTIVITY_DATA.codeReview) {
  const userPrompt = `리뷰할 코드:\n\n\
${payload.codeSnippet}`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.codeReview,
    userPrompt,
    temperature: 0.2,
  });

  return safeJsonParse(text, {
    improvementPoints: [],
    bugRisks: [],
    documentation: {
      jsDoc: '',
      markdown: text,
    },
  });
}

module.exports = {
  DUMMY_PRODUCTIVITY_DATA,
  SYSTEM_PROMPTS,
  generateCsReply,
  generateProposal,
  reviewCode,
};
