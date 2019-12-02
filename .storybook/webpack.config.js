const path = require('path');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = function ({ config, mode }) {
  config.resolve = {
    ...config.resolve,
    extensions: [
      ...config.resolve.extensions,
      ".js",
      ".jsx"
    ],
    modules: [
      "../node_modules",
      ...config.resolve.modules,
    ]
  }
  config.module.rules.push(
    ...[
      {
        test: /\.scss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: "css-loader", options: { url: false, sourceMap: true } },
          {
            loader: "postcss-loader",
            options: {
              sourceMap: true,
              indent: 'postcss',
              plugins: [require('autoprefixer')],
              config: {
                path: path.resolve(__dirname, "../postcss.config.js")
              }
            }
          },
          {
              loader: "sass-loader",
              options: {
                  sourceMap: true
              }
          }
        ]
      },
      {
        // Loads storybook in IE11;
        // Hack until 5.3 release: https://github.com/storybookjs/storybook/issues/8884
        test: /\.js$/,
        include: /node_modules\/acorn-jsx/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [[require.resolve('@babel/preset-env'), { modules: 'commonjs' }]],
            },
          },
        ],
      },
      {
        test: /\.(stories|story)\.mdx$/,
        use: [
          {
            loader: 'babel-loader',
            // may or may not need this line depending on your app's setup
            options: {
              plugins: ['@babel/plugin-transform-react-jsx'],
            },
          },
          {
            loader: '@mdx-js/loader',
            options: {
              compilers: [createCompiler({})],
            },
          }
        ]
      },
      {
        test: /\.(stories|story)\.js?$/,
        loader: require.resolve('@storybook/source-loader'),
        exclude: [/node_modules/],
        enforce: 'pre'        
      }
    ]
  );
  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    })
  );
  return config;
};
