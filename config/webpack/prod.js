const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');

const Path = require('path');
const glob = require('glob');
const AppRoot = Path.resolve(__dirname, '../../');

function toObj(paths) {
  let ret = {};

  paths.forEach(function(_path) {
    ret['javascripts/' + _path.split('/').slice(-2)[0]] = _path;
  });

  return ret;
}

let jsEntryObj = toObj(
  glob.sync(AppRoot + '/app/assets/javascripts/**/main.js')
);

function imageCdn(css) {
  const pattern = /image-cdn\('(.*)'\)(.*)/g;

  function walker(decl) {
    if (decl.value.indexOf('image-cdn') > -1) {
      decl.parent.replaceValues(pattern, string => {
        const arr = string.split(' ');
        let res = [];
        let tmp;
        for (let i = 0, len = arr.length; i < len; i++) {
          tmp = arr[i];
          tmp = tmp.replace(
            pattern,
            ' url("http://localhost:8201/public/images/$1")$2'
          );
          res.push(tmp);
        }

        res = res.join(' ');

        return res;
      });
    }
  }

  if (css.walkDecls && typeof css.walkDecls === 'function') {
    css.walkDecls(walker);
  } else {
    css.eachDecl(walker);
  }
}

let jsNames = Object.keys(jsEntryObj);

module.exports = {
  devtool: 'source-map',
  entry: Object.assign(jsEntryObj, {
    vendor: ['vue', 'zepto']
  }),
  output: {
    path: AppRoot + '/public',
    filename: '[name].js',
    publicPath: '/static'
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx', '.vue', '.css', '.scss'],
    alias: {
      'vue': 'vue/dist/vue.js',
      images: AppRoot + '/app/assets/images'
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre', // Check raw before other loaders
        test: /\.(js|jsx|vue)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          extends: [
            // add more generic rulesets here, such as:
            // 'eslint:recommended',
            'plugin:vue/essential'
          ],
          rules: {
            // override/add rules settings here, such as:
            // 'vue/no-unused-vars': 'error'
          }
        }
      },
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader'
        }
      },
      {
        test: /\.html$/,
        loader: 'vue-html'
      },
      {
        test: /\.(css|scss)$/,
        use: ExtractTextPlugin.extract({
          use: [
            'css-loader',
            'sass-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: loader => [
                  autoprefixer
                  // imageCdn
                ]
              }
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /.(gif|jpeg|jpg|png|svg)$/,
        loader: 'url-loader',
        query: {
          limit: 8192,
          name: '/images/[hash:8].[name].[ext]'
        },
        include: [Path.resolve(__dirname, '../../app/assets/images')]
      },
      {
        test: /.woff|ttf|eot([?]?.*)$/,
        loader: 'file-loader',
        query: {
          name: '/fonts/[name].[ext]'
        }
      },
      {
        test: /.mp3$/,
        loader: 'file-loader',
        query: {
          name: '/media/[name].[ext]'
        }
      },
      {
        test: require.resolve('zepto'),
        use: ['exports-loader?window.Zepto', 'script-loader']
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: 'javascripts/common.js',
      chunks: jsNames
    }),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      filename: 'javascripts/vendor.js',
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            AppRoot + '/node_modules')
          ) === 0
      },
    }),
    new ExtractTextPlugin({
      filename: getPath => {
        return getPath('stylesheets/[name].css').replace(
          'stylesheets/javascripts',
          'stylesheets'
        );
      },
      allChunks: true
    }),
    new UglifyJSPlugin({
      test: /\.js|jsx|vue($|\?)/i,
      uglifyOptions: {
        ecma: 8,
        compress: {
          warnings: false
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    })
  ]
};
