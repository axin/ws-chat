var gulp = require('gulp');
var rollup = require('gulp-rollup');
var rename = require('gulp-rename');
var livereload = require('gulp-livereload');
var st = require('st');
var http = require('http');
var del = require('del');

gulp.task('bundle', function () {
    return gulp.src('src/app.js', { read: false })
        .pipe(rollup({
            format: 'es6'
        }))
        .pipe(rename('bundle.js'))
        .pipe(gulp.dest('dist'))
        .pipe(livereload());
});

gulp.task('copy-files', function () {
    return gulp.src([ 'src/index.html' ])
        .pipe(gulp.dest('dist'));
});

gulp.task('server', function (done) {
    http.createServer(
        st({ path: __dirname + '/dist', index: 'index.html', cache: false })
        ).listen(8080, done);
});

gulp.task('clean', function () {
  return del(['dist/**/*']);
});

gulp.task('watch', ['server', 'build'], function () {
    livereload.listen({ basePath: 'dist' });
    gulp.watch('src/**/*.js', ['bundle']);
});

gulp.task('build', ['bundle', 'copy-files']);
gulp.task('default', ['clean', 'build']);