import * as util from 'util';
import {TypeInfo, UnionTypeInfo, Operation} from './intermediaryRepresentation';
import {buildStatementsForClient} from './swaggerTypeExtractor';
import * as codeGeneration from './codeGeneration';

// Entrypoint //////////////////////////////////////////////////

export function generateCodeForClient(client, interfaceName): string{
	const statementGroups = buildStatementsForClient(client, interfaceName);
	return codeGeneration.renderStatementsByGroup(statementGroups);
}

// Render Code //////////////////////////////////////////////////
