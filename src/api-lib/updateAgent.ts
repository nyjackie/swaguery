import axios, { AxiosRequestConfig } from "axios";

type Headers = Record<string, string>;



/**
 * 200: 200 response
 *
 */
interface UpdateAgentFunction {
  (
    /** The unique ID of the tenant or account.
 */
    tenant_id: string,
    /** The unique ID associated with the agent.
 */
    id: string,
    headers?: Headers,
    configOverride?: AxiosRequestConfig,
  ): Promise<UpdateAgent.Result>;
};

export namespace UpdateAgent {
  
  /**
  * Updates an agent build.

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

  export type Function = UpdateAgentFunction;

  export type Result = 
    | Response200;
}


export const updateAgent: UpdateAgent.Function = async (tenant_id, id, headers) => {
  const config: AxiosRequestConfig = {
    url: `/v2/${tenant_id}/os-agents/${id}`,
    method: "put",
  };

  if (headers) {
    config.headers = headers;
  }

  return await axios(config);
}

export default updateAgent;
