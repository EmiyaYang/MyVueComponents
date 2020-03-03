const path = require("path");
const rimraf = require("rimraf");
const gulp = require("gulp");
const through2 = require("through2");
const merge2 = require("merge2");
const babel = require("gulp-babel");
const getBabelCommonConfig = require("./getBabelCommonConfig");
const cwd = process.cwd();
const libDir = path.join(cwd, "lib_TEST");
// const esDir = path.join(cwd, "es");

function compile() {
  // rm -rf
  rimraf.sync(libDir);
  // const less = gulp
  //   .src(['components/**/*.less'])
  //   .pipe(
  //     through2.obj(function(file, encoding, next) {
  //       this.push(file.clone());
  //       if (
  //         file.path.match(/\/style\/index\.less$/) ||
  //         file.path.match(/\/style\/v2-compatible-reset\.less$/)
  //       ) {
  //         transformLess(file.path)
  //           .then(css => {
  //             file.contents = Buffer.from(css);
  //             file.path = file.path.replace(/\.less$/, '.css');
  //             this.push(file);
  //             next();
  //           })
  //           .catch(e => {
  //             console.error(e);
  //           });
  //       } else {
  //         next();
  //       }
  //     }),
  //   )
  //   .pipe(gulp.dest(modules === false ? esDir : libDir));

  const assetsStream = gulp
    .src(["components/**/*.@(png|svg)"])
    .pipe(gulp.dest(libDir));

  const source = [
    "components/**/*.js",
    "components/**/*.jsx",
    "!components/*/__tests__/*"
  ];
  const jsFilesStream = babelify(gulp.src(source));

  // Merge multiple streams into one stream in sequence or parallel.
  return merge2([jsFilesStream, assetsStream]);
}

function babelify(js) {
  const babelConfig = getBabelCommonConfig(true);
  babelConfig.babelrc = false;
  delete babelConfig.cacheDirectory;
  // if (modules === false) {
  //   babelConfig.plugins.push(replaceLib);
  // }
  let stream = js.pipe(babel(babelConfig)).pipe(
    through2.obj(function z(file, encoding, next) {
      this.push(file.clone());
      if (file.path.match(/\/style\/index\.(js|jsx)$/)) {
        const content = file.contents.toString(encoding);
        file.contents = Buffer.from(
          content
            // .replace(/\/style\/?'/g, "/style/css'")
            .replace(/\.less/g, ".css")
        );
        file.path = file.path.replace(/index\.(js|jsx)$/, "css.js");
        this.push(file);
        next();
      } else {
        next();
      }
    })
  );
  return stream.pipe(gulp.dest(libDir));
}

gulp.task(
  "compile",
  gulp.series(done => {
    compile().on("finish", function() {
      done();
    });
  })
);
