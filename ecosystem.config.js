// no touchy!
module.exports = {
  apps: [
    {
      name: "frontend",
      script: ".output/server/index.mjs",
      cwd: "/path/to/project/frontend",
      env: {
        PORT: 3001,
        NUXT_API_BASE: "<Set-your-url-to-hosted-backend-here>",
        NUXT_BASE: "/archive/",
      },
    },
    {
      name: "backend",
      script: "dist/main.js",
      cwd: "/path/to/project/backend",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
