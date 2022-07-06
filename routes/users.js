const { Router } = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// handle errors
const handleErrors = (err) => {
	const errors = { username: '', password: '' };

	// incorrect username
	if (err.message === 'incorrect username') {
		errors.username = 'That username is not registered';
	}
	// incorrect password
	if (err.message === 'incorrect password') {
		errors.password = 'That password is incorrect';
	}

	// duplicate error code
	if (err.code === 11000) {
		errors.username = 'Username is already registered';
		return errors;
	}

	// validation errors
	if (err.message.includes('user validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}
	return errors;
};

const maxAge = 2 * 60 * 60;

// create JWT
const createToken = (user) => {
	return jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.SEC_KEY, {
		expiresIn: maxAge,
	});
};

const router = Router();

const User = require('../models/user');
const { requireAuth, requireAdmin } = require('../middleware/authenticate');

router.use(bodyParser.json());

router
	.route('/')
	/* GET users listing. */
	.get(requireAdmin, (_req, res, next) => {
		User.find({})
			.populate('books.title')
			.then(
				(users) => {
					console.log(users);
					res.render('adminRestricted/users', { users });
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	/* DELETE all users. */
	.delete((_req, res) => {
		User.remove({})
			.then(
				(response) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(response);
				},
				(err) => handleErrors(err)
			)
			.catch((err) => handleErrors(err));
	});

router
	.route('/signup')
	.get((_req, res) => {
		res.render('signup');
	})
	.post(async (req, res) => {
		const { username, name, password } = req.body;
		try {
			const user = await User.create({ username, name, password });
			const token = createToken(user);
			res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
			res.status(201).json({ user: user._id });
		} catch (err) {
			const errors = handleErrors(err);
			res.status(400).json({ errors });
		}
	});

router
	.route('/login')
	.get((_req, res) => {
		res.render('login');
	})
	.post(async (req, res) => {
		const { username, password } = req.body;
		try {
			const user = await User.login(username, password);
			const token = createToken(user);
			res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
			res.status(200).json({ user: user._id });
		} catch (err) {
			const errors = handleErrors(err);
			res.status(400).json({ errors });
		}
	});

router.get('/logout', (_req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	res.redirect('/');
});

router
	.route('/settings')
	.get((_req, res) => {
		res.render('settings');
	})
	.post(requireAuth, async (req, res) => {
		const password = req.body.password;
		try {
			const newPassword = await User.hashPassword(password);

			const token = req.cookies.jwt;
			const decoded = jwt.decode(token);

			const user = await User.findByIdAndUpdate(
				{ _id: decoded.id },
				{ $set: { password: newPassword } }
			);
			console.log('Successfully changed password for user ', user.username);
			res.status(200).json({ user: user._id, token });
			res.redirect('/');
		} catch (err) {
			const errors = handleErrors(err);
			res.status(400).json({ errors });
		}
	});

router
	.route('/:userID')
	.post(requireAdmin, (req, res, next) => {
		User.findByIdAndUpdate(
			req.params.userID,
			{
				$set: req.body,
			},
			{ new: true }
		)
			.then(
				(user) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(user);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	})
	.delete(requireAdmin, (req, res, next) => {
		User.findByIdAndRemove(req.params.userID)
			.then(
				(response) => {
					res.statusCode = 200;
					res.setHeader('Content-Type', 'application/json');
					res.json(response);
				},
				(err) => next(err)
			)
			.catch((err) => next(err));
	});

module.exports = router;
