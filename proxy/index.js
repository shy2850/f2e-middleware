// @ts-check
const { URL } = require('url')
const http = require('http')
/**
 * 
 * @param {*} conf 
 * @param {{
 * setBefore?: number,
 * test: RegExp,
 * url: string | string[],
 * debug?: boolean,
 * timeout?: number,
 * pathname?: string | {(s:string, ...args: any[]): string},
 * renderHeaders?: (req: http.IncomingMessage) => http.IncomingHttpHeaders
 * responseHeaders?: (req: http.IncomingMessage) => http.OutgoingHttpHeaders
 * options?: http.RequestOptions
 * }} _options 
 * @returns 
 */
module.exports = (conf, _options) => {
    const {
        setBefore = 0,
        url,
        debug,
        timeout = 120000,
        pathname = m => m,
        renderHeaders = req => req.headers,
        responseHeaders = (resp, req) => resp.getHeaders(),
        options = {},
        test = /.*/
    } = _options

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
    })([''].concat(url).filter(l => !!l));

    /**
     * 
     * @param {string} path 
     * @param {import('http').IncomingMessage} req
     * @param {import('http').ServerResponse} resp
     */
    const render = function (path, req, resp) {
        if (typeof req.url != 'undefined' && test.test(req.url)) {
            const _url = url_provider.get()
            try {
                // @ts-ignore
                const newPath = new URL(req.url && req.url.replace(test, pathname) || '/', _url)
                debug && console.log(newPath, 'begin')
                const creq = http.request(newPath, {
                    method: req.method,
                    headers: Object.assign({}, {
                        host: _url.replace(/^https?:\/\/([^\/]+).*$/, '$1')
                    }, renderHeaders(req)),
                    timeout,
                    ...options,
                }, function (res) {
                    debug && console.log(newPath, 'response')
                    res.pipe(resp)
                }).on('response', function (response) {
                    resp.writeHead(response.statusCode || 200, response.statusMessage, responseHeaders(response))
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
