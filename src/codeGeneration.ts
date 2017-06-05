import * as _ from 'lodash';
import {TypeInfo, UnionTypeInfo, Operation} from './intermediaryRepresentation';

export function generateInterfaceForClient(name, operations: Operation[]): string {
	const byTag = _.groupBy(operations, operation => operation.tags[0]);
	const apis = _.mapValues(byTag, oppsGroup => {
		const methods = _(oppsGroup)
		.keyBy((op: any) => op.operationId)
		.mapValues((operation, operationId) => {
			return {
				type: 'function',
				parameters: [{name: 'params', type: operationId + 'Request'}],
				resultType: `${operationId}Response`
			};
		}).value();
		return {type: 'object', children: methods};
	});

	const clientInterfaceType = {
		type: 'object',
		children: {
			apis: {
				type: 'object', children: apis
			}
		}};
	return 'export ' + generateInterface(clientInterfaceType, name, {indentCharacter: '\t'});
	}

function renderInterfacesForOperation(operation: Operation): string{
	const options = {indentCharacter: '\t'};
	const {requestType, responseType} = operation.processedParams;
	const requestInterfaceCode = generateInterface(requestType, operation.operationId + 'Request', options);
	const responseInterfaceCode = generateInterface(responseType, operation.operationId + 'Response', options);
	// const responseInterfaceCode = `type ${operation.operationId}Response = Promise<any>;`;
	return requestInterfaceCode + '\n' + responseInterfaceCode + '\n\n';
}

export function renderTypeDefsForOperation(operation: Operation): string{
		const options = {indentCharacter: '\t'};
		const {requestType, responseType} = operation.processedParams;
		const requestInterfaceCode = renderTypeDef(requestType, operation.operationId + 'Request', options);
		const responseInterfaceCode = renderTypeDef(responseType, operation.operationId + 'Response', options);
		// const responseInterfaceCode = `type ${operation.operationId}Response = Promise<any>;`;
		return 'export ' + requestInterfaceCode + '\n' + 'export ' + responseInterfaceCode + '\n\n';
	}


function renderType(node: TypeInfo, options, depth = 1): string {
		if (node.type === 'object'){
			const children = Object.keys(node.children).map(key => {
				return {key, ...node.children[key]};
			});
			const indent = new Array(depth).fill(options.indentCharacter).join('');
			const trailingIndent = new Array(depth - 1).fill(options.indentCharacter).join('');
			const inner = children.map(child => `${child.key}${child.isOptional ? '?' : ''}: ${renderType(child, options, depth + 1)};`);
			return ['{', ...inner.map(line => indent + line), trailingIndent + '}'].join('\n');
		}
		if (node.type === 'function'){
			const paramList = node.parameters.map(param => `${param.name}: ${param.type}`).join(', ');
			return `(${paramList}) => ${node.resultType}`;
		}
		if (node.type === 'union'){
			return node.parts.map(part => renderType(part, options, depth + 1)).join(' | ');
		}
		if (node.type === 'array'){
			return `Array<${renderType(node.itemType, options, depth + 1)}>`;
		}
		if (node.type === 'literal'){
			if (_.isString(node.value)){
				return `'${node.value}'`;
			}
			return node.value;
		}

		return node.type;
	}

export function generateInterface(node, name, options){
		return `interface ${name} ${renderType(node, options)}`;
	}

function renderTypeDef(node, name, options){
		return `type ${name} = ${renderType(node, options)}`;
	}
