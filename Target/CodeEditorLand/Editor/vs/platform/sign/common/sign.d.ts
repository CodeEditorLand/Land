export declare const SIGN_SERVICE_ID = "signService";
export declare const ISignService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISignService>;
export interface IMessage {
    id: string;
    data: string;
}
export interface ISignService {
    readonly _serviceBrand: undefined;
    createNewMessage(value: string): Promise<IMessage>;
    validate(message: IMessage, value: string): Promise<boolean>;
    sign(value: string): Promise<string>;
}
