const Profile = require('./model.js').Profile;

//get the list of users being followed by the requested user
const getFollowing = (req, res) => {
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
          following: elements[0].following
        })
    }
  })
}

//add :user to the following list for the loggedInUser
const putFollowing = (req, res) => {
  const username = req.username;
  const id = req.id;
  const newFollowing = req.params.user;

  if (newFollowing) {
    Profile.find({
      id: newFollowing
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (!user || user.length === 0) {
        res.status(400).send("no existing user")
      } else {
        Profile.findOneAndUpdate({
          id
        }, {
          $addToSet: {
            following: newFollowing
          }
        }, {
          new: true
        }, function(err, user) {
          if (err) {
            console.log(err);
            return;
          } else if (user) {
            res.status(200).send({
              username,
              following: user.following
            })
          } else {
            res.sendStatus(401);
          }
        })
      }
    })

  } else {
    res.status(400)
      .send("no user to follow")
  }
}

//remove :user to the following list for the loggedInUser
const deleteFollowing = (req, res) => {
  const username = req.username;
  const id = req.id;
  const removeFollowing = req.params.user;

  if (removeFollowing) {
    Profile.findOneAndUpdate({
      id
    }, {
      $pull: {
        following: removeFollowing
      }
    }, {
      new: true
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (user) {
        res.status(200).send({
          username,
          following: user.following
        })
      } else {
        res.sendStatus(401);
      }
    })
  } else {
    res.status(400)
      .send("no user to unfollow")
  }
}

module.exports = (app) => {
  app.get('/following/:user?', getFollowing)
  app.put('/following/:user', putFollowing)
  app.delete('/following/:user', deleteFollowing)
}
