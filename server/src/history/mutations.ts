import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { InsertOneResult, ObjectId, WithId } from 'mongodb';
import { getPermission } from '../account/permissions';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { accountCollection, historyCollection } from '../database';
import { DbAccount, DbHistoryArticle, HistoryArticle } from '../schemas';

const validateHistoryArticle = (args: CreateHistoryArticleArgs | EditHistoryArticleArgs): void => {
	if (args.title && args.title.trim() === ``) {
		throw new UserInputError(`emptyTitle`);
	}
	if (args.content && args.content.trim() === ``) {
		throw new UserInputError(`emptyTitle`);
	}
	if (args.type && args.type !== `church` && args.type !== `baptist`) {
		throw new UserInputError(`invalidType`);
	}
	if (args.font && args.font !== `sans` && args.font !== `serif`) {
		throw new UserInputError(`invalidType`);
	}
	if (args.videoLink !== undefined && args.videoLink !== ``) {
		if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink)) {
			// I KNOW THIS REGEX IS HORRIBLE!!!
			throw new UserInputError(`invalidVideoLink`);
		}
	}
}

interface CreateHistoryArticleArgs {
	token: string,
	title: string,
	content: string,
	type: string,
	font: string,
	videoLink?: string
}
export const createHistoryArticle = async (_parent: any, args: CreateHistoryArticleArgs, _context: any, _info: any): Promise<HistoryArticle> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 2)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		validateHistoryArticle(args);

		let timestamp: number = Date.now();

		let article: InsertOneResult<DbHistoryArticle> = <InsertOneResult<DbHistoryArticle>> await historyCollection.insertOne({
			_id: new ObjectId(),
			title: args.title,
			content: args.content,
			date: timestamp,
			author: getUsernameFromToken(args.token),
			type: args.type,
			font: args.font,
			videoLink: args.videoLink
		});

		return {
			id: article.insertedId.toString(),
			title: args.title,
			content: args.content,
			preview: args.content.slice(0, 60),
			date: timestamp,
			author: getUsernameFromToken(args.token),
			type: args.type,
			font: args.font,
			videoLink: args.videoLink?.length === 0 ? undefined : args.videoLink
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

interface EditHistoryArticleArgs {
	token: string,
	id: string,
	title: string,
	content: string,
	type: string,
	font: string,
	videoLink?: string
}
export const editHistoryArticle = async (_parent: any, args: EditHistoryArticleArgs, _context: any, _info: any): Promise<HistoryArticle> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 2)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		validateHistoryArticle(args);

		let originalArticle: WithId<DbHistoryArticle> = <WithId<DbHistoryArticle>> await historyCollection.findOne({ _id: new ObjectId(args.id) });
		if (originalArticle === null) {
			throw new UserInputError(`invalidHistoryId`);
		}

		// Create a list of the accounts that have written this article
		let account: WithId<DbAccount> = <WithId<DbAccount>> await accountCollection.findOne({ username: getUsernameFromToken(args.token) });
		let authorList: string[] = originalArticle.author.split(` & `);
		let currentAuthorName: string = `${account.firstName} ${account.lastName}`;
		if (!authorList.includes(currentAuthorName)) {
			authorList.push(currentAuthorName);
		}

		const modifiedArticle: WithId<DbHistoryArticle> = {
			_id: originalArticle._id,
			title: args.title ?? originalArticle.title,
			content: args.content ?? originalArticle.content,
			date: originalArticle.date,
			author: authorList.join(` & `),
			type: args.type ?? originalArticle.type,
			font: args.font ?? originalArticle.font,
			videoLink: args.videoLink?.length === 0 ? undefined : args.videoLink ?? originalArticle.videoLink
		};

		historyCollection.replaceOne({ _id: originalArticle._id }, modifiedArticle);

		return {
			id: modifiedArticle._id.toString(),
			title: modifiedArticle.title,
			content: modifiedArticle.content,
			preview: modifiedArticle.content.slice(0, 60),
			date: modifiedArticle.date,
			author: modifiedArticle.author,
			type: modifiedArticle.type,
			font: modifiedArticle.font,
			videoLink: modifiedArticle.videoLink
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

interface DeleteHistoryArticle {
	token: string,
	id: string
}
export const deleteHistoryArticle = async (_parents: any, args: DeleteHistoryArticle, _context: any, _info: any): Promise<HistoryArticle> => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}
	if (!await getPermission(args.token, 3)) {
		throw new ForbiddenError(`invalidPermissions`);
	}

	// Check if the article exists
	let article: WithId<DbHistoryArticle> = <WithId<DbHistoryArticle>> await historyCollection.findOne({ _id: new ObjectId(args.id) });
	if (article === null) {
		throw new UserInputError(`invalidHistoryId`);
	}

	historyCollection.deleteOne({ _id: article._id });

	return {
		id: article._id.toString(),
		title: article.title,
		content: article.content,
		preview: article.content.slice(0, 60),
		date: article.date,
		author: article.author,
		type: article.type,
		font: article.font,
		videoLink: article.videoLink
	}
}