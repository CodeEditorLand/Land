import type { IReference } from '../../../base/common/lifecycle.js';
export declare namespace GPULifecycle {
    function requestDevice(fallback?: (message: string) => void): Promise<IReference<GPUDevice>>;
    function createBuffer(device: GPUDevice, descriptor: GPUBufferDescriptor, initialValues?: Float32Array | (() => Float32Array)): IReference<GPUBuffer>;
    function createTexture(device: GPUDevice, descriptor: GPUTextureDescriptor): IReference<GPUTexture>;
}
