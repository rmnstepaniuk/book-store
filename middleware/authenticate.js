const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');

const requireAuth = (req, res, next) => {
	const token = req.cookies.jwt;
	// check jwt existence & if verified
	if (token) {
		jwt.verify(token, process.env.SEC_KEY, (err, _decodedToken) => {
			if (err) {
				console.log(err);
				res.redirect('/users/login');
			} else {
				// console.log(decodedToken)
				next();
			}
		});
	} else {
		res.redirect('/users/login');
	}
	next();
};

const checkUser = (req, res, next) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, process.env.SEC_KEY, async (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.locals.user = null;
				next();
			} else {
				res.locals.user = await User.findById(decodedToken.id);
				next();
			}
		});
	} else {
		res.locals.user = null;
		next();
	}
};

const requireAdmin = (req, res, next) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, process.env.SEC_KEY, async (err, decodedToken) => {
			if (err) res.redirect('/');
			else {
				if (decodedToken.isAdmin) next();
				else res.redirect('/');
			}
		});
	}
};

module.exports = { requireAuth, checkUser, requireAdmin };
