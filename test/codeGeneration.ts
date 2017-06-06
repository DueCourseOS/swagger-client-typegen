import {expect} from 'chai';
import * as codeGen from '../src/codeGeneration';
import {TypeInfo, PrimitiveTypeInfo, ComplexTypeInfo, ArrayTypeInfo, UnionTypeInfo, LiteralTypeInfo, ConcreteGenericTypeInfo, FunctionTypeInfo} from '../src/intermediaryRepresentation';
import {readFileSync} from 'fs';

function loadFixture(name){
	const fixture = readFileSync(__dirname + `/fixtures/${name}.json`, 'utf8');
	return JSON.parse(fixture);
}

const options = {indentCharacter:'\t'};

describe('code Generation', () => {
  describe('type rendering', () => {
		it('should render primitives', () => {
			const primitive: PrimitiveTypeInfo = {type: 'string'};
			expect(codeGen.renderType(primitive, options)).to.equal('string');
		});

		it('should render object types', () => {
			const objectType: ComplexTypeInfo = {
				type:'object',
				children: {
					s: {type: 'string'},
					nested: {
						type:'object',
						children: {
							n: {type: 'number'}
						}
					}
				}
			};
			const expectedCode =
`{
	s: string;
	nested: {
		n: number;
	};
}`;
			expect(codeGen.renderType(objectType, options)).to.equal(expectedCode);
		});

		it('should render array types', () => {
			const array : ArrayTypeInfo = {
				type: 'array',
				itemType: {type: 'object', children: {n: {type: 'number'}}}
			};
			const expectedCode =
`Array<{
	n: number;
}>`;
			expect(codeGen.renderType(array, options)).to.equal(expectedCode);
		});

		it('should render union types', () => {
			const union : UnionTypeInfo = {
				type: 'union',
				parts: [{type: 'number'}, {type: 'string'}]
			};
			const expectedCode =
`number | string`;
			expect(codeGen.renderType(union, options)).to.equal(expectedCode);
		});

		it('should render literal types', () => {
			const literal : LiteralTypeInfo = {
				type: 'literal',
				value: 'foo'
			};
			const expectedCode =
`'foo'`;
			expect(codeGen.renderType(literal, options)).to.equal(expectedCode);
		});

	it('should render concrete instantiations of generic types', () => {
      const paramterType: TypeInfo = {
				type: 'object',
				children: {somestring: {type: 'string'}}
			};
			const concrete : ConcreteGenericTypeInfo = {
				type: 'concrete',
				genericTypeName: 'Promise',
				parameters: [paramterType]
			};
			const expectedCode =
`Promise<{
	somestring: string;
}>`;
			expect(codeGen.renderType(concrete, options)).to.equal(expectedCode);
		});
	});

	it('should render function types', () => {
      const parameterA:TypeInfo = {type: 'string'};
      const parameterB:TypeInfo = {type: 'number'};
			const result:TypeInfo = {type: 'concrete', genericTypeName: 'Promise', parameters: [{type: 'number'}]}
			const func : FunctionTypeInfo = {
				type: 'function',
				parameters: [{name: 'a', type: parameterA}, {name: 'b', type: parameterB}],
				resultType: result
			};
			const expectedCode =
`(a: string, b: number) => Promise<number>`;
			expect(codeGen.renderType(func, options)).to.equal(expectedCode);
		});
});
