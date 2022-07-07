const { Router } = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const bookcaseRouter = Router();

const Bookcases = require('../models/bookcase');
const { requireAuth, requireAdmin } = require('../middleware/authenticate');
const Book = require('../models/book');

bookcaseRouter.use(bodyParser.json());

bookcaseRouter
	.route('/')
	.all(requireAuth)
	.get((req, res) => {
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
				if (userBookcases) {
					res.json(userBookcases);
				} else {
					console.log('You have no bookcase');
					res.status(400).json('You have no bookcase');
				}
			})
			.catch((err) => {
				res.status(400).json(err);
			});
	})
	.post((req, res) => {
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
			.catch((err) => {
				res.status(400).json(err);
			});
	})
	.delete((req, res) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.remove({ user: decoded.id })
			.then((response) => {
				console.log('Successfully deleted all your bookcases');
				res.statusCode(200);
				res.setHeader('Content-Type', 'application/json');
				res.json(response);
			})
			.catch((err) => {
				res.status(400).json(err);
			});
	});

bookcaseRouter
	.route('/:bookcaseId')
	.all(requireAuth)
	.get((req, res) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.find({ _id: req.params.bookcaseId, user: decoded.id })
			.populate('user')
			.populate('books')
			.then((bookcase) => {
				if (bookcase) {
					console.log(bookcase[0]);
					res.json(bookcase[0]);
				} else {
					const errMessage = 'Your do not own such bookcase';
					console.log(errMessage);
					res.json(errMessage);
				}
			})
			.catch((err) => {
				res.status(400).json(err);
			});
	})
	.delete((req, res) => {
		const token = req.cookies.jwt;
		const decoded = jwt.decode(token);
		Bookcases.find({ _id: req.params.bookcaseId, user: decoded.id }).then(
			(bookcase) => {
				if (bookcase) {
					Bookcases.deleteOne(bookcase[0])
						.then((response) => {
							console.log(
								'Successfully deleted bookcase#',
								req.params.bookcaseId
							);
							res.statusCode(200);
							res.setHeader('Content-Type', 'application/json');
							res.json(response);
						})
						.catch((err) => {
							res.status(400).json(err);
						});
				} else {
					res.json('You do not have such bookcase');
				}
			}
		);
	});

bookcaseRouter
	.route('/:bookcaseId/:bookId')
	.all(requireAuth)
	.post(async (req, res) => {
		console.log(
			`Bookcase: ${req.params.bookcaseId}\nBook: ${req.params.bookId}`
		);
		try {
			const book = await Book.findById(req.params.bookId);
			console.log(book.title);
			if (book.featured) {
				const bookcase = await Bookcases.findById({
					_id: req.params.bookcaseId,
				});

				bookcase.books.push(book);
				bookcase.save();
				console.log(bookcase);
				res.json(bookcase);
			}
		} catch (err) {
			res.json(err);
		}
		// }).
		// delete((req, res) => {
		//
	});

module.exports = bookcaseRouter;
