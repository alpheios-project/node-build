/*
This preset is for building libraries that are using Vue.js.
 */
import { TERSER_OPTIONS } from './data/settings.mjs'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import sass from 'sass'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import path from 'path'
const projectRoot = process.cwd()

const webpack = {
  // Settings that are shared between both production and development configs
  common: {
    context: path.join(projectRoot, 'src/'),
    output: {
      path: path.join(projectRoot, 'dist/'),
      libraryTarget: 'umd'
    },
    resolve: {
      mainFields: ['moduleExternal', 'module', 'main']
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
        },
        {
          test: /\.(jpg|png)$/,
          use: [{
            loader: 'url-loader',
            options: {
              limit: 65000
            }
          }]
        },
        {
          test: /\.svg$/,
          loader: 'vue-svg-loader', // `vue-svg` for webpack 1.x
          options: {
            // optional [svgo](https://github.com/svg/svgo) options
            svgo: {
              plugins: [
                {removeDoctype: true},
                {removeComments: true},
                {inlineStyles: false}
              ]
            }
          }
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
        },
        {
          test: /\.(htmlf)$/,
          use: {
            loader: 'vue-template-loader'
          }
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
        new OptimizeCSSAssetsPlugin({})
      ]
    }
  },

  // Settings that are used for development mode only
  development: {
    mode: 'development',
    devtool: 'source-map'
  }
}

export default { webpack }