import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { InsertOneResult, ObjectId } from 'mongodb';
import { getPermission } from '../account/permissions';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { articleCollection } from '../database';
import { uploadImg } from '../imgbb';
import { DbArticle } from '../schemas';

export const addArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 0)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		let timestamp: number = new Date().getTime();

		let image: any = await uploadImg(args.image).then((res) => { return res; });

		let article: InsertOneResult<Document> = await articleCollection.insertOne({
			title: args.title,
			content: args.content,
			image: image.url,
			imageAlt: args.imageAlt,
			date: timestamp,
			edited: false,
			author: getUsernameFromToken(args.token)
		});

		return {
			id: article.insertedId.toString(),
			title: args.title,
			content: args.content,
			imageAlt: args.imageAlt,
			edited: false
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

export const modifyArticle = async (parent: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 0)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		let originalArticle: DbArticle | undefined = <DbArticle | undefined> await articleCollection.findOne({ _id: new ObjectId(args.id) }).then(res => { return res; });
		if (originalArticle === undefined) {
			throw new UserInputError(`invalidArticleId`);
		}

		// Modify the article
		const modifiedArticle: DbArticle = {
			_id: new ObjectId(args.id),
			title: args.title,
			content: args.content,
			image: originalArticle?.image || ``,
			imageAlt: args.imageAlt,
			date: originalArticle?.date || 0,
			edited: true,
			author: getUsernameFromToken(args.token)
		};

		articleCollection.replaceOne({ _id: new ObjectId(args.id) }, modifiedArticle);

		return {
			id: args.id,
			title: args.title,
			content: args.content,
			imageAlt: args.imageAlt,
			edited: true
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

export const removeArticle = async (parents: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!getPermission(args.token, 3)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		// Check if the article exists
		let article: DbArticle | undefined = <DbArticle | undefined> await articleCollection.findOne({ _id: new ObjectId(args.id) }).then(res => { return res; });
		if (article === undefined) {
			throw new UserInputError(`invalidArticleId`);
		}

		// Delete the article
		articleCollection.deleteOne({ _id: new ObjectId(args.id) });

		return {
			id: args.id,
			title: article.title,
			content: article.content,
			imageAlt: article.imageAlt,
			edited: article.edited
		}
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}