import { CommentClass } from './CommentClass'

export class ArticleClass {
  _id: string;
  text: string;
  date: string;
  img: string;
  comments: CommentClass[];
  author: string;
}
