import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
interface IGettingStartedContentProvider {
    (): string;
}
declare class GettingStartedContentProviderRegistry {
    private readonly providers;
    registerProvider(moduleId: string, provider: IGettingStartedContentProvider): void;
    getProvider(moduleId: string): IGettingStartedContentProvider | undefined;
}
export declare const gettingStartedContentRegistry: GettingStartedContentProviderRegistry;
export declare function moduleToContent(resource: URI): Promise<string>;
export type BuiltinGettingStartedStep = {
    id: string;
    title: string;
    description: string;
    completionEvents?: string[];
    when?: string;
    media: {
        type: 'image';
        path: string | {
            hc: string;
            hcLight?: string;
            light: string;
            dark: string;
        };
        altText: string;
    } | {
        type: 'svg';
        path: string;
        altText: string;
    } | {
        type: 'markdown';
        path: string;
    };
};
export type BuiltinGettingStartedCategory = {
    id: string;
    title: string;
    description: string;
    isFeatured: boolean;
    next?: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: 'steps';
        steps: BuiltinGettingStartedStep[];
    };
};
export type BuiltinGettingStartedStartEntry = {
    id: string;
    title: string;
    description: string;
    icon: ThemeIcon;
    when?: string;
    content: {
        type: 'startEntry';
        command: string;
    };
};
type GettingStartedWalkthroughContent = BuiltinGettingStartedCategory[];
type GettingStartedStartEntryContent = BuiltinGettingStartedStartEntry[];
export declare const startEntries: GettingStartedStartEntryContent;
export declare const walkthroughs: GettingStartedWalkthroughContent;
export {};
