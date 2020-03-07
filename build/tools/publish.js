const inquirer = require("inquirer");
const { execSync } = require("child_process");

console.log("开始准备发布!");

const questions = [
  {
    type: "list",
    name: "level",
    message: "发什么等级?",
    choices: ["patch", "minor", "major"],
    filter: function(val) {
      return val.toLowerCase();
    }
  },
  {
    type: "list",
    name: "pack",
    message: "用什么打包方式?",
    choices: [
      { name: "自定义", value: "comp" },
      {
        name: "vue-cli3 库模式",
        value: "build:lib"
      }
    ],
    filter: function(val) {
      return val.toLowerCase();
    }
  }
];

inquirer.prompt(questions).then(answer => {
  const { pack, level } = answer;

  execSync(`yarn ${pack}`, { stdio: "inherit" });

  execSync(`yarn version ${level}`, { stdio: "inherit" });

  execSync("yarn publish", { stdio: "inherit" });

  console.log("发布成功!");
});
