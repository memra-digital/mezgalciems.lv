import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { articleCollection } from '../database';
import { uploadImg } from '../imgbb';
import { DbArticle } from '../schemas';

export const addArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		// Capture the timestamp
		let timestamp: number = new Date().getTime();

		// Get the article count
		let id: number = await articleCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
			if (res.length === 0) {
				return 0;
			} else {
				return parseInt(res[0]._id.toString()) + 1;
			}
		});

		// Upload the image
		let image: any = await uploadImg(args.image).then((res) => { return res; });

		articleCollection.insertOne({
			_id: new ObjectId(id.toString()),
			title: args.title,
			content: args.content,
			image: image.url,
			imageAlt: args.imageAlt,
			date: timestamp,
			edited: false,
			author: getUsernameFromToken(args.token)
		});

		return {
			id: id,
			title: args.title,
			content: args.content,
			imageAlt: args.imageAlt,
			edited: false
		}
	} catch (e: any) {
		console.log(e);
	}
}

export const modifyArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		let originalArticle: DbArticle | undefined;

		// Check if the article exists
		if (await articleCollection.find({ _id: args.id }).count() === 0) {
			throw new UserInputError(`invalidArticleId`);
		}

		originalArticle = <DbArticle | undefined> await articleCollection.findOne({ _id: args.id }).then(res => { return res; });

		// Modify the article
		const modifiedArticle: DbArticle = {
			_id: args.id,
			title: args.title,
			content: args.content,
			image: originalArticle?.image || ``,
			imageAlt: args.imageAlt,
			date: originalArticle?.date || 0,
			edited: true,
			author: getUsernameFromToken(args.token)
		};

		articleCollection.replaceOne({ _id: args.id }, modifiedArticle);

		return {
			id: args.id,
			title: args.title,
			content: args.content,
			imageAlt: args.imageAlt,
			edited: true
		}
	} catch (e: any) {
		console.log(e);
	}
}

export const removeArticle = async (parents: any, args: any, context: any, info: any) => {
	try {
		// Verify token
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}

		// Check if the article exists
		let article: DbArticle | undefined = <DbArticle | undefined> await articleCollection.findOne({ _id: args.id }).then(res => { return res; });
		if (article === undefined) {
			throw new UserInputError(`invalidArticleId`);
		}

		// Delete the article
		articleCollection.deleteOne({ _id: args.id });

		return {
			id: article._id,
			title: article.title,
			content: article.content,
			imageAlt: article.imageAlt,
			edited: article.edited
		}
	} catch (e: any) {
		console.log(e);
	}
}