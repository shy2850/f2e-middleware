// @ts-check
const { URL } = require('url')
const http = require('http')
module.exports = (conf, options) => {
    const {
        setBefore = 0,
        url,
        debug,
        timeout = 120000,
        pathname = m => m,
        renderHeaders = req => req.headers,
        responseHeaders = (resp, req) => resp.headers,
        test = /.*/
    } = options

    if (!url) {
        throw new Error('url needed!')
    }
    const url_provider = (function (urls) {
        let i = 0
        return {
            get: () => {
                i = (i + 1) % urls.length
                return urls[i]
            }
        }
    })([].concat(url));

    /**
     * 
     * @param {string} path 
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     */
    const render = function (path, req, resp) {
        if (test.test(req.url)) {
            const _url = url_provider.get()
            try {
                const newPath = new URL(req.url.replace(test, pathname), _url)
                debug && console.log(newPath, 'begin')
                const creq = http.request(newPath, {
                    method: req.method,
                    headers: Object.assign({}, {
                        host: _url.replace(/^https?:\/\/([^\/]+).*$/, '$1')
                    }, renderHeaders(req)),
                    timeout,
                }, function (res) {
                    debug && console.log(newPath, 'response')
                    res.pipe(resp)
                }).on('response', function (response) {
                    resp.writeHead(response.statusCode, response.statusMessage, responseHeaders(response, req))
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
