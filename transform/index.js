const fs = require("fs");
const SwaggerParser = require("@apidevtools/swagger-parser");
const generateAPI = require("./process");
const path = require("path");

const yaml = process.argv[2];
if (!yaml) {
  console.error("missing required file. You must add a file after like this");
  console.error("yarn build openapi.yaml");
  console.error("OR");
  console.error("yarn build ./somewhere/openapi.yaml");
  process.exit(0);
}

const file = path.resolve(__dirname, yaml);

(async function () {
  try {
    let api = await SwaggerParser.bundle(file);
    fs.writeFileSync("file.json", JSON.stringify(api, null, 2), "utf8");
    console.log("API name: %s, Version: %s", api.info.title, api.info.version);
    generateAPI(api); // kick off everything
  } catch (err) {
    console.error(err);
  }
})();
