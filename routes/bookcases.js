const { Router } = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const bookcaseRouter = Router();

const Bookcases = require('../models/bookcase');
const { requireAuth, requireAdmin } = require('../middleware/authenticate');
const Books = require('../models/book');
const Console = require('console');

bookcaseRouter.use(bodyParser.json());

bookcaseRouter
	.route('/')
	.all(requireAuth)
	.get((req, res, next) => {
		Bookcases.find({})
			.populate('user')
			.populate('books')
			.then((bookcases) => {
				const token = req.cookies.jwt;
				const decoded = jwt.decode(token);
				const userBookcases = bookcases.filter(
					(bookcase) => bookcase.user.id.toString() === decoded.id.toString()
				);

				console.log(userBookcases);
				res.render('books/bookcases', { bookcases: userBookcases });
			})
			.catch((err) => next(err));
	})
	.post((req, res, next) => {
		const { title, description } = req.body;
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.create({ title, description, user: decoded.id })
			.then((bookcase) => {
				console.log(bookcase);
				res.statusCode(200);
				res.setHeader('Content-Type', 'application/json');
				res.json(bookcase);
			})
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.remove({ user: decoded.id })
			.then((response) => {
				console.log('Successfully deleted all your bookcases');
				res.statusCode(200);
				res.setHeader('Content-Type', 'application/json');
				res.json(response);
			})
			.catch((err) => next(err));
	});

bookcaseRouter
	.route('/:bookcaseId')
	.all(requireAuth)
	.get((req, res, next) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.find({ _id: req.params.bookcaseId, user: decoded.id })
			.populate('user')
			.populate('books')
			.then((bookcase) => {
				if (bookcase) {
					console.log(bookcase[0].books);
					res.json(bookcase[0]);
				} else {
					const errMessage = 'Your do not own such bookcase';
					console.log(errMessage);
					res.json(errMessage);
				}
			})
			.catch((err) => next(err));
	})
	.delete((req, res, next) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);

		const bookcaseID = req.params.bookcaseId;

		Bookcases.find({ _id: bookcaseID, user: decoded.id }).then((bookcases) => {
			if (bookcases) {
				Bookcases.deleteOne(bookcases[0])
					.then((response) => {
						console.log(
							response,
							'\nSuccessfully deleted bookcase#',
							bookcaseID
						);
					})
					.catch((err) => next(err));
			} else {
				console.log('You do not have such bookcase');
			}
		});
	});

bookcaseRouter
	.route('/:bookcaseId/:bookId')
	.all(requireAuth)
	.post(async (req, res, next) => {
		const bookcaseID = req.params.bookcaseId;
		const bookID = req.params.bookId;

		try {
			const book = await Books.findById(bookID);
			if (book.featured) {
				Bookcases.findById(bookcaseID)
					.populate('user')
					.populate('books')
					.then((bookcase) => {
						bookcase.books.push(book);
						bookcase.save();

						console.log(bookcase);
					})
					.catch((err) => next(err));
			}
		} catch (err) {
			next(err);
		}
	})
	.delete((req, res, next) => {
		const bookcaseID = req.params.bookcaseId;
		const bookID = req.params.bookId;

		try {
			Bookcases.findById(bookcaseID)
				.then((bookcase) => {
					bookcase.books = bookcase.books.filter((book) => book._id !== bookID);
					bookcase.save();

					console.log(
						'Successfully deleted book#',
						bookID,
						' from bookcase#',
						bookcaseID
					);
				})
				.catch((err) => next(err));
		} catch (err) {
			next(err);
		}
	});

module.exports = bookcaseRouter;
