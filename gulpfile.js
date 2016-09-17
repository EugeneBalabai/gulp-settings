//npm init
//npm install gulp gulp-watch gulp-autoprefixer gulp-uglify gulp-sass gulp-sourcemaps gulp-rigger gulp-clean-css gulp-tinypng-compress browser-sync --save-dev
'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cleanCSS  = require('gulp-clean-css'),
    tinypng = require('gulp-tinypng-compress'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/images/',
        fonts: 'build/fonts/'
    },
    dev: {
        html: 'dev/*.html',
        js: 'dev/js/*.js',
        style: 'dev/style/style.scss',
        img: 'dev/images/**/*.{png,jpg,jpeg}',
        fonts: 'dev/fonts/**/*.*'
    },
    watch: {
        html: 'dev/**/*.html',
        js: 'dev/js/**/*.js',
        style: 'dev/style/**/*.*',
        img: 'dev/images/**/*.{png,jpg,jpeg}',
        fonts: 'dev/fonts/**/*.*'
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
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js:build', function () {
    gulp.src(path.dev.js) 
        .pipe(uglify()) 
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    gulp.src(path.dev.style) 
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['dev/style/'],
            errLogToConsole: true
        }))
        .pipe(prefixer())
        //.pipe(cleanCSS()) 
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.dev.img)
        .pipe(tinypng({
            key: 'KpaEMOnqEvuKLm8KiTI6J_UAFKNqlUTY', //XRZuqyo6VWQvcOmvYPYprQBjS1GUcgy- ; P3jx6VFnO6SllhgMm1gktt1olcJDTYDs ;73fEeflGGhHyRfftICpYXfKDG85FCcE2
            log: true,
            sigFile: 'build/images/.tinypng-sigs',
            summarise: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});


gulp.task('fonts:build', function() {
    gulp.src(path.dev.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});


gulp.task('default', ['build', 'webserver', 'watch']);