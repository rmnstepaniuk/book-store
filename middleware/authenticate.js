const jwt = require('jsonwebtoken')
const { secretKey } = require('../bin/config')

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt
  // check jwt existence & if verified
  if (token) {
    jwt.verify(token, secretKey, (err, decodedToken) => {
      if (err) {
        console.log(err)
        res.redirect('/users/login')
      } else {
        console.log(decodedToken)
        next()
      }
    })
  } else {
    res.redirect('/users/login')
  }
  next()
}

module.exports = { requireAuth }
