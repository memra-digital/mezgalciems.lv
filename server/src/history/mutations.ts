import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { historyCollection } from '../database';
import { DbHistoryArticle, HistoryArticle } from '../schemas';

export const addHistoryArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		// Check if the video link is valid
		if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink) && args.videoLink !== ``) {
			// I KNOW THIS REGEX IS HORRIBLE!!!
			throw new UserInputError(`invalidVideoLink`);
		}

		// Capture the timestamp
		let timestamp: number = new Date().getTime();

		// Get the article count
		let id: number  = await historyCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
			if (res.length === 0) {
				return 0;
			} else {
				return parseInt(res[0]._id.toString()) + 1;
			}
		});

		historyCollection.insertOne({
			_id: new ObjectId(id.toString()),
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
			id: id,
			title: args.title,
			content: args.content,
			type: args.type,
			font: args.font,
			videoLink: args.videoLink
		}
	} catch (e: any) {
		console.log(e);
	}
}

export const modifyHistoryArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		// Check if the article exists
		if (await historyCollection.find({ _id: args.id }).count() === 0) {
			throw new UserInputError(`invalidHistoryId`);
		}

		// Check if the code is valid
		if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink)) {
			throw new UserInputError(`invalidVideoLink`);
		}

		let originalArticle: DbHistoryArticle = <DbHistoryArticle> await historyCollection.findOne({ _id: args.id }).then(res => { return res; });

		// Modify the article
		const modifiedArticle: HistoryArticle = {
			id: parseInt(originalArticle?._id.toString()) || 0,
			title: args.title,
			content: args.content,
			date: originalArticle?.date || 0,
			author: getUsernameFromToken(args.token),
			type: args.type,
			font: args.font,
			videoLink: args.videoLink || ``
		};

		historyCollection.replaceOne({ _id: args.id }, modifiedArticle);

		// Return everything
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
	}
}

export const removeHistoryArticle = async (parents: any, args: any, context: any, info: any) => {
	// Verify token
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}

	// Check if the article exists
	let article: DbHistoryArticle = <DbHistoryArticle> await historyCollection.findOne({ _id: args.id }).then(res => { return res; });
	if (article === undefined) {
		throw new UserInputError(`invalidHistoryId`);
	}

	// Delete the article
	historyCollection.deleteOne({ _id: args.id });

	// Return everything
	return {
		id: article._id,
		title: article.title,
		content: article.content
	}
}