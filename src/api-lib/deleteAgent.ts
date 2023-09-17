import axios, { AxiosRequestConfig } from "axios";

type Headers = Record<string, string>;



/**
 * 202: 202 response
 *
 */
interface DeleteAgentFunction {
  (
    /** The unique ID of the tenant or account.
 */
    tenant_id: string,
    headers?: Headers,
    configOverride?: AxiosRequestConfig,
  ): Promise<DeleteAgent.Result>;
};

export namespace DeleteAgent {
  
  /**
   * Response 202: 202 response
   */
  export type Response202 = unknown;
  
  export type Response = 
    | Response202;

  
  /**
   * Error 500: Unknown Error
   */
  type Error500 = unknown;
  
  export type Error =   
    | Error500;

  export type Function = DeleteAgentFunction;

  export type Result = 
    | Response202;
}


export const deleteAgent: DeleteAgent.Function = async (tenant_id, headers) => {
  const config: AxiosRequestConfig = {
    url: `/v2/${tenant_id}/os-agents`,
    method: "delete",
  };

  if (headers) {
    config.headers = headers;
  }

  return await axios(config);
}

export default deleteAgent;
