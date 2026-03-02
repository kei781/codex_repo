const {
  adCopyController,
  sentimentController,
  competitorController,
} = require('../controllers/marketingController');

async function marketingRoutes(app) {
  app.post('/ad-copy', {
    schema: {
      body: {
        type: 'object',
        required: ['productInfo', 'targetCustomer', 'previousPerformanceData'],
        properties: {
          productInfo: { type: 'string' },
          targetCustomer: { type: 'string' },
          previousPerformanceData: { type: 'string' },
        },
      },
    },
    handler: adCopyController,
  });

  app.post('/sentiment', {
    schema: {
      body: {
        type: 'object',
        required: ['chatLogs'],
        properties: {
          chatLogs: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
          },
        },
      },
    },
    handler: sentimentController,
  });

  app.post('/competitor', {
    schema: {
      body: {
        type: 'object',
        required: ['myProductSpec', 'competitorSpec'],
        properties: {
          myProductSpec: { type: 'string' },
          competitorSpec: { type: 'string' },
        },
      },
    },
    handler: competitorController,
  });
}

module.exports = marketingRoutes;
