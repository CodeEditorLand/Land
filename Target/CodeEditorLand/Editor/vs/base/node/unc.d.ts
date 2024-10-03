export declare function getUNCHostAllowlist(): string[];
export declare function addUNCHostToAllowlist(allowedHost: string | string[]): void;
export declare function getUNCHost(maybeUNCPath: string | undefined | null): string | undefined;
export declare function disableUNCAccessRestrictions(): void;
export declare function isUNCAccessRestrictionsDisabled(): boolean;
