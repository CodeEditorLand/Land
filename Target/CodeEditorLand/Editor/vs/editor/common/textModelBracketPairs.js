export class BracketInfo {
    constructor(range, nestingLevel, nestingLevelOfEqualBracketType, isInvalid) {
        this.range = range;
        this.nestingLevel = nestingLevel;
        this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
        this.isInvalid = isInvalid;
    }
}
export class BracketPairInfo {
    constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode) {
        this.range = range;
        this.openingBracketRange = openingBracketRange;
        this.closingBracketRange = closingBracketRange;
        this.nestingLevel = nestingLevel;
        this.nestingLevelOfEqualBracketType = nestingLevelOfEqualBracketType;
        this.bracketPairNode = bracketPairNode;
    }
    get openingBracketInfo() {
        return this.bracketPairNode.openingBracket.bracketInfo;
    }
    get closingBracketInfo() {
        return this.bracketPairNode.closingBracket?.bracketInfo;
    }
}
export class BracketPairWithMinIndentationInfo extends BracketPairInfo {
    constructor(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode, minVisibleColumnIndentation) {
        super(range, openingBracketRange, closingBracketRange, nestingLevel, nestingLevelOfEqualBracketType, bracketPairNode);
        this.minVisibleColumnIndentation = minVisibleColumnIndentation;
    }
}
