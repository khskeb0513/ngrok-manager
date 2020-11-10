const express = require('express')
const router = express.Router()
const ngrok = require('ngrok')
const moment = require('moment')
const level = require('level-party')
const path = require('path')
const eventLog = level(path.join(__dirname, '../../log/eventLog'), {
    valueEncoding: 'json'
})
const statusLog = level(path.join(__dirname, '../../log/statusLog'), {
    valueEncoding: 'json'
})
const urlLog = level(path.join(__dirname, '../../log/urlLog'), {
    valueEncoding: 'json'
})

router.get('/', function (req, res, next) {
    (async () => {
        const requestTime = moment().valueOf()
        const requestDate = moment().format('YYYYMMDD')
        const query = {
            proto: req.query['proto'],
            addr: req.query['addr']
        }
        await ngrok.authtoken('1cMNxL0cPeTCOl9LXbwpWiV6vw3_VW1sCWQ2YhSB1otZEB9Q')
        query.proto && query.addr ? await ngrok.connect({
            proto: query.proto,
            addr: query.addr,
            region: 'jp',
            onStatusChange: status => {
                statusLog.get(moment().format('YYYYMMDD'), (err, value) => {
                    if (!value) {
                        const putData = {}
                        putData[requestTime] = [{timestamp: moment().valueOf(), row: status}]
                        statusLog.put(requestDate, putData)
                    } else {
                        value[requestTime].push({timestamp: moment().valueOf(), row: status})
                        statusLog.put(requestDate, value)
                    }
                })
            },
            onLogEvent: data => {
                eventLog.get(moment().format('YYYYMMDD'), (err, value) => {
                    if (!value) {
                        const putData = {}
                        putData[requestTime] = [{timestamp: moment().valueOf(), row: data}]
                        eventLog.put(requestDate, putData)
                    } else {
                        value[requestTime].push({timestamp: moment().valueOf(), row: data})
                        eventLog.put(requestDate, value)
                    }
                })
            }
        }).then(url => {
            urlLog.put(url, {
                timestamp: requestTime,
                type: 'timestamp'
            })
            urlLog.put(requestTime, {
                url: url,
                type: 'url'
            })
            res.render('api', {
                status: 'connected',
                url: url
            })
        }, e => {
            next({
                message: 'ngrok connection not created'
            })
        }) : next({
            message: 'parameter not satisfied'
        })
    })()
})

module.exports = router
