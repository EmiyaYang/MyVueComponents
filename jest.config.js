module.exports = {
  preset: "@vue/cli-plugin-unit-jest",

  testEnvironment: "node",
  watchPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"]
};
