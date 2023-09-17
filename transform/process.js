const createRoutes = require("./createConstants.js");
const createLib = require("./createLib.js");

module.exports = function processYaml(json) {
  createRoutes(json);
  createLib(json);
};
