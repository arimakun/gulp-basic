# gulp-basic

## install
```sh
$ npm init -y
$ npm install autoprefixer browser-sync del gulp@3.9.1 gulp-changed gulp-clean-css gulp-concat gulp-ejs gulp-file-include gulp-gh-pages gulp-html-prettify gulp-imagemin gulp-nunjucks-render gulp-plumber gulp-postcss gulp-pug gulp-rename gulp-sass gulp-sass-glob gulp-size gulp-sourcemaps gulp-uglify-es gulp.spritesmith imagemin-gifsicle imagemin-mozjpeg imagemin-pngquant imagemin-svgo postcss-nesting run-sequence --save-dev
```

## folder structure
```
project
│   README.md
│   gulpfile.js
│   .gitignore
│   .browserlistrc
│   .edtiorconfig
│   .package.json
│ 
└─── src
│     │
│     └── assets
│     │      └── fonts (use webfont)
│     │      └── images
│     │      |    └── etc...
│     │      └── js
│     │      |    └── plugins
│     │      └── scss
│     │           └── plugins
│     └── ejs (ejs markup template)
│     └── html (file include markup template)
│     └── njk (nunjucks markup template)
│     └── pug (pug markup template)
│   
└─── dist
│     └── sample src folder
│
└─── node_modules
```

## SCSS Tool
| Tool | URL |
| ------ | ------ |
| bourbon | <https://www.bourbon.io/> |

## JS, CSS Plugin
| Plugin | URL |
| ------ | ------ |
| jQuery | <https://jquery.com/> |
| swiperJS | <https://swiperjs.com/> |
| jQuery.waitforimages | <https://github.com/alexanderdickson/waitForImages> |
| PrismJS | <https://prismjs.com/> |
| Monthpicker | <http://www.daterangepicker.com/> |
| WOW | <https://wowjs.uk/> |
| animate.css | <https://animate.style/> |
| lazy | <http://jquery.eisbehr.de/lazy/> |

## Fonts
| Fonts | URL |
| ------ | ------ |
| ionicons (icon webfont) | <https://ionicons.com/v2/> |
| XEICON (icon webfont) | <https://xpressengine.github.io/XEIcon/index.html> |
| Noto San KR | <https://github.com/sangwoobae/noto-sans-korean-webfont> |
| NanumGothicSquare | <https://github.com/moonspam/NanumSquare> |

## task
### scss
```javascript
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
```

### HTML - file include
```javascript
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
```

### Javascript
```javascript
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
```

### imagemin
```javascript
// js
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
```

### watch
```javascript
// watch
gulp.task('watch', () => {
    gulp.watch(['src/assets/scss/**/*.scss', 'src/_modules/**/*.scss'], ['sass']);
    gulp.watch(['src/html/**/*.html', 'src/pug/**/*.pug', 'src/njk/**/*.njk', 'src/ejs/**/*.html'], ['html-all']);
    gulp.watch(['src/assets/js/**/*'], ['js']);
    gulp.watch(['src/assets/images/**/*'], ['imagemin']);
});
```

### etc
```javascript
// onError
const onError = (err) => {
    console.log(err);
};

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

// browser sync
gulp.task('server', function () {
    browserSync.init({
        server: {
            baseDir: './dist',
            directory: true
        }
    });
});
```

### default, deploy, build
```javascript
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
```

## run
```sh
$ gulp
```

## deploy
```sh
$ gulp deploy
```

## build
```sh
$ gulp build
```