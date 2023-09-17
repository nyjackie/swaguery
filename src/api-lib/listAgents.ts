import axios, { AxiosRequestConfig } from "axios";

type Headers = Record<string, string>;



/**
 * 200: 200 response
 *
 */
interface ListAgentsFunction {
  (
    /** The unique ID of the tenant or account.
 */
    tenant_id: string,
    headers?: Headers,
    configOverride?: AxiosRequestConfig,
  ): Promise<ListAgents.Result>;
};

export namespace ListAgents {
  
  /**
  * Lists all agent builds.

   * Response 200: 200 response
   */
  export type Response200 = unknown;
  
  export type Response = 
    | Response200;

  
  /**
   * Error 500: Unknown Error
   */
  type Error500 = unknown;
  
  export type Error =   
    | Error500;

  export type Function = ListAgentsFunction;

  export type Result = 
    | Response200;
}


export const listAgents: ListAgents.Function = async (tenant_id, headers) => {
  const config: AxiosRequestConfig = {
    url: `/v2/${tenant_id}/os-agents`,
    method: "get",
  };

  if (headers) {
    config.headers = headers;
  }

  return await axios(config);
}

export default listAgents;
