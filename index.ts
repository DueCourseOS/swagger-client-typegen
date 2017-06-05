import * as getStdIn from 'get-stdin';
import * as swagger from 'swagger-client';
import * as rp from 'request-promise';
import * as _ from 'lodash';
import {generateCodeForClient} from './src/typewriter';
import {readFileSync} from 'fs';

const isJson = (val) => {
	if (_.isPlainObject(val)) {
		return true;
	}
	else if (_.isString(val)) {
		try {
			JSON.parse(val);
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
};

const swaggerOpts = {

};

const interfaceName = process.argv[2];

getStdIn()
	.then(spec => swagger({spec: JSON.parse(spec), swaggerOpts}))
	.then(client => generateCodeForClient(client, interfaceName))
	.then(console.log);
