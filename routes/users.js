const express = require('express')
const router = express.Router()

const bodyParser = require('body-parser')
const User = require('../models/user')
const authenticate = require('../authenticate')
const passport = require('passport')

router.use(bodyParser.json())

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

router.post('/signup', (req, res, next) => {
  User.register(new User({ username: req.body.username }),
    req.body.password, (err, user) => {
      if (err) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.json({ err })
      } else {
        if (req.body.firstname) { user.firstname = req.body.firstname }
        if (req.body.lastname) { user.lastname = req.body.lastname }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.json({ err })
            return
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({ success: true, status: 'Registration Successful!' })
          })
        })
      }
    })
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id })
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({ success: true, token, status: 'Logged in' })
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
