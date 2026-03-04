const marketingService = require('../services/marketingService');

async function adCopyController(request, reply) {
  const result = await marketingService.generateAdCopy(request.body);
  return reply.send({ success: true, data: result });
}

async function sentimentController(request, reply) {
  const result = await marketingService.analyzeSentiment(request.body);
  return reply.send({ success: true, data: result });
}

async function competitorController(request, reply) {
  const result = await marketingService.analyzeCompetitor(request.body);
  return reply.send({ success: true, data: result });
}

async function mediaMixController(request, reply) {
  const result = await marketingService.generateMediaMix(request.body);
  return reply.send({ success: true, data: result });
}

module.exports = {
  adCopyController,
  sentimentController,
  competitorController,
  mediaMixController,
};
