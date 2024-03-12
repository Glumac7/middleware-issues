const Path = require("path");
const nanoid = require("nanoid").nanoid;
const readFile = require("fs").readFileSync;
const hostname = require("os").hostname();
const isProd = process.env.NODE_ENV === "production";
const profile = process.env.PROFILE === "true";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const SENTRY_DSN =
  process.env.MODE === "intern"
    ? "https://520da02a9879d7e54289520a5646ee88@o89023.ingest.sentry.io/4506240869924864"
    : "https://f01a584256af4e6d9b388177afefbda2@o89023.ingest.sentry.io/5539007";

let SENTRY_ENVIRONMENT = "";
if (process.env.GCP_STAGE) {
  SENTRY_ENVIRONMENT = process.env.GCP_STAGE;
}
if (SENTRY_ENVIRONMENT === "durchblicker-at-prod") {
  SENTRY_ENVIRONMENT = "production";
}

module.exports = () => {
  //NC stands for next config, so its identifiable
  //do not use any secrets or confidential information here. you can use utils/config for that
  const env = {
    NC_SAVINGS: "3.950",
    NC_STORAGE_SERVER_HOST: "127.0.0.1",
    NC_STORAGE_CLIENT_PATH: "/api/0.2/storage/",
    NC_STORAGE_SERVER_PORT: "9030",
    NC_STORAGE_SERVER_PATH: "/api/next/storage/",
    NC_SENTRY_DSN: SENTRY_DSN,
    NC_SENTRY_ENVIRONMENT: SENTRY_ENVIRONMENT,
    NC_SENTRY_AUTO_SESSION_TRACKING: "true",
    NC_SENTRY_DEBUG: String(!isProd),
    NC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE: "0",
    NC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: "0.1",
    NC_SENTRY_SERVER_NAME: hostname,
  };

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    env: env,
    generateEtags: false,
    crossOrigin: "anonymous",
    optimizeFonts: false,
    productionBrowserSourceMaps: true,
    pageExtensions: ["js", "tsx", "de.js", "ade.js", "ts"],
    // does run during build, access with it with process.env.<var>
    // vars replaced during build by webpack
    // do not set secrets here as they get exposed
    // compress: false, deactivate compression, as we are not behind an nginx
    poweredByHeader: false,
    reactStrictMode: true,
    typescript: {
      ignoreBuildErrors: true,
    },
    onDemandEntries: {
      // period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 10 * 60 * 1000,
      // number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 50,
    },
    eslint: {
      // Warning: Dangerously allow production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true,
    },
    images: {
      domains: ["res.cloudinary.com", "d3c90x7s263fnk.cloudfront.net"],
    },
    webpack: function (config, { isServer, buildId, webpack }) {
      // DATENEINGABE Loader

      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias.dateneingabe = Path.join(__dirname, "dateneingabe");
      config.resolve.alias.components = Path.join(__dirname, "components");
      config.resolve.alias.styles = Path.join(__dirname, "styles");
      config.resolve.alias.config = Path.join(__dirname, "config");
      config.resolve.alias.utils = Path.join(__dirname, "utils");
      config.resolve.alias.lib = Path.join(__dirname, "lib");
      config.resolve.alias.icons = Path.join(
        __dirname,
        "components/inlineIcons"
      );

      config.plugins.push(
        // Remove node: from import specifiers, because
        // webpack does not yet support node: scheme
        // https://github.com/webpack/webpack/issues/13290
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      if (profile) {
        const TerserPlugin = require("terser-webpack-plugin");
        config.optimization.minimizer = [
          new TerserPlugin({
            parallel: true,
            terserOptions: {
              keep_fnames: true,
              keep_classnames: true,
              sourceMap: true,
            },
          }),
        ];
      }

      config.module.rules.push({
        test: /\.md$/,
        type: "asset/source",
      });

      // https://webpack.js.org/migrate/5/#clean-up-configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.node = {
        __dirname: true,
      };

      // set build id to SENTRY_RELEASE
      config.plugins.push(
        new webpack.DefinePlugin({
          // 'process.env.SENTRY_RELEASE': JSON.stringify(buildId)
          "process.env.BUILD_ID": JSON.stringify(buildId),
        })
      );
      config.module.rules.push({
        test: /\.(gif|png|jpe?g|svg|woff|woff2|eot|ttf)$/,
        include: [Path.resolve(__dirname, "./public/")],
        type: "asset/resource",
      });
      // add SVG load, see more @README.md
      config.module.rules.push({
        test: /\.svg$/,
        use: [
          {
            loader: "babel-loader",
          },
          {
            loader: "react-svg-loader",
            options: {
              jsx: true, // true outputs JSX tags
              svgo: {
                plugins: [{ removeTitle: false }],
                floatPrecision: 2,
              },
            },
          },
        ],
      });

      if (!isServer) {
        config.plugins.push(
          new webpack.IgnorePlugin({ resourceRegExp: /(abort-controller)/ })
        );

        if (profile) {
          config.resolve.alias["react-dom$"] = "react-dom/profiling";
          config.resolve.alias["scheduler/tracing"] =
            "scheduler/tracing-profiling";
        }
      }

      return config;
    },
    generateBuildId: async () => {
      // This might be not needed any more in our gcp deployment
      let buildId;
      try {
        buildId = readFile(
          Path.join(__dirname, "./.lastGitCommitId"),
          "utf-8"
        ).replace(/^\s*|\s*$/g, "");
      } catch (ex) {
        buildId = nanoid();
      }
      return buildId;
    },
  };
  const plugins = [withBundleAnalyzer];
  return plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig });
};
