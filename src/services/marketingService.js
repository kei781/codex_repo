const { callClaude } = require('../utils/claudeClient');
const { callGemini } = require('../utils/geminiClient');
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
  adCopy: `
  System Prompt (역할 부여):
    당신은 10년 차 탑티어 퍼포먼스 마케터이자 탁월한 카피라이터입니다. 당신의 목표는 제공된 제품 정보와 타겟 고객, 그리고 과거 성과 데이터를 분석하여 전환율(CVR)과 클릭률(CTR)을 극대화할 수 있는 광고 카피를 작성하는 것입니다. CV3의 마케팅 솔루션 'Adssoon(애드순)'의 톤앤매너에 맞춰, 트렌디하고 후킹한 문구를 작성해야 합니다.
  User Prompt (입력 템플릿):
    다음 정보를 바탕으로 페이스북/인스타그램 스폰서드 광고 카피 3가지를 제안해 주세요.
    · 제품 정보: {product_info}
    · 메인 타겟: {target_audience}
    · 과거 고성과 카피 특징: {past_data}
  출력 형식 (Markdown):
    1. 각 카피는 [메인 카피], [서브 카피], [행동 유도 버튼(CTA)]으로 구성할 것.
    2. 각 카피 하단에 이 카피가 왜 타겟에게 먹힐지(예상 CTR 및 심리학적 근거)를 1~2줄로 요약할 것.`,
  sentiment: `
  System Prompt (역할 부여):
    당신은 라이브 커머스 전문 데이터 애널리스트입니다. 수만 건의 실시간 채팅 로그 속에서 시청자의 진짜 반응을 캐치하고, 구매 전환을 일으키는 핵심 키워드와 페인 포인트(Pain Point)를 찾아내는 데 탁월합니다.
  User Prompt (입력 템플릿):
    다음은 최근 진행된 라이브 방송의 채팅 로그 일부입니다. 이 데이터를 분석해 주세요.
    채팅 데이터: {chat_logs}
  출력 형식 (Markdown):
    1. 감성 분석: 긍정/부정/중립 비율 (%)
    2. 핵심 키워드 Top 3: 시청자가 가장 많이 언급한 단어와 그 맥락
    3. 인사이트 및 액션 플랜: 시청자의 주요 불만이나 요구사항 1가지를 뽑고, 다음 방송에서 개선해야 할 점을 제안할 것.`,
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
  const { text } = await callGemini({
    systemPrompt: SYSTEM_PROMPTS.adCopy,
    userPrompt,
    temperature: 0.7,
  });
  console.log(text);

  return safeJsonParse(text, {
    ctrPrediction: 'N/A',
    adCopies: [],
    markdown: text,
  });
}

async function analyzeSentiment(payload = DUMMY_MARKETING_DATA.sentiment) {
  const userPrompt = `라이브 채팅 로그:\n${payload.chatLogs.map((chat, idx) => `${idx + 1}. ${chat}`).join('\n')}`;
  const { text } = await callGemini({
    systemPrompt: SYSTEM_PROMPTS.sentiment,
    userPrompt,
    temperature: 0.2,
  });

  return safeJsonParse(text, {
    positiveRatio: 0,
    negativeRatio: 0,
    keywords: [],
    markdown: text,
  });
}

async function analyzeCompetitor(payload = DUMMY_MARKETING_DATA.competitor) {
  const userPrompt = `자사 제품 스펙:\n${payload.myProductSpec}\n\n경쟁사 제품 스펙:\n${payload.competitorSpec}`;
  const { text } = await callGemini({
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
