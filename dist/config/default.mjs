import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'
import path from 'path'
const projectRoot = process.cwd()

export default {
  // Settings that are shared between both production and development configs
  common: {
    context: path.join(projectRoot, 'src/'),
    output: {
      path: path.join(projectRoot, 'dist/'),
      libraryTarget: 'umd'
    },
    resolve: {
      alias: {},
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
                {removeComments: true}
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
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: false
        })
      ]
    }
  },

  // Settings that are used for development mode only
  development: {
    mode: 'development',
    devtool: 'source-map'
  }
}
