/*
This preset is for building PWA applications that uses Vue.js.

 */
import { TERSER_OPTIONS } from './data/settings.mjs'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import sass from 'sass'
import fibers from 'fibers'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
import WebpackCleanupPlugin from 'webpack-cleanup-plugin'
import path from 'path'
const projectRoot = process.cwd()
const sourceDir = path.join(projectRoot, 'src')
const destDir = path.join(projectRoot, 'dist')

const webpack = {
  // Settings that are shared between both production and development configs
  common: {
    context: sourceDir,
    output: {
      path: destDir,
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
              limit: 25000
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
                fiber: fibers,
                sourceMap: true
              }
            }
          ]
        },
        {
          test: /\.(htmlf)$/,
          use: {
            loader: 'html-loader'
          }
        }
      ]
    },
    plugins: [
      /* new CleanWebpackPlugin([ destDir ], {
        root: path.join(projectRoot, 'node-modules/webpack'),
        allowExternal: true,
        verbose: true
      }), */
      new WebpackCleanupPlugin()
    ]
  },

  // Settings that are used for production mode only
  production: {
    mode: 'production',
    optimization: {
      minimizer: [
        new TerserPlugin(TERSER_OPTIONS),
        new OptimizeCSSAssetsPlugin({})
      ]
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style.[hash].min.css'
      })
    ]
  },

  // Settings that are used for development mode only
  development: {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style/style.[hash].css'
      })
    ]
  }
}

export default { webpack }
