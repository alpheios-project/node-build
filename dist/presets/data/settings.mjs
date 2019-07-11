const TERSER_OPTIONS = {
  cache: true,
  terserOptions: {
    ecma: 8,
    warnings: false,
    parse: {},
    compress: {},
    mangle: true, // Note `mangle.properties` is `false` by default.
    module: false,
    output: null,
    toplevel: false,
    nameCache: null,
    ie8: false,
    keep_classnames: true, // Without this class names will not be comparable with strings
    /*
    Without below it will be not possible to bundle minified files because of
    "TypeError: Super expression must either be null or a function, not undefined" error.
    Please see https://github.com/airbnb/react-dates/issues/1456 for more details.
     */
    keep_fnames: true, // Without this it will be
    safari10: false
  }
}

export { TERSER_OPTIONS }
