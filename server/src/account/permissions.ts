import { decode } from 'jsonwebtoken';
import { accountCollection } from '../database';
import { AccountToken, DbAccount } from '../schemas';

/*
	0 - Add/modify articles
	1 - Modify information
	2 - Add/modify history
	3 - Delete articles/history
	4 - View/add/modify/delete others' accounts, change everyone's permissions
	5 - View statistics
*/
export const getPermission = async (token: string, perm: number) => {
	try {
		let username = (<AccountToken>decode(token)).username;
		let account: DbAccount = await accountCollection.findOne({ username }).then((res: any) => { return res; });
		if (account === null) {
			return false;
		}

		let permCheckNum;
		switch (perm) {
			case 0:
				permCheckNum = 128;
				break;
			case 1:
				permCheckNum = 64;
				break;
			case 2:
				permCheckNum = 32;
				break;
			case 3:
				permCheckNum = 16;
				break;
			case 4:
				permCheckNum = 8;
				break;
			case 5:
				permCheckNum = 4;
				break;
			default:
				permCheckNum = 0;
				break;
		}

		return (account.permissions & permCheckNum) === permCheckNum;
	} catch (e: any) {
		console.error(e);

		return false;
	}
}