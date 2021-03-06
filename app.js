const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const usersRouter = require('./routes/users');
const booksRouter = require('./routes/books');
const bookcasesRouter = require('./routes/bookcases');
const { checkUser } = require('./middleware/authenticate');

const connect = mongoose.connect(
	process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore'
);

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
app.use('/bookcases', bookcasesRouter);

module.exports = app;
