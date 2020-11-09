const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const hbs = require('hbs')

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerHelper('json', (value) => {
    if (typeof value === "object") {
        delete value['_locals']
        delete value['cache']
        delete value['settings']
        return JSON.stringify(value)
    } else {
        return `"${value}"`
    }
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

const indexRouter = require('./routes/index');
const logRouter = require('./routes/log')
app.use('/', indexRouter);
app.use('/log', logRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    res.status(err['status'] || 500);
    res.render('error', {
        message: err.message,
        error: req.app.get('env') === 'development' && err['status'] ? err : {status: 500}
    });
});

module.exports = app;
