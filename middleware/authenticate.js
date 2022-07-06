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
		jwt.verify(token, secretKey, async (err, decodedToken) => {
			if (err) {
				console.log(err.message);
				res.locals.user = null;
				next();
			} else {
				const user = await User.findById(decodedToken.id);
				res.locals.user = user;
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
		jwt.verify(token, secretKey, async (err, decodedToken) => {
			if (err) res.redirect('/');
			else {
				const user = await User.findById(decodedToken.id);
				if (user.isAdmin) {
					next();
				} else {
					res.redirect('/');
				}
			}
		});
	}
};

/**
const requireAdmin = (req, res, next) => {
  const user = req.user;
  console.log(user);
  if (user) {
    if (user.isAdmin) {
      next();
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/");
  }
};
**/
module.exports = { requireAuth, checkUser, requireAdmin };
