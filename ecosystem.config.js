module.exports = {
  apps: [
    {
      name: 'wetomtech',
      script: './server.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '350M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
