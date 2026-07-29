module.exports = {
  apps: [
    {
      name: "vizag-properties",
      script: "npm",
      args: "start",
      cwd: "/var/www/vizag-properties",
      instances: 2,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
