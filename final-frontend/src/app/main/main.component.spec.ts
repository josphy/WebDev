import { async, ComponentFixture, TestBed } from '@angular/core/testing';
// import fetch, { mock } from 'mock-fetch';
import { MainComponent } from './main.component';

import { FormsModule } from '@angular/forms'
import { MatToolbarModule } from '@angular/material';
import { MatCardModule } from '@angular/material';
import { HttpModule }  from '@angular/http';

import { ArticlesService } from '../article/articles.service'
import { FollowingsService } from './followings.service'
import { ProfileService } from '../profile/profile.service'

import { resource, url, mock, fetch } from '../resource';

describe('Validate Article actions', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let articleServ: ArticlesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainComponent ],
      imports: [ MatToolbarModule, MatCardModule, FormsModule, HttpModule ],
      providers: [
        ArticlesService,
        FollowingsService,
        ProfileService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    articleServ = TestBed.get(ArticlesService, null);
  });

  // should fetch articles (mocked request)
  it(`should fetch articles (mocked request)`, async(() => {
    mock(`${url}/articles`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
      json: {"text": "an article"}
    });

    resource('GET', 'articles', '')
    .then(res => {
			expect(res.text).toEqual('an article');
		});
  }));

  // should update the search keyword
  it('should update the search keyword', async(() => {
    const articles = [{_id:1, text:'you got a friend in me', author:'asdf'},
                      {_id:2, text:'not a key sentence', author:'mz22'}];
    let keyword = 'friend';
    expect(articleServ.searchContent(articles,keyword)).toEqual([articles[0]]);

    keyword = 'not';
    expect(articleServ.searchContent(articles,keyword)).toEqual([articles[1]]);
  }));

  // should filter displayed articles by the search keyword
  it('should filter displayed articles by the search keyword', async(() => {
    const articles = [{_id:1, text:'you got a friend in me', author:'asdf'},
                      {_id:2, text:'not a key sentence', author:'mz22'}];
    const keyword = 'friend';
    expect(articleServ.searchContent(articles,keyword)).toEqual([articles[0]]);
  }));

});


describe('Articles View (component tests)', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;
  let articleServ: ArticlesService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainComponent ],
      imports: [ MatToolbarModule, MatCardModule, FormsModule, HttpModule ],
      providers: [
        ArticlesService,
        FollowingsService,
        ProfileService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    articleServ = TestBed.get(ArticlesService, null);
  });

  // should render articles
  it('should render articles', async(() => {
    expect(articleServ.getArticles()!==undefined).toEqual(true);
  }));

  // should dispatch actions to create a new article
  it('should dispatch actions to create a new article', async(() => {
    const text = 'you got a friend in me';
    const author = 'hz56';
    let newArticles = articleServ.post(text, author);
    expect(newArticles.length).toEqual(1);
  }));

});
