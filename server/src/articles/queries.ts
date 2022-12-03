import { ApolloError } from 'apollo-server-express';
import { articleCollection } from '../database';
import { articlePageSize } from '../config.json';
import { Article, DbArticle } from '../schemas';
import { Document, ObjectId, WithId } from 'mongodb';

interface GetArticlesArgs {
	page: number
}
interface GetArticlesReturn {
	articles: Article[],
	totalArticles: number,
	totalPages: number,
	page: number
}
export const getArticles = async (_parent: any, args: GetArticlesArgs, _context: any, _info: any): Promise<GetArticlesReturn> => {
	let totalArticles: number = 0;
	let totalPages: number = 0;

	let articles: Article[] = await articleCollection.find().sort({ date: -1 }).toArray().then((res: WithId<Document>[]) => {
		totalArticles = res.length;
		totalPages = Math.ceil(res.length / articlePageSize);

		let processed: Article[] = [];
		for (let i: number = args.page * articlePageSize; i < Math.min(totalArticles, (args.page * articlePageSize + articlePageSize)); i++) {
			processed.push({
				id: res[i]._id.toString(),
				title: res[i].title,
				content: res[i].content,
				image: res[i].image,
				imageAlt: res[i].imageAlt,
				date: res[i].date,
				edited: res[i].edited,
				author: res[i].author
			});
		}
		return processed;
	});

	return {
		totalArticles,
		totalPages,
		page: args.page,
		articles
	};
}

interface GetArticleArgs {
	id: string
}
export const getArticle = async (_parent: any, args: GetArticleArgs, _context: any, _info: any): Promise<Article> => {
	let dbArticle: WithId<DbArticle> = <WithId<DbArticle>> await articleCollection.findOne({ _id: new ObjectId(args.id) });
	if (dbArticle === null) {
		throw new ApolloError(`unknown`);
	}

	return {
		id: dbArticle._id.toString(),
		title: dbArticle.title,
		content: dbArticle.content,
		image: dbArticle.image,
		imageAlt: dbArticle.imageAlt,
		date: dbArticle.date,
		edited: dbArticle.edited,
		author: dbArticle.author
	};
}