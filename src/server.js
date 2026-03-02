require('dotenv').config();
const buildApp = require('./app');

const app = buildApp();
const PORT = Number(process.env.PORT || 3000);

async function start() {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`CV3 API server listening on ${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
