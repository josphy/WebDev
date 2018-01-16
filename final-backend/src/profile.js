const Profile = require('./model.js').Profile;
const uploadImage = require('./uploadCloudinary')

//Get the headline for the loggedInUser
const getHeadline = (req, res) => {
  getHeadlines(req, res);
}

//Update the headline for the loggedInUser
const putHeadline = (req, res) => {
  const username = req.username;
  const id = req.id;
  const headline = req.body.headline;

  if (headline) {
    Profile.findOneAndUpdate({
      id
    }, {
      headline
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (user) {
        res.status(200).send({
          username,
          headline
        })
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.status(400)
      .send("no existing headline")
  }
}

//Get the headlines for multiple users
const getHeadlines = (req, res) => {
  const users = req.params.users ? req.params.users.split(',') : [req.id]

  Profile.find({
    id: {
      $in: users
    }
  }, function(err, elements) {
    if (err) {
      console.log(err);
      return;
    } else if (!elements || elements.length === 0 || elements.length !== users.length) {
      res.status(400)
        .send("acquired users not registered")
    } else {
      const headlines = elements.reduce(function(pre, cur) {
        pre.push({
          username: cur.username,
          headline: cur.headline
        })
        return pre;
      }, [])
      res.status(200)
        .send({
          headlines
        })
    }
  })
}

//get the email address for the requested user
const getEmail = (req, res) => {
  const id = req.params.user ? req.params.user : req.id;

  Profile.find({
    id
  }, function(err, elements) {
    if (err) {
      console.log(err);
      return;
    } else if (!elements || elements.length === 0) {
      res.status(404)
        .send("acquired user not registered")
    } else if (elements.length > 1) {
      res.status(400)
        .send("acquired user is not unique")
    } else {
      res.status(200)
        .send({
          username: elements[0].username,
          email: elements[0].email
        })
    }
  })
}

//update the email addres for the loggedInUser
const putEmail = (req, res) => {
  const username = req.username;
  const id = req.id;
  const email = req.body.email;

  if (email) {
    Profile.findOneAndUpdate({
      id
    }, {
      email
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (user) {
        res.status(200).send({
          username,
          email
        })
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.status(400)
      .send("no existing email")
  }
}

//get the date of birth in milliseconds for the requested user
const getDob = (req, res) => {
  const id = req.id;

  Profile.find({
    id
  }, function(err, elements) {
    if (err) {
      console.log(err);
      return;
    } else if (!elements || elements.length === 0) {
      res.status(404)
        .send("acquired user not registered")
    } else if (elements.length > 1) {
      res.status(400)
        .send("acquired user is not unique")
    } else {
      res.status(200)
        .send({
          username: elements[0].username,
          dob: elements[0].dob
        })
    }
  })
}

//get the zipcode for the requested user
const getZipcode = (req, res) => {
  const id = req.params.user ? req.params.user : req.id;

  Profile.find({
    id
  }, function(err, elements) {
    if (err) {
      console.log(err);
      return;
    } else if (!elements || elements.length === 0) {
      res.status(404)
        .send("acquired user not registered")
    } else if (elements.length > 1) {
      res.status(400)
        .send("acquired user is not unique")
    } else {
      res.status(200)
        .send({
          username: elements[0].username,
          zipcode: elements[0].zipcode
        })
    }
  })
}

//update the zipcode for the loggedInUser
const putZipcode = (req, res) => {
  const username = req.username;
  const id = req.id;
  const zipcode = req.body.zipcode;

  if (zipcode) {
    Profile.findOneAndUpdate({
      id
    }, {
      zipcode
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (user) {
        res.status(200).send({
          username,
          zipcode
        })
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.status(400)
      .send("no existing zipcode")
  }
}

//get the avatar address(es) for the requested user(s)
const getAvatars = (req, res) => {
  const users = req.params.users ? req.params.users.split(',') : [req.id]

  Profile.find({
    id: {
      $in: users
    }
  }, function(err, elements) {
    if (err) {
      console.log(err);
      return;
    } else if (!elements || elements.length === 0 || elements.length !== users.length) {
      res.status(400)
        .send("acquired users not registered")
    } else {
      const avatars = elements.reduce(function(pre, cur) {
        pre.push({
          username: cur.username,
          avatar: cur.avatar
        })
        return pre;
      }, [])
      res.status(200)
        .send({
          avatars
        })
    }
  })
}

//Update the avatar address for the loggedInUser
const putAvatar = (req, res) => {
  const username = req.username;
  const id = req.id;
  const avatar = req.fileurl;

  if (avatar) {
    Profile.findOneAndUpdate({
      id
    }, {
      avatar
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (user) {
        res.status(200).send({
          username,
          avatar
        })
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.status(400)
      .send("no existing avatar")
  }
}

module.exports = (app) => {
  app.get('/headline', getHeadline)
  app.put('/headline', putHeadline)
  app.get('/headlines/:users?', getHeadlines)
  app.get('/email/:user?', getEmail)
  app.put('/email', putEmail)
  app.get('/dob', getDob)
  app.get('/zipcode/:user?', getZipcode)
  app.put('/zipcode', putZipcode)
  app.get('/avatars/:users?', getAvatars)
  app.put('/avatar', uploadImage('avatar'), putAvatar)
}
