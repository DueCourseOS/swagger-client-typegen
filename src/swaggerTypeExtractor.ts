import * as _ from 'lodash';
import {TypeInfo, UnionTypeInfo, Operation} from './intermediaryRepresentation';
// Extract Types //////////////////////////////////////////////////
function flatten(listOfLists){
	return listOfLists.reduce((acc, list) => acc.concat(list), []);
}

export function extractOperationsFromClient(client: any): Operation[]{
	const paths = client.spec.paths;
	const operationSpecs = Object.keys(paths).map(url => {
		const path = paths[url];
		const operations = Object.keys(path).map(method => {
			return {...path[method], method, url, processedParams: extractRequestAndResponseTypes(path[method])};
		});
		return operations;
	}, {});
	return flatten(operationSpecs);
}

function isSuccessResponse(value, statusCode){
	const code = parseInt(statusCode, 10);
	return code < 400 && code >= 200;
}

function extractRequestAndResponseTypes(operation): {requestType: TypeInfo, responseType: TypeInfo}{
	const requestTypeChildren = _(operation.parameters)
	.keyBy(param => param.name)
	.mapValues((param: any) => schemaToTypeInfo(param.schema || param))
	.value();

	const responses: TypeInfo[] = _(operation.responses).pickBy(isSuccessResponse).map((response: any, statusCode: string) => {
		const body: TypeInfo = schemaToTypeInfo(response.schema);
		return {type: 'object', children: {body, statusCode: {type: 'literal', value: parseInt(statusCode, 10)}}} as TypeInfo;
	}).value();

	const responseType: UnionTypeInfo = {type: 'union', parts: responses};

	const requestType: TypeInfo = {type: 'object', children: requestTypeChildren};

	return {requestType, responseType};
}

function schemaToTypeInfo(schema): TypeInfo{
	const result = {type: schema.type};
	if (schema.type === 'object'){
		const requiredProps = schema.required || [];
		return {...result, children: _.mapValues(schema.properties, (prop, propName) => {
			const isOptional = !requiredProps.includes(propName);
			return {...schemaToTypeInfo(prop), isOptional};
		})};
	}
	if (schema.type === 'array') {
		return {...result, itemType: schemaToTypeInfo(schema.items)};
	}
	return result;
}

