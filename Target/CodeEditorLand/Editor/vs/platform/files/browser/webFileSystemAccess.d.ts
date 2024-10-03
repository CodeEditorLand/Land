export declare namespace WebFileSystemAccess {
    function supported(obj: any & Window): boolean;
    function isFileSystemHandle(handle: unknown): handle is FileSystemHandle;
    function isFileSystemFileHandle(handle: FileSystemHandle): handle is FileSystemFileHandle;
    function isFileSystemDirectoryHandle(handle: FileSystemHandle): handle is FileSystemDirectoryHandle;
}
