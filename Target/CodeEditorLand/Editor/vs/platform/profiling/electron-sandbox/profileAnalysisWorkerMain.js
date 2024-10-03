import { create } from './profileAnalysisWorker.js';
import { bootstrapSimpleWorker } from '../../../base/common/worker/simpleWorkerBootstrap.js';
bootstrapSimpleWorker(create);
