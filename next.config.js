const Path = require("path");
const nanoid = require("nanoid").nanoid;
const readFile = require("fs").readFileSync;
const profile = process.env.PROFILE === "true";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = () => {
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    generateEtags: false,
    crossOrigin: "anonymous",
    optimizeFonts: false,
    productionBrowserSourceMaps: true,
    pageExtensions: ["js", "tsx", "de.js", "ade.js", "api.ts"],
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
