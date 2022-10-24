import Express from 'express';
import cors from 'cors';

import { ApolloServer, gql } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { DocumentNode } from 'graphql';
import rateLimit from 'express-rate-limit';

import * as dotenv from 'dotenv';
dotenv.config();

import * as config from './config.json';
import { getArticle, getArticles } from './articles/queries';
import { getInformation } from './information/queries';
import { getHistoryArticle, getHistoryArticles } from './history/queries';
import { getAccounts, login } from './account/queries';
import { getStatistics } from './statistics/queries';
import { createArticle, editArticle, deleteArticle } from './articles/mutations';
import { editInformation } from './information/mutations';
import { createHistoryArticle, editHistoryArticle, deleteHistoryArticle } from './history/mutations';
import { registerPageView } from './statistics/mutations';
import { dbClient } from './database';
import { createAccount, changeAccountPassword, editAccount, deleteAccount } from './account/mutations';

console.log(`✅ Started mezgalciems.lv backend server!`);

const schema: string = readFileSync(`schema.graphql`).toString();
const typeDefs: DocumentNode = gql`${schema}`;

dbClient.connect().then(async () => {
	const resolvers: any = {
		Query: {
			articles: getArticles,
			article: getArticle,

			information: getInformation,

			historyArticles: getHistoryArticles,
			historyArticle: getHistoryArticle,

			login: login,

			statistics: getStatistics,

			accounts: getAccounts
		},
		Mutation: {
			createArticle: createArticle,
			editArticle: editArticle,
			deleteArticle: deleteArticle,

			editInformation: editInformation,

			createHistoryArticle: createHistoryArticle,
			editHistoryArticle: editHistoryArticle,
			deleteHistoryArticle: deleteHistoryArticle,

			registerPageView: registerPageView,

			createAccount: createAccount,
			editAccount: editAccount,
			changeAccountPassword: changeAccountPassword,
			deleteAccount: deleteAccount
		}
	};

	const server = new ApolloServer({
		typeDefs,
		resolvers
	});
	await server.start();

	const app = Express();
	app.use(cors());

	const limiter = rateLimit({
		windowMs: config.rateLimiting.window * 1000,
		max: config.rateLimiting.limit,
		standardHeaders: true
	});
	app.use(limiter);

	server.applyMiddleware({
		app,
		bodyParserConfig: {
			limit: config.fileSizeLimit
		}
	});

	await new Promise((resolve: any) => app.listen({ port: process.env.PORT || 4000 }, resolve));
	console.log(`🚀 Apollo Server playground ready at http://localhost:${process.env.PORT || 4000}${server.graphqlPath} !`);
}).catch((err) => {
	console.error(err);
});