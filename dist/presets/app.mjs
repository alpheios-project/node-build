/*
This preset is to be used for building apps that are distributed to the end user.
It includes support for JS, CSS, and Sass.
 */
import { TERSER_OPTIONS } from './data/settings.mjs'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import sass from 'sass'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  // Settings that are shared between both production and development configs
  common: {
    context: path.join(projectRoot, 'src/'),
    output: {
      path: path.join(projectRoot, 'dist/')
    },
    resolve: {
      mainFields: ['moduleExternal', 'module', 'main']
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        },
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader'
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                implementation: sass,
                sourceMap: true
              }
            }
          ]
        }
      ]
    }
  },

  // Settings that are used for production mode only
  production: {
    mode: 'production',
    optimization: {
      minimizer: [
        new TerserPlugin(TERSER_OPTIONS),
        new CssMinimizerPlugin()
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style.min.css'
      })
    ]
  },

  // Settings that are used for development mode only
  development: {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style.css'
      })
    ]
  }
}

export default { webpack }