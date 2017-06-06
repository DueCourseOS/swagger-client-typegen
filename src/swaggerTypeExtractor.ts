import * as _ from 'lodash';
import {TypeInfo, UnionTypeInfo, Operation, TypeStatement, ComplexTypeInfo} from './intermediaryRepresentation';
// Extract Types //////////////////////////////////////////////////
function flatten(listOfLists){
	return listOfLists.reduce((acc, list) => acc.concat(list), []);
}

function promiseTypeOf(type:TypeInfo){
	return {type: 'concrete', genericTypeName: 'Promise', parameters: [type]};
}

export function extractOperationsFromClient(client: any): Operation[]{
	const paths = client.spec.paths;
	const operationSpecs = Object.keys(paths).map(url => {
		const path = paths[url];
		const operations = Object.keys(path).map(method => {
			return {...path[method], method, url, types: extractRequestAndResponseTypes(path[method])};
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

	const responseType: TypeInfo = responses.length > 1 ? {type: 'union', parts: responses} : responses[0];

	const requestType: TypeInfo = {type: 'object', children: requestTypeChildren};

	return {requestType, responseType};
}

export function buildStatementsForClient(client: any, interfaceName): TypeStatement[][] {
	const operations = extractOperationsFromClient(client);
	const dtoTypes:TypeStatement[][] = _.map(operations, (operation: Operation) => {
		return [
			{statement: 'typedef', name: operation.operationId + 'Request', definition: operation.types.requestType},
			{statement: 'typedef', name: operation.operationId + 'Response', definition: operation.types.responseType}
		] as TypeStatement[];
	});

	const byTag = _.groupBy(operations, operation => operation.tags[0]);
	const apis = _.mapValues(byTag, oppsGroup => {
		const methods = _(oppsGroup)
		.keyBy((op: any) => op.operationId)
		.mapValues((operation, operationId) => {
			const responseType:TypeInfo = {type: 'named', typeName: operationId + 'Response'};
			const paramType:TypeInfo = {type: 'named', typeName: operationId + 'Request'};
			return {
				type: 'function',
				parameters: [{name: 'params', type: paramType}],
				resultType: promiseTypeOf(responseType)
			};
		}).value();
		return {type: 'object', children: methods} as TypeInfo;
	});

	const clientInterfaceType:ComplexTypeInfo = {
		type: 'object',
		children: {
			apis: {
				type: 'object', children: apis
			}
	}};
	const clientInterface:TypeStatement = {statement: 'interface', name: interfaceName, definition: clientInterfaceType};
	const clientInterfaceStatements = [[clientInterface]];

	return dtoTypes.concat(clientInterfaceStatements);
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

