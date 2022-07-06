const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const { checkUser } = require('./middleware/authenticate');

const connect = mongoose.connect(process.env.DB_URI);

connect.then(
	(_db) => {
		console.log('Connection to database successful');
	},
	(err) => console.log(err)
);

const app = express();

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));

// view engine setup
app.set('view engine', 'ejs');

// routes
app.get('*', checkUser);
app.get('/', (_req, res) => {
	res.render('home');
});
app.use('/users', usersRouter);
app.use('/books', booksRouter);

module.exports = app;
