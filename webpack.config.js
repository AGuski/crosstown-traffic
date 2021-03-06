module.exports = {
  entry: './src/main.ts',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  devServer: {
    port: 4200,
    publicPath: '/dist'
  },

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, use: 'awesome-typescript-loader', exclude: /node_modules/ },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: 'pre', test: /\.js$/, use: 'source-map-loader', exclude: /node_modules/ },
      // Workaround for snapsvg
      { test: require.resolve('snapsvg'), loader: 'imports-loader?this=>window,fix=>module.exports=0' }
    ]
  },
  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.
  // This is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between builds.
  externals: {
    // 'snapsvg': 'Snap'
  }
};