const gulp = require('gulp');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const nested = require('postcss-nesting');
const runSequence = require('run-sequence');
const fileinclude = require('gulp-file-include');
const pug = require('gulp-pug');
const ejs = require('gulp-ejs');
const size = require('gulp-size');
const prettify = require('gulp-html-prettify');
const rename = require('gulp-rename');
const del = require('del');
const concat = require('gulp-concat');
const uglify = require("gulp-uglify-es").default;
const changed = require('gulp-changed');
const ghPages = require('gulp-gh-pages');
const plumber = require('gulp-plumber');
const browserSync = require('browser-sync').create();
const reload = require('browser-sync').reload();
const spritesmith = require('gulp.spritesmith');
const nunjucksRender = require('gulp-nunjucks-render');

const imagemin = require('gulp-imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');
const gifsicle = require('imagemin-gifsicle');
const svgo = require('imagemin-svgo');

// onError
const onError = (err) => {
    console.log(err);
};

// ------------------- //

// sass
gulp.task('sass', () => {
    var plugins = [
        autoprefixer(),
        nested()
    ];
    
    return gulp.src([ 'src/assets/scss/**/*.scss', 'src/_modules/**/*.scss' ])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write('./'))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/assets/css'))
        .pipe(browserSync.stream());
});

// ------------------- //

// html : makeindex
gulp.task('makeindex', () => {
    return gulp.src(['src/index.html'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist'));
});

// html : fileinclude
gulp.task('fileinclude', () => {
    return gulp.src(['src/html/**/*.html'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/html'));
});

// html : pug
gulp.task('pug', () => {
    return gulp.src(['src/pug/**/*.pug'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(pug())
        .pipe(rename({ extname: '.html' }))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/pug'));
});

// html : ejs
gulp.task('ejs', () => {
    return gulp.src(['src/ejs/**/*.html'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(ejs())
        .pipe(rename({ extname: '.html' }))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/ejs'));
});

// html : nunjucksRender
gulp.task('njk', () => {
    return gulp.src(['src/njk/**/*.njk'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(nunjucksRender())
        .pipe(rename({ extname: '.html' }))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/njk'));
});

// html-all
gulp.task('html-all', ['fileinclude', 'pug', 'ejs', 'njk'], () => {
    return gulp.src(['dist/html/**/*', 'dist/pug/**/*', 'dist/ejs/**/*'])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(prettify({indent_char: ' ', indent_size: 2}))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/ejs'))
        .pipe(browserSync.stream());
});

// ------------------- //

// js
gulp.task('js', () => {
    return gulp.src([ 'src/assets/js/**/*' ])
        .pipe(plumber({ errorHandler: onError }))
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/assets/js'))
        .pipe(browserSync.stream());
});

// ------------------- //

// imagemin
gulp.task('imagemin', () => {
    return gulp.src('src/assets/images/**/*')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(changed('dist/images'))
        .pipe(imagemin([
            pngquant({quality: [0.5, 0.5]}),
            mozjpeg({quality: 75, progressive: true}),
            gifsicle(),
            svgo()
        ], {verbose: true}))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/assets/images'))
        .pipe(browserSync.stream());
});

// ------------------- //

// clean dist
gulp.task('clean:dist', () => {
    return del.sync(['dist/*']);
});

// fonts
gulp.task('fonts', () => {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(plumber({ errorHandler: onError }))
        .pipe(changed('dist/assets/fonts'))
        .pipe(size({ gzip: true, showFiles: false }))
        .pipe(gulp.dest('dist/assets/fonts'));
});

// ------------------- //

// watch
gulp.task('watch', () => {
    gulp.watch(['src/assets/scss/**/*.scss', 'src/_modules/**/*.scss'], ['sass']);
    gulp.watch(['src/html/**/*.html', 'src/pug/**/*.pug', 'src/njk/**/*.njk', 'src/ejs/**/*.html'], ['html-all']);
    gulp.watch(['src/assets/js/**/*'], ['js']);
    gulp.watch(['src/assets/images/**/*'], ['imagemin']);
});

// ------------------- //

// browser sync
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './dist',
            directory: true
        }
    });
});

// ------------------- //

// ghPages
gulp.task('ghPages', () => {
    return gulp.src('./dist/**/*')
        .pipe(ghPages())
});

// deploy
gulp.task('deploy', (cb) => {
    return runSequence(['build'], 'ghPages', cb);
})

// default
gulp.task('default', (cb) => {
    return runSequence('clean:dist', ['imagemin'], ['fonts', 'html-all', 'sass', 'js'], 'server', 'watch', cb);
});

// build
gulp.task('build', (cb) => {
    return runSequence('clean:dist', ['imagemin'], ['fonts', 'html-all', 'sass', 'js'], cb);
});