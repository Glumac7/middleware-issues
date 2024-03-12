const setConfig = require("next/config").setConfig;

// setConfig(require("./next.config.mjs"));

const Server = require("./server");

module.exports = Server;

/* istanbul ignore next */
if (require.main === module) {
  let server = new Server();
  server.startServer();
}
