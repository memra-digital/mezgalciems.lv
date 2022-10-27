import { AuthenticationError, UserInputError } from 'apollo-server-express';
import { hash, compare } from 'bcrypt';
import { InsertOneResult, WithId } from 'mongodb';
import { accountCollection } from '../database';
import { Account, DbAccount } from '../schemas';
import { getPermission } from './permissions';
import { createAccountToken, getUsernameFromToken, verifyAccountToken } from './tokens';

interface LoginArgs {
	username: string,
	password: string
}
interface LoginReturn {
	token: string,
	id: string,
	username: string,
	firstName: string,
	lastName: string,
	permissions: number
}
export const login = async (_parent: any, args: LoginArgs, _context: any, _info: any): Promise<LoginReturn> => {
	if (args.username.trim() === ``) {
		throw new UserInputError(`emptyUsername`);
	}
	if (args.password.trim() === ``) {
		throw new UserInputError(`emptyPassword`);
	}

	let shouldRegister: boolean = await accountCollection.find({}).toArray().then((res: any) => { return res.length === 0; });

	if (shouldRegister) {
		let hashedPwd: string = await hash(args.password, 10);

		let newAccount: InsertOneResult<Document> = await accountCollection.insertOne({
			username: args.username,
			password: hashedPwd,
			firstName: ``,
			lastName: ``,
			permissions: 255
		});

		return await {
			token: createAccountToken(args.username),
			id: newAccount.insertedId.toString(),
			username: args.username,
			firstName: ``,
			lastName: ``,
			permissions: 255
		};
	}

	let account: WithId<DbAccount> = <WithId<DbAccount>> await accountCollection.findOne({ username: args.username });
	let isPwdCorrect: boolean = await compare(args.password, account?.password ?? ``);

	if (account === null || !isPwdCorrect) {
		throw new AuthenticationError(`invalidUsernameOrPassword`);
	}

	return await {
		token: createAccountToken(account.username),
		id: account._id.toString(),
		username: account.username,
		firstName: account.firstName,
		lastName: account.lastName,
		permissions: account.permissions
	};
}

interface GetAccountsArgs {
	token: string
}
export const getAccounts = async (_parent: any, args: GetAccountsArgs, _context: any, _info: any): Promise<Account[]> => {
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