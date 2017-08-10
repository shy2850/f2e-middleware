
module.exports = (conf, options) => {
    const { build } = conf
    const {
        test = /\.md$/,
        dest = '.html'
    } = options

    const render = function (pathname, data, store) {
        if (test.test(pathname)) {
            store._set(pathname.replace(test, dest), data)
        }
    }

    return build && {
        onSet: render,
        outputFilter (pathname, data) {
            return !test.test(pathname)
        }
    }
}
