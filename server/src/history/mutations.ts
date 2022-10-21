import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { InsertOneResult, ObjectId } from 'mongodb';
import { getPermission } from '../account/permissions';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { historyCollection } from '../database';
import { DbHistoryArticle, HistoryArticle } from '../schemas';

export const addHistoryArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 2)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		// Check if the video link is valid
		if (args.videoLink !== ``) {
			if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink) && args.videoLink !== ``) {
				// I KNOW THIS REGEX IS HORRIBLE!!!
				throw new UserInputError(`invalidVideoLink`);
			}
		}

		// Capture the timestamp
		let timestamp: number = new Date().getTime();

		let article: InsertOneResult<Document> = await historyCollection.insertOne({
			_id: new ObjectId(),
			title: args.title,
			content: args.content,
			date: timestamp,
			author: getUsernameFromToken(args.token),
			type: args.type,
			font: args.font,
			videoLink: args.videoLink
		});

		// Return everything
		return {
			id: article.insertedId.toString(),
			title: args.title,
			content: args.content,
			type: args.type,
			font: args.font,
			videoLink: args.videoLink
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

export const modifyHistoryArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 2)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		// Check if the video link is valid
		if (args.videoLink !== ``) {
			if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink)) {
				throw new UserInputError(`invalidVideoLink`);
			}
		}

		let originalArticle: DbHistoryArticle | undefined = <DbHistoryArticle | undefined> await historyCollection.findOne({ _id: new ObjectId(args.id) }).then(res => { return res; });
		if (originalArticle === undefined) {
			throw new UserInputError(`invalidHistoryId`);
		}

		// Modify the article
		const modifiedArticle: DbHistoryArticle = {
			_id: originalArticle?._id,
			title: args.title,
			content: args.content,
			date: originalArticle?.date || 0,
			author: getUsernameFromToken(args.token),
			type: args.type,
			font: args.font,
			videoLink: args.videoLink || ``
		};

		historyCollection.replaceOne({ _id: new ObjectId(args.id) }, modifiedArticle);

		return {
			id: args.id,
			title: args.title,
			content: args.content,
			type: args.type,
			font: args.font,
			videoLink: args.videoLink
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

export const removeHistoryArticle = async (parents: any, args: any, context: any, info: any) => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}
	if (!getPermission(args.token, 3)) {
		throw new ForbiddenError(`invalidPermissions`);
	}

	// Check if the article exists
	let article: DbHistoryArticle = <DbHistoryArticle> await historyCollection.findOne({ _id: new ObjectId(args.id) }).then(res => { return res; });
	if (article === undefined) {
		throw new UserInputError(`invalidHistoryId`);
	}

	historyCollection.deleteOne({ _id: new ObjectId(args.id) });

	// Return everything
	return {
		id: article._id,
		title: article.title,
		content: article.content
	}
}