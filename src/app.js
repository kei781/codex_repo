const Fastify = require('fastify');
const path = require('path'); // 파일 경로 계산을 위해 필요
const fastifyStatic = require('@fastify/static'); // 플러그인 가져오기

const marketingRoutes = require('./routes/marketingRoutes');
const productivityRoutes = require('./routes/productivityRoutes');

function buildApp() {
  const app = Fastify({
    logger: true,
  });
  // 1. 정적 파일 경로 등록
  // 프로젝트 루트에 'public' 폴더를 만들고 그 안에 index.html을 넣었다고 가정합니다.
  app.register(fastifyStatic, {
    root: path.join(__dirname, 'public'), 
    prefix: '/', // URL 앞에 붙을 접두사
  });

  app.register(marketingRoutes, { prefix: '/api/marketing' });
  app.register(productivityRoutes, { prefix: '/api/productivity' });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'cv3-all-in-one-automation-api-suite',
  }));

// 2. 루트 경로에서 index.html 반환
  app.get('/', async (request, reply) => {
    return reply.sendFile('index.html'); // public 폴더 안의 index.html을 찾아 보냅니다.
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      error: {
        message: error.message || 'Internal Server Error',
        code: error.code || 'INTERNAL_ERROR',
      },
    });
  });

  return app;
}

module.exports = buildApp;
