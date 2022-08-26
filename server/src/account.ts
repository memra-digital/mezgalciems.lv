import * as dotenv from 'dotenv';
dotenv.config();

import { sign, verify, decode } from 'jsonwebtoken';

import { AccountToken } from './schemas';

const jwtSecretKey: string = process.env.JWT_PRIVATE_KEY || ``;

export const createAccountToken = (username: string) => {
	let date: number = new Date().getTime();
	
	let token = sign({
		username,
		date
	}, jwtSecretKey, { expiresIn: `365d` });

	return token;
}

export const verifyAccountToken = (token: string) => {
	try {
		let decoded: AccountToken = <AccountToken>verify(token, jwtSecretKey);

		return true;
	} catch (e: any) {
		console.log(e);

		return false;
	}
}

export const getUsernameFromToken = (token: string) => {
	try {
		let decoded: AccountToken = <AccountToken>decode(token);
		
		return decoded?.username;
	} catch (e: any) {
		console.log(e);

		return ``;
	}
}