
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

var clean = require('gulp-clean');

var mockFn = require('./mock.js');

var srcFiles = {
    html: './src/html/**/*.html',
    css: '',
    scss: './src/css/**/*.scss',
    js: './src/js/**/*.js',
    img: ''
};
var distFiles = {
    html: './dist/html/',
    css: '',
    scss: './dist/css',
    js: './dist/js/',
    img: ''
};
var version = {
    css: './ver/css',
    js: './ver/js',
    htmlVer: './ver/**/*.json'
};
var versionFiles = {
    html: './src/html/**/*.html',
    css: './dist/css/**/*.css',
    js: './dist/js/**/*.js',
};

// =========================================================================================================
gulp.task('clean', function() {
    gulp.src(['dist','ver'], {read: false})
    .pipe(clean({force: true}));
});
// =========================================================================================================
// 拷贝 html
gulp.task('html', function () {
  gulp.src(srcFiles.html)
    .pipe(gulp.dest(distFiles.html));
});
// =========================================================================================================
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
        mockFn.mock(req, res, next);
      }
    }))
});
// =========================================================================================================
// 编译 Sass
gulp.task('sass', function () {
  gulp.src(srcFiles.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCSS())
    .pipe(gulp.dest(distFiles.scss));
});
// =========================================================================================================
// js 模块化
gulp.task('js', function () {
  gulp.src(srcFiles.js)
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
    .pipe(gulp.dest(distFiles.js));
});
// =========================================================================================================
// 版本号控制
gulp.task('ver', function () {
  gulp.src(versionFiles.css)
    // 生成 name-MD5.css
    .pipe(rev())
    .pipe(gulp.dest(distFiles.scss))
    // 生成 rev-manifest.json(映射)
    .pipe(rev.manifest())
    .pipe(gulp.dest(version.css));

  gulp.src(versionFiles.js)
    // 生成 name-MD5.css
    .pipe(rev())
    .pipe(gulp.dest(distFiles.js))
    // 生成 rev-manifest.json(映射)
    .pipe(rev.manifest())
    .pipe(gulp.dest(version.js));
});
gulp.task('htmlVer', function () {
  gulp.src([version.htmlVer, versionFiles.html])
    .pipe(revCollector())
    .pipe(gulp.dest(distFiles.html));
});

// =========================================================================================================
// gulp watch
gulp.task('watch',['html','sass','js'], function () {
  gulp.watch(srcFiles.html, ['html']);
  gulp.watch(srcFiles.scss, ['sass']);
  gulp.watch(srcFiles.js, ['js']);
});

// 设置默认task
gulp.task('default', ['watch', 'webserver'], function () {
  console.log('all task done!');
});
