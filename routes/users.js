const { Router } = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const { secretKey } = require('../bin/config')

// handle errors
const handleErrors = (err) => {
  const errors = { username: '', password: '' }

  // incorrect username
  if (err.message === 'incorrect username') {
    errors.username = 'That username is not registered'
  }
  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect'
  }

  // duplicate error code
  {
    if (err.code === 11000) {
      errors.username = 'Username is already registered'
      return errors
    }
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }
  return errors
}

const maxAge = 3 * 24 * 60 * 60

// create JWT
const createToken = (id) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge
  })
}

const router = Router()

const User = require('../models/user')
// const authenticate = require('../authenticate')
// const passport = require('passport')

router.use(bodyParser.json())

router.route('/')
/* GET users listing. */
  .get((req, res, next) => {
    User.find({}, (err, users) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({ err })
      } else {
        res.json(users)
      }
    })
  })
/* DELETE all users. */
  .delete((req, res, next) => {
    User.remove({})
      .then((response) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      }, (err) => next(err))
      .catch((err) => next(err))
  })

router.route('/signup')
  .get((req, res) => { res.render('signup') })
  .post(async (req, res, next) => {
    const { username, name, password } = req.body
    try {
      const user = await User.create({ username, name, password })
      const token = createToken(user._id)
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
      res.status(201).json({ user: user._id })
    } catch (err) {
      const errors = handleErrors(err)
      res.status(400).json({ errors })
    }
  })

router.route('/login')
  .get((req, res) => { res.render('login') })
  .post(async (req, res) => {
    const { username, password } = req.body
    try {
      const user = await User.login(username, password)
      const token = createToken(user._id)
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
      res.status(200).json({ user: user._id })
    } catch (err) {
      const errors = handleErrors(err)
      res.status(400).json({ errors })
    }
  })

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  } else {
    const err = new Error('You are not logged in!')
    err.status = 403
    return next(err)
  }
})

module.exports = router
