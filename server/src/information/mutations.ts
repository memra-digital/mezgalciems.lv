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

		infoCollection.replaceOne({}, {
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		});

		return {
			nextDate: args.nextDate,
			dateInfo: args.dateInfo,
			information: args.information
		}
	} catch (e: any) {
		console.log(e);
	}
}