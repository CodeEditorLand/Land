declare enum Severity {
    Ignore = 0,
    Info = 1,
    Warning = 2,
    Error = 3
}
declare namespace Severity {
    function fromValue(value: string): Severity;
    function toString(severity: Severity): string;
}
export default Severity;
