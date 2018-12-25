import TerserPlugin from 'terser-webpack-plugin'
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
          test: /\.js$/,
          use: ['source-map-loader'],
          enforce: 'pre'
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

export default { webpack }