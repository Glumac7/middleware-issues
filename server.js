const express = require("express");
const next = require("next");
// const Path = require('path');
// const readFile = require('fs').readFileSync;
const events = require("events");

const eventEmitter = new events.EventEmitter();

const testRunning = false;

let port = 8888;

function getRandomInt(min = 20000, max = 30000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const hostname = "localhost";

// change port to random port if test is running
if (testRunning) {
  port = getRandomInt();
}
const production = true;
// const devRunning = process.env.NODE_ENV === 'development';

const nextjs = next({ dev: !production, hostname, port });

process.on("uncaughtException", (err) => {
  console.error(err);
  console.error(err, "uncaughtException detected - server is stopping");
  process.exit(1);
});

class Server {
  constructor() {
    this.express = express();
    this.express.disable("x-powered-by");
    this.express.use((req, res, next) => {
      res.removeHeader("x-powered-by");
      next();
    });
    /* istanbul ignore next */
    process.on("SIGINT", () => {
      console.error("SIGINT");
      this.stopServer();
      eventEmitter.emit("shutdown");
    });
    process.on("SIGTERM", () => {
      console.log("SIGTERM");
      this.stopServer();
      eventEmitter.emit("shutdown");
    });
  }

  async startServer(test) {
    if (test) {
      throw new Error("this is only for testing");
    }
    // console.log('got port:', port);
    try {
      if (!testRunning) {
        await nextjs.prepare();
      }

      this.express.locals.nextjs = nextjs;

      console.log("Server is starting in normal mode");

      // add handler for new websocket in next 12 dev server
      // see: https://nextjs.org/docs/upgrading#nextjs-hmr-connection-now-uses-a-websocket
      if (!production) {
        this.express.all("/_next/webpack-hmr", (req, res) => {
          nextjs.getRequestHandler(req, res);
        });
      }
      const handle = nextjs.getRequestHandler();
      this.express.all("*", (req, res) => {
        return handle(req, res);
      });

      this.express.set("express", express);

      await new Promise((resolve) => {
        this.expressServer = this.express.listen(port, () => {
          console.log(`Server running at: http://localhost:${port}`);
          resolve();
        });
      });
    } catch (error) {
      console.error(error);
      this.stopServer();
    }
  }

  stopServer() {
    console.log("stopping express server");
    console.log("stopping express server");
    if (this.expressServer) {
      this.expressServer.close(() => {
        console.log("stopped express server");
        console.info("stopped express server");
        process.exit(0);
      });
      setTimeout(() => {
        console.error(
          "Could not gracefully shut down in time, forcefully shutting down"
        );
        process.exit(1);
      }, 6000);
    } else {
      console.log("express server not running");
      process.exit(0);
    }
  }
}

module.exports = Server;
