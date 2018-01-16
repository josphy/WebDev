import { Component, OnInit } from '@angular/core';
import { ArticlesService } from '../article/articles.service';
import { ArticleClass } from '../article/ArticleClass';
import { FollowingsService } from './followings.service'
import { FollowingClass } from './FollowingClass';
import { ProfileService } from '../profile/profile.service';
import { ProfileClass } from '../profile/ProfileClass';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  articles: ArticleClass[];
  followings: FollowingClass[];
  profile: ProfileClass;

  newPost: string;
  showComment: boolean;
  followingAlert: string;

  constructor(private articleServ: ArticlesService,
    private followingServ: FollowingsService,
    private profileServ: ProfileService) {
  }

  ngOnInit() {
    this.getProfile();
    this.initFollowings();
    this.initArticles();
    this.newPost = "Enter New Post Here.";
    this.followingAlert = "";
  }

  //log out
  logout() {
    this.profileServ.logout();
  }

  //fetch articles from backend
  initArticles(): void {
    this.articleServ.initArticles().subscribe(res => {
      this.getArticles();
    })
  }

  //get articles saved in service
  getArticles(): void {
    this.articles = this.articleServ.getArticles();
  }

  //fetch followings information from backend
  initFollowings(): void {
    this.followingServ.initFollowings().subscribe((res) => {
      this.getFollowings();
    })
  }

  //get followings from service
  getFollowings(): void {
    this.followings = this.followingServ.getFollowings();
  }

  //get profile from service
  getProfile(): void {
    this.profile = this.profileServ.getProfile();
    if (this.profile.name == "") this.profileServ.initProfile().subscribe(res=>{
      this.profile = this.profileServ.getProfile();
    })
  }

  //execute status update by changing profile
  updateStatus(newStatus: string): void {
    this.profileServ.updateStatus(newStatus);
  }

  //add a new post into the beginning of current articles
  post(newPost, newPic): void {
    this.articleServ.post(newPost, newPic[0])
      .subscribe(res => {
        this.getArticles();
      }, err => { console.log(err) });
    this.newPost = "";
  }

  //clear the post box
  clearPost(): void {
    this.newPost = "";
  }

  //add a following user by inserting a new following into current following
  addFollowing(newFollowing: string): void {
    this.followingServ.addFollowing(newFollowing)
      .subscribe(result => {
        this.followingAlert = "follow success";
        this.getArticles();
      }, error => {
        this.followingAlert = "no existing user";
      });
  }

  //delete a following by id
  unfollow(id: string): void {
    this.followingServ.unfollow(id)
      .subscribe(res => {
        this.getFollowings();
        this.getArticles();
      });
  }

  //filter posts by author
  searchAuthor(keyword: string): void {
    this.articles = this.articleServ.searchAuthor(this.articles, [keyword]);
  }

  //filter posts by text content
  searchContent(keyword: string): void {
    this.articles = this.articleServ.searchContent(this.articles, keyword);
  }

  //edit displayed post
  editPost(id: string, content: string): void {
    this.articleServ.editPost(id, content);
  }

  //change comment display state
  toggleComment(id: string): void {
    this.showComment = this.showComment ? false : true;
  }

  //post a new comment
  postComment(id: string, content: string): void {
    this.articleServ.postComment(id, content);
  }

  //edit a new comment
  editComment(postID: string, commentID: string, content: string): void {
    this.articleServ.editComment(postID, commentID, content);
  }

}
