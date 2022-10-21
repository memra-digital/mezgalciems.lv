import { ForbiddenError } from "apollo-server-express";
import { ObjectId } from "mongodb";
import { getPermission } from "../account/permissions";
import { verifyAccountToken } from "../account/tokens";
import { infoCollection } from "../database";
import { DbInformation } from "../schemas";

export const modifyInformation = async (parents: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 1)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		// Modify the information
		const modifiedInformation: DbInformation = {
			_id: new ObjectId(),
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		};

		infoCollection.replaceOne({}, modifiedInformation);

		return {
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		}
	} catch (e: any) {
		console.log(e);
	}
}