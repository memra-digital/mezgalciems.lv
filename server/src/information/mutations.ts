import { ApolloError, ForbiddenError, UserInputError } from "apollo-server-express";
import { getPermission } from "../account/permissions";
import { verifyAccountToken } from "../account/tokens";
import { infoCollection } from "../database";
import { Information } from "../schemas";

interface EditInformationArgs {
	token: string,
	nextDate?: string,
	dateInfo: string,
	information: string
}
export const editInformation = async (_parents: any, args: EditInformationArgs, _context: any, _info: any): Promise<Information> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 1)) {
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
		};
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}