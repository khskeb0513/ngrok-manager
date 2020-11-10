const express = require('express')
const router = express.Router()
const ngrok = require('ngrok')
const axios = require('axios')

router.get('/', (req, res, next) => {
    (async () => {
        const api = await ngrok.getApi()
        if (!api) {
            await next({message: 'ngrok process cannot found'})
        } else {
            const url = api.get('/api/tunnels').uri.href
            axios.get(url, {
                responseType: "json"
            }).then(url => {
                url.data['tunnels'] = url.data['tunnels'].map(each_data => {
                    delete each_data['metrics']
                    return each_data
                })
                res.render('api', url.data)
            })
        }
    })()
})

module.exports = router
