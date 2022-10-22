import * as dotenv from 'dotenv';
import { sign, verify, decode } from 'jsonwebtoken';
import { AccountToken } from '../schemas';

dotenv.config();
const jwtSecretKey: string = process.env.JWT_PRIVATE_KEY || ``;

export const createAccountToken = (username: string): string => {
	return sign({
		username,
		date: new Date().getTime()
	}, jwtSecretKey, { expiresIn: `365d` });
}

export const verifyAccountToken = (token: string): boolean => {
	try {
		verify(token, jwtSecretKey);

		return true;
	} catch (e: any) {
		console.error(e);

		return false;
	}
}

export const getUsernameFromToken = (token: string): string => {
	try {
		let decoded: AccountToken = <AccountToken>decode(token);
		
		return decoded?.username;
	} catch (e: any) {
		console.error(e);

		return ``;
	}
}