const express = require('express')
const router = express.Router()
const ngrok = require('ngrok')

router.get('/', (req, res, next) => {
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
})

module.exports = router
