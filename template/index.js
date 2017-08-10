
module.exports = (conf, options) => {
    const _ = require('lodash')
    const { build } = conf
    const {
        setBefore = 1,
        test = /.*/
    } = options

    const render = function (pathname, data) {
        if (test.test(pathname)) {
            let str = data.toString()
            try {
                str = _.template(str)(_.extend(options, {pathname, require}))
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
        // 开发环境需要实时更新模板引擎的运行时结果
        onText: render
    }
}
