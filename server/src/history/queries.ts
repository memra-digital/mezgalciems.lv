import { ApolloError } from 'apollo-server-express';
import { ObjectId, WithId } from 'mongodb';
import { historyCollection } from '../database';
import { DbHistoryArticle, HistoryArticle } from '../schemas';

interface GetHistoryArticlesArgs {}
interface GetHistoryArticlesReturn {
	articles: HistoryArticle[],
	totalArticles: number
}
export const getHistoryArticles = async (_parent: any, args: GetHistoryArticlesArgs, _context: any, _info: any): Promise<GetHistoryArticlesReturn> => {
	let totalArticles: number = 0;

	let articles: HistoryArticle[] = await historyCollection.find({}).sort({ _id: -1 }).toArray().then((res: any) => {
		totalArticles = res.length;

		let processed: HistoryArticle[] = [];
		for (let i = 0; i < res.length; i++) {
			processed.push({
				id: res[i]._id.toString(),
				title: res[i].title,
				content: res[i].content,
				preview: res[i].content.slice(0, 60),
				date: res[i].date,
				author: res[i].author,
				type: res[i].type,
				font: res[i].font,
				videoLink: res[i].videoLink
			});
		}

		return processed;
	});

	return {
		totalArticles,
		articles
	};
}

interface GetHistoryArticleArgs {
	id: string
}
export const getHistoryArticle = async (_parent: any, args: GetHistoryArticleArgs, _context: any, _info: any): Promise<HistoryArticle> => {
	let article: WithId<DbHistoryArticle> = <WithId<DbHistoryArticle>> await historyCollection.findOne({ _id: new ObjectId(args.id) });
	if (article === null) {
		throw new ApolloError(`unknown`);
	}

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
	};
}