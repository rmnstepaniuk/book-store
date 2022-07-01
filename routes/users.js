const express = require('express')
const bodyParser = require('body-parser')

const userRouter = express.Router()

userRouter.use(bodyParser.json())

userRouter.route('/')
  .get((req, res, next) => {
    res.end('Authentication required\nList of all users')
  })
  .post((req, res, next) => {
    res.end('Authentication required\nNot supported')
  })
  .put((req, res, next) => {
    res.end('Authentication required\nNot supported')
  })
  .delete((req, res, next) => {
    res.end('Authentication required\nDelete all user')
  })
userRouter.route('/:userID')
  .get((req, res, next) => {
    res.end('Details about user#' + req.params.userID)
  })
  .post((req, res, next) => {
    res.end('Authentication required\nCreate new user#' + req.params.userID)
  })
  .put((req, res, next) => {
    res.end('Authentication required\nUpdate the user#' + req.params.userID)
  })
  .delete((req, res, next) => {
    res.end('Authentication required\nDelete the user#' + req.params.userID)
  })

module.exports = userRouter
