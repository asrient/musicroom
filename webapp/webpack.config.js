const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    app: "./index.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.(s*)css$/,
        use: [{ 
          loader: "style-loader",
        }, 
        {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            modules: true,
            url: false
          }
        }]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve('../server/musicroom/static/bundle'),
    publicPath: "/",
    filename: "[name].js"
  },
  // plugins: [new webpack.HotModuleReplacementPlugin()]
};