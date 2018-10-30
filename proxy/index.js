const { resolve } = require('url')
const request = require('request')
module.exports = (conf, options) => {
    const {
        setBefore = 0,
        url,
        pathname = m => m,
        test = /.*/
    } = options

    const render = function (path, req, resp) {
        if (test.test(path)) {
            try {
                const newPath = resolve(url, path.replace(test, pathname))
                const buffers = []
                request(newPath, {
                    method: req.method,
                    headers: req.rawHeaders || {},
                    body: req.rawBody || ''
                }).on('error', function (e) {
                    resp.writeHead(500)
                    resp.end(e.toString())
                }).on('data', data => {
                    buffers.push(data)
                }).on('response', response => {
                    resp.writeHead(response.statusCode, response.headers)
                }).on('end', function () {
                    resp.end(Buffer.concat(buffers))
                })
            } catch (e) {
                resp.writeHead(500)
                resp.end(e.toString())
            }
            return false
        }
    }

    return {
        setBefore,
        onRoute: render
    }
}
