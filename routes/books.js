const express = require('express');
const bodyParser = require('body-parser');

const Books = require('../models/book');
const { requireAuth, requireAdmin } = require('../middleware/authenticate');

const bookRouter = express.Router();

bookRouter.use(bodyParser.json());

bookRouter
	.route('/')
	.get((_req, res, next) => {
		Books.find({})
			.then((books) => {
				console.log(books);
				res.render('books/books', { books });
			})
			.catch((err) => next(err));
	})
	.post(requireAuth, (req, res, next) => {
		Books.create(req.body)
			.then((book) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(book);
			})
			.catch((err) => next(err));
	})
	.delete(requireAuth, (_req, res, next) => {
		Books.remove({})
			.then((response) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(response);
			})
			.catch((err) => next(err));
	});
/**
bookRouter.route('/add/:bookID').post(requireAuth, async (req, res) => {
	try {
		const book = await Book.findById(req.params.bookID);
		console.log(book);
		if (book.featured) {
			const token = req.cookies.jwt;
			const decoded = jwt.decode(token);

			console.log({ user_id: decoded.id });

			const user = await User.findById(decoded.id);

			user.books.push(book);
			user.save();

			console.log(user);

			res.render('books/books');
		} else {
			console.log('This book is not featured');
			res.status(400).json('This book is not featured');
		}
	} catch (err) {
		res.status(400).json(err.message);
	}
});
**/

bookRouter
	.route('/:bookID')
	/**
  .get(requireAuth, (req, res, next) => {
    Books.findById(req.params.bookID)
      .then(
        (book) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(book);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  **/
	.put(requireAdmin, (req, res, next) => {
		Books.findByIdAndUpdate(
			req.params.bookID,
			{
				$set: req.body,
			},
			{ new: true }
		)
			.then((book) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(book);
			})
			.catch((err) => next(err));
	})
	.delete(requireAdmin, (req, res, next) => {
		Books.findByIdAndRemove(req.params.bookID)
			.then((response) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.json(response);
			})
			.catch((err) => next(err));
	});

module.exports = bookRouter;
