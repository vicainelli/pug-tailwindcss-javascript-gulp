
const paths = require("./package.json").paths;

const gulp = require("gulp");
const browserSync = require("browser-sync").create();
const concat = require("gulp-concat");
const plumber = require("gulp-plumber");
const pug = require('gulp-pug');
const postcss = require("gulp-postcss");
const purgecss = require("gulp-purgecss");
const tailwindcss = require("tailwindcss");


// Custom extractor for purgeCSS, to avoid stripping classes with `:` prefixes
class TailwindExtractor {
  static extract(content) {
    return content.match(/[A-z0-9-:\/]+/g) || [];
  }
}

// compiling tailwind CSS
gulp.task("css", () => {
  return gulp
    .src(paths.src.css + "*.css")
    .pipe(
      postcss([tailwindcss(paths.config.tailwind), require("autoprefixer")])
    )
    .pipe(
      purgecss({
        content: [paths.dist.base + "*.html"],
        extractors: [
          {
            extractor: TailwindExtractor,
            extensions: ["html", "js"]
          }
        ]
      })
    )
    .pipe(gulp.dest(paths.dist.css));
});


// SCRIPTS
gulp.task('scripts', () => {
  return gulp.src(['./src/js/app.js', './src/js/components/*.js'])
  .pipe(concat('app.js'))
  .pipe(gulp.dest('./dist/js'));
});


// VIEWS
gulp.task('views', () => {
  return gulp.src('./src/views/**/*.pug')
  .pipe(plumber())
  .pipe(pug({}))
  .pipe(gulp.dest('./dist/'))
});

// WATCH
gulp.task('default', function () {
  gulp.watch("./src/views/**/*.pug", ["views"]);
  gulp.watch("./src/js/**/*.js", ["scripts"]);
  gulp.watch(paths.dist.base + "**/*.html", ["css"]);
});

// SERVER +  Watch
gulp.task("server", ["css"], () => {
  browserSync.init({
    server: {
      baseDir: paths.dist.base
    }
  });

  gulp.watch([paths.src.views + "**/*.pug"], ["views"]);
  gulp.watch(paths.src.css + "*.css", ["css"]);
  gulp.watch(paths.config.tailwind, ["css"]);
  gulp.watch(paths.dist.base + "**/*.html", ["css"]);
  gulp.watch(paths.dist.base + "**/*.html").on("change", browserSync.reload);
});

// COPY
gulp.task('copy-images', () => {
  return gulp.src(paths.src.images + '**.*')
    .pipe(gulp.dest(paths.dist.images));
});