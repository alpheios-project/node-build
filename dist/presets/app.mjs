/*
This preset is to be used for building apps that are distributed to the end user.
It includes support for JS, CSS, and Sass.
 */
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import sass from 'sass'
import fibers from 'fibers'
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin'
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
                fiber: fibers,
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
        new TerserPlugin({
          cache: true,
          terserOptions: {
            ecma: undefined,
            warnings: false,
            parse: {},
            compress: {},
            mangle: true, // Note `mangle.properties` is `false` by default.
            module: false,
            output: null,
            toplevel: false,
            nameCache: null,
            ie8: false,
            keep_classnames: true,
            keep_fnames: false,
            safari10: false
          }
        }),
        new OptimizeCSSAssetsPlugin({})
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