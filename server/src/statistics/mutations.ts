import { ObjectId } from 'mongodb';
import { statisticsCollection } from '../database';

export const registerPageView = async (parents: any, args: any, context: any, info: any) => {
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
	}
}