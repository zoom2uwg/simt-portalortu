module.exports = {
  apps: [{
    name: 'simt-portalortu',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3000',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      NODE_OPTIONS: '--max-old-space-size=1024',
    },
    max_memory_restart: '512M',
    max_restarts: 15,
    restart_delay: 3000,
    watch: false,
    autorestart: true,
  }]
};
