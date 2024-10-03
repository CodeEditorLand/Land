var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
import { URI } from '../../../../base/common/uri.js';
import { Schemas } from '../../../../base/common/network.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkspaceTagsService } from '../common/workspaceTags.js';
import { getHashedRemotesFromConfig } from './workspaceTags.js';
import { splitLines } from '../../../../base/common/strings.js';
import { MavenArtifactIdRegex, MavenDependenciesRegex, MavenDependencyRegex, GradleDependencyCompactRegex, GradleDependencyLooseRegex, MavenGroupIdRegex, JavaLibrariesToLookFor } from '../common/javaWorkspaceTags.js';
import { hashAsync } from '../../../../base/common/hash.js';
const MetaModulesToLookFor = [
    '@azure',
    '@azure/ai',
    '@azure/core',
    '@azure/cosmos',
    '@azure/event',
    '@azure/identity',
    '@azure/keyvault',
    '@azure/search',
    '@azure/storage'
];
const ModulesToLookFor = [
    'express',
    'sails',
    'koa',
    'hapi',
    'socket.io',
    'restify',
    'next',
    'nuxt',
    '@nestjs/core',
    'strapi',
    'gatsby',
    'react',
    'react-native',
    'react-native-macos',
    'react-native-windows',
    'rnpm-plugin-windows',
    '@angular/core',
    '@ionic',
    'vue',
    'tns-core-modules',
    '@nativescript/core',
    'electron',
    'aws-sdk',
    'aws-amplify',
    'azure',
    'azure-storage',
    'chroma',
    'faiss',
    'firebase',
    '@google-cloud/common',
    'heroku-cli',
    'langchain',
    'milvus',
    'openai',
    'pinecone',
    'qdrant',
    '@microsoft/teams-js',
    '@microsoft/office-js',
    '@microsoft/office-js-helpers',
    '@types/office-js',
    '@types/office-runtime',
    'office-ui-fabric-react',
    '@uifabric/icons',
    '@uifabric/merge-styles',
    '@uifabric/styling',
    '@uifabric/experiments',
    '@uifabric/utilities',
    '@microsoft/rush',
    'lerna',
    'just-task',
    'beachball',
    'playwright',
    'playwright-cli',
    '@playwright/test',
    'playwright-core',
    'playwright-chromium',
    'playwright-firefox',
    'playwright-webkit',
    'cypress',
    'nightwatch',
    'protractor',
    'puppeteer',
    'selenium-webdriver',
    'webdriverio',
    'gherkin',
    '@azure/app-configuration',
    '@azure/cosmos-sign',
    '@azure/cosmos-language-service',
    '@azure/synapse-spark',
    '@azure/synapse-monitoring',
    '@azure/synapse-managed-private-endpoints',
    '@azure/synapse-artifacts',
    '@azure/synapse-access-control',
    '@azure/ai-metrics-advisor',
    '@azure/service-bus',
    '@azure/keyvault-secrets',
    '@azure/keyvault-keys',
    '@azure/keyvault-certificates',
    '@azure/keyvault-admin',
    '@azure/digital-twins-core',
    '@azure/cognitiveservices-anomalydetector',
    '@azure/ai-anomaly-detector',
    '@azure/core-xml',
    '@azure/core-tracing',
    '@azure/core-paging',
    '@azure/core-https',
    '@azure/core-client',
    '@azure/core-asynciterator-polyfill',
    '@azure/core-arm',
    '@azure/amqp-common',
    '@azure/core-lro',
    '@azure/logger',
    '@azure/core-http',
    '@azure/core-auth',
    '@azure/core-amqp',
    '@azure/abort-controller',
    '@azure/eventgrid',
    '@azure/storage-file-datalake',
    '@azure/search-documents',
    '@azure/storage-file',
    '@azure/storage-datalake',
    '@azure/storage-queue',
    '@azure/storage-file-share',
    '@azure/storage-blob-changefeed',
    '@azure/storage-blob',
    '@azure/cognitiveservices-formrecognizer',
    '@azure/ai-form-recognizer',
    '@azure/cognitiveservices-textanalytics',
    '@azure/ai-text-analytics',
    '@azure/event-processor-host',
    '@azure/schema-registry-avro',
    '@azure/schema-registry',
    '@azure/eventhubs-checkpointstore-blob',
    '@azure/event-hubs',
    '@azure/communication-signaling',
    '@azure/communication-calling',
    '@azure/communication-sms',
    '@azure/communication-common',
    '@azure/communication-chat',
    '@azure/communication-administration',
    '@azure/attestation',
    '@azure/data-tables',
    '@azure/arm-appservice',
    '@azure-rest/ai-inference',
    '@azure-rest/arm-appservice',
    '@azure/arm-appcontainers',
    '@azure/arm-rediscache',
    '@azure/arm-redisenterprisecache',
    '@azure/arm-apimanagement',
    '@azure/arm-logic',
    '@azure/app-configuration',
    '@azure/arm-appconfiguration',
    '@azure/arm-dashboard',
    '@azure/arm-signalr',
    '@azure/arm-securitydevops',
    '@azure/arm-labservices',
    '@azure/web-pubsub',
    '@azure/web-pubsub-client',
    '@azure/web-pubsub-client-protobuf',
    '@azure/web-pubsub-express',
    '@azure/openai',
    '@azure/arm-hybridkubernetes',
    '@azure/arm-kubernetesconfiguration',
    '@anthropic-ai/sdk',
    '@anthropic-ai/tokenizer',
    '@arizeai/openinference-instrumentation-langchain',
    '@arizeai/openinference-instrumentation-openai',
    '@aws-sdk-client-bedrock-runtime',
    '@aws-sdk/client-bedrock',
    '@datastax/astra-db-ts',
    'fireworks-js',
    '@google-cloud/aiplatform',
    '@huggingface/inference',
    'humanloop',
    '@langchain/anthropic',
    'langsmith',
    'llamaindex',
    '@mistralai/mistralai',
    'mongodb',
    'neo4j-driver',
    'ollama',
    'onnxruntime-node',
    'onnxruntime-web',
    'pg',
    'postgresql',
    'redis',
    '@supabase/supabase-js',
    '@tensorflow/tfjs',
    '@xenova/transformers',
    'tika',
    'weaviate-client',
    '@zilliz/milvus2-sdk-node',
    '@azure-rest/ai-anomaly-detector',
    '@azure-rest/ai-content-safety',
    '@azure-rest/ai-document-intelligence',
    '@azure-rest/ai-document-translator',
    '@azure-rest/ai-personalizer',
    '@azure-rest/ai-translation-text',
    '@azure-rest/ai-vision-image-analysis',
    '@azure/ai-anomaly-detector',
    '@azure/ai-form-recognizer',
    '@azure/ai-language-conversations',
    '@azure/ai-language-text',
    '@azure/ai-text-analytics',
    '@azure/arm-botservice',
    '@azure/arm-cognitiveservices',
    '@azure/arm-machinelearning',
    '@azure/cognitiveservices-contentmoderator',
    '@azure/cognitiveservices-customvision-prediction',
    '@azure/cognitiveservices-customvision-training',
    '@azure/cognitiveservices-face',
    '@azure/cognitiveservices-translatortext',
    'microsoft-cognitiveservices-speech-sdk',
    '@google/generative-ai'
];
const PyMetaModulesToLookFor = [
    'azure-ai',
    'azure-cognitiveservices',
    'azure-core',
    'azure-cosmos',
    'azure-event',
    'azure-identity',
    'azure-keyvault',
    'azure-mgmt',
    'azure-ml',
    'azure-search',
    'azure-storage'
];
const PyModulesToLookFor = [
    'azure',
    'azure-ai-inference',
    'azure-ai-language-conversations',
    'azure-ai-language-questionanswering',
    'azure-ai-ml',
    'azure-ai-translation-document',
    'azure-appconfiguration',
    'azure-appconfiguration-provider',
    'azure-loganalytics',
    'azure-synapse-nspkg',
    'azure-synapse-spark',
    'azure-synapse-artifacts',
    'azure-synapse-accesscontrol',
    'azure-synapse',
    'azure-cognitiveservices-vision-nspkg',
    'azure-cognitiveservices-search-nspkg',
    'azure-cognitiveservices-nspkg',
    'azure-cognitiveservices-language-nspkg',
    'azure-cognitiveservices-knowledge-nspkg',
    'azure-containerregistry',
    'azure-communication-identity',
    'azure-communication-phonenumbers',
    'azure-communication-email',
    'azure-communication-rooms',
    'azure-communication-callautomation',
    'azure-confidentialledger',
    'azure-containerregistry',
    'azure-developer-loadtesting',
    'azure-iot-deviceupdate',
    'azure-messaging-webpubsubservice',
    'azure-monitor',
    'azure-monitor-query',
    'azure-monitor-ingestion',
    'azure-mgmt-appcontainers',
    'azure-mgmt-apimanagement',
    'azure-mgmt-web',
    'azure-mgmt-redis',
    'azure-mgmt-redisenterprise',
    'azure-mgmt-logic',
    'azure-appconfiguration',
    'azure-appconfiguration-provider',
    'azure-mgmt-appconfiguration',
    'azure-mgmt-dashboard',
    'azure-mgmt-signalr',
    'azure-messaging-webpubsubservice',
    'azure-mgmt-webpubsub',
    'azure-mgmt-securitydevops',
    'azure-mgmt-labservices',
    'azure-ai-metricsadvisor',
    'azure-servicebus',
    'azureml-sdk',
    'azure-keyvault-nspkg',
    'azure-keyvault-secrets',
    'azure-keyvault-keys',
    'azure-keyvault-certificates',
    'azure-keyvault-administration',
    'azure-digitaltwins-nspkg',
    'azure-digitaltwins-core',
    'azure-cognitiveservices-anomalydetector',
    'azure-ai-anomalydetector',
    'azure-applicationinsights',
    'azure-core-tracing-opentelemetry',
    'azure-core-tracing-opencensus',
    'azure-nspkg',
    'azure-common',
    'azure-eventgrid',
    'azure-storage-file-datalake',
    'azure-search-nspkg',
    'azure-search-documents',
    'azure-storage-nspkg',
    'azure-storage-file',
    'azure-storage-common',
    'azure-storage-queue',
    'azure-storage-file-share',
    'azure-storage-blob-changefeed',
    'azure-storage-blob',
    'azure-cognitiveservices-formrecognizer',
    'azure-ai-formrecognizer',
    'azure-ai-nspkg',
    'azure-cognitiveservices-language-textanalytics',
    'azure-ai-textanalytics',
    'azure-schemaregistry-avroencoder',
    'azure-schemaregistry-avroserializer',
    'azure-schemaregistry',
    'azure-eventhub-checkpointstoreblob-aio',
    'azure-eventhub-checkpointstoreblob',
    'azure-eventhub',
    'azure-servicefabric',
    'azure-communication-nspkg',
    'azure-communication-sms',
    'azure-communication-chat',
    'azure-communication-administration',
    'azure-security-attestation',
    'azure-data-nspkg',
    'azure-data-tables',
    'azure-devtools',
    'azure-elasticluster',
    'azure-functions',
    'azure-graphrbac',
    'azure-iothub-device-client',
    'azure-shell',
    'azure-translator',
    'azure-mgmt-hybridkubernetes',
    'azure-mgmt-kubernetesconfiguration',
    'adal',
    'pydocumentdb',
    'botbuilder-core',
    'botbuilder-schema',
    'botframework-connector',
    'playwright',
    'transformers',
    'langchain',
    'llama-index',
    'guidance',
    'openai',
    'semantic-kernel',
    'sentence-transformers',
    'anthropic',
    'aporia',
    'arize',
    'deepchecks',
    'fireworks-ai',
    'langchain-fireworks',
    'humanloop',
    'pymongo',
    'langchain-anthropic',
    'langchain-huggingface',
    'langchain-fireworks',
    'ollama',
    'onnxruntime',
    'pgvector',
    'sentence-transformers',
    'tika',
    'trulens',
    'trulens-eval',
    'wandb',
    'azure-ai-contentsafety',
    'azure-ai-documentintelligence',
    'azure-ai-translation-text',
    'azure-ai-vision',
    'azure-cognitiveservices-language-luis',
    'azure-cognitiveservices-speech',
    'azure-cognitiveservices-vision-contentmoderator',
    'azure-cognitiveservices-vision-face',
    'azure-mgmt-cognitiveservices',
    'azure-mgmt-search',
    'google-generativeai'
];
const GoModulesToLookFor = [
    'github.com/Azure/azure-sdk-for-go/sdk/storage/azblob',
    'github.com/Azure/azure-sdk-for-go/sdk/storage/azfile',
    'github.com/Azure/azure-sdk-for-go/sdk/storage/azqueue',
    'github.com/Azure/azure-sdk-for-go/sdk/storage/azdatalake',
    'github.com/Azure/azure-sdk-for-go/sdk/tracing/azotel',
    'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azadmin',
    'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azcertificates',
    'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azkeys',
    'github.com/Azure/azure-sdk-for-go/sdk/security/keyvault/azsecrets',
    'github.com/Azure/azure-sdk-for-go/sdk/monitor/azquery',
    'github.com/Azure/azure-sdk-for-go/sdk/monitor/azingest',
    'github.com/Azure/azure-sdk-for-go/sdk/messaging/azeventhubs',
    'github.com/Azure/azure-sdk-for-go/sdk/messaging/azservicebus',
    'github.com/Azure/azure-sdk-for-go/sdk/data/azappconfig',
    'github.com/Azure/azure-sdk-for-go/sdk/data/azcosmos',
    'github.com/Azure/azure-sdk-for-go/sdk/data/aztables',
    'github.com/Azure/azure-sdk-for-go/sdk/containers/azcontainerregistry',
    'github.com/Azure/azure-sdk-for-go/sdk/ai/azopenai',
    'github.com/Azure/azure-sdk-for-go/sdk/azidentity',
    'github.com/Azure/azure-sdk-for-go/sdk/azcore',
    'github.com/Azure/azure-sdk-for-go/sdk/resourcemanager/'
];
let WorkspaceTagsService = class WorkspaceTagsService {
    constructor(fileService, contextService, environmentService, textFileService) {
        this.fileService = fileService;
        this.contextService = contextService;
        this.environmentService = environmentService;
        this.textFileService = textFileService;
    }
    async getTags() {
        if (!this._tags) {
            this._tags = await this.resolveWorkspaceTags();
        }
        return this._tags;
    }
    async getTelemetryWorkspaceId(workspace, state) {
        function createHash(uri) {
            return hashAsync(uri.scheme === Schemas.file ? uri.fsPath : uri.toString());
        }
        let workspaceId;
        switch (state) {
            case 1:
                workspaceId = undefined;
                break;
            case 2:
                workspaceId = await createHash(workspace.folders[0].uri);
                break;
            case 3:
                if (workspace.configuration) {
                    workspaceId = await createHash(workspace.configuration);
                }
        }
        return workspaceId;
    }
    getHashedRemotesFromUri(workspaceUri, stripEndingDotGit = false) {
        const path = workspaceUri.path;
        const uri = workspaceUri.with({ path: `${path !== '/' ? path : ''}/.git/config` });
        return this.fileService.exists(uri).then(exists => {
            if (!exists) {
                return [];
            }
            return this.textFileService.read(uri, { acceptTextOnly: true }).then(content => getHashedRemotesFromConfig(content.value, stripEndingDotGit), err => []);
        });
    }
    async resolveWorkspaceTags() {
        const tags = Object.create(null);
        const state = this.contextService.getWorkbenchState();
        const workspace = this.contextService.getWorkspace();
        tags['workspace.id'] = await this.getTelemetryWorkspaceId(workspace, state);
        const { filesToOpenOrCreate, filesToDiff, filesToMerge } = this.environmentService;
        tags['workbench.filesToOpenOrCreate'] = filesToOpenOrCreate && filesToOpenOrCreate.length || 0;
        tags['workbench.filesToDiff'] = filesToDiff && filesToDiff.length || 0;
        tags['workbench.filesToMerge'] = filesToMerge && filesToMerge.length || 0;
        const isEmpty = state === 1;
        tags['workspace.roots'] = isEmpty ? 0 : workspace.folders.length;
        tags['workspace.empty'] = isEmpty;
        const folders = !isEmpty ? workspace.folders.map(folder => folder.uri) : undefined;
        if (!folders || !folders.length) {
            return Promise.resolve(tags);
        }
        const aiGeneratedWorkspaces = URI.joinPath(this.environmentService.workspaceStorageHome, 'aiGeneratedWorkspaces.json');
        await this.fileService.exists(aiGeneratedWorkspaces).then(async (result) => {
            if (result) {
                try {
                    const content = await this.fileService.readFile(aiGeneratedWorkspaces);
                    const workspaces = JSON.parse(content.value.toString());
                    if (workspaces.indexOf(workspace.folders[0].uri.toString()) > -1) {
                        tags['aiGenerated'] = true;
                    }
                }
                catch (e) {
                }
            }
        });
        return this.fileService.resolveAll(folders.map(resource => ({ resource }))).then((files) => {
            const names = [].concat(...files.map(result => result.success ? (result.stat.children || []) : [])).map(c => c.name);
            const nameSet = names.reduce((s, n) => s.add(n.toLowerCase()), new Set());
            tags['workspace.grunt'] = nameSet.has('gruntfile.js');
            tags['workspace.gulp'] = nameSet.has('gulpfile.js');
            tags['workspace.jake'] = nameSet.has('jakefile.js');
            tags['workspace.tsconfig'] = nameSet.has('tsconfig.json');
            tags['workspace.jsconfig'] = nameSet.has('jsconfig.json');
            tags['workspace.config.xml'] = nameSet.has('config.xml');
            tags['workspace.vsc.extension'] = nameSet.has('vsc-extension-quickstart.md');
            tags['workspace.ASP5'] = nameSet.has('project.json') && this.searchArray(names, /^.+\.cs$/i);
            tags['workspace.sln'] = this.searchArray(names, /^.+\.sln$|^.+\.csproj$/i);
            tags['workspace.unity'] = nameSet.has('assets') && nameSet.has('library') && nameSet.has('projectsettings');
            tags['workspace.npm'] = nameSet.has('package.json') || nameSet.has('node_modules');
            tags['workspace.bower'] = nameSet.has('bower.json') || nameSet.has('bower_components');
            tags['workspace.java.pom'] = nameSet.has('pom.xml');
            tags['workspace.java.gradle'] = nameSet.has('build.gradle') || nameSet.has('settings.gradle') || nameSet.has('build.gradle.kts') || nameSet.has('settings.gradle.kts') || nameSet.has('gradlew') || nameSet.has('gradlew.bat');
            tags['workspace.yeoman.code.ext'] = nameSet.has('vsc-extension-quickstart.md');
            tags['workspace.py.requirements'] = nameSet.has('requirements.txt');
            tags['workspace.py.requirements.star'] = this.searchArray(names, /^(.*)requirements(.*)\.txt$/i);
            tags['workspace.py.Pipfile'] = nameSet.has('pipfile');
            tags['workspace.py.conda'] = this.searchArray(names, /^environment(\.yml$|\.yaml$)/i);
            tags['workspace.py.setup'] = nameSet.has('setup.py');
            tags['workspace.py.manage'] = nameSet.has('manage.py');
            tags['workspace.py.setupcfg'] = nameSet.has('setup.cfg');
            tags['workspace.py.app'] = nameSet.has('app.py');
            tags['workspace.py.pyproject'] = nameSet.has('pyproject.toml');
            tags['workspace.go.mod'] = nameSet.has('go.mod');
            const mainActivity = nameSet.has('mainactivity.cs') || nameSet.has('mainactivity.fs');
            const appDelegate = nameSet.has('appdelegate.cs') || nameSet.has('appdelegate.fs');
            const androidManifest = nameSet.has('androidmanifest.xml');
            const platforms = nameSet.has('platforms');
            const plugins = nameSet.has('plugins');
            const www = nameSet.has('www');
            const properties = nameSet.has('properties');
            const resources = nameSet.has('resources');
            const jni = nameSet.has('jni');
            if (tags['workspace.config.xml'] &&
                !tags['workspace.language.cs'] && !tags['workspace.language.vb'] && !tags['workspace.language.aspx']) {
                if (platforms && plugins && www) {
                    tags['workspace.cordova.high'] = true;
                }
                else {
                    tags['workspace.cordova.low'] = true;
                }
            }
            if (tags['workspace.config.xml'] &&
                !tags['workspace.language.cs'] && !tags['workspace.language.vb'] && !tags['workspace.language.aspx']) {
                if (nameSet.has('ionic.config.json')) {
                    tags['workspace.ionic'] = true;
                }
            }
            if (mainActivity && properties && resources) {
                tags['workspace.xamarin.android'] = true;
            }
            if (appDelegate && resources) {
                tags['workspace.xamarin.ios'] = true;
            }
            if (androidManifest && jni) {
                tags['workspace.android.cpp'] = true;
            }
            function getFilePromises(filename, fileService, textFileService, contentHandler) {
                return !nameSet.has(filename) ? [] : folders.map(workspaceUri => {
                    const uri = workspaceUri.with({ path: `${workspaceUri.path !== '/' ? workspaceUri.path : ''}/${filename}` });
                    return fileService.exists(uri).then(exists => {
                        if (!exists) {
                            return undefined;
                        }
                        return textFileService.read(uri, { acceptTextOnly: true }).then(contentHandler);
                    }, err => {
                    });
                });
            }
            function addPythonTags(packageName) {
                if (PyModulesToLookFor.indexOf(packageName) > -1) {
                    tags['workspace.py.' + packageName] = true;
                }
                for (const metaModule of PyMetaModulesToLookFor) {
                    if (packageName.startsWith(metaModule)) {
                        tags['workspace.py.' + metaModule] = true;
                    }
                }
                if (!tags['workspace.py.any-azure']) {
                    tags['workspace.py.any-azure'] = /azure/i.test(packageName);
                }
            }
            const requirementsTxtPromises = getFilePromises('requirements.txt', this.fileService, this.textFileService, content => {
                const dependencies = splitLines(content.value);
                for (const dependency of dependencies) {
                    const format1 = dependency.split('==');
                    const format2 = dependency.split('>=');
                    const packageName = (format1.length === 2 ? format1[0] : format2[0]).trim();
                    addPythonTags(packageName);
                }
            });
            const pipfilePromises = getFilePromises('pipfile', this.fileService, this.textFileService, content => {
                let dependencies = splitLines(content.value);
                dependencies = dependencies.slice(dependencies.indexOf('[packages]') + 1);
                for (const dependency of dependencies) {
                    if (dependency.trim().indexOf('[') > -1) {
                        break;
                    }
                    if (dependency.indexOf('=') === -1) {
                        continue;
                    }
                    const packageName = dependency.split('=')[0].trim();
                    addPythonTags(packageName);
                }
            });
            const packageJsonPromises = getFilePromises('package.json', this.fileService, this.textFileService, content => {
                try {
                    const packageJsonContents = JSON.parse(content.value);
                    const dependencies = Object.keys(packageJsonContents['dependencies'] || {}).concat(Object.keys(packageJsonContents['devDependencies'] || {}));
                    for (const dependency of dependencies) {
                        if (dependency.startsWith('react-native')) {
                            tags['workspace.reactNative'] = true;
                        }
                        else if ('tns-core-modules' === dependency || '@nativescript/core' === dependency) {
                            tags['workspace.nativescript'] = true;
                        }
                        else if (ModulesToLookFor.indexOf(dependency) > -1) {
                            tags['workspace.npm.' + dependency] = true;
                        }
                        else {
                            for (const metaModule of MetaModulesToLookFor) {
                                if (dependency.startsWith(metaModule)) {
                                    tags['workspace.npm.' + metaModule] = true;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                }
            });
            const goModPromises = getFilePromises('go.mod', this.fileService, this.textFileService, content => {
                try {
                    const lines = splitLines(content.value);
                    let firstRequireBlockFound = false;
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line.startsWith('require (')) {
                            if (!firstRequireBlockFound) {
                                firstRequireBlockFound = true;
                                continue;
                            }
                            else {
                                break;
                            }
                        }
                        if (line.startsWith(')')) {
                            break;
                        }
                        if (firstRequireBlockFound && line !== '') {
                            const packageName = line.split(' ')[0].trim();
                            for (const module of GoModulesToLookFor) {
                                if (packageName.startsWith(module)) {
                                    tags['workspace.go.mod.' + packageName] = true;
                                }
                            }
                        }
                    }
                }
                catch (e) {
                }
            });
            const pomPromises = getFilePromises('pom.xml', this.fileService, this.textFileService, content => {
                try {
                    let dependenciesContent;
                    while (dependenciesContent = MavenDependenciesRegex.exec(content.value)) {
                        let dependencyContent;
                        while (dependencyContent = MavenDependencyRegex.exec(dependenciesContent[1])) {
                            const groupIdContent = MavenGroupIdRegex.exec(dependencyContent[1]);
                            const artifactIdContent = MavenArtifactIdRegex.exec(dependencyContent[1]);
                            if (groupIdContent && artifactIdContent) {
                                this.tagJavaDependency(groupIdContent[1], artifactIdContent[1], 'workspace.pom.', tags);
                            }
                        }
                    }
                }
                catch (e) {
                }
            });
            const gradlePromises = getFilePromises('build.gradle', this.fileService, this.textFileService, content => {
                try {
                    this.processGradleDependencies(content.value, GradleDependencyLooseRegex, tags);
                    this.processGradleDependencies(content.value, GradleDependencyCompactRegex, tags);
                }
                catch (e) {
                }
            });
            const androidPromises = folders.map(workspaceUri => {
                const manifest = URI.joinPath(workspaceUri, '/app/src/main/AndroidManifest.xml');
                return this.fileService.exists(manifest).then(result => {
                    if (result) {
                        tags['workspace.java.android'] = true;
                    }
                }, err => {
                });
            });
            return Promise.all([...packageJsonPromises, ...requirementsTxtPromises, ...pipfilePromises, ...pomPromises, ...gradlePromises, ...androidPromises, ...goModPromises]).then(() => tags);
        });
    }
    processGradleDependencies(content, regex, tags) {
        let dependencyContent;
        while (dependencyContent = regex.exec(content)) {
            const groupId = dependencyContent[1];
            const artifactId = dependencyContent[2];
            if (groupId && artifactId) {
                this.tagJavaDependency(groupId, artifactId, 'workspace.gradle.', tags);
            }
        }
    }
    tagJavaDependency(groupId, artifactId, prefix, tags) {
        for (const javaLibrary of JavaLibrariesToLookFor) {
            if (javaLibrary.predicate(groupId, artifactId)) {
                tags[prefix + javaLibrary.tag] = true;
                return;
            }
        }
    }
    searchArray(arr, regEx) {
        return arr.some(v => v.search(regEx) > -1) || undefined;
    }
};
WorkspaceTagsService = __decorate([
    __param(0, IFileService),
    __param(1, IWorkspaceContextService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, ITextFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkspaceTagsService);
export { WorkspaceTagsService };
registerSingleton(IWorkspaceTagsService, WorkspaceTagsService, 1);
