import { create } from './languageDetectionSimpleWorker.js';
import { bootstrapSimpleWorker } from '../../../../base/common/worker/simpleWorkerBootstrap.js';
bootstrapSimpleWorker(create);
