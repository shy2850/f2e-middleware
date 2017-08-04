
module.exports = (conf, options) => {
    const _ = require('lodash')
    const { build } = conf
    const {
        setBefore = 1,
        test = /.*/,
        middleware,
        ...opts
    } = options

    const render = function (pathname, data) {
        if (test.test(pathname)) {
            let str = data.toString()
            try {
                str = _.template(str)({pathname, require, ...opts})
            } catch (e) {
                console.log(pathname, e)
            }
            return str
        }
    }

    return build ? {
        setBefore,
        onSet: render
    } : {
        setBefore,
        onText: render
    }
}
