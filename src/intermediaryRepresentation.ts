export type PrimitiveTypeInfo = ({type: 'string'} | {type: 'number'} | {type: 'Promise<any>'} | {type: 'function', parameters: Array<{name: string, type: TypeInfo}>, resultType: TypeInfo}) & {isOptional?: boolean};
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

export type TypeInfo = PrimitiveTypeInfo | ComplexTypeInfo | ArrayTypeInfo | UnionTypeInfo | LiteralTypeInfo;

export interface Operation {
	operationId: string;
	method: string;
	processedParams: {
		requestType: TypeInfo;
		responseType: TypeInfo;
	};
	tags: string[];
}
