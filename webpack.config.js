const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseRules = [
  {
    test: /\.vue$/,
    loader: 'vue-loader',
  },
  {
    test: /\.js$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  },
];

const baseResolve = {
  extensions: ['.js', '.vue'],
};

// Background (service worker)
const backgroundConfig = {
  name: 'background',
  target: 'webworker',
  entry: {
    background: './src/background/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].js',
  },
  module: {
    rules: [...baseRules],
  },
  resolve: baseResolve,
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
};

// Content script
const contentScriptConfig = {
  name: 'content-script',
  target: 'web',
  entry: {
    'content-script': './src/content/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].js',
  },
  module: {
    rules: [
      ...baseRules,
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].css',
    }),
  ],
  resolve: baseResolve,
};

// Inject script (IIFE, no imports/exports)
const injectScriptConfig = {
  name: 'inject-script',
  target: 'web',
  entry: {
    'inject-script': './src/inject/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].js',
    iife: true,
  },
  module: {
    rules: [...baseRules],
  },
  resolve: baseResolve,
  optimization: {
    splitChunks: false,
    runtimeChunk: false,
  },
};

// Popup (Vue/Vuex)
const popupConfig = {
  name: 'popup',
  target: 'web',
  entry: {
    popup: './src/popup/main.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/js/[name].js',
  },
  module: {
    rules: [
      ...baseRules,
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'rules.json', to: 'rules.json' },
        { from: '_locales', to: '_locales', noErrorOnMissing: true },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        { from: 'assets/images', to: 'assets/images', noErrorOnMissing: true },
        { from: 'assets/fonts', to: 'assets/fonts', noErrorOnMissing: true },
        { from: 'popup.html', to: 'popup.html' },
        { from: 'options.html', to: 'options.html' },
      ],
    }),
  ],
  resolve: baseResolve,
};

// Export multi-compiler configuration
module.exports = [backgroundConfig, contentScriptConfig, injectScriptConfig, popupConfig];
