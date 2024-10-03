import { create } from './extensionHostWorker.js';
const data = create();
self.onmessage = (e) => data.onmessage(e.data);
