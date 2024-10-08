interface ProductDescription {
    productName: string;
    version: string;
    commit: string;
    executableName: string;
}
export declare function main(desc: ProductDescription, args: string[]): Promise<void>;
export {};
