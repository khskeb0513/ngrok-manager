const express = require('express');
const router = express.Router();
const ngrok = require('ngrok')
const fs = require('fs')
const moment = require('moment')

router.get('/', function (req, res, next) {
    (async () => {
        const query = {
            proto: req.query['proto'],
            addr: req.query['addr']
        }
        await ngrok.authtoken('1cMNxL0cPeTCOl9LXbwpWiV6vw3_VW1sCWQ2YhSB1otZEB9Q')
        query.proto && query.addr ? await ngrok.connect({
            proto: query.proto,
            addr: query.addr,
            region: 'jp',
            // onStatusChange: status => {
            //     console.log(status)
            // },
            // onLogEvent: data => {
            //     console.log(data)
            // }
        }).then(r => {
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
        await api ? await res.redirect(api.get('/status').uri.href) : await next({message: 'ngrok process cannot found'})
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
