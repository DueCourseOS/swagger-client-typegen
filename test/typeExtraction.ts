import {expect} from 'chai';
import * as swagger from 'swagger-client';
import {extractOperationsFromClient} from '../src/swaggerTypeExtractor';
import {readFileSync} from 'fs';

function loadFixture(name){
	const fixture = readFileSync(__dirname + `/fixtures/${name}.json`, 'utf8');
	return JSON.parse(fixture);
}

describe('type extraction', () => {
	it('should discover the operations', ()=>{
		return swagger({spec: loadFixture('example')}).then(extractOperationsFromClient).then(operations => {
      console.log(operations);
			expect(operations).to.have.lengthOf(1);
			const operation = operations[0];
			expect(operation.url).to.equal('/simple');
			expect(operation.method).to.equal('get');

      const expectedRequestType = {
				type: 'object',
				children: {}
			};
			expect(operation.types.requestType).to.deep.equal(expectedRequestType);
      const expectedResponseType = {
				type: 'object',
				children: {
					body: {type: 'string'},
					statusCode: {type: 'literal', value: 200}
				}
			};
			expect(operation.types.responseType).to.deep.equal(expectedResponseType);
		});
	})
})
