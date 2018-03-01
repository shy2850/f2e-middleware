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
            req.pipe(request(resolve(url, path.replace(test, pathname)))).pipe(resp)
            return false
        }
    }

    return {
        setBefore,
        onRoute: render
    }
}
