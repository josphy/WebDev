import { OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { ArticleClass } from './ArticleClass';
import { CommentClass } from './CommentClass';
import { BackendURL, options } from '../const';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ArticlesService {
  articles: ArticleClass[];

  private uploadHeaders = new Headers();
  private uploadOptions = { headers: this.uploadHeaders, withCredentials: true };

  constructor(private http: Http) { }

  //initialize get articles request
  initArticles() {
    return this.http.get(`${BackendURL}/articles`, options)
      .map(response => {
        this.articles = response.json().articles as ArticleClass[]
      });
  }

  //getter of articles
  getArticles(): ArticleClass[] {
    return this.articles;
  }

  //put new post
  post(newPost, newPic) {
    let data = new FormData();
    data.append("text", newPost);
    data.append("image", newPic);

    return this.http.post(`${BackendURL}/article`, data, this.uploadOptions)
      .map(res => {
        this.articles.unshift(res.json().articles[0] as ArticleClass);
      }, err => { console.log(err) })
  }

  //search article by keyword. allow vague search
  searchContent(articles, keyword) {
    articles = articles.filter(function(item) {
      return item.text.search(keyword) >= 0;
    });
    return articles;
  }

  //search article by author. allow multiple authors
  searchAuthor(articles, keywords) {
    var filtered = [];
    keywords.forEach((key) => {
      var results = articles.filter(function(item) {
        return item.author == key;
      });
      if (results.length > 0)
        results.forEach((result) => {
          filtered.push(result);
        });
    });

    return filtered;
  }

  //edit a displayed post
  editPost(id: string, content: string) {
    this.http.put(`${BackendURL}/articles/${id}`, { text: content }, options)
      .subscribe(res => {
        let currArticle = this.articles.filter(function(item) {
          return item._id == id;
        })[0];
        currArticle.text = content;
      }, err => { console.log(err) });
  }

  //post a new comment
  postComment(id: string, content: string) {
    this.http.put(`${BackendURL}/articles/${id}`, {
      text: content,
      commentId: '-1'
    }, options)
      .subscribe(res => {
        let currArticle = this.articles.filter(function(item) {
          return item._id == id;
        })[0];
        currArticle.comments = res.json().articles[0].comments as CommentClass[];
      }, err => { console.log(err) });
  }

  //edit an existing comment
  editComment(postID: string, commentID: string, content): void {
    this.http.put(`${BackendURL}/articles/${postID}`, {
      text: content,
      commentId: commentID
    }, options)
      .subscribe(res => {
        let currArticle = this.articles.filter(function(item) {
          return item._id == postID;
        })[0];
        currArticle.comments = res.json().articles[0].comments as CommentClass[];
      }, err => { console.log(err) });
  }

}
