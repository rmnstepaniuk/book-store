const express = require('express')
const bodyParser = require('body-parser')

const authenticate = require('../authenticate')
const Book = require('../models/book')

const bookRouter = express.Router()

bookRouter.use(bodyParser.json())

bookRouter.route('/')
  .get((req, res, next) => {
    Book.find({})
      .then((books) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(books)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Book.create(req.body)
      .then((book) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(book)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /books')
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Book.remove({})
      .then((response) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

bookRouter.route('/:bookID')
  .get((req, res, next) => {
    Book.findById(req.params.bookID)
      .then((book) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(book)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /books/' + req.params.bookID)
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Book.findByIdAndUpdate(req.params.bookID, {
      $set: req.body
    }, { new: true })
      .then((book) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(book)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Book.findByIdAndRemove(req.params.bookID)
      .then((response) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

module.exports = bookRouter
