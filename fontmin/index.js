
module.exports = (conf, options) => {
    const { build } = conf
    const {
        setBefore,
        suffix = 'md',
        outputSuffix = 'html',
        cfg = {},
        test = /\.md$/
    } = options

    const suffixReg = new RegExp(`\\.${suffix}$`)
    const render = function (pathname, data, store) {
        if (test.test(pathname)) {
            return {
                outputPath: pathname.replace(suffixReg, `.${outputSuffix}`),
                data: require('marked')(data.toString(), cfg)
            }
        }
    }

    return {
        setBefore,
        onSet: render
    }
}
