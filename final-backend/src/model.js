// this is model.js
var mongoose = require('mongoose')
require('./db.js')

const profileSchema = new mongoose.Schema({
  username: String,
  id: String,
  headline: String,
  following: [String],
  email: String,
  dob: String,
  zipcode: String,
  avatar: String,
  phone: String
})

const userSchema = new mongoose.Schema({
  username: String,
  salt: String,
  hash: String,
  auth: [],
  authId: String
})

const commentSchema = new mongoose.Schema({
  commentId: String,
  author: String,
  date: Date,
  text: String
})

const articleSchema = new mongoose.Schema({
  id: String,
  author: String,
  img: String,
  date: Date,
  text: String,
  comments: [commentSchema]
})

exports.Profile = mongoose.model("Profile",profileSchema);
exports.User = mongoose.model("User",userSchema);
exports.Comment = mongoose.model('Comment', commentSchema)
exports.Article = mongoose.model('Article', articleSchema)
