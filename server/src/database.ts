import * as dotenv from 'dotenv';
dotenv.config();

import { Collection, Db, MongoClient } from 'mongodb';

const dbUrl: string = process.env.DB_DEV_URL || process.env.DB_URL || ``;
const dbName: string = `mezgalciems-lv`;
export const dbClient: MongoClient = new MongoClient(dbUrl);

console.log(`💡 Connected to database at ${dbUrl}!`);

const db: Db = dbClient.db(dbName);
export const articleCollection: Collection = db.collection(`articles`);
export const infoCollection: Collection = db.collection(`information`);
export const historyCollection: Collection = db.collection(`history`);
export const accountCollection: Collection = db.collection(`accounts`);
export const statisticsCollection: Collection = db.collection(`statistics`);