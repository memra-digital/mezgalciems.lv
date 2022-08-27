import Express from 'express';
import cors from 'cors';

import { ApolloServer, gql } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { Collection, Db, MongoClient } from 'mongodb';
import { compare, hash } from 'bcrypt';
import { DocumentNode } from 'graphql';
import rateLimit from 'express-rate-limit';

import * as dotenv from 'dotenv';
dotenv.config();

import { articlePageSize } from './globals';
import { createAccountToken, getUsernameFromToken, verifyAccountToken } from './account';
import { uploadImg } from './imgbb';
import type { DbAccount, DbArticle, Article, DbHistoryArticle, DbInformation, HistoryArticlePreview, DbStatisticsLog, HistoryArticle } from './schemas';

console.log(`✅ Started mezgalciems.lv backend server!`);

const schema: string = readFileSync(`schema.graphql`).toString();
const typeDefs: DocumentNode = gql`${schema}`;

const dbUrl: string = process.env.DB_URL || ``;
const dbName: string = `mezgalciems-lv`;
const client: MongoClient = new MongoClient(dbUrl, { useUnifiedTopology: true });

client.connect(async (err) => {
	if (err) throw err;

	console.log(`💡 Connected to database at ${dbUrl}!`);

	const db: Db = client.db(dbName);
	const articleCollection: Collection = db.collection(`articles`);
	const infoCollection: Collection = db.collection(`information`);
	const historyCollection: Collection = db.collection(`history`);
	const accountCollection: Collection = db.collection(`accounts`);
	const statisticsCollection: Collection = db.collection(`statistics`);

	const resolvers = {
		Query: {
			articles: async (parent: any, args: any, context: any, info: any) => {
				let totalArticles: number = 0;
				let totalPages: number = 0;

				let articles: Article[] = await articleCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
					totalArticles = res.length;
					totalPages = Math.ceil(res.length / articlePageSize);

					let processed: Article[] = [];
					for (let i: number = args.page * articlePageSize; i < Math.min(totalArticles, (args.page * articlePageSize + articlePageSize)); i++) {
						processed.push({
							id: res[i]._id,
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
			},
			article: async (parent: any, args: any, context: any, info: any) => {
				let article: DbArticle = await articleCollection.findOne({ _id: args.id }).then(res => { return res; });
				return article;
			},

			information: async () => {
				let information: DbInformation = await infoCollection.findOne({}).then(res => { return res; });
				return information;
			},

			historyArticles: async (parent: any, args: any, context: any, info: any) => {
				let totalArticles: number = 0;
				let totalPages: number = 0;

				let articles: HistoryArticlePreview[] = await historyCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
					totalArticles = res.length;

					let processed: HistoryArticlePreview[] = [];
					for (let i = 0; i < res.length; i++) {
						processed.push({
							id: res[i]._id,
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
			},
			historyArticle: async (parent: any, args: any, context: any, info: any) => {
				let article: HistoryArticle = await historyCollection.findOne({ _id: args.id }).then(res => { return {
					id: res._id,
					title: res.title,
					content: res.content,
					date: res.date,
					author: res.author,
					type: res.type,
					font: res.font,
					videoLink: res.videoLink
				}});
				return article;
			},

			login: async (parent: any, args: any, context: any, info: any) => {
				let shouldRegister: boolean = await accountCollection.find({}).toArray().then((res: any) => { return res.length === 0; });

				if (shouldRegister) {
					let hashedPwd: string = await hash(args.password, 10).then((res: any) => { return res; });
					
					accountCollection.insertOne({
						_id: 0,
						username: args.username,
						password: hashedPwd,
						email: ``,
						firstName: ``,
						lastName: ``,
						permissions: 63
					});

					return await {
						error: ``,
						token: createAccountToken(args.username)
					};
				}

				let account: DbAccount = await accountCollection.findOne({ username: args.username }).then((res: any) => { return res; });

				if (account === null) {
					return {
						error: `usernameNotFound`,
						token: ``
					};
				}

				let pwdIsCorrect: boolean = await compare(args.password, account.password).then((res: any) => { return res; });

				if (!pwdIsCorrect) {
					return {
						error: `pwdNotCorrect`,
						token: ``
					};
				}

				return await {
					error: ``,
					token: createAccountToken(account.username)
				};
			},

			statistics: async (parent: any, args: any, context: any, info: any) => {
				try {
					// Verify token
					if (!verifyAccountToken(args.token)) {
						throw new Error(`Invalid token!`);
					}

					let logs: DbStatisticsLog[] = await statisticsCollection.find({}).sort({ _id: -1 }).toArray().then(res => { return res; });

					let logs6DaysAgo: DbStatisticsLog[] = [];
					let logs5DaysAgo: DbStatisticsLog[] = [];
					let logs4DaysAgo: DbStatisticsLog[] = [];
					let logs3DaysAgo: DbStatisticsLog[] = [];
					let logs2DaysAgo: DbStatisticsLog[] = [];
					let logs1DayAgo: DbStatisticsLog[] = [];
					let logsToday: DbStatisticsLog[] = [];
					
					let pageViews: any = {};

					let usersToday: any = {};
					let usersInLast7Days: any = {};

					let timestamp: number = Date.now();

					for (let i: number = 0; i < logs.length; i++) {
						switch (Math.floor((timestamp - logs[i].time) / 1000 / 60 / 60 / 24)) {
							case 0:
								logsToday.push(logs[i]);

								if (logs[i].user !== ``) {
									if (usersToday[logs[i].user] === undefined) {
										usersToday[logs[i].user] = 1;
									} else {
										usersToday[logs[i].user] += 1;
									}
								}

								break;
							case 1:
								logs1DayAgo.push(logs[i]);
								break;
							case 2:
								logs2DaysAgo.push(logs[i]);
								break;
							case 3:
								logs3DaysAgo.push(logs[i]);
								break;
							case 4:
								logs4DaysAgo.push(logs[i]);
								break;
							case 5:
								logs5DaysAgo.push(logs[i]);
								break;
							case 6:
								logs6DaysAgo.push(logs[i]);
								break;
							default:
								statisticsCollection.deleteOne({ _id: logs[i]._id });
								break;
						}

						if (pageViews[logs[i].page] === undefined) {
							pageViews[logs[i].page] = 1;
						} else {
							pageViews[logs[i].page] += 1;
						}

						if (logs[i].user !== ``) {
							if (usersInLast7Days[logs[i].user] === undefined) {
								usersInLast7Days[logs[i].user] = 1;
							} else {
								usersInLast7Days[logs[i].user] += 1;
							}
						}
					}

					let viewsInLast7Days: number = logs6DaysAgo.length + logs5DaysAgo.length + logs4DaysAgo.length + logs3DaysAgo.length + logs2DaysAgo.length + logs1DayAgo.length + logsToday.length;

					let mostViewedPage: string = ``;
					let mostViewedPageViews: number = 0;
					for (let i in pageViews) {
						if (pageViews[i] > mostViewedPageViews) {
							mostViewedPage = i;
							mostViewedPageViews = pageViews[i];
						}
					}

					// Return everything
					return {
						visitorsInLast7Days: Object.keys(usersInLast7Days).length,
						visitorsToday: Object.keys(usersToday).length,
					
						mostViewedPage,
						mostViewedPageViews,
					
						viewsInLast7Days,
						viewsToday: logsToday.length,
						views6DaysAgo: logs6DaysAgo.length,
						views5DaysAgo: logs5DaysAgo.length,
						views4DaysAgo: logs4DaysAgo.length,
						views3DaysAgo: logs3DaysAgo.length,
						views2DaysAgo: logs2DaysAgo.length,
						viewsYesterday: logs1DayAgo.length
					}
				} catch (e: any) {
					console.log(e);
				}
			}
		},

		Mutation: {
			addArticle: async (parent: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}

					let id: number | undefined;
					let timestamp: number | undefined;

					if (error === ``) {
						// Capture the timestamp
						timestamp = new Date().getTime();

						// Get the article count
						id = await articleCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
							if (res.length === 0) {
								return 0;
							} else {
								return res[0]._id + 1;
							}
						});

						// Upload the image
						let image: any = await uploadImg(args.image).then((res) => { return res; });

						articleCollection.insertOne({
							_id: id,
							title: args.title,
							content: args.content,
							image: image.url,
							imageAlt: args.imageAlt,
							date: timestamp,
							edited: false,
							author: getUsernameFromToken(args.token)
						});
					}

					// Return everything
					return {
						error,
						id: id,
						title: args.title,
						content: args.content,
						imageAlt: args.imageAlt,
						edited: false
					}
				} catch (e: any) {
					console.log(e);
				}	
			},
			modifyArticle: async (parent: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}

					let originalArticle: DbArticle | undefined;

					// Check if the article exists
					if (await articleCollection.find({ _id: args.id }).count() === 0) {
						error = `couldntFind`;
					}

					if (error === ``) {
						originalArticle = await articleCollection.findOne({ _id: args.id }).then(res => { return res; });

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
					}

					// Return everything
					return {
						error,
						id: args.id || 0,
						title: args.title || ``,
						content: args.content || ``,
						imageAlt: args.imageAlt || ``,
						edited: true
					}
				} catch (e: any) {
					console.log(e);
				}
			},
			removeArticle: async (parents: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}
					
					// Check if the article exists
					let article: DbArticle | undefined;
					if (await articleCollection.find({ _id: args.id }).count() === 0) {
						error = `couldntFind`;
					}
					
					if (error === ``) {
						article = await articleCollection.findOne({ _id: args.id }).then(res => { return res; });
					
						// Delete the article
						articleCollection.deleteOne({ _id: args.id });
					}
					
					// Return everything
					return {
						error,
						id: article?._id || 0,
						title: article?.title || ``,
						content: article?.content || ``,
						imageAlt: article?.imageAlt || ``,
						edited: article?.edited || false
					}
				} catch (e: any) {
					console.log(e);
				}
			},

			modifyInformation: async (parents: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}

					if (error === ``) {
						// Modify the information
						const modifiedInformation: DbInformation = {
							_id: 0,
							nextDate: args.nextDate,
							dateInfo: args.dateInfo,
							information: args.information
						};

						infoCollection.replaceOne({ _id: 0 }, modifiedInformation);
					}

					// Return everything
					return {
						error,
						nextDate: args.nextDate,
						dateInfo: args.dateInfo,
						information: args.information
					}
				} catch (e: any) {
					console.log(e);
				}
			},

			addHistoryArticle: async (parent: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}

					// Check if the code is valid
					if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink) && args.videoLink !== ``) {
						// I KNOW THIS REGEX IS HORRIBLE!!! Whatcha gonna do? Poop your pants? Go cry to your mommy
						error = `invalidVideoLink`;
					}

					let id: number | undefined;
					let timestamp: number | undefined;

					if (error === ``) {
						// Capture the timestamp
						timestamp = new Date().getTime();

						// Get the article count
						id = await historyCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
							if (res.length === 0) {
								return 0;
							} else {
								return res[0]._id + 1;
							}
						});

						historyCollection.insertOne({
							_id: id,
							title: args.title,
							content: args.content,
							date: timestamp,
							author: getUsernameFromToken(args.token),
							type: args.type,
							font: args.font,
							videoLink: args.videoLink
						});
					}

					// Return everything
					return {
						error,
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
			},
			modifyHistoryArticle: async (parent: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}

					let originalArticle: DbHistoryArticle | undefined;

					// Check if the article exists
					if (await historyCollection.find({ _id: args.id }).count() === 0) {
						error = `couldntFind`;
					}

					// Check if the code is valid
					if (!/([a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_][a-zA-Z0-9-_])/gi.test(args.videoLink)) {
						error = `invalidVideoLink`;
					}

					if (error === ``) {
						originalArticle = await historyCollection.findOne({ _id: args.id }).then(res => { return res; });

						// Modify the article
						const modifiedArticle: HistoryArticle = {
							id: originalArticle?._id || 0,
							title: args.title,
							content: args.content,
							date: originalArticle?.date || 0,
							author: getUsernameFromToken(args.token),
							type: args.type,
							font: args.font,
							videoLink: args.videoLink || ``
						};

						historyCollection.replaceOne({ _id: args.id }, modifiedArticle);
					}

					// Return everything
					return {
						error,
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
			},
			removeHistoryArticle: async (parents: any, args: any, context: any, info: any) => {
				try {
					let error: string = ``;

					// Verify token
					if (!verifyAccountToken(args.token)) {
						error = `invalidToken`;
					}
					
					// Check if the article exists
					let article: DbHistoryArticle | undefined;
					if (await historyCollection.find({ _id: args.id }).count() === 0) {
						error = `couldntFind`;
					}
					
					if (error === ``) {
						article = await historyCollection.findOne({ _id: args.id }).then(res => { return res; });
					
						// Delete the article
						historyCollection.deleteOne({ _id: args.id });
					}
					
					// Return everything
					return {
						error,
						id: article?._id || 0,
						title: article?.title || ``,
						content: article?.content || ``
					}
				} catch (e: any) {
					console.log(e);
				}
			},

			registerPageView: async (parents: any, args: any, context: any, info: any) => {
				try {
					// Get the stastistics log count
					const id: number = await statisticsCollection.find({}).sort({ _id: -1 }).toArray().then(res => {
						if (res.length === 0) {
							return 0;
						} else {
							return res[0]._id + 1;
						}
					});

					// Log the page view
					statisticsCollection.insertOne({
						_id: id,
						time: Date.now(),
						page: args.page,
						user: args.user
					});
					
					return true;
				} catch (e: any) {
					console.log(e);
				}
			}

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
		windowMs: 60000,
		max: 100,
		standardHeaders: true
	});
	app.use(limiter);

	server.applyMiddleware({
		app,
		bodyParserConfig: {
			limit: 2097152
		}
	});

	await new Promise((resolve: any) => app.listen({ port: process.env.PORT || 4000 }, resolve));
	console.log(`🚀 Apollo Server playground ready at http://localhost:${process.env.PORT || 4000}${server.graphqlPath} !`);
});


/*

Permission integer:

1. - Add/edit articles
2. - Modify information
3. - Add/edit history
4. - Delete articles/history
5. - Add/modify new accounts
6. - View statistics
*/
