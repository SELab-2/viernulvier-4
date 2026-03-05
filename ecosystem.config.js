// no touchy!
module.exports = {
  apps: [
    {
      name: "frontend",
      script: ".output/server/index.mjs",
      cwd: "/home/selab2/project/frontend",
      env: {
        PORT: 3001,
        NUXT_API_BASE: "https://sel2-4.ugent.be/api",
        NUXT_BASE: "/archive/",
      },
    },
    {
      name: "backend",
      script: "dist/main.js",
      cwd: "/home/selab2/project/backend",
      env: {
        PORT: 3000,
        NODE_ENV: "production",
      },
    },
  ],
};
