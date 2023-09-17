const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const templateHelpers = require("./helpers.js");

const templateRoot = path.resolve(__dirname, "./templates");
const templateFile = templateRoot + "/api-lib.ejs";
const indexTemplateFile = templateRoot + "/index.ejs";

const distFolder = path.resolve(__dirname, process.cwd() + "/src/api-lib/");

const indexRenderfile = distFolder + "/index.ts";
const getRenderFile = (operationId) => {
  return distFolder + "/" + operationId + ".ts";
};

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder);
}

module.exports = function handleEJS(json) {
  const routes = [];

  console.log("\nSetting up lib:");
  console.log("--------------------------");

  for (let route in json.paths) {
    const routeObj = json.paths[route];

    for (let method in routeObj) {
      if (method !== "parameters") {
        const methodData = routeObj[method];

        const typeName =
          methodData.operationId.charAt(0).toUpperCase() +
          methodData.operationId.slice(1);

        routes.push({
          path: route,
          method,
          spec: methodData,
          typeName,
          parameters: routeObj["parameters"],
        });
      }
    }
  }

  const options = {
    filename: "api-lib.ets",
    root: templateRoot,
    context: {
      // insert the helper functions
      h: templateHelpers,
    },
  };

  try {
    let indexTemplateStr = fs.readFileSync(indexTemplateFile, "utf8");
    let indexTemplate = ejs.compile(indexTemplateStr, options);
    fs.writeFileSync(indexRenderfile, indexTemplate({ routes }), "utf8");

    let templateStr = fs.readFileSync(templateFile, "utf8");
    let template = ejs.compile(templateStr, options);
    for (const route of routes) {
      fs.writeFileSync(
        getRenderFile(route.spec.operationId),
        template({ route }),
        "utf8"
      );
    }
  } catch (e) {
    console.error(e);
  }
};
