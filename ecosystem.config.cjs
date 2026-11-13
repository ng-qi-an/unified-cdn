module.exports = {
  apps: [{
    name: "unified-cdn",
    script: "./node_modules/next/dist/bin/next",
    args: "start",
    cwd: "./",
    env: { NODE_ENV: "production" }
  }]
}
