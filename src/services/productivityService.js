const { callClaude } = require('../utils/claudeClient');
const { callGemini } = require('../utils/geminiClient');
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
  csReply: `
    System Prompt (역할 부여):
    당신은 공감 능력이 뛰어나고 문제 해결이 빠른 시니어 CS 매니저입니다. 고객의 감정이 상하지 않으면서도 회사의 정책을 명확하게 전달하는 유려한 비즈니스 커뮤니케이션의 달인입니다.
    User Prompt (입력 템플릿):
    다음 고객의 문의 내용과 과거 상담 이력을 확인하고, 대응 방안을 마련해 주세요.
    · 과거 이력: {past_history}
    · 현재 문의 내용: {current_inquiry}
    출력 형식 (Markdown):
    1. 문의 핵심 요약: 고객이 진짜 원하는 것이 무엇인지 1줄 요약.
    2. 답변 초안 A (공감/부드러운 톤): 고객의 불편에 깊이 공감하며 유연하게 대처하는 버전.
    3. 답변 초안 B (원칙/단호한 톤): 규정을 명확히 안내하며 정중하게 거절/안내하는 버전.`,
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
  const { text } = await callGemini({
    systemPrompt: SYSTEM_PROMPTS.csReply,
    userPrompt,
    temperature: 0.4,
  });

  return safeJsonParse(text, {
    markdown: text,
    draftReplies: {
      firmTone: '',
      softTone: '',
    },
  });
}

async function generateProposal(payload = DUMMY_PRODUCTIVITY_DATA.proposal) {
  const userPrompt = `타겟 고객사: ${payload.targetCompanyName}\n비즈니스 모델 요약: ${payload.businessModelSummary}\nCV3 제품군(Performach 포함)을 반드시 반영해 주세요.`;
  const { text } = await callGemini({
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
  const userPrompt = `리뷰할 코드:\n\n\ ${payload.codeSnippet}`;
  const { text } = await callGemini({
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
