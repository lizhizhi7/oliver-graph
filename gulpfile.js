const {src, dest} = require("gulp");

function defaultTask(cb) {
    return src(["./src/**/*.css"])     // Source file
        .pipe(dest("./dist"));
}

exports.default = defaultTask;
