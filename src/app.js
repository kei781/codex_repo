const Fastify = require('fastify');
const marketingRoutes = require('./routes/marketingRoutes');
const productivityRoutes = require('./routes/productivityRoutes');

function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(marketingRoutes, { prefix: '/api/marketing' });
  app.register(productivityRoutes, { prefix: '/api/productivity' });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'cv3-all-in-one-automation-api-suite',
  }));

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
