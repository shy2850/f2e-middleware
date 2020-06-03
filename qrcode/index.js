const qr = require('qr-image')
const url = require('url')

module.exports = (conf, options) => {
    const {
        setBefore = 0,
        test = /^qrcode/
    } = options

    const render = function (path, req, resp) {
        if (test.test(path)) {
            const search = url.parse(req.url).search + ''
            const code = qr.image(decodeURIComponent(search.substring(1)), { type: 'png' })
            resp.setHeader('Content-type', 'image/png')
            code.pipe(resp)
            return false
        }
    }

    return {
        setBefore,
        onRoute: render
    }
}
