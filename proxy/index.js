// @ts-check
const { resolve } = require('url')
const http = require('http')
module.exports = (conf, options) => {
    const {
        setBefore = 0,
        url,
        debug,
        timeout = 120000,
        pathname = m => m,
        renderHeaders = req => req.headers,
        test = /.*/
    } = options

    if (!url) {
        throw new Error('url needed!')
    }

    /**
     * 
     * @param {string} path 
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     */
    const render = function (path, req, resp) {
        if (test.test(req.url)) {
            try {
                const newPath = resolve(url, req.url.replace(test, pathname))
                debug && console.log(newPath, 'begin')
                const creq = http.request(newPath, {
                    method: req.method,
                    headers: Object.assign({}, renderHeaders(req), {
                        host: url.replace(/^https?:\/\/([^\/]+).*$/, '$1')
                    }),
                    timeout,
                }, function (res) {
                    debug && console.log(newPath, 'response')
                    res.pipe(resp)
                }).on('response', function (response) {
                    resp.writeHead(response.statusCode, response.statusMessage, response.headers)
                }).on('timeout', function () {
                    debug && console.log(newPath, 'timeout')
                }).on('error', function (err) {
                    debug && console.log(newPath, 'error')
                    resp.writeHead(500)
                    resp.end(err.toString())
                });
                req.pipe(creq)
            } catch (e) {
                resp.writeHead(500)
                resp.end(e.toString())
            }
            return false
        }
    }

    return {
        setBefore,
        beforeRoute: render
    }
}
