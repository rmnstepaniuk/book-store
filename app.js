const express = require('express')
const logger = require('morgan')

const userRouter = require('./routes/users')
const bookRouter = require('./routes/books')

const app = express()

app.use(logger('dev'))
app.use(express.json())

app.use('/users', userRouter)
app.use('/books', bookRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404))
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500)
    res.render('error')
});

module.exports = app