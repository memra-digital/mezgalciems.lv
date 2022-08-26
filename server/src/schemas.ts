export interface DbArticle {
    _id: number,
    title: string,
    content: string,
    date: number,
    edited: boolean,
    imageAlt: string,
    author: string,
    image: string
}
export interface Article {
    id: number,
    title: string,
    content: string,
    date: number,
    edited: boolean,
    imageAlt: string,
    author: string,
    image: string
}
export interface DbInformation {
    _id: number,
    nextDate: string,
    dateInfo: string,
    information: string
}
export interface DbHistoryArticle {
    _id: number,
    title: string,
    content: string,
    date: number,
    author: string,
    type: string,
    font: string,
    videoLink: string
}
export interface HistoryArticlePreview {
    id: number,
    title: string,
    preview: string,
    date: number,
    author: string,
    type: string,
    videoLink: string
}
export interface DbStatisticsLog {
    _id: number,
    time: number,
    page: string,
    user: string
}
export interface DbAccount {
    _id: number,
    username: string,
    name: string,
    lastName: string,
    password: string,
    permissions: number
}
export interface AccountToken {
    username: string
}