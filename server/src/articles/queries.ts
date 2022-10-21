import { ApolloError } from 'apollo-server-express';
import { articleCollection } from '../database';
import { articlePageSize } from '../config.json';
import { Article, DbArticle } from '../schemas';
import { ObjectId } from 'mongodb';

export const getArticles = async (parent: any, args: any, context: any, info: any) => {
	let totalArticles: number = 0;
	let totalPages: number = 0;

	let articles: Article[] = await articleCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
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

export const getArticle = async (parent: any, args: any, context: any, info: any) => {
	let article: DbArticle | null = <DbArticle | null> await articleCollection.findOne({ _id: new ObjectId(args.id) }).then(res => { return res; });

	if (article === null) {
		throw new ApolloError(`unknown`);
	}

	return article;
}