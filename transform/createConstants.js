const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const templateHelpers = require("./helpers.js");

const templateRoot = path.resolve(__dirname, "./templates");
const routesTemplateFile = templateRoot + "/routes.ejs";

const distFolder = path.resolve(__dirname, process.cwd() + "/src");
const publicRenderfile = distFolder + "/routes.js";

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder);
}

module.exports = function handleEJS(json) {
  const routes = [];

  console.log("\nSetting up constants:");
  console.log("--------------------------");

  for (let route in json.paths) {
    const routeObj = json.paths[route];

    for (let method in routeObj) {
      // @TODO: update parameters
      if (method !== "parameters") {
        const methodData = routeObj[method];

        routes.push({
          path: route,
          method,
          spec: methodData,
        });
      }
    }

    const options = {
      filename: "constants.ejs",
      root: templateRoot,
      context: {
        // insert the helper functions
        h: templateHelpers,
      },
    };

    try {
      let routesTemplateStr = fs.readFileSync(routesTemplateFile, "utf8");
      let routesTemplate = ejs.compile(routesTemplateStr, options);
      fs.writeFileSync(publicRenderfile, routesTemplate({ routes }), "utf8");
    } catch (e) {
      console.error(e);
    }
  }
};
