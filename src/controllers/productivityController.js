const productivityService = require('../services/productivityService');

async function csReplyController(request, reply) {
  const result = await productivityService.generateCsReply(request.body);
  return reply.send({ success: true, data: result });
}

async function proposalController(request, reply) {
  const result = await productivityService.generateProposal(request.body);
  return reply.send({ success: true, data: result });
}

async function codeReviewController(request, reply) {
  const result = await productivityService.reviewCode(request.body);
  return reply.send({ success: true, data: result });
}

module.exports = {
  csReplyController,
  proposalController,
  codeReviewController,
};
