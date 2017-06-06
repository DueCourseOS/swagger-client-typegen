export type PrimitiveTypeInfo = ({type: 'string'} | {type: 'number'} | {type: 'Promise<any>'}) & {isOptional?: boolean};

export interface FunctionTypeInfo {
	type: 'function',
	parameters: Array<{name: string, type: TypeInfo}>,
	resultType: TypeInfo
	isOptional?: boolean;
}
export interface ComplexTypeInfo {
	type: 'object';
	children: { [name: string]: TypeInfo };
	isOptional?: boolean;
}
export interface ArrayTypeInfo {
	type: 'array';
	itemType: TypeInfo;
	isOptional?: boolean;
}
export interface UnionTypeInfo {
	type: 'union';
	parts: TypeInfo[];
	isOptional?: boolean;
}
export interface LiteralTypeInfo {
	type: 'literal';
	value: any;
	isOptional?: boolean;
}
export interface ConcreteGenericTypeInfo {
	type: 'concrete';
	genericTypeName: string;
	parameters: TypeInfo[];
	isOptional?: boolean;
}

export type TypeInfo = PrimitiveTypeInfo | FunctionTypeInfo | ComplexTypeInfo | ArrayTypeInfo | UnionTypeInfo | LiteralTypeInfo | ConcreteGenericTypeInfo;

export interface Operation {
	operationId: string;
	method: string;
	types: {
		requestType: TypeInfo;
		responseType: TypeInfo;
	};
	tags: string[];
}
