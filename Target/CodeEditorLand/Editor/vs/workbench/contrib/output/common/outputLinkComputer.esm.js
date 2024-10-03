import { create } from './outputLinkComputer.js';
import { bootstrapSimpleWorker } from '../../../../base/common/worker/simpleWorkerBootstrap.js';
bootstrapSimpleWorker(create);
