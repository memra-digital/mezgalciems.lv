import { AuthenticationError } from 'apollo-server-express';
import { hash, compare } from 'bcrypt';
import { accountCollection } from '../database';
import { DbAccount } from '../schemas';
import { createAccountToken } from './tokens';

export const login = async (parent: any, args: any, context: any, info: any) => {
	let shouldRegister: boolean = await accountCollection.find({}).toArray().then((res: any) => { return res.length === 0; });

	if (shouldRegister) {
		let hashedPwd: string = await hash(args.password, 10).then((res: any) => { return res; });

		accountCollection.insertOne({
			username: args.username,
			password: hashedPwd,
			email: ``,
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