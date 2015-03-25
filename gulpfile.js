var cover = require('gulp-coverage');
var gulp = require('gulp');
var inject = require('gulp-inject-string');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var size = require('gulp-size');
var uglify = require('gulp-uglify');
var pkg = require('./package.json');

var VERSION = pkg.version;

gulp.task('mocha', function() {
    return gulp.src('test.js', {read: false})
        .pipe(cover.instrument({
            pattern: ['octopus.js']
        }))
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(cover.gather())
        .pipe(cover.format())
        .pipe(cover.enforce())
        .pipe(gulp.dest('reports'));
});

gulp.task('compress', function() {
    gulp.src('octopus.js')
        .pipe(uglify())
        .pipe(rename('octopus.min.js'))
        .pipe(inject.prepend('/* octopus.js v' + VERSION + '*/'))
        .pipe(inject.append('\n'))
        .pipe(gulp.dest('./'));
});

gulp.task('size', ['compress'], function() {
    return gulp.src('octopus.min.js')
        .pipe(size({gzip: true, showFiles: true}));
});

gulp.task('default', ['mocha', 'compress', 'size']);
