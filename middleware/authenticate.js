const jwt = require("jsonwebtoken");
const { secretKey } = require("../bin/config");
const User = require("../models/user");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;
  // check jwt existence & if verified
  if (token) {
    jwt.verify(token, secretKey, (err, _decodedToken) => {
      if (err) {
        console.log(err);
        res.redirect("/users/login");
      } else {
        // console.log(decodedToken)
        next();
      }
    });
  } else {
    res.redirect("/users/login");
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

module.exports = { requireAuth, checkUser };
