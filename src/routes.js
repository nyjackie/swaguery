/*****************************************************
 * Routes
 */
const ROUTES = {

  /**
   * Lists all agent builds.

   *    * /v2/{tenant_id}/os-agents
   *    */
  LIST_AGENTS: /^\/v2\/([.a-zA-Z0-9-_~]+)\/os-agents$/,

  /**
   * Creates an agent build.

   *    * /v2/{tenant_id}/os-agents
   *    */
  CREATE_AGENT: /^\/v2\/([.a-zA-Z0-9-_~]+)\/os-agents$/,

  /**
   * Deletes an existing agent build.

   *    * /v2/{tenant_id}/os-agents
   *    */
  DELETE_AGENT: /^\/v2\/([.a-zA-Z0-9-_~]+)\/os-agents$/,

  /**
   * Updates an agent build.

   *    * /v2/{tenant_id}/os-agents/{id}
   *    */
  UPDATE_AGENT: /^\/v2\/([.a-zA-Z0-9-_~]+)\/os-agents\/([.a-zA-Z0-9-_~]+)$/,

};

export default ROUTES;
