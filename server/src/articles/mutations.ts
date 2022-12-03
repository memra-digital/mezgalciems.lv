import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { InsertOneResult, ObjectId, WithId } from 'mongodb';
import { getPermission } from '../account/permissions';
import { verifyAccountToken, getUsernameFromToken } from '../account/tokens';
import { accountCollection, articleCollection } from '../database';
import { uploadImg } from '../imgbb';
import { Article, DbAccount, DbArticle } from '../schemas';

interface CreateArticleArgs {
	token: string,
	title: string,
	content: string,
	image: string,
	imageAlt: string
}
export const createArticle = async (_parent: any, args: CreateArticleArgs, _context: any, _info: any): Promise<Article> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 0)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		if (args.title.trim() === ``) {
			throw new UserInputError(`emptyTitle`);
		}
		if (args.content.trim() === ``) {
			throw new UserInputError(`emptyContent`);
		}
		if (args.image.trim() === ``) {
			throw new UserInputError(`noImage`);
		}
		if (args.imageAlt.trim() === ``) {
			throw new UserInputError(`emptyAlt`);
		}

		let timestamp: number = new Date().getTime();

		let image: any = await uploadImg(args.image).then((res) => { return res; }).catch((err) => { throw new ApolloError(`imgUploadFailed`); });

		let account: WithId<DbAccount> = <WithId<DbAccount>> await accountCollection.findOne({ username: getUsernameFromToken(args.token) });

		let article: InsertOneResult<Document> = await articleCollection.insertOne({
			title: args.title,
			content: args.content,
			image: image.url,
			imageAlt: args.imageAlt,
			date: timestamp,
			edited: false,
			author: `${account.firstName} ${account.lastName}`
		});

		return {
			id: article.insertedId.toString(),
			title: args.title,
			content: args.content,
			image: image.url,
			imageAlt: args.imageAlt,
			date: timestamp,
			edited: false,
			author: `${account.firstName} ${account.lastName}`
		};
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

interface EditArticleArgs {
	token: string,
	id: string,
	title: string,
	content: string,
	imageAlt: string
}
export const editArticle = async (_parent: any, args: EditArticleArgs, _context: any, _info: any): Promise<Article> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 0)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		if (args.title.trim() === ``) {
			throw new UserInputError(`emptyTitle`);
		}
		if (args.content.trim() === ``) {
			throw new UserInputError(`emptyContent`);
		}
		if (args.imageAlt.trim() === ``) {
			throw new UserInputError(`emptyAlt`);
		}

		let originalArticle: WithId<DbArticle> = <WithId<DbArticle>> await articleCollection.findOne({ _id: new ObjectId(args.id) });
		if (originalArticle === null) {
			throw new UserInputError(`invalidArticleId`);
		}

		// Create a list of the accounts that have written this article
		let account: WithId<DbAccount> = <WithId<DbAccount>> await accountCollection.findOne({ username: getUsernameFromToken(args.token) });
		let authorList: string[] = originalArticle.author.split(` & `);
		let currentAuthorName: string = `${account.firstName} ${account.lastName}`;
		if (!authorList.includes(currentAuthorName)) {
			authorList.push(currentAuthorName);
		}

		const modifiedArticle: WithId<DbArticle> = {
			_id: new ObjectId(args.id),
			title: args.title,
			content: args.content,
			image: originalArticle.image,
			imageAlt: args.imageAlt,
			date: originalArticle.date,
			edited: true,
			author: authorList.join(` & `)
		};

		articleCollection.replaceOne({ _id: new ObjectId(args.id) }, modifiedArticle);

		return {
			id: args.id,
			title: modifiedArticle.title,
			content: modifiedArticle.content,
			image: modifiedArticle.image,
			imageAlt: modifiedArticle.imageAlt,
			date: modifiedArticle.date,
			edited: modifiedArticle.edited,
			author: modifiedArticle.author
		};
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}

interface DeleteArticleArgs {
	token: string,
	id: string
}
export const deleteArticle = async (_parents: any, args: DeleteArticleArgs, _context: any, _info: any): Promise<Article> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new ForbiddenError(`invalidToken`);
		}
		if (!await getPermission(args.token, 3)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		// Check if the article exists
		let article: WithId<DbArticle> = <WithId<DbArticle>> await articleCollection.findOne({ _id: new ObjectId(args.id) });
		if (article === null) {
			throw new UserInputError(`invalidArticleId`);
		}

		// Delete the article
		articleCollection.deleteOne({ _id: new ObjectId(args.id) });

		return {
			id: args.id,
			title: article.title,
			content: article.content,
			image: article.image,
			imageAlt: article.imageAlt,
			date: article.date,
			edited: article.edited,
			author: article.author
		};
	} catch (e: any) {
		console.log(e);
		throw new ApolloError(`unknown`);
	}
}