/**
 * @module Action
 *
 */
export default interface Interface {
	Type: "HTML" | "CSS" | "TypeScript";
	Hidden: boolean;
	Content: string;
}
