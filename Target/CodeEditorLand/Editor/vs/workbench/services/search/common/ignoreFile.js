import * as glob from '../../../../base/common/glob.js';
export class IgnoreFile {
    constructor(contents, location, parent) {
        this.location = location;
        this.parent = parent;
        if (location[location.length - 1] === '\\') {
            throw Error('Unexpected path format, do not use trailing backslashes');
        }
        if (location[location.length - 1] !== '/') {
            location += '/';
        }
        this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
    }
    updateContents(contents) {
        this.isPathIgnored = this.parseIgnoreFile(contents, this.location, this.parent);
    }
    isPathIncludedInTraversal(path, isDir) {
        if (path[0] !== '/' || path[path.length - 1] === '/') {
            throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
        }
        const ignored = this.isPathIgnored(path, isDir);
        return !ignored;
    }
    isArbitraryPathIgnored(path, isDir) {
        if (path[0] !== '/' || path[path.length - 1] === '/') {
            throw Error('Unexpected path format, expectred to begin with slash and end without. got:' + path);
        }
        const segments = path.split('/').filter(x => x);
        let ignored = false;
        let walkingPath = '';
        for (let i = 0; i < segments.length; i++) {
            const isLast = i === segments.length - 1;
            const segment = segments[i];
            walkingPath = walkingPath + '/' + segment;
            if (!this.isPathIncludedInTraversal(walkingPath, isLast ? isDir : true)) {
                ignored = true;
                break;
            }
        }
        return ignored;
    }
    gitignoreLinesToExpression(lines, dirPath, trimForExclusions) {
        const includeLines = lines.map(line => this.gitignoreLineToGlob(line, dirPath));
        const includeExpression = Object.create(null);
        for (const line of includeLines) {
            includeExpression[line] = true;
        }
        return glob.parse(includeExpression, { trimForExclusions });
    }
    parseIgnoreFile(ignoreContents, dirPath, parent) {
        const contentLines = ignoreContents
            .split('\n')
            .map(line => line.trim())
            .filter(line => line && line[0] !== '#');
        const fileLines = contentLines.filter(line => !line.endsWith('/'));
        const fileIgnoreLines = fileLines.filter(line => !line.includes('!'));
        const isFileIgnored = this.gitignoreLinesToExpression(fileIgnoreLines, dirPath, true);
        const fileIncludeLines = fileLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
        const isFileIncluded = this.gitignoreLinesToExpression(fileIncludeLines, dirPath, false);
        const dirIgnoreLines = contentLines.filter(line => !line.includes('!'));
        const isDirIgnored = this.gitignoreLinesToExpression(dirIgnoreLines, dirPath, true);
        const dirIncludeLines = contentLines.filter(line => line.includes('!')).map(line => line.replace(/!/g, ''));
        const isDirIncluded = this.gitignoreLinesToExpression(dirIncludeLines, dirPath, false);
        const isPathIgnored = (path, isDir) => {
            if (!path.startsWith(dirPath)) {
                return false;
            }
            if (isDir && isDirIgnored(path) && !isDirIncluded(path)) {
                return true;
            }
            if (isFileIgnored(path) && !isFileIncluded(path)) {
                return true;
            }
            if (parent) {
                return parent.isPathIgnored(path, isDir);
            }
            return false;
        };
        return isPathIgnored;
    }
    gitignoreLineToGlob(line, dirPath) {
        const firstSep = line.indexOf('/');
        if (firstSep === -1 || firstSep === line.length - 1) {
            line = '**/' + line;
        }
        else {
            if (firstSep === 0) {
                if (dirPath.slice(-1) === '/') {
                    line = line.slice(1);
                }
            }
            else {
                if (dirPath.slice(-1) !== '/') {
                    line = '/' + line;
                }
            }
            line = dirPath + line;
        }
        return line;
    }
}
