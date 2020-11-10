const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const sassMiddleware = require('node-sass-middleware')
const hbs = require('hbs')
const fs = require('fs')

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

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

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}))
app.use(express.static(path.join(__dirname, 'public')))

fs.readdirSync('./routes/api/').forEach(each_data => {
    each_data = each_data.slice(0, each_data.length - 3)
    const directory = each_data === 'index' ? '' : '/' + each_data
    const router = require(`./routes/api/${each_data}`)
    app.use(`/api${directory}`, router)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
    res.status(err['status'] || 500)
    let error = {}
    if (req.app.get('env') === 'development') {
        error = err
        if (!err['status']) {
            error['status'] = 500
        }
    } else {
        error['status'] = err['status'] || 500
    }
    res.render('error', {
        message: err.message,
        error: error
    })
})

module.exports = app
