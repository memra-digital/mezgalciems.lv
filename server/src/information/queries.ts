import { ApolloError } from 'apollo-server-express';
import { WithId } from 'mongodb';
import { infoCollection } from '../database';
import { Information } from '../schemas';

interface GetInformationArgs {}
export const getInformation = async (_parent: any, _args: GetInformationArgs, _context: any, _info: any): Promise<Information> => {
	try {
		let information: WithId<Information> = <WithId<Information>> await infoCollection.findOne({});
		
		return information;
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}