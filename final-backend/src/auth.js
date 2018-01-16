const md5 = require('md5')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy
const User = require('./model.js').User;
const Profile = require('./model.js').Profile;
const Article = require('./model.js').Article;
const Comment = require('./model.js').Comment;

const cookieKey = 'sid'
const mySecretMessage = 'doYouKnowMarioOdyssey';

var userInfo = {}; //store username, salt and hash
var sessionUser = {}; //store a map from sessionKey to username

const configFacebook = {
  clientID: '846869748820852',
  clientSecret: '4ade7a4aef60310b5ad606c12c32bb30',
  callbackURL: "/auth/facebook/callback",
  passReqToCallback: true,
  enableProof: true
}

//Register a new user with the system. This is not functional, new users cannot log in.
const register = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const dob = new Date(req.body.dob).getTime();
  const zipcode = req.body.zipcode;
  const phone = req.body.phone;

  // user name must be unique
  User.find({
    username
  }, function(err, user) {
    if (err) {
      console.log(err);
      return;
    } else if (user.length === 0) {
      var randomSalt = Math.floor(Math.random() * 1000000).toString(36);
      var hash = md5(randomSalt + password);

      User.create({
        username,
        salt: randomSalt,
        hash
      }, function(err, user) {
        if (err) {
          console.log(err);
          return;
        }

        const id = user._id;

        Profile.create({
          username,
          id,
          headline: "please edit your headline",
          following: [],
          email,
          dob,
          zipcode,
          phone,
          avatar: "https://cdn4.iconfinder.com/data/icons/account-avatar/128/stranger-128.png"
        }, function(err, profile) {
          if (err) {
            console.log(err);
            return;
          }
        })
      })

      res.status(200).send({
        result: 'success',
        username
      })

    } else if (user.length !== 0) {
      res.status(400)
        .send(`${username} has already been used!`)
    }
  })

}

//log in to server, sets session id and hash cookies
const login = (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  if (!username || !password) {
    res.sendStatus(400);
    return
  }

  User.find({
    username
  }, function(err, user) {
    if (err) {
      console.log(err);
      return;
    } else {
      const userObj = user[0];
      if (!userObj || userObj.hash !== md5(userObj.salt + password)) {
        res.sendStatus(401); //Unauthorized
        return
      }

      const sessionKey = md5(mySecretMessage + new Date().getTime() + userObj.username)
      res.cookie(cookieKey, sessionKey, {
        maxAge: 3600 * 1000,
        httpOnly: true
      });
      sessionUser[sessionKey] = username;

      var msg = {
        username,
        result: 'success'
      }
      res.send(msg);
    }
  })

}

//log out of server, clears session id
const logout = (req, res) => {
  if (req.isAuthenticated()) {
    req.session.destroy()
    req.logout()
  } else {
    var sid = req.cookies[cookieKey]
    delete sessionUser[sid]
    res.clearCookie(cookieKey)
  }
  res.status(200).send('OK')
}

//would update the password for the loggedInUser.
const putPassword = (req, res) => {
  const username = req.username;
  const id = req.id;
  const password = req.body.password;

  if (!password) {
    res.status(400).send("empty password")
    return
  }

  var randomSalt = Math.floor(Math.random() * 1000000).toString(36);
  var hash = md5(randomSalt + password);

  User.findOneAndUpdate({
    _id: id
  }, {
    $set: {
      salt: randomSalt,
      hash
    }
  }, function(err, user) {
    if (err) {
      console.log(err);
      return;
    } else if (user) {
      res.status(200).send({
        username,
        status: "password is updated"
      })
    } else {
      res.status(401).send({
        username,
        status: "will not change"
      });
    }
  })

}

//middleware to authenticate a loggedInUser
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    const usrArr = req.user.username.split('@');
    const authObj = {}
    authObj[`${usrArr[1]}`] = usrArr[0]
    User.findOne({
      auth: authObj
    }).exec(function(err, user) {
      if (!user) {
        res.status(400).send("error finding user")
      } else {
        req.username = user.username;
        req.id = user._id;
        next()
      }
    })
  } else {
    if (req.cookies == undefined) {
      return res.status(400).send("no cookie")
    }

    const sid = req.cookies[cookieKey]
    if (!sid) {
      return res.sendStatus(401) //Unauthorized
    }

    const username = sessionUser[sid]
    if (username) {
      req.username = username

      User.find({
        username
      }, function(err, user) {
        req.id = user[0]._id
        next()
      })
    } else {
      res.sendStatus(401)
    }
  }
}

