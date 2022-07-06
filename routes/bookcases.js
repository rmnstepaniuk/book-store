const { Router } = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const bookcaseRouter = Router();

const Bookcases = require('../models/bookcase');
const { requireAuth, requireAdmin } = require('../middleware/authenticate');

bookcaseRouter.use(bodyParser.json());

bookcaseRouter.route('/')
    .all(requireAuth)
    .get((req, res) => {
        Bookcases.find({})
            .populate('user')
            .populate('books')
            .then((bookcases) => {
                const token = req.cookies.jwt;
                const decoded = jwt.decode(token);
                const userBookcases = bookcases.filter((bookcase) => bookcase.user.id.toString() === decoded.id.toString());
                console.log(userBookcases);
                if (userBookcases) {
                    res.json(userBookcases);
                }
                else {
                    console.log('You have no bookcase');
                    res.status(400).json('You have no bookcase');
                }
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    })
    .post((req, res) => {
        const { title, description } = req.body;
        const token = req.cookies.jwt;
        const decoded = jwt.decode(token);
        Bookcases.create({ title, description, user: decoded.id })
            .then((bookcase) => {
                console.log(bookcase);
                res.statusCode(200);
                res.setHeader('Content-Type', 'application/json');
                res.json(bookcase);
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    });

module.exports = bookcaseRouter;