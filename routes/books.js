const express = require('express')
const bodyParser = require('body-parser')

const Books = require('../models/book')
const { requireAuth } = require('../middleware/authenticate')
// const { dbFindBooks } = require('../middleware/dbFind')

const bookRouter = express.Router()

bookRouter.use(bodyParser.json())

bookRouter
  .route('/')
  .get((req, res, next) => {
    Books.find({})
      .populate('comments.author')
      .then(
        (dishes) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(dishes)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })
  .post(requireAuth, (req, res, next) => {
    Books.create(req.body)
      .then(
        (dish) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(dish)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })
  .put(requireAuth, (req, res, next) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /dishes')
  })
  .delete(requireAuth, (req, res, next) => {
    Books.remove({})
      .then(
        (response) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(response)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })

bookRouter
  .route('/:bookID')
  .get(requireAuth, (req, res, next) => {
    Books.findById(req.params.bookID)
      .then(
        (book) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(book)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })
  .post(requireAuth, (req, res, next) => {
    res.statusCode = 403
    res.end('POST operation not supported on /books/' + req.params.bookID)
  })
  .put(requireAuth, (req, res, next) => {
    Books.findByIdAndUpdate(
      req.params.bookID,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then(
        (book) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(book)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })
  .delete(requireAuth, (req, res, next) => {
    Books.findByIdAndRemove(req.params.bookID)
      .then(
        (response) => {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.json(response)
        },
        (err) => next(err)
      )
      .catch((err) => next(err))
  })

module.exports = bookRouter
