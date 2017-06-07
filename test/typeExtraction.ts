import {expect} from 'chai';
import * as swagger from 'swagger-client';
import {buildStatementsForClient} from '../src/swaggerTypeExtractor';
import {TypeStatement} from '../src/intermediateRepresentation';
import {readFileSync} from 'fs';
import {flatten} from 'lodash';

function loadFixture(name){
	const fixture = readFileSync(__dirname + `/fixtures/${name}.json`, 'utf8');
	return JSON.parse(fixture);
}

describe('type extraction', () => {
	it('should discover the operations', ()=>{
		return swagger({spec: loadFixture('example')})
		.then(client => buildStatementsForClient(client, 'MyClient'))
		.then((statementGroups:TypeStatement[][]) => {
			const clientInterface = flatten(statementGroups).filter(statement => statement.name === 'MyClient')[0];
			expect(clientInterface).to.exist;

			const expectedInterface = {
				export: true,
				statement: 'interface',
				name: 'MyClient',
				definition: {
					type: 'object',
					children: {
						apis: {
							type: 'object',
							children: {
								tagA: {
									type: 'object',
									children: {
										getSimple: {
											type: 'function',
											parameters: [{name:'params', type: {
												type: 'named',
												typeName: 'getSimpleRequest'
											}}],
											resultType: {
												type: 'concrete',
												genericTypeName:'Promise',
												parameters:[{
													type: 'named',
													typeName: 'getSimpleResponse'
											}]}
										}
									}
								}
							}
						}
					}
				}
			}

			expect(clientInterface).to.deep.equal(expectedInterface);
		});
	})
})
