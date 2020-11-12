// @ts-check
const { resolve } = require('url')
const request = require('request')
module.exports = (conf, options) => {
    const {
        setBefore = 0,
        debug = false,
        url,
        pathname = m => m,
        renderHeaders = req => req.headers,
        pipe = true,
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
                const buffers = []
                

                if (req.aborted || req.destroyed) {
                    debug && console.log(path, 'aborted or destroyed')
                    return false
                }
                req.addListener('close', function () {
                    debug && console.log(path, 'close to abort')
                    conn.abort()
                })

                
                debug && console.log(path, 'begin')
                const conn = request(newPath, {
                    method: req.method,
                    headers: Object.assign({}, renderHeaders(req), {
                        host: url.replace(/^https?:\/\/([^\/]+).*$/, '$1')
                    }),
                    body: req['rawBody']
                })
                conn.on('error', function (e) {
                    debug && console.log(path, 'error')
                    resp.writeHead(500)
                    resp.end(e.toString())
                })
                if (pipe) {
                    req.pipe(conn)
                    conn.pipe(resp)
                } else {
                    conn.on('data', data => {
                        buffers.push(data)
                    }).on('response', response => {
                        resp.writeHead(response.statusCode, response.headers)
                    }).on('end', function () {
                        debug && console.log(path, 'success')
                        resp.end(Buffer.concat(buffers))
                    })
                }
                
                
            } catch (e) {
                resp.writeHead(500)
                resp.end(e.toString())
            }
            return false
        }
    }

    return {
        setBefore,
        [pipe ? 'beforeRoute' : 'onRoute']: render
    }
}
