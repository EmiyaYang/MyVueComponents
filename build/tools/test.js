const { exec } = require("child_process");

// 1. 打版本
// 2. 打包
// 3. 发布

exec("npm version patch", function(error, stdout, stderr) {
  console.log("stdout: " + stdout);
  console.log("stderr: " + stderr);
  if (error !== null) {
    console.log("exec error: " + error);
  }
});
