const express = require('express');
const router = express.Router();
const ngrok = require('ngrok')
const moment = require('moment')
const axios = require('axios');
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
        }).then(r => {
            urlLog.put(r, {
                timestamp: requestTime,
                type: 'timestamp'
            })
            urlLog.put(requestTime, {
                url: r,
                type: 'url'
            })
            res.render('index', {
                status: 'connected',
                url: r
            })
        }, e => {
            next({
                message: 'ngrok connection not created'
            })
        }) : next({
            message: 'parameter not satisfied'
        })
    })()
});

router.get('/list', (req, res, next) => {
    (async () => {
        const api = await ngrok.getApi()
        if (!api) {
            await next({message: 'ngrok process cannot found'})
        } else {
            const url = api.get('/api/tunnels').uri.href
            axios.get(url, {
                responseType: "json"
            }).then(r => {
                r.data['tunnels'] = r.data['tunnels'].map(each_data => {
                    delete each_data['metrics']
                    return each_data
                })
                res.render('index', r.data)
            })
        }
    })()
});

router.get('/disconnect', (req, res, next) => {
    const query = {
        url: req.query['url']
    }
    ngrok.disconnect(query.url).then(r => {
        res.json({
            status: 'disconnected',
            r: r
        })
    }, e => {
        next(e)
    })
});

router.get('/stop', (req, res, next) => {
    ngrok.kill().then(r => {
        res.json({
            status: 'killed',
            r: r
        })
    }, e => {
        next(e)
    })
})

module.exports = router;
