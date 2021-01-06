module.exports = {
  apps : [{
    name: "mr-live",
    script: 'index.js',
    watch: '.',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  },
  {
    name: "mr-scheduler",
    script: 'scheduler.js',
    watch: '.',
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
