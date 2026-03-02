const { callClaude } = require('../utils/claudeClient');
const { safeJsonParse } = require('../utils/jsonUtils');

const DUMMY_MARKETING_DATA = {
  adCopy: {
    productInfo: 'AI 기반 세일즈 자동화 SaaS, CRM 연동 가능, 실시간 대시보드 제공',
    targetCustomer: 'B2B SaaS 마케팅 매니저 (팀 규모 5~20명)',
    previousPerformanceData: '지난 캠페인 CTR 평균 2.4%, CPC 950원, 전환율 3.1%',
  },
  sentiment: {
    chatLogs: [
      '오늘 기능 소개 너무 이해하기 쉬워요!',
      '가격이 조금 비싼 것 같아요. 할인 이벤트 있나요?',
      'CRM 연동 데모 더 자세히 보고 싶어요.',
      '응답 속도 빨라서 좋네요.',
    ],
  },
  competitor: {
    myProductSpec: 'CV3 Performach: 자동 리드 스코어링, 옴니채널 메시징, SLA 추적',
    competitorSpec: '경쟁사 A: 이메일 자동화 중심, 기본 대시보드, 별도 SLA 모듈 없음',
  },
};

const SYSTEM_PROMPTS = {
  adCopy: `당신은 퍼포먼스 마케팅 카피라이터이자 광고 데이터 분석가입니다.
목표: 주어진 제품/타겟/성과 데이터를 바탕으로 CTR 개선 가능성이 높은 광고 카피 3개를 제안합니다.
응답 형식: 반드시 JSON 문자열로 반환하세요.
스키마:
{
  "ctrPrediction": "문자열(예: 2.9% ~ 3.4%)",
  "adCopies": [
    {"headline": "", "body": "", "reason": ""}
  ]
}`,
  sentiment: `당신은 라이브 커머스 채팅 분석 전문가입니다.
목표: 채팅 로그의 긍정/부정 비율, 주요 키워드, 시청자 요구를 요약합니다.
응답은 반드시 JSON 문자열로 반환하세요.
스키마:
{
  "positiveRatio": 0,
  "negativeRatio": 0,
  "keywords": [""],
  "viewerNeedsSummary": ""
}`,
  competitor: `당신은 B2B 세일즈 전략가입니다.
목표: 자사/경쟁사 스펙을 비교해 영업 소구점을 도출합니다.
응답은 반드시 JSON 문자열로 반환하세요.
스키마:
{
  "comparisonTable": [
    {"category": "", "ourProduct": "", "competitor": "", "advantage": ""}
  ],
  "salesTalkingPoints": [""]
}`,
};

async function generateAdCopy(payload = DUMMY_MARKETING_DATA.adCopy) {
  const userPrompt = `제품 정보: ${payload.productInfo}\n타겟 고객: ${payload.targetCustomer}\n이전 성과 데이터: ${payload.previousPerformanceData}`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.adCopy,
    userPrompt,
    temperature: 0.7,
  });

  return safeJsonParse(text, {
    ctrPrediction: 'N/A',
    adCopies: [],
    rawText: text,
  });
}

async function analyzeSentiment(payload = DUMMY_MARKETING_DATA.sentiment) {
  const userPrompt = `라이브 채팅 로그:\n${payload.chatLogs.map((chat, idx) => `${idx + 1}. ${chat}`).join('\n')}`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.sentiment,
    userPrompt,
    temperature: 0.2,
  });

  return safeJsonParse(text, {
    positiveRatio: 0,
    negativeRatio: 0,
    keywords: [],
    viewerNeedsSummary: text,
  });
}

async function analyzeCompetitor(payload = DUMMY_MARKETING_DATA.competitor) {
  const userPrompt = `자사 제품 스펙:\n${payload.myProductSpec}\n\n경쟁사 제품 스펙:\n${payload.competitorSpec}`;
  const { text } = await callClaude({
    systemPrompt: SYSTEM_PROMPTS.competitor,
    userPrompt,
    temperature: 0.3,
  });

  return safeJsonParse(text, {
    comparisonTable: [],
    salesTalkingPoints: [text],
  });
}

module.exports = {
  DUMMY_MARKETING_DATA,
  SYSTEM_PROMPTS,
  generateAdCopy,
  analyzeSentiment,
  analyzeCompetitor,
};
