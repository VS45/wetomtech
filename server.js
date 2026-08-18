require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const PORT = Number(process.env.PORT) || 9000;
let server;

async function startServer() {

  mongoose.connect(process.env.MONGODB_URI).then(() => {
    server = app.listen(PORT, () => {
      console.log(`WetomTech website running at http://localhost:${PORT}`);
    });
  }).catch((error) => {
    console.error('Unable to connect to MongoDB:', error);
    process.exit(1);
  })
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
  process.exit(1);
});


