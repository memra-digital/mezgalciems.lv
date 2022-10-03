import { ForbiddenError } from "apollo-server-express";
import { verifyAccountToken } from "../account/tokens";
import { infoCollection } from "../database";
import { DbInformation } from "../schemas";

export const modifyInformation = async (parents: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		// Modify the information
		const modifiedInformation: DbInformation = {
			_id: `0`,
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		};

		infoCollection.replaceOne({ _id: 0 }, modifiedInformation);

		// Return everything
		return {
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		}
	} catch (e: any) {
		console.log(e);
	}
}