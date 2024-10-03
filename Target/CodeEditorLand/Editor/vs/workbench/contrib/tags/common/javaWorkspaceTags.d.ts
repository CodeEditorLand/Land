export declare const GradleDependencyLooseRegex: RegExp;
export declare const GradleDependencyCompactRegex: RegExp;
export declare const MavenDependenciesRegex: RegExp;
export declare const MavenDependencyRegex: RegExp;
export declare const MavenGroupIdRegex: RegExp;
export declare const MavenArtifactIdRegex: RegExp;
export declare const JavaLibrariesToLookFor: {
    predicate: (groupId: string, artifactId: string) => boolean;
    tag: string;
}[];
