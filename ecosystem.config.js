module.exports = {
  apps: [
    {
      name: "chakyruu",
      script: "server/dist/index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
