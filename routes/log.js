const express = require('express');
const router = express.Router();
const level = require('level-party')
const path = require('path')
const eventLog = level(path.join(__dirname, '../log/eventLog'), {
    valueEncoding: 'json'
})
const statusLog = level(path.join(__dirname, '../log/statusLog'), {
    valueEncoding: 'json'
})
const urlLog = level(path.join(__dirname, '../log/urlLog'), {
    valueEncoding: 'json'
})

router.get('/event', (req, res, next) => {
    const query = {
        date: req.query['date']
    }
    eventLog.get(query.date, (err, value) => {
        err ? next(err) : res.render('index', value)
    })
})

router.get('/status', (req, res, next) => {
    const query = {
        date: req.query['date']
    }
    statusLog.get(query.date, (err, value) => {
        err ? next(err) : res.render('index', value)
    })
})

router.get('/url', (req, res, next) => {
    const query = {
        url: req.query['url'],
        timestamp: req.query['timestamp']
    }
    urlLog.get(query.url || query.timestamp, (err, value) => {
        err ? next(err) : res.render('index', value)
    })
})

module.exports = router;
