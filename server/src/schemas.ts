import { ObjectId } from 'mongodb';

export interface DbArticle {
	_id: ObjectId,
	title: string,
	content: string,
	date: number,
	edited: boolean,
	imageAlt: string,
	author: string,
	image: string
}
export interface Article {
	id: string,
	title: string,
	content: string,
	date: number,
	edited: boolean,
	imageAlt: string,
	author: string,
	image: string
}
export interface DbInformation {
	_id: ObjectId,
	nextDate: string,
	dateInfo: string,
	information: string
}
export interface DbHistoryArticle {
	_id: ObjectId,
	title: string,
	content: string,
	date: number,
	author: string,
	type: string,
	font: string,
	videoLink: string
}
export interface HistoryArticlePreview {
	id: string,
	title: string,
	preview: string,
	date: number,
	author: string,
	type: string,
	videoLink: string
}
export interface DbHistoryArticle {
	_id: ObjectId,
	title: string,
	content: string,
	date: number,
	author: string,
	type: string,
	font: string,
	videoLink: string
}
export interface HistoryArticle {
	id: ObjectId,
	title: string,
	content: string,
	date: number,
	author: string,
	type: string,
	font: string,
	videoLink: string
}
export interface DbStatisticsLog {
	_id: ObjectId,
	time: number,
	page: string,
	user: string
}
export interface DbAccount {
	username: string,
	firstName: string,
	lastName: string,
	password: string,
	permissions: number
}
export interface AccountToken {
	username: string
}
export interface Account {
	id: string,
	username: string,
	firstName: string,
	lastName: string,
	permissions: number
}