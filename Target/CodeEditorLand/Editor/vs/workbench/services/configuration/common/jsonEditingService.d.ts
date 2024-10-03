import { URI } from '../../../../base/common/uri.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IJSONEditingService, IJSONValue } from './jsonEditing.js';
export declare class JSONEditingService implements IJSONEditingService {
    private readonly fileService;
    private readonly textModelResolverService;
    private readonly textFileService;
    _serviceBrand: undefined;
    private queue;
    constructor(fileService: IFileService, textModelResolverService: ITextModelService, textFileService: ITextFileService);
    write(resource: URI, values: IJSONValue[]): Promise<void>;
    private doWriteConfiguration;
    private writeToBuffer;
    private applyEditsToBuffer;
    private getEdits;
    private resolveModelReference;
    private hasParseErrors;
    private resolveAndValidate;
    private reject;
    private toErrorMessage;
}
