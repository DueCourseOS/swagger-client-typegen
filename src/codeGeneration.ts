import * as _ from 'lodash';
import {TypeInfo, UnionTypeInfo, Operation, TypeStatement} from './intermediaryRepresentation';

export function renderStatement(statement:TypeStatement): string {
	const options = {indentCharacter: '\t'}
	const prefix = statement.export ? 'export ' : '';
	if(statement.statement === 'typedef'){
		return `${prefix}type ${statement.name} = ${renderType(statement.definition, options)};`
	}
	if(statement.statement === 'interface'){
		return `${prefix}interface ${statement.name} ${renderType(statement.definition, options)}`
	}
	return '';
}

export function renderStatementsByGroup(statementGroups:TypeStatement[][]): string {
	return statementGroups.map(statements => statements.map(renderStatement).join('\n')+'\n').join('\n');
}

export function renderType(node: TypeInfo, options, depth = 1): string {
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
			const paramList = node.parameters.map(param => `${param.name}: ${renderType(param.type, options, depth)}`).join(', ');
			return `(${paramList}) => ${renderType(node.resultType, options, depth)}`;
		}
		if (node.type === 'union'){
			if(node.parts.length === 1){
				return renderType(node.parts[1], options, depth);
			}
			return node.parts.map(part => renderType(part, options, depth + 1)).join(' | ');
		}
		if (node.type === 'array'){
			return `Array<${renderType(node.itemType, options, depth)}>`;
		}
		if (node.type === 'literal'){
			if (_.isString(node.value)){
				return `'${node.value}'`;
			}
			return node.value;
		}
		if (node.type === 'concrete'){
			const parameters = node.parameters.map(parameter => renderType(parameter, options, depth));
			return `${node.genericTypeName}<${parameters.join(', ')}>`;
		}
		if (node.type === 'named'){
			return node.typeName;
		}

		return node.type;
	}
