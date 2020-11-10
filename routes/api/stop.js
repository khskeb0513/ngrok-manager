const express = require('express')
const router = express.Router()
const ngrok = require('ngrok')

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

module.exports = router