//use Facebook Strategy to login
passport.use(new FacebookStrategy(configFacebook,
  function(req, accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      //check if the user is login
      const sid = req.cookies[cookieKey]
      const username = profile.displayName + "@" + profile.provider

      if (!sid) {
        User.findOne({
          username: username
        }).exec(function(err, user) {
          //register the user in our system
          if (!user || user.length === 0) {
            const userObj = new User({
              username: username,
              auth: [{
                facebook: profile.displayName
              }],
              authId: profile.id
            });
            new User(userObj).save(function(err, usr) {
              if (err) return console.log(err);

              const profileObj = new Profile({
                username: username,
                id: usr._id,
                headline: "login with facebook",
                following: [],
                email: null,
                zipcode: null,
                dob: new Date(1970, 01, 01).getTime(),
                avatar: "https://cdn4.iconfinder.com/data/icons/account-avatar/128/stranger-128.png"
              })
              new Profile(profileObj).save(function(err, usr) {
                if (err) {
                  console.log(err);
                  return;
                }
              })
            })
          }
        });
        return done(null, profile)
      } else {
        //link to local logged in user
        const localUser = sessionUser[sid]

        Article.update({
          author: username
        }, {
          $set: {
            'author': localUser
          }
        }, {
          new: true,
          multi: true
        }, function() {})
        Article.update({
          'comments.author': username
        }, {
          $set: {
            'comments.$.author': localUser
          }
        }, {
          new: true,
          multi: true
        }, function() {})
        Comment.update({
          author: username
        }, {
          $set: {
            'author': localUser
          }
        }, {
          new: true,
          multi: true
        }, function() {})
        Profile.findOne({
          username: username
        }).exec(function(err, profileData) {
          if (profileData) {
            const oldFollowingArr = profileData.following
            Profile.findOne({
              username: localUser
            }).exec(function(err, newProfile) {
              if (newProfile) {

                const newFollowingArr = newProfile.following.concat(oldFollowingArr)
                Profile.update({
                  username: localUser
                }, {
                  $set: {
                    'following': newFollowingArr
                  }
                }, function() {})
              }
            })

            Profile.update({
              username: username
            }, {
              $set: {
                'following': []
              }
            }, function() {})
          }
        })
        User.findOne({
          username: localUser
        }).exec(function(err, user) {
          if (user) {
            let authObj = {}
            authObj[`${profile.provider}`] = profile.displayName
            User.update({
              username: localUser
            }, {
              $addToSet: {
                'auth': authObj
              }
            }, {
              new: true
            }, function() {})
          }
        })
        return done(null, profile)
      }
    })
  }));

//link facebook auth to local user
const merge = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    res.status(400).send("missing account credentials")
    return
  }

  User.find({
    username: username
  }).exec(function(err, users) {
    if (!users || users.length === 0) {
      res.status(400).send("no corresponding user in database")
      return
    }
    const userObj = users[0]
    if (!userObj) {
      res.status(400).send("not valid local account")
    }
    const salt = userObj.salt;
    const hash = userObj.hash;

    if (md5(salt + password) === hash) {
      //update thrid party user profile
      Article.update({
        author: req.username
      }, {
        $set: {
          'author': username
        }
      }, {
        new: true,
        multi: true
      }, function() {})
      Article.update({
        'comments.author': req.username
      }, {
        $set: {
          'comments.$.author': username
        }
      }, {
        new: true,
        multi: true
      }, function() {})
      Comment.update({
        author: req.username
      }, {
        $set: {
          'author': username
        }
      }, {
        new: true,
        multi: true
      }, function() {})
      Profile.findOne({
        username: req.username
      }).exec(function(err, profile) {
        if (profile) {
          const oldFollowingArr = profile.following
          Profile.findOne({
            username: username
          }).exec(function(err, newProfile) {
            if (newProfile) {
              //merge following users
              const newFollowingArr = newProfile.following.concat(oldFollowingArr)
              Profile.update({
                username: username
              }, {
                $set: {
                  'following': newFollowingArr
                }
              }, function() {})
            }
          })
          //delete local record
          Profile.update({
            username: req.username
          }, {
            $set: {
              'following': []
            }
          }, function() {})
        }
      })
      User.findOne({
        username: username
      }).exec(function(err, user) {
        if (user) {
          const usrArr = req.username.split('@');
          const authObj = {}
          authObj[`${usrArr[1]}`] = usrArr[0]
          User.update({
            username: username
          }, {
            $addToSet: {
              'auth': authObj
            }
          }, {
            new: true
          }, function() {})
        }
      })
      res.status(200).send({
        username: username,
        result: 'success'
      })
    } else {
      res.status(401).send("incorrect password")
    }
  })
}

//unlink third party auth method from local user
const unlink = (req, res) => {
  const username = req.username;
  const company = req.body.company;

  User.findOne({
    username: username
  }).exec(function(err, user) {
    if (user.auth.length !== 0) {
      User.findOne({
        username: username
      }).exec(function(err, user) {
        let authArr = user.auth
        authArr = authArr.filter(function(obj) {
          return Object.keys(obj)[0] !== company;
        })
        User.update({
          username: username
        }, {
          $set: {
            'auth': authArr
          }
        }, {
          new: true
        }, function() {})
        res.status(200).send({
          result: 'successfully unlink ' + company
        })
      })
    } else {
      res.status(400).send("no link account")
    }
  })
}

//middleware handler
passport.serializeUser(function(user, done) {
  done(null, user.id)
})

//middleware handler
passport.deserializeUser(function(id, done) {
  User.findOne({
    authId: id
  }).exec(function(err, user) {
    done(null, user)
  })
})

let originHostUrl = '';

//third party auth success
const onSuccess = (req, res) => {
  res.redirect(`${originHostUrl}#/main`)
}

//third party auth failure
const onError = (err, req, res, next) => {
  if (err) {
    console.log(err)
    res.status(400).send({
      err: err.message
    });
  }
}

//record request origin
const initOrigin = (req, res, next) => {
  if (originHostUrl === '') {
    originHostUrl = req.headers.referer
  }
  next()
}

module.exports = (app) => {
  app.use(cookieParser())
  app.post('/login', login)
  app.post('/register', register)

  app.use(initOrigin)
  app.use(session({
    secret: 'letusseeiffacebookloginworks',
    resave: false,
    saveUninitialized: false
  }))
  app.use(passport.initialize())
  app.use(passport.session())
  app.use('/auth/facebook', passport.authenticate('facebook'))
  app.use('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/headlines'
  }), onSuccess, onError)

  app.use(isLoggedIn)

  app.use('/link/facebook', passport.authorize('facebook'))
  app.post('/unlink', unlink)
  app.post('/merge', merge)

  app.put('/logout', logout)
  app.put('/password', putPassword)
}
