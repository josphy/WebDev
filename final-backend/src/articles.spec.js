/*
 * Test suite for articles.js
 */
const expect = require('chai').expect
const fetch = require('isomorphic-fetch')

const url = path => `http://localhost:3000${path}`

const resource = (method, endpoint, payload) => {
    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: ''
    }
    if (payload) {
      options.body = JSON.stringify(payload);
    }

    return fetch(`http://localhost:3000${endpoint}`, options)
}

describe('Validate POST /article functionality', () => {

	it('should give me ten or more articles', (done) => {
		fetch(url("/articles"))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.text()
		})
		.then(body => {
			body=JSON.parse(body)
			expect(body.articles.length>=10).to.eql(true);
		})
		.then(done)
		.catch(done)
 	}, 200)

	it('should post an article, and return the article in response', (done) => {
		// add a new article
		resource('POST', '/article', {
        text:"a new post"
    })
		.then(res => {
			expect(res.status).to.eql(200)
			return res.text()
		})
		// verify the content of the article
		.then(body => {
			body=JSON.parse(body)
			expect(body.articles[0].text).to.eql("a new post")
		})
		.then(done)
 	}, 200)

	it('should return an article with a specified id', (done) => {
		var articleID = '5a0e368d4a390ffab1a73751';
		// fetch(url("/articles"))
		// .then(res => {
    //   console.log(res.status)
		// 	expect(res.status).to.eql(200)
		// 	return res.text()
		// })
		// .then(body => {
		// 	body=JSON.parse(body)
		// 	articleID = body.articles[0]._id;
    //   console.log(articleID)
		// })

		fetch(url("/articles/"+articleID))
		.then(res => {
			expect(res.status).to.eql(200)
			return res.text()
		})
		.then(body => {
			body=JSON.parse(body)
			expect([body]).to.have.length(1)
		})
		.then(done)
		.catch(done)
		// call GET /articles first to find an id, perhaps one at random
		// then call GET /articles/id with the chosen id
		// validate that only one article is returned
	}, 200)

	it('should return nothing for an invalid id', (done) => {
		fetch(url("/articles/1000"))
		.then(res => {
			return res.text()
		})
		.then(body => {
			expect(body).to.eql("no existing article for id 1000");
		})
		.then(done)
		.catch(done)
		// call GET /articles/id where id is not a valid article id, perhaps 0
		// confirm that you get no results
	}, 200)

});
