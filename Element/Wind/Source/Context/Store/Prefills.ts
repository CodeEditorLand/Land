export type Type = {
	Identifier: ReturnType<Crypto["randomUUID"]>;
	Key: NonNullable<JsonWebKey["k"]>;
	string: string;
};

export type { Type as default };
