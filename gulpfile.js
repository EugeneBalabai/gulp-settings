'use strict';

var gulp = require('gulp'),
  watch = require('gulp-watch'),
  prefixer = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  rigger = require('gulp-rigger'),
  cleanCSS = require('gulp-clean-css'),
  svgmin = require('gulp-svgmin'),
  svgstore = require('gulp-svgstore'),
  svgpath = require('path'),
  includes = require('gulp-file-include'),
  markdown = require('markdown'),
  plumber = require('gulp-plumber'),
  tinypng = require('gulp-tinypng-extended'),
  browserSync = require('browser-sync'),
  babel = require('gulp-babel'), //2 low severity vulnerabilities
  reload = browserSync.reload;

var path = {
  build: {
    html: 'build/',
    js: 'build/js/',
    css: 'build/css/',
    img: 'build/storage/images/',
    fonts: 'build/fonts/',
    svg: 'build/storage/images/',
    svg2: 'build/storage/images/'
  },
  dev: {
    html: 'dev/*.html',
    js: 'dev/js/*.js',
    style: 'dev/style/style.scss',
    img: 'dev/storage/images/**/*.{png,jpg,jpeg}',
    fonts: 'dev/fonts/**/*.*',
    svg: 'dev/storage/images/icons/**/*.svg',
    svg2: 'dev/storage/images/*.svg'
  },
  watch: {
    html: 'dev/**/*.html',
    js: 'dev/js/**/*.js',
    style: 'dev/style/**/*.*',
    img: 'dev/storage/images/**/*.{png,jpg,jpeg}',
    fonts: 'dev/fonts/**/*.*',
    svg: 'dev/storage/images/icons/**/*.svg',
    svg2: 'dev/storage/images/*.svg'
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 3000,
  logPrefix: 'Frontend'
};

gulp.task('webserver', function() {
  browserSync(config);
});

gulp.task('html:build', function() {
  gulp
    .src(path.dev.html)
    .pipe(rigger())
    .pipe(
      includes({
        prefix: '@@',
        basepath: '@file',
        indent: true,
        filters: {
          markdown: markdown.parse
        }
      }).on('error', function(err) {
        console.error(err.message);
      })
    )
    .pipe(gulp.dest(path.build.html))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task('js:build', function() {
  gulp
    .src(path.dev.js)
    // .pipe(uglify())
    .pipe(
      babel({
        presets: ['@babel/env']
      }).on('error', function(err) {
        console.error(err.message);
      })
    )
    .pipe(gulp.dest(path.build.js))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task('style:build', function() {
  gulp
    .src(path.dev.style)
    .pipe(
      sass({
        includePaths: ['dev/style/'],
        errLogToConsole: true
      }).on('error', sass.logError)
    )
    .pipe(prefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(path.build.css))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task('image:build', function() {
  gulp
    .src(path.dev.img)
    .pipe(plumber())
    .pipe(
      tinypng({
        key: 'KpaEMOnqEvuKLm8KiTI6J_UAFKNqlUTY', //XRZuqyo6VWQvcOmvYPYprQBjS1GUcgy- ; P3jx6VFnO6SllhgMm1gktt1olcJDTYDs ;73fEeflGGhHyRfftICpYXfKDG85FCcE2
        log: true,
        sigFile: 'dev/storage/images/.tinypng-sigs',
        summarise: true
      }).on('error', function(err) {
        console.error(err.message);
      })
    )
    .pipe(gulp.dest(path.build.img))
    .pipe(
      reload({
        stream: true
      })
    );
});

gulp.task('svg:build', function() {
  return (
    gulp
      .src(path.dev.svg)
      // minify svg
      .pipe(
        svgmin({
          js2svg: {
            pretty: true
          },
          plugins: [
            {
              removeDoctype: false
            },
            {
              removeComments: true
            },
            {
              cleanupNumericValues: {
                floatPrecision: 2
              }
            },
            {
              removeViewBox: false
            },
            {
              convertColors: {
                names2hex: false,
                rgb2hex: false
              }
            }
          ]
        })
      )
      // build svg sprite
      .pipe(
        svgmin(function(file) {
          var prefix = svgpath.basename(
            file.relative,
            svgpath.extname(file.relative)
          );
          return {
            plugins: [
              {
                cleanupIDs: {
                  prefix: prefix + '-',
                  minify: false
                }
              }
            ]
          };
        })
      )
      .pipe(
        svgstore({
          inlineSvg: true
        })
      )
      .pipe(gulp.dest(path.build.svg))
      .pipe(
        reload({
          stream: true
        })
      )
  );
});
gulp.task('svg2:build', function() {
  return (
    gulp
      .src(path.dev.svg2)
      // minify svg
      .pipe(
        svgmin({
          js2svg: {
            pretty: true
          },
          plugins: [
            {
              removeTitle: true
            },
            {
              removeDoctype: false
            },
            {
              removeComments: true
            },
            {
              cleanupNumericValues: {
                floatPrecision: 2
              }
            },
            {
              convertColors: {
                names2hex: false,
                rgb2hex: false
              }
            }
          ]
        })
      )
      .pipe(gulp.dest(path.build.svg2))
      .pipe(
        reload({
          stream: true
        })
      )
  );
});

gulp.task('fonts:build', function() {
  gulp.src(path.dev.fonts).pipe(gulp.dest(path.build.fonts));
});

gulp.task(
  'build',
  gulp.parallel(
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'svg:build',
    'svg2:build'
  )
);

gulp.task('watch', function() {
  watch([path.watch.html], gulp.series('html:build'));
  watch([path.watch.style], gulp.series('style:build'));
  watch([path.watch.js], gulp.series('js:build'));
  watch([path.watch.img], gulp.series('image:build'));
  watch([path.watch.svg], gulp.series('svg:build'));
  watch([path.watch.svg2], gulp.series('svg2:build'));
  watch([path.watch.fonts], gulp.series('fonts:build'));
});

gulp.task('default', gulp.parallel('build', 'webserver', 'watch'));
