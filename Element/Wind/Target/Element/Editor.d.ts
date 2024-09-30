import type Editor from "@Context/Action/Editor";
import { type SubmitHandler } from "@modular-forms/solid";
import "@Stylesheet/Element/Action.scss";
import "@Stylesheet/Element/Editor.scss";
/**
 * @module Editor
 *
 */
declare const _default: ({ Type }?: {
    Type: Editor["Type"];
}) => import("solid-js").JSX.Element;
export default _default;
export type Type = {
    Field: Editor["Type"];
    Content: string;
};
export declare const Return: (Type: Editor["Type"]) => "" | "\n/* Example CSS Code */\nbody {\n\n}\t\t\t\n" | "\n<!-- Example HTML Code -->\n<!doctype html>\n<html lang=\"en\">\n\t<body>\n\t</body>\n</html>\n" | "\n/**\n * Example TypeScript Code\n */\nexport default () => ({});\n";
export declare const Update: SubmitHandler<Type>;
