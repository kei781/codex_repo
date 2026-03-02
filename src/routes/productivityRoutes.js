const {
  csReplyController,
  proposalController,
  codeReviewController,
} = require('../controllers/productivityController');

async function productivityRoutes(app) {
  app.post('/cs-reply', {
    schema: {
      body: {
        type: 'object',
        required: ['inquiry', 'history'],
        properties: {
          inquiry: { type: 'string' },
          history: { type: 'string' },
        },
      },
    },
    handler: csReplyController,
  });

  app.post('/proposal', {
    schema: {
      body: {
        type: 'object',
        required: ['targetCompanyName', 'businessModelSummary'],
        properties: {
          targetCompanyName: { type: 'string' },
          businessModelSummary: { type: 'string' },
        },
      },
    },
    handler: proposalController,
  });

  app.post('/code-review', {
    schema: {
      body: {
        type: 'object',
        required: ['codeSnippet'],
        properties: {
          codeSnippet: { type: 'string' },
        },
      },
    },
    handler: codeReviewController,
  });
}

module.exports = productivityRoutes;
