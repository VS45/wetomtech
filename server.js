require('dotenv').config();

const app = require('./app');
const { initialiseDatabase, closeDatabase } = require('./config/database');

const PORT = Number(process.env.PORT) || 9000;
let server;

async function startServer() {
  await initialiseDatabase();

  server = app.listen(PORT, () => {
    console.log(`WetomTech website running at http://localhost:${PORT}`);
  });
}

async function shutdown(signal) {
  console.log(`\n${signal} received. Closing WetomTech website safely...`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await closeDatabase();
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startServer().catch(async (error) => {
  console.error('Unable to start WetomTech website:', error);
  await closeDatabase().catch(() => {});
  process.exit(1);
});
