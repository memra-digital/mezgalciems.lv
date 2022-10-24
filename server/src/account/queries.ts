import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { hash, compare } from 'bcrypt';
import { accountCollection } from '../database';
import { Account, DbAccount } from '../schemas';
import { getPermission } from './permissions';
import { createAccountToken, getUsernameFromToken, verifyAccountToken } from './tokens';

export const login = async (parent: any, args: any, context: any, info: any) => {
	if (args.username.trim() === ``) {
		throw new UserInputError(`emptyUsername`);
	}
	if (args.password.trim() === ``) {
		throw new UserInputError(`emptyPassword`);
	}

	let shouldRegister: boolean = await accountCollection.find({}).toArray().then((res: any) => { return res.length === 0; });

	if (shouldRegister) {
		let hashedPwd: string = await hash(args.password, 10).then((res: any) => { return res; });

		accountCollection.insertOne({
			username: args.username,
			password: hashedPwd,
			firstName: ``,
			lastName: ``,
			permissions: 255
		});

		return await {
			token: createAccountToken(args.username)
		};
	}

	let account: DbAccount = await accountCollection.findOne({ username: args.username }).then((res: any) => { return res; });
	let isPwdCorrect: boolean = await compare(args.password, account?.password ?? ``).then((res: any) => { return res; });

	if (account === null || !isPwdCorrect) {
		throw new AuthenticationError(`invalidUsernameOrPassword`);
	}

	return await {
		token: createAccountToken(account.username)
	};
}

export const getAccounts = async (parent: any, args: any, context: any, info: any) => {
	if (!verifyAccountToken(args.token)) {
		throw new UserInputError(`invalidToken`);
	}
	
	let canSeeOtherAccounts: boolean = await getPermission(args.token, 4);

	let accounts: Account[] = await accountCollection.find({}).sort({ _id: -1 }).toArray().then(async (res) => {
		let processed: Account[] = [];

		for (let i: number = 0; i < res.length; i++) {
			if (canSeeOtherAccounts || res[i].username === getUsernameFromToken(args.token)) {
				processed.push({
					id: res[i]._id.toString(),
					username: res[i].username,
					firstName: res[i].firstName,
					lastName: res[i].lastName,
					permissions: res[i].permissions
				});
			}
		}

		return processed;
	});
	
	return accounts;
}