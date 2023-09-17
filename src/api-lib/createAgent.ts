import axios, { AxiosRequestConfig } from "axios";

type Headers = Record<string, string>;



/**
 * 200: 200 response
 *
 */
interface CreateAgentFunction {
  (
    /** The unique ID of the tenant or account.
 */
    tenant_id: string,
    headers?: Headers,
    configOverride?: AxiosRequestConfig,
  ): Promise<CreateAgent.Result>;
};

export namespace CreateAgent {
  
  /**
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

  export type Function = CreateAgentFunction;

  export type Result = 
    | Response200;
}


export const createAgent: CreateAgent.Function = async (tenant_id, headers) => {
  const config: AxiosRequestConfig = {
    url: `/v2/${tenant_id}/os-agents`,
    method: "post",
  };

  if (headers) {
    config.headers = headers;
  }

  return await axios(config);
}

export default createAgent;
