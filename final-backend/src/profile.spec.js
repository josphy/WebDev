/*
 * Test suite for profile.js
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

describe('Validate PUT /headline functionality', () => {

	it('should update the headline', (done) => {
		// update existing headline
		resource('PUT', '/headline', {
        headline: "a new headline"
    })
		.then(res => {
			expect(res.status).to.eql(200)
			return res.text()
		})
		// verify the content of the article
		.then(body => {
			body=JSON.parse(body)
			expect(body.headline).to.eql("a new headline")
		})

		.then(done)
		.catch(done)
 	}, 200)

  it('has updated the headline in database', (done) => {
    fetch(url("/headlines"))
    .then(res => {
    	expect(res.status).to.eql(200)
    	return res.text()
    })
    .then(body => {
    	body=JSON.parse(body)
    	expect(body.headlines[0].headline).to.eql("a new headline");
    })
    .then(done)
    .catch(done)
 	}, 200)

});
