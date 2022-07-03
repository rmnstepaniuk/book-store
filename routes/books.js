const express = require('express')
const bodyParser = require('body-parser')

const Book = require('../models/book')
const { requireAuth } = require('../middleware/authenticate')

const bookRouter = express.Router()

bookRouter.use(bodyParser.json())

bookRouter.route('/')
  .get(requireAuth, (req, res, next) => {
    // Book.find({})
    //   .then((books) => {
    //     res.statusCode = 200
    //     res.setHeader('Content-Type', 'application/json')
    //     res.json(books)
    //   }, (err) => next(err))
    //   .catch((err) => next(err))
    res.render('books')
  })
  .post(requireAuth, (req, res, next) => {
    Book.create(req.body)
      .then((book) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(book)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .put(requireAuth, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /books')
  })
  .delete(requireAuth, (req, res, next) => {
    Book.remove({})
      .then((response) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

bookRouter.route('/:bookID')
  .get(requireAuth, (req, res, next) => {
    Book.findById(req.params.bookID)
      .then((book) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(book)
      }, (err) => next(err))
      .catch((err) => next(err))
  })
  .post(requireAuth, (req, res, next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /books/' + req.params.bookID)
  })
  .put(requireAuth, (req, res, next) => {
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
  .delete(requireAuth, (req, res, next) => {
    Book.findByIdAndRemove(req.params.bookID)
      .then((response) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

module.exports = bookRouter
