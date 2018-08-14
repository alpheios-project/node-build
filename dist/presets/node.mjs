const path = require('path')

const webpack = {
  target: "node",
  entry: {
    app: ["./src/index.js"]
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "alpheios-lt-cmdtool.js"
  },
  externals: [],
  mode: "development",
  node: {
    __dirname: false
  },
  resolve: {
    modules: ['node_modules']
  }
}

export default { webpack }