
//
var gulp = require('gulp');

var webserver = require('gulp-webserver');

var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');

var named = require('vinyl-named');
var webpack = require('gulp-webpack');
var uglify = require('gulp-uglify');

var rev = require('gulp-rev');
var revCollector = require('gulp-rev-collector');

var url = require('url');
var fs = require('fs');

// 拷贝 index 到 app
gulp.task('copy-index', function () {
  gulp.src('./index.html')
    .pipe(gulp.dest('./app'));
});

// 启动 webserver
gulp.task('webserver', function () {
  gulp.src('./')
    .pipe(webserver({
      host: 'localhost',
      port: 80,
      livereload: true,
      directoryListing: {
        enable: true,
        path: './'
      },
      middleware: function (req, res, next) {
        var urlObj = url.parse(req.url, true);
        switch (urlObj.pathname) {
          case '/api/getLivelist.php':
            res.setHeader('Content-type', 'application/json');
            fs.readFile('./mock/livelist.json', 'utf-8', function (err, data) {
              res.end(data);
            });
            return;
          case '/api/getLivelistmore.php':
            // ....
            return;
        }
        next();
      }
    }))
});

// 编译 Sass
var cssFiles = [
  './src/styles/index.scss'
]
gulp.task('sass', function () {
  gulp.src(cssFiles)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCSS())
    .pipe(gulp.dest('./app/prd/styles'));
});
gulp.task('css', function () {
  gulp.src('./src/styles/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest('./app/prd/styles'));
});

// js 模块化
var jsFiles = [
  './src/scripts/app.js'
];
gulp.task('packjs', function () {
  gulp.src(jsFiles)
    // js commonjs规范模块化编译
    .pipe(named())
    .pipe(webpack({
      output: {
        filename: '[name].js'
      },
      module: {
        loaders: [{
          test: /\.js$/,
          loader: 'imports?define=>false'
        }]
      }
    }))
    // js 压缩
    .pipe(uglify().on('error', function (e) {
      console.log('\x07', e.lineNumber, e.message);
      // 在控制台上输出
      return this.end();
    }))
    .pipe(gulp.dest('./app/prd/scripts'));
});

// 版本号控制
var cssDistFiles = [
  './app/prd/styles/app.css'
];
var jsDistFiles = [
  './app/prd/scripts/app.js'
];
gulp.task('ver', function () {
  gulp.src(cssDistFiles)
    // 生成 name-MD5.css
    .pipe(rev())
    .pipe(gulp.dest('./app/prd/styles'))

    // 生成 rev-manifest.json(映射)
    .pipe(rev.manifest())
    .pipe(gulp.dest('./app/ver/styles'))

  gulp.src(jsDistFiles)
    // 生成 name-MD5.css
    .pipe(rev())
    .pipe(gulp.dest('./app/prd/scripts'))

    // 生成 rev-manifest.json(映射)
    .pipe(rev.manifest())
    .pipe(gulp.dest('./app/ver/scripts'))
});
gulp.task('html', function () {
  gulp.src(['./app/ver/**/*.json', './app/*.html'])
    .pipe(revCollector())
    .pipe(gulp.dest('./app'));
});
gulp.task('min', ['ver', 'html']);

// gulp watch
gulp.task('watch', function () {
  gulp.watch('./*.html', ['copy-index']);
  gulp.watch('./src/styles/**/*.scss', ['sass']);
  gulp.watch('./src/styles/**/*.css', ['css']);
  gulp.watch('./src/scripts/**/*.js', ['packjs']);
});

// 设置默认task
gulp.task('default', ['watch', 'webserver'], function () {
  console.log('all task done!');
});
