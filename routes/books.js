const express = require('express');
const bodyParser = require('body-parser');

const bookRouter = express.Router();

bookRouter.use(bodyParser.json());

bookRouter.route('/')
    .get((req, res, next) => {
        res.end("List of all books");
    })
    .post((req, res, next) => {
        res.end('Authentication required\nNot supported');
    })
    .put((req, res, next) => {
        res.end('Authentication required\nNot supported');
    })
    .delete((req, res, next) => {
        res.end('Authentication required\nDelete all books');
    });
bookRouter.route('/:bookID')
    .get((req, res, next) => {
        res.end('Details about book#' + req.params.bookID);
    })
    .post((req, res, next) => {
        res.end('Authentication required\nCreate new book#' + req.params.bookID);
    })
    .put((req, res, next) => {
        res.end('Authentication required\nUpdate the book#' + req.params.bookID);
    })
    .delete((req, res, next) => {
        res.end('Authentication required\nDelete the book#' + req.params.bookID);
    });

module.exports = bookRouter;