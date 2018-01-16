import { AppPage } from './app.po';
import { browser, element, by } from 'protractor'

describe('front-end App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Landing View');
  });

  // Register a new user
  it('Register a new user', () => {
    element(by.name('name')).sendKeys("e2etest");
    element(by.name('email')).sendKeys("e2etest@rice.edu");
    element(by.name('phone')).sendKeys("123-456-7890")
    element(by.name('dob')).sendKeys("1900-01-01")
    element(by.name('zipcode')).sendKeys("77005")
    element(by.name('psw')).sendKeys("asdf")
    element(by.name('pswc')).sendKeys("asdf")
    element(by.name('registerBtn')).click()
    expect(element(by.name('regAlert')).getText()).toEqual("You are registered. Please log in.")
  });

  // Log in as your test user
  it('Log in as your test user', () => {
    element(by.name('logname')).sendKeys("hz56test");
    element(by.name('logpsw')).sendKeys("not-at-all");
    element(by.name('loginBtn')).click()
    expect(page.getParagraphText()).toEqual('Main View');
  });

  // Create a new article and validate the article appears in the feed
  it('Create a new article and validate the article appears in the feed', () => {
    element(by.name('newPost')).clear();
    element(by.name('newPost')).sendKeys("e2e test new post");
    element(by.name('postBtn')).click();
    expect(element(by.name('postContent')).getText()).toEqual('e2e test new post');
  });

  // Edit an article and validate the article text has updated
  it('Edit an article and validate the article text has updated', () => {
    element(by.name('postContent')).click();
    element(by.name('postContent')).clear();
    element(by.name('postContent')).sendKeys('make edit on e2e test post');
    element(by.name('editBtn')).click();
    expect(element(by.name('postContent')).getText()).toEqual('make edit on e2e test post');
  });

  // Update the status headline and verify the change
  it('Update the status headline and verify the change', () => {
    element(by.name('newStatus')).clear();
    element(by.name('newStatus')).sendKeys('test a new status');
    element(by.name('statusBtn')).click();
    expect(element(by.name('status')).getText()).toEqual('test a new status');
  });

  // Count the number of followed users
  it('Count the number of followed users', () => {
    element(by.name('refreshBtn')).click();
    let list = element.all(by.className('followings'));
    expect(list.count()).toBe(3);
  });

  // Add the user "Follower" to the list of followed users and verify the count increases by one
  it('Add the user "Follower" to the list of followed users and verify the count increases by one', () => {
    element(by.name('newFollowing')).clear();
    element(by.name('newFollowing')).sendKeys('Follower');
    element(by.name('followBtn')).click();
    let list = element.all(by.className('followings'));
    expect(list.count()).toBe(4);
  });

  // Remove the user "Follower" from the list of followed users and verify the count decreases by one
  it('Remove the user "Follower" from the list of followed users and verify the count decreases by one', () => {
    element(by.name('Follower')).click();
    let list = element.all(by.className('followings'));
    expect(list.count()).toBe(3);
  });

  // Search for Only One Article Like This and verify only one article shows, and verify the author
  it('Search for Only One Article Like This and verify only one article shows, and verify the author', () => {
    element(by.name('keyword')).clear();
    element(by.name('keyword')).sendKeys('make edit on e2e test post');
    element(by.name('searchContentBtn')).click();
    let list = element.all(by.name('postContent'));
    expect(list.count()).toBe(1);
    expect(element(by.name('postAuthor')).getText()).toEqual('hz56test');
  });

  // Navigate to the profile view, Update the user's email and verify
  it('Navigate to the profile view, Update the user\'s email and verify', () => {
    element(by.name('navToProfile')).click();
    expect(page.getParagraphText()).toEqual('Profile View');

    element(by.name('newEmail')).clear();
    element(by.name('newEmail')).sendKeys('update@rice.edu');
    element(by.name('updateBtn')).click();
    expect(element(by.name('email')).getText()).toEqual('update@rice.edu');
  });

  // Navigate to the profile view, Update the user's zipcode and verify
  it('Navigate to the profile view, Update the user\'s zipcode and verify', () => {
    element(by.name('newZipcode')).clear();
    element(by.name('newZipcode')).sendKeys('84605');
    element(by.name('updateBtn')).click();
    expect(element(by.name('zipcode')).getText()).toEqual('84605');
  });

  // Navigate to the profile view, Update the user's password and verify
  it('Navigate to the profile view, Update the user\'s password and verify', () => {
    element(by.name('newPsw')).clear();
    element(by.name('newPsw')).sendKeys('updated-pass-word');
    element(by.name('newPswc')).clear();
    element(by.name('newPswc')).sendKeys('updated-pass-word');
    element(by.name('updateBtn')).click();
    expect(element(by.name('psw')).getText()).toEqual('updated-pass-word');
  });

});
