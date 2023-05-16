const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const baseConfig = {
  entry: "./index.ts",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        include: [
          path.resolve(__dirname, "html-chess"),
          path.resolve(__dirname, "assets"),
          path.resolve(__dirname, "packages/chess-engine"),
        ]
      },
      {
        test: /\.png$/,
        use: "url-loader",
        include: [
          path.resolve(__dirname, "html-chess"),
          path.resolve(__dirname, "templates"),
          path.resolve(__dirname, "assets"),
          path.resolve(__dirname, "packages/chess-engine"),
        ]
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
        include: [
          path.resolve(__dirname, "html-chess"),
          path.resolve(__dirname, "assets"),
          path.resolve(__dirname, "packages/chess-engine"),
        ]
      }
    ],
  },
};

const prodConfig = {
  ...baseConfig,
  mode: "production",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
  ],
};

const devConfig = {
  ...baseConfig,
  mode: "development",
  devServer: {
    contentBase: "./dist",
    hot: true,
  },
  output: {
    path: path.join(__dirname, "/dev"),
    filename: "index.bundle.js",
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./index.html",
    }),
    new webpack.SourceMapDevToolPlugin({}),
  ],
  devtool: "inline-source-map",
};

const isProduction = process.env.NODE_ENV === "production";

module.exports = isProduction ? prodConfig : devConfig;
