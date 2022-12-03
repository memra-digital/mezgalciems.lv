import { ApolloError, ForbiddenError, UserInputError } from 'apollo-server-express';
import { compare, hash } from 'bcrypt';
import { Document, InsertOneResult, ObjectId, WithId } from 'mongodb';
import { accountCollection } from '../database';
import { Account, DbAccount } from '../schemas';
import { getPermission } from './permissions';
import { getUsernameFromToken, verifyAccountToken } from './tokens';

const validateAccount = (args: CreateAccountArgs | EditAccountArgs): void => {
	if (args.username.trim() === ``) {
		throw new UserInputError(`emptyUsername`);
	}
	if (args.firstName.trim() === ``) {
		throw new UserInputError(`emptyFirstName`);
	}
	if (args.lastName.trim() === ``) {
		throw new UserInputError(`emptyLastName`);
	}
	if (args.permissions > 255 || args.permissions < 0) {
		throw new UserInputError(`invalidPermissions`);
	}
}

interface CreateAccountArgs {
	token: string,
	username: string,
	password: string,
	firstName: string,
	lastName: string,
	permissions: number
}
export const createAccount = async (_parent: any, args: CreateAccountArgs, _context: any, _info: any): Promise<Account> => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}
	if (!await getPermission(args.token, 4)) {
		throw new ForbiddenError(`invalidPermissions`);
	}

	validateAccount(args);
	if (args.password.trim() === ``) {
		throw new UserInputError(`emptyPassword`);
	}

	let account: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ username: args.username });
	if (account !== null) {
		throw new UserInputError(`accountAlreadyExists`);
	}
	
	let hashedPwd: string = await hash(args.password, 10);

	let newAccount: InsertOneResult<Document> = await accountCollection.insertOne({
		username: args.username,
		password: hashedPwd,
		firstName: args.firstName,
		lastName: args.lastName,
		permissions: args.permissions
	});

	return {
		id: newAccount.insertedId.toString(),
		username: args.username,
		firstName: args.firstName,
		lastName: args.lastName,
		permissions: args.permissions
	}
}

interface EditAccountArgs {
	token: string,
	id: string,
	username: string,
	firstName: string,
	lastName: string,
	permissions: number
}
export const editAccount = async (_parent: any, args: EditAccountArgs, _context: any, _info: any): Promise<Account> => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}

	if ((args.id.length !== 24 && args.id.length !== 48) || !/[0-9a-fA-F]+/.test(args.id)) {
		throw new UserInputError(`invalidAccountId`);
	}

	let accountToChange: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ _id: new ObjectId(args.id) });

	if (!await getPermission(args.token, 4)) {
		let account: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ username: getUsernameFromToken(args.token) });
		if (account === null) throw new ApolloError(`unknown`);

		if (accountToChange === null || account._id.toString() !== args.id) {
			throw new ForbiddenError(`invalidPermissions`);
		}

		if (args.permissions !== accountToChange.permissions) {
			throw new ForbiddenError(`invalidPermissions`);
		}
	}

	if (accountToChange === null) {
		throw new UserInputError(`invalidAccountId`); // We throw this error after invalidPermissions so that no one can start guessing random ID's unless they have perm 4
	}

	validateAccount(args);

	// If an account with the specified username exists and it isn't this account itself, throw an error
	let accountWithUsername: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ username: args.username });
	if (accountWithUsername !== null && accountWithUsername._id.toString() !== accountToChange._id.toString()) {
		throw new UserInputError(`accountAlreadyExists`);
	}

	const modifiedAccount: WithId<DbAccount> = {
		_id: new ObjectId(args.id),
		username: args.username,
		password: accountToChange.password,
		firstName: args.firstName,
		lastName: args.lastName,
		permissions: args.permissions
	};

	accountCollection.replaceOne({ _id: new ObjectId(args.id) }, modifiedAccount);

	return {
		id: args.id,
		username: args.username,
		firstName: args.firstName,
		lastName: args.lastName,
		permissions: args.permissions
	}
}

interface ChangeAccountPasswordArgs {
	token: string,
	oldPassword: string,
	newPassword: string
}
export const changeAccountPassword = async (_parent: any, args: ChangeAccountPasswordArgs, _context: any, _info: any): Promise<Account> => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}

	if (args.oldPassword.trim() === ``) {
		throw new UserInputError(`emptyOldPassword`);
	}
	if (args.newPassword.trim() === ``) {
		throw new UserInputError(`emptyNewPassword`);
	}

	let account: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ username: getUsernameFromToken(args.token) });
	if (account === null) {
		throw new UserInputError(`invalidAccount`);
	}

	let isOldPwdCorrect: boolean = await compare(args.oldPassword, account.password);
	if (!isOldPwdCorrect) {
		throw new UserInputError(`invalidOldPassword`);
	}

	let hashedPwd: string = await hash(args.newPassword, 10);

	const modifiedAccount: WithId<DbAccount> = {
		_id: account._id,
		username: account.username,
		password: hashedPwd,
		firstName: account.firstName,
		lastName: account.lastName,
		permissions: account.permissions
	};

	accountCollection.replaceOne({ _id: new ObjectId(account._id) }, modifiedAccount);

	return {
		id: account._id.toString(),
		username: account.username,
		firstName: account.firstName,
		lastName: account.lastName,
		permissions: account.permissions
	}
}

interface DeleteAccountArgs {
	token: string,
	id: string
}
export const deleteAccount = async (_parent: any, args: DeleteAccountArgs, _context: any, _info: any): Promise<Account> => {
	if (!verifyAccountToken(args.token)) {
		throw new ForbiddenError(`invalidToken`);
	}

	if ((args.id.length !== 24 && args.id.length !== 48) || /[0-9a-fA-F]+/.test(args.id)) {
		throw new UserInputError(`invalidAccountId`);
	}

	let account: WithId<DbAccount> | null = <WithId<DbAccount>> await accountCollection.findOne({ _id: new ObjectId(args.id) });

	if (!await getPermission(args.token, 4)) {
		if (account === null || account._id.toString() !== args.id) {
			throw new ForbiddenError(`invalidPermissions`);
		}
	}

	if (account === null) {
		throw new UserInputError(`invalidAccountId`);
	}

	accountCollection.deleteOne({ _id: new ObjectId(args.id) });

	return {
		id: args.id,
		username: account.username,
		firstName: account.firstName,
		lastName: account.lastName,
		permissions: account.permissions
	}
}