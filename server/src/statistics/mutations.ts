import { ApolloError } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { statisticsCollection } from '../database';

interface RegisterPageViewArgs {
	page: string,
	user?: string
}
export const registerPageView = async (_parents: any, args: RegisterPageViewArgs, _context: any, _info: any): Promise<boolean> => {
	try {
		statisticsCollection.insertOne({
			_id: new ObjectId(),
			time: Date.now(),
			page: args.page,
			user: args.user
		});

		return true;
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}