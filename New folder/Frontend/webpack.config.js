const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const FRONTEND_PORT = process.env.PORT ? Number(process.env.PORT) : 3005;
const BACKEND_URL = process.env.BACKEND_URL || 'https://task-assignment-and-management-dashboard.onrender.com';

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    port: FRONTEND_PORT,
    allowedHosts: 'all',
    proxy: [
      {
        context: ['/api'],
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        proxyTimeout: 60000,
        timeout: 60000,
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('X-Dev-Proxy', 'webpack-dev-server');
        }
      }
    ],
  },
};

