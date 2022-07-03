const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
// const createError = require('http-errors')
// const path = require('path')
// const passport = require('passport')

const config = require('./bin/config')

const usersRouter = require('./routes/users')
const booksRouter = require('./routes/books')

const url = config.uri
const connect = mongoose.connect(url)

connect.then((db) => {
  console.log('Connection to database successful')
}, (err) => console.log(err))

const app = express()

// middleware
app.use(express.static('public'))
app.use(express.json())
app.use(cookieParser())
app.use(logger('dev'))

// view engine setup
app.set('view engine', 'ejs')

// app.use(passport.initialize())

// routes
app.get('/', (req, res) => { res.render('home') })
app.use('/users', usersRouter)
app.use('/books', booksRouter)

module.exports = app
