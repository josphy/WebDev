const md5 = require('md5')
const Article = require('./model.js').Article;
const Comment = require('./model.js').Comment;
const Profile = require('./model.js').Profile;
const uploadImage = require('./uploadCloudinary')

//Add a new article for the loggedInUser, date and id are determined by server. Optional image upload
const addArticle = (req, res) => {
  const username = req.username;
  const newArticle = req.body.text;
  const img = req.fileurl ? req.fileurl : null;

  if (newArticle == null) {
    res.status(400)
      .send("input article missing")
  } else {
    Article.create({
      author: username,
      text: newArticle,
      date: new Date(),
      img
    }, function(err, article) {
      if (err) {
        console.log(err);
        return;
      } else {
        res.status(200).send({
          articles: [article]
        })
      }
    })
  }
}

//A requested article, all requested articles by a user, or array of articles in the loggedInUser's feed
const getArticles = (req, res) => {

  if (req.params.id) {
    Article.findById(req.params.id).exec(function(err, articles) {
      if (!articles || articles.length === 0) {
        Profile.findOne({
          id: req.params.id
        }).exec(function(err, user) {
          if (!user || user.length === 0) {
            res.status(401).send("invalid id");
            return;
          } else {
            Article.find({
              author: user.username
            }).exec(function(err, articles) {
              res.status(200)
                .send({
                  articles
                });
              return;
            })
          }
        })
      } else {
        res.status(200).send({
          articles: [articles]
        });
        return;
      }
    })
  } else {
    Profile.findOne({
      id: req.id
    }, function(err, user) {
      if (err) {
        console.log(err);
        return;
      } else if (!user) {
        res.status(400).send("user not found");
        return;
      } else {
        let userArray = [req.id, ...user.following];
        let usernameArray = [];
        //retrieve username array
        Profile.find({
          id: {
            $in: userArray
          }
        }, function(err, elements) {
          if (err) {
            console.log(err);
            return;
          } else if (!elements || elements.length === 0 || elements.length !== userArray.length) {
            res.status(400)
              .send("acquired users not registered")
          } else {
            usernameArray = elements.reduce(function(pre, cur) {
              pre.push(cur.username)
              return pre;
            }, []);

            Article.find({
              author: {
                $in: usernameArray
              }
            }).limit(10).sort('-date').exec(function(err, articles) {
              if (err) {
                console.log(err);
                return;
              } else {
                res.status(200).send({
                  articles
                });
              }
            });
          }
        });
      }
    });
  }
}

/**
 * Update the article :id with a new text if commentId is not supplied.
 * Forbidden if the user does not own the article.
 * If commentId is supplied, then update the requested comment on the article, if owned.
 * If commentId is -1, then a new comment is posted with the text message.
 **/
const putArticle = (req, res) => {
  const id = req.params.id
  const commentId = req.body.commentId

  if (!id) {
    res.status(401)
      .send("no query parameter")
  } else {
    Article.findById(id, function(err, article) {
      if (!article) {
        res.status(400).send("no existing article for id " + id)
      } else if (commentId != null) {
        if (commentId === '-1') {
          //add new comment
          const commentId = md5(req.username + new Date().getTime());
          const commentObj = new Comment({
            commentId,
            author: req.username,
            date: new Date(),
            text: req.body.text
          })
          commentObj.save(function(err, comments) {
            if (err) {
              console.log(err)
            }
          })
          Article.findByIdAndUpdate(id, {
            $addToSet: {
              comments: commentObj
            }
          }, {
            upsert: true,
            new: true
          }, function(err, article) {
            if (err) {
              console.log(err);
              return;
            } else {
              res.status(200).send({
                articles: [article]
              })
            }
          })
        } else {
          //update an existing comment
          Comment.findOne({
            commentId
          }, function(err, comment) {
            if (err) {
              console.log(err);
              return;
            } else if (!comment) {
              res.status(401).send("no existing comment for commentId " + commentId)
            } else if (comment.author !== req.username) {
              res.status(401).send("You can not edit other's comment.")
            } else {
              Comment.update({
                commentId
              }, {
                $set: {
                  text: req.body.text
                }
              }, {
                new: true
              }, function(err, comments) {})
              Article.findOneAndUpdate({
                _id: req.params.id,
                'comments.commentId': commentId
              }, {
                $set: {
                  'comments.$.text': req.body.text
                }
              }, {
                new: true
              }, function(err, article) {
                if (err) {
                  console.log(err)
                } else {
                  res.status(200).send({
                    articles: [article]
                  });
                }
              })
            }
          })
        }
      } else {
        if (article.author === req.username) {
          Article.findByIdAndUpdate(req.params.id, {
            $set: {
              text: req.body.text
            }
          }, function(err, article) {
            if (err) {
              console.log(err);
              return;
            } else {
              res.status(200).send({
                articles: [article]
              })
            }
          })
        } else {
          res.status(401).send("You can not edit other's article.")
        }
      }
    })
  }

}

module.exports = (app) => {
  app.post('/article', uploadImage('post'), addArticle)
  app.get('/articles/:id*?', getArticles)
  app.put('/articles/:id', putArticle)
}
