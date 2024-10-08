export declare function initialize(factory: any): void;
type CreateFunction<C, D, R = any> = (ctx: C, data: D) => R;
export declare function bootstrapSimpleEditorWorker<C, D, R>(createFn: CreateFunction<C, D, R>): void;
export {};
