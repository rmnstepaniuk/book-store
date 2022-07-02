const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const passport = require('passport')

const config = require('./bin/config')

const usersRouter = require('./routes/users')
const booksRouter = require('./routes/books')

const mongoose = require('mongoose')

const url = config.uri
const connect = mongoose.connect(url)

connect.then((db) => {
  console.log('Connection successful')
}, (err) => console.log(err))

const app = express()

// middleware
app.use(express.static('public'))

// view engine setup
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize())

app.use('/users', usersRouter)
app.use('/books', booksRouter)

app.use(express.static(path.join(__dirname, 'public')))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
