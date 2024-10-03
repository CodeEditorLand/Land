export declare function findFreePort(startPort: number, giveUpAfter: number, timeout: number, stride?: number): Promise<number>;
export declare const BROWSER_RESTRICTED_PORTS: any;
export declare function findFreePortFaster(startPort: number, giveUpAfter: number, timeout: number, hostname?: string): Promise<number>;
