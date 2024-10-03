import { IMessage, ISignService } from './sign.js';
export interface IVsdaSigner {
    sign(arg: string): string;
}
export interface IVsdaValidator {
    createNewMessage(arg: string): string;
    validate(arg: string): 'ok' | 'error';
    dispose?(): void;
}
export declare abstract class AbstractSignService implements ISignService {
    readonly _serviceBrand: undefined;
    private static _nextId;
    private readonly validators;
    protected abstract getValidator(): Promise<IVsdaValidator>;
    protected abstract signValue(arg: string): Promise<string>;
    createNewMessage(value: string): Promise<IMessage>;
    validate(message: IMessage, value: string): Promise<boolean>;
    sign(value: string): Promise<string>;
}
