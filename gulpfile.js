'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    rigger = require('gulp-rigger'),
    cleanCSS = require('gulp-clean-css'),
    svgmin = require('gulp-svgmin'),
    svgstore = require('gulp-svgstore'),
    svgpath = require('path'),
    includes = require('gulp-file-include'),
    tinypng = require('gulp-tinypng-compress'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/storage/images/',
        fonts: 'build/fonts/',
        svg: 'build/storage/images/',
        svg2: 'build/storage/images/',
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
        baseDir: "./build"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend"
};

gulp.task('webserver', function () {
    browserSync(config);
});


gulp.task('html:build', function () {
    gulp.src(path.dev.html)
        .pipe(rigger())
        .pipe(includes({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('js:build', function () {
    gulp.src(path.dev.js)
        // .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('style:build', function () {
    gulp.src(path.dev.style)
        .pipe(sass({
            includePaths: ['dev/style/'],
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(cleanCSS())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('image:build', function () {
    gulp.src(path.dev.img)
        .pipe(tinypng({
            key: 'KpaEMOnqEvuKLm8KiTI6J_UAFKNqlUTY', //XRZuqyo6VWQvcOmvYPYprQBjS1GUcgy- ; P3jx6VFnO6SllhgMm1gktt1olcJDTYDs ;73fEeflGGhHyRfftICpYXfKDG85FCcE2
            log: true,
            sigFile: 'dev/storage/images/.tinypng-sigs',
            summarise: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('svg:build', function () {
    return gulp
        .src(path.dev.svg)
        // minify svg
        .pipe(svgmin({
            js2svg: {
                pretty: true
            },
            plugins: [{
                removeDoctype: false
            }, {
                removeComments: true
            }, {
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }, {
                convertColors: {
                    names2hex: false,
                    rgb2hex: false
                }
            }]
        }))
        // build svg sprite
        .pipe(svgmin(function (file) {
            var prefix = svgpath.basename(file.relative, svgpath.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: false
                    }
                }]
            }
        }))
        .pipe(svgstore({
            inlineSvg: true
        }))
        .pipe(gulp.dest(path.build.svg))
        .pipe(reload({
            stream: true
        }));
});
gulp.task('svg2:build', function () {
    return gulp
        .src(path.dev.svg2)
        .pipe(gulp.dest(path.build.svg2))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('fonts:build', function () {
    gulp.src(path.dev.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build',
    'svg:build',
    'svg2:build'
]);


gulp.task('watch', function () {
    watch([path.watch.html], function (event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function (event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function (event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function (event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.svg], function (event, cb) {
        gulp.start('svg:build');
    });
    watch([path.watch.svg], function (event, cb) {
        gulp.start('svg2:build');
    });
    watch([path.watch.fonts], function (event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);