export interface UsbDeviceData {
    readonly deviceClass: number;
    readonly deviceProtocol: number;
    readonly deviceSubclass: number;
    readonly deviceVersionMajor: number;
    readonly deviceVersionMinor: number;
    readonly deviceVersionSubminor: number;
    readonly manufacturerName?: string;
    readonly productId: number;
    readonly productName?: string;
    readonly serialNumber?: string;
    readonly usbVersionMajor: number;
    readonly usbVersionMinor: number;
    readonly usbVersionSubminor: number;
    readonly vendorId: number;
}
export declare function requestUsbDevice(options?: {
    filters?: unknown[];
}): Promise<UsbDeviceData | undefined>;
export interface SerialPortData {
    readonly usbVendorId?: number | undefined;
    readonly usbProductId?: number | undefined;
}
export declare function requestSerialPort(options?: {
    filters?: unknown[];
}): Promise<SerialPortData | undefined>;
export interface HidDeviceData {
    readonly opened: boolean;
    readonly vendorId: number;
    readonly productId: number;
    readonly productName: string;
    readonly collections: [];
}
export declare function requestHidDevice(options?: {
    filters?: unknown[];
}): Promise<HidDeviceData | undefined>;
