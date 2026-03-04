module.exports = {
  apps: [
    {
      name: "frontend",
      script: ".output/server/index.mjs",
      cwd: "/home/selab2/project/frontend", // adjust to your project root
      env: {
        PORT: 3001,
        NUXT_API_BASE: "/api",
        NUXT_BASE: "/archive/",
      },
    },
    {
      name: "backend",
      script: "dist/main.js",
      cwd: "/home/selab2/project/backend", // adjust to your backend directory
      env: {
        PORT: 3000,
      },
    },
  ],
};
