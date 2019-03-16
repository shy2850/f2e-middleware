const { renderSync } = require('node-sass')
const { readFileSync, readdirSync } = require('fs')
const { join, dirname } = require('path')
const _ = require('lodash')
const pathREG = /[^\\/]+/g

module.exports = (conf, options) => {
    const {
        setBefore,
        test = /\.s[ac]ss$/i,
        middleware,
        ...opt
    } = options
    const {
        root,
        build
    } = conf

    let imports = {}
    const render = function (pathname, data, store) {
        if (test.test(pathname)) {
            const _pathname = join(root, pathname)
            const outFile = pathname.replace(/\.\w+$/, '.css')
            try {
                const result = renderSync({
                    data: data.toString().replace(/(@import.*)"(\S*\/)"/g, (impt, pre, dir) => {
                        let pkg = join(dirname(pathname), dir)
                        return readdirSync(pkg)
                            .filter(d => test.test(d)).map(d => `${pre}"${dir}${d}";`).join('\n')
                    }),
                    includePaths: [dirname(_pathname)],
                    outFile,
                    outputStyle: build ? 'compressed' : 'nested',
                    ...opt
                })

                if (result.map) {
                    store._set(outFile + '.map', result.map)
                }
                result.stats.includedFiles.map(dep => {
                    const d = dep.match(pathREG).join('/').replace(root.match(pathREG).join('/') + '/', '')
                    const p = pathname.match(pathREG).join('/')
                    _.set(imports, [d, p], 1)
                })
                return {
                    data: result.css,
                    outputPath: pathname.replace(/\.\w+$/, '.css')
                }
            } catch (e) {
                console.trace(e)
                return data
            }
        }
    }

    return {
        setBefore,
        onSet: render,
        buildWatcher(pathname, type, build) {
            const p = pathname.match(pathREG)
            let importsMap
            if (p && (importsMap = imports[p.join('/')])) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        },
        outputFilter(pathname, data) {
            return !test.test(pathname)
        }
    }
}

// try {
//     var result = renderSync({
//         data: readFileSync(join(__dirname, './test/test.scss')).toString(),
//         includePaths: [dirname(join(__dirname, './test/test.scss'))],
//         sourceMap: true,
//         outFile: 'test.css.map'
//     });
//     console.log(result)
// } catch (e) {
//     console.trace(e)
// }

