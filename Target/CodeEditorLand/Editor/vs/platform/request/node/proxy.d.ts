export type Agent = any;
export interface IOptions {
    proxyUrl?: string;
    strictSSL?: boolean;
}
export declare function getProxyAgent(rawRequestURL: string, env: typeof process.env, options?: IOptions): Promise<Agent>;
