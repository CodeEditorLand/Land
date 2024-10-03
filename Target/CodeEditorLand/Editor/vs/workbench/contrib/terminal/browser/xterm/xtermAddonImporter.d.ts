import type { ClipboardAddon as ClipboardAddonType } from '@xterm/addon-clipboard';
import type { ImageAddon as ImageAddonType } from '@xterm/addon-image';
import type { SearchAddon as SearchAddonType } from '@xterm/addon-search';
import type { SerializeAddon as SerializeAddonType } from '@xterm/addon-serialize';
import type { Unicode11Addon as Unicode11AddonType } from '@xterm/addon-unicode11';
import type { WebglAddon as WebglAddonType } from '@xterm/addon-webgl';
export interface IXtermAddonNameToCtor {
    clipboard: typeof ClipboardAddonType;
    image: typeof ImageAddonType;
    search: typeof SearchAddonType;
    serialize: typeof SerializeAddonType;
    unicode11: typeof Unicode11AddonType;
    webgl: typeof WebglAddonType;
}
export declare class XtermAddonImporter {
    importAddon<T extends keyof IXtermAddonNameToCtor>(name: T): Promise<IXtermAddonNameToCtor[T]>;
}
