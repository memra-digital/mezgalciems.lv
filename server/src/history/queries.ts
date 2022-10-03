import { ApolloError } from 'apollo-server-express';
import { historyCollection } from '../database';
import { HistoryArticlePreview, DbHistoryArticle } from '../schemas';

export const getHistoryArticles = async (parent: any, args: any, context: any, info: any) => {
	let totalArticles: number = 0;
	let totalPages: number = 0;

	let articles: HistoryArticlePreview[] = await historyCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
		totalArticles = res.length;

		let processed: HistoryArticlePreview[] = [];
		for (let i = 0; i < res.length; i++) {
			processed.push({
				id: parseInt(res[i]._id.toString()),
				title: res[i].title,
				preview: `${res[i].content.substr(0, 50)}`,
				date: res[i].date,
				author: res[i].author,
				type: res[i].type,
				videoLink: res[i].videoLink
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

export const getHistoryArticle = async (parent: any, args: any, context: any, info: any) => {
	let dbArticle: DbHistoryArticle | null = <DbHistoryArticle | null> await historyCollection.findOne({ _id: args.id });

	if (dbArticle === null) {
		throw new ApolloError(`unknown`);
	}

	return {
		id: parseInt(dbArticle._id.toString()),
		title: dbArticle.title,
		content: dbArticle.content,
		date: dbArticle.date,
		author: dbArticle.author,
		type: dbArticle.type,
		font: dbArticle.font,
		videoLink: dbArticle.videoLink
	};
}