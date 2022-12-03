import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { WithId } from 'mongodb';
import { getPermission } from '../account/permissions';
import { verifyAccountToken } from '../account/tokens';
import { statisticsCollection } from '../database';
import { DbStatisticsLog } from '../schemas';

interface GetStatisticsArgs {
	token: string
}
interface GetStatisticsReturn {
	visitorsInLast7Days: number,
	visitorsToday: number,
	mostViewedPage?: string,
	mostViewedPageViews?: number,
	viewsInLast7Days: number,
	viewsToday: number,
	views6DaysAgo: number,
	views5DaysAgo: number,
	views4DaysAgo: number,
	views3DaysAgo: number,
	views2DaysAgo: number,
	viewsYesterday: number
}
export const getStatistics = async (_parent: any, args: GetStatisticsArgs, _context: any, _info: any): Promise<GetStatisticsReturn> => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new UserInputError(`invalidToken`);
		}
		if (!await getPermission(args.token, 5)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		let logs: WithId<DbStatisticsLog>[] = <WithId<DbStatisticsLog>[]> await statisticsCollection.find({}).sort({ _id: -1 }).toArray().then(res => { return res; });

		let logs6DaysAgo: WithId<DbStatisticsLog>[] = [];
		let logs5DaysAgo: WithId<DbStatisticsLog>[] = [];
		let logs4DaysAgo: WithId<DbStatisticsLog>[] = [];
		let logs3DaysAgo: WithId<DbStatisticsLog>[] = [];
		let logs2DaysAgo: WithId<DbStatisticsLog>[] = [];
		let logs1DayAgo: WithId<DbStatisticsLog>[] = [];
		let logsToday: WithId<DbStatisticsLog>[] = [];

		let pageViews: any = {};

		let usersToday: any = {};
		let usersInLast7Days: any = {};

		let timestampDate: Date = new Date();
		timestampDate.setHours(24);
		timestampDate.setMinutes(0);
		let timestamp: number = timestampDate.getTime();

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

		let mostViewedPage: string | undefined;
		let mostViewedPageViews: number | undefined;
		for (let i in pageViews) {
			if (mostViewedPageViews === undefined || pageViews[i] > mostViewedPageViews) {
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
		throw new ApolloError(`unknown`);
	}
}