import * as getStdIn from 'get-stdin';
import * as swagger from 'swagger-client';
import {buildStatementsForClient} from './src/swaggerTypeExtractor';
import * as codeGeneration from './src/codeGeneration';

const interfaceName = process.argv[2];

getStdIn()
	.then(spec => swagger({spec: JSON.parse(spec), swaggerOps: {}}))
	.then(client => codeGeneration.renderStatementsByGroup(buildStatementsForClient(client, interfaceName)))
	.then(console.log);
