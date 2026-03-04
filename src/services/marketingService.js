require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server');

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

async function generateMediaMix(payload = {}) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const error = new Error('GEMINI_API_KEY is not set. Please check your .env file.');
    error.statusCode = 500;
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  const adDirPath = path.join(__dirname, 'ad');
  const uploadedFiles = [];
  const fileManager = new GoogleAIFileManager(apiKey);
  const genAI = new GoogleGenerativeAI(apiKey);

  if (!fs.existsSync(adDirPath)) {
    const error = new Error(`'${adDirPath}' 디렉토리가 존재하지 않습니다.`);
    error.statusCode = 400;
    error.code = 'AD_DIRECTORY_NOT_FOUND';
    throw error;
  }

  const files = fs.readdirSync(adDirPath);
  const mdFiles = files.filter((file) => file.endsWith('.md'));

  if (mdFiles.length === 0) {
    const error = new Error('업로드할 .md 파일이 ad 디렉토리에 없습니다.');
    error.statusCode = 400;
    error.code = 'NO_MARKDOWN_FILES';
    throw error;
  }

  for (const file of mdFiles) {
    const filePath = path.join(adDirPath, file);

    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: 'text/markdown',
      displayName: file,
    });

    uploadedFiles.push(uploadResult.file);
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction:
      '당신은 디지털 광고 플랫폼의 수석 미디어 플래너입니다. 첨부된 매체 소개서 및 단가표(.md) 내의 정보만을 활용하여 사용자의 예산과 타겟에 맞는 최적의 미디어믹스를 제안하세요. 없는 매체를 지어내면 안 됩니다.',
  });

  const defaultPrompt = '이번에 공간 리뷰 앱을 런칭합니다. 2030 타겟으로 100만 원 예산을 쓰려고 하는데, 업로드된 매체들을 활용해서 가성비 좋은 미디어믹스를 짜주세요.';
  const hasCampaignContext = payload.campaignGoal && payload.totalBudget && payload.targetAudience;
  const prompt = payload.userPrompt
    || (hasCampaignContext
      ? `캠페인 목표: ${payload.campaignGoal}\n총 예산: ${payload.totalBudget}\n타겟 오디언스: ${payload.targetAudience}\n\n업로드된 매체 자료를 바탕으로 예산 안에서 효율적인 미디어믹스를 제안해 주세요. 매체별 예산 배분, 집행 이유, 기대 효과를 포함해 주세요.`
      : defaultPrompt);

  const requestContents = [
    ...uploadedFiles.map((file) => ({
      fileData: {
        mimeType: file.mimeType,
        fileUri: file.uri,
      },
    })),
    { text: prompt },
  ];

  const result = await model.generateContent(requestContents);
  const responseText = result.response.text();

  return {
    markdown: responseText,
    uploadedFileCount: uploadedFiles.length,
    uploadedFileNames: uploadedFiles.map((file) => file.displayName),
  };
}

module.exports = {
  DUMMY_MARKETING_DATA,
  SYSTEM_PROMPTS,
  generateAdCopy,
  analyzeSentiment,
  analyzeCompetitor,
  generateMediaMix,
};
