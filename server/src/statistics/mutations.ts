import { ObjectId } from 'mongodb';
import { statisticsCollection } from '../database';

export const registerPageView = async (parents: any, args: any, context: any, info: any) => {
	try {
		// Get the stastistics log count
		const id: number = await statisticsCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
			if (res.length === 0) {
				return 0;
			} else {
				return parseInt(res[0]._id.toString()) + 1;
			}
		});

		// Log the page view
		statisticsCollection.insertOne({
			_id: new ObjectId(id.toString()),
			time: Date.now(),
			page: args.page,
			user: args.user
		});

		return true;
	} catch (e: any) {
		console.log(e);
	}
}