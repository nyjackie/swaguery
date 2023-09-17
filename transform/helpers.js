function realType(type) {
  if (!type) return "unknown";
  if (type === "integer") return "number";
  return type;
}

function processName(operationId) {
  // camelCase to upppercase SNAKE_CASE
  var result = operationId.replace(/([A-Z])/g, "_$1").toUpperCase();
  return result.charAt(0) + result.slice(1);
}

/**
 * convert a url path from this: /path/with/{user_id}/action
 * to this: /path/with/${user_id}/action
 * @param {string} route
 */
function createUrl(route) {
  return route.replace(/\{/g, "${");
}

/**
 * if a response type is an object this will generate the documentation for that
 * object's properties
 * @param {object} schema
 */
function schemaObj(schema) {
  return Object.keys(schema.properties)
    .map((key) => {
      const { type, description } = schema.properties[key];
      return `- @property {${realType(type)}} ${key} ${description || ""}`;
    })
    .join("\n");
}

/**
 * Generates the documentation for the responses
 * @param {object} responses
 */
function docResponses(responses) {
  return Object.keys(responses)
    .map((code) => {
      const curr = responses[code];
      if (!curr.schema) {
        return `${code}: ${curr.description}`;
      }
      const type = realType(curr.schema.type);
      if (type === "object") {
        return `${code}: {${type}} - ${curr.description || ""}
  ${schemaObj(curr.schema)}`;
      }
      return `${code}: {${type}} - ${curr.description || ""}`;
    })
    .join("\n");
}

/**
 * Generates the documentation for the responses
 * @param {object[]} responses
 */
function typeResponses(responses) {
  return Object.keys(responses).map((code) => {
    const curr = responses[code];
    if (!curr.schema) {
      return {
        code,
        type: "unknown",
        response: curr,
      };
    } else if (curr.schema.$ref) {
      return {
        code,
        type: `definitions["${curr.schema.$ref.replace(
          "#/definitions/",
          ""
        )}"]`,
        response: curr,
      };
    }

    const type = realType(curr.schema.type);
    if (type.toUpperCase() === "OBJECT") {
      const fields = objToArray(curr.schema.properties);
      return {
        code,
        type: `{\n${handleObjParamType("  ", fields).join("\n")}\n}`,
        response: curr,
      };
    } else if (type.toUpperCase() === "ARRAY") {
      return {
        code,
        type: handleArrayParamType("  ", curr.schema),
        response: curr,
      };
    }

    return {
      code,
      type: `${type} /** ${curr.description || ""} */`,
      response: curr,
    };
  });
}

/**
 * converts object into an array of the top level key/value pairs
 * { someKey: 'someValue' } -> [{ key: 'someKey', val: 'someValue' }]
 * @param {object} obj
 */
function objToArray(obj) {
  return Object.keys(obj).map((key) => {
    return {
      key,
      val: obj[key],
    };
  });
}

function handleArrayParamType(prefix, val) {
  const { type, properties, $ref } = val.items;

  if ($ref) {
    const typeName = $ref.replace("#/definitions/", "");
    return `Array<definitions["${typeName}"]>`;
  } else if (type === "object") {
    const props = objToArray(properties);
    const objFields = handleObjParamType(`${prefix}`, props);
    return `Array<{\n${objFields.join("\n")}\n${prefix.slice(2)}}>`;
  }

  return `Array<${realType(type)}>`;
}

function handleObjParamType(prefix, properties) {
  let paramArr = [];
  for (const bodyProp of properties) {
    const { key, val } = bodyProp;
    const req = val.required ? "" : "?";
    const type = realType(val.type);

    if (val.description) {
      paramArr.push(`${prefix}/** ${val.description} */`);
    }

    if (val["$ref"]) {
      const typeName = val["$ref"].replace("#/definitions/", "");
      paramArr.push(`${prefix}${key}${req}: definitions["${typeName}"],`);
      continue;
    } else if (type.toUpperCase() === "ARRAY") {
      const arrayParam = handleArrayParamType(`${prefix}  `, val);
      paramArr.push(`${prefix}${key}${req}: ${arrayParam},`);
      continue;
    }

    if (type.toUpperCase() === "OBJECT") {
      const objAsArray = objToArray(val.properties);
      const subObjArr = handleObjParamType(`${prefix}  `, objAsArray);

      if (subObjArr.length > 0) {
        const objRequired = objAsArray.some((b) => b.val.required) ? "" : "?";
        paramArr.push(`${prefix}${val.name}${objRequired}: {`);
        paramArr = paramArr.concat(subObjArr);
        paramArr.push(`${prefix}},`);
      }
      continue;
    }

    paramArr.push(`${prefix}${key}${req}: ${type},`);
  }
  return paramArr;
}

function typeParams(params = []) {
  let doc = [];

  const pathParams = params
    .filter((p) => p.in === "path")
    .map((p) => {
      const req = p.required ? "" : "?";
      return `    /** ${p.description} */\n    ${p.name}${req}: ${realType(
        p.type
      )},`;
    });
  doc = doc.concat(pathParams);

  let queryRequired = "?";
  const queryParams = params
    .filter((p) => p.in === "query")
    .map((q) => {
      const req = q.required ? "" : "?";
      if (q.required) queryRequired = "";
      return `      /** ${q.description} */\n      ${q.name}${req}: ${realType(
        q.type
      )},`;
    });

  if (queryParams.length > 0) {
    doc.push(`    queryParams${queryRequired}: {`);
    doc = doc.concat(queryParams);
    doc.push("    },");
  }

  const inBody = params.filter((p) => p.in === "body");
  let body = [];
  if (inBody[0]?.schema?.properties) {
    body = objToArray(inBody[0].schema.properties);
  }

  const bodyParts = handleObjParamType("      ", body);

  const bodyRequired = inBody.some((b) => b.required) ? "" : "?";

  if (bodyParts.length > 0) {
    doc.push(`    body${bodyRequired}: {`);
    doc = doc.concat(bodyParts);
    doc.push("    },");
  } else if (inBody[0]?.schema?.$ref) {
    doc.push(
      `body${bodyRequired}: definitions["${inBody[0]?.schema?.$ref.replace(
        "#/definitions/",
        ""
      )}"],`
    );
  }

  doc.push(`    headers?: Headers,`);
  doc.push(`    configOverride?: AxiosRequestConfig,`);

  return doc.length ? "\n" + doc.join("\n") + "\n" : "";
}

/**
 * create the argument parameters
 * @param {array} params
 */
function processArgs(params = []) {
  const pathParams = params.filter((p) => p.in === "path");
  const queryParams = params.filter((p) => p.in === "query");
  const body = params.filter((p) => p.in === "body");

  let args = [];

  if (pathParams.length > 0) {
    pathParams.forEach((p) => args.push(p.name));
  }

  if (queryParams.length > 0) {
    args.push(`query`);
  }

  if (body.length > 0) {
    args.push("body");
  }

  // all functions will take an optional headers arg as the last argument
  args.push("headers");

  return args;
}

/**
 * create a regex from a route
 * @param {string} p
 */
function processPath(p) {
  // const escaped = prefix.replace(/\//g, "\\/");
  return p
    .split("/")
    .map((e) => {
      if (e.startsWith("{")) {
        return "([.a-zA-Z0-9-_~]+)";
      }
      return e;
    })
    .join("/")
    .replace(/\//g, "\\/");
}

module.exports = {
  createUrl,
  docResponses,
  processArgs,
  processName,
  processPath,
  typeParams,
  typeResponses,
};
