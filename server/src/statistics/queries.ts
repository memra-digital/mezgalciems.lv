import { ForbiddenError, UserInputError } from 'apollo-server-express';
import { getPermission } from '../account/permissions';
import { verifyAccountToken } from '../account/tokens';
import { statisticsCollection } from '../database';
import { DbStatisticsLog } from '../schemas';

export const getStatistics = async (parent: any, args: any, context: any, info: any) => {
	try {
		if (!verifyAccountToken(args.token)) {
			throw new UserInputError(`invalidToken`);
		}
		if (!await getPermission(args.token, 5)) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		let logs: DbStatisticsLog[] = <DbStatisticsLog[]> await statisticsCollection.find({}).sort({ _id: -1 }).toArray().then(res => { return res; });

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