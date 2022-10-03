import { ApolloError } from 'apollo-server-express';
import { infoCollection } from '../database';
import { DbInformation } from '../schemas';

export const getInformation = async (parent: any, args: any, context: any, info: any) => {
	let information: DbInformation | null = <DbInformation | null> await infoCollection.findOne({}).then(res => { return res; });

	if (information === null) {
		throw new ApolloError(`unknown`);
	}
	
	return information;
}