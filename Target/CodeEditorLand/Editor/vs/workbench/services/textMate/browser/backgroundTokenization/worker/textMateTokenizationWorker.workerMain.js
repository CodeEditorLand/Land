import { create } from './textMateTokenizationWorker.worker.js';
import { bootstrapSimpleWorker } from '../../../../../../base/common/worker/simpleWorkerBootstrap.js';
bootstrapSimpleWorker(create);
