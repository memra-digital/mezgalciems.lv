import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const dbUrl: string = process.env.DB_DEV_URL || ``;
const dbName: string = `mezgalciems-lv`;
const client: MongoClient = new MongoClient(dbUrl);