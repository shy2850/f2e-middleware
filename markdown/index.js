
module.exports = (conf, options) => {
    const { build } = conf
    const {
        setBefore,
        suffix = 'md',
        outputSuffix = 'html',
        test = /\.md$/
    } = options

    const suffixReg = new RegExp(`\\.${suffix}$`)
    const render = function (pathname, data, store) {
        if (test.test(pathname)) {
            let res = require('marked')(data.toString())
            store._set(pathname.replace(suffixReg, `.${outputSuffix}`), res)
            if (build) {
                return res
            }
        }
    }

    return {
        setBefore,
        onSet: render,
        outputFilter (pathname, data) {
            return !suffixReg.test(pathname)
        }
    }
}
