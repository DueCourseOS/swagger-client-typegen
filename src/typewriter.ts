import * as util from 'util';
import {TypeInfo, UnionTypeInfo, Operation} from './intermediaryRepresentation';
import {extractOperationsFromClient} from './swaggerTypeExtractor';
import * as codeGeneration from './codeGeneration';

// Entrypoint //////////////////////////////////////////////////

export function generateCodeForClient(client, interfaceName): string{
	const operations = extractOperationsFromClient(client);
	const interfaces = operations.map(codeGeneration.renderTypeDefsForOperation).join('\n');
	return interfaces + codeGeneration.generateInterfaceForClient(interfaceName, operations);
}

// Render Code //////////////////////////////////////////////////
