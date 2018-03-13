import { rollup, InputOptions, OutputOptions } from 'rollup'
import { join } from 'path'
import { existsSync } from 'fs'
import * as _ from 'lodash'

const UglifyJS = require('uglify-js')
const UglifyES = require('uglify-es')

const configPath = join(process.cwd(), 'rollup.config.js')

export interface Options extends InputOptions {
    output?: OutputOptions
}
const pathREG = /[^\\/]+/g
let configBases: Options[]
if (existsSync(configPath)) {
    configBases = [].concat(require(configPath))
}

module.exports = (conf, options) => {
    const { build, root } = conf
    const { setBefore, middleware, mapConfig = (cfg: Options): Options => cfg } = options;
    const inputs: { [x: string]: Options } = configBases.reduce((m, c) => {
        [].concat(c.input).map(input => {
            m[input] = mapConfig(c)
        })
        return m
    }, {})

    let imports = {}
    const render = function (pathname, data, store) {
        let finalCfg = inputs[pathname]
        if (finalCfg) {
            return new Promise(resolve => (async function (params) {
                const { input, output = {}, plugins = [], ...cfg } = finalCfg;
                const outputPath = output.file || pathname.replace(/\.\w+$/, '.js');

                const bundle = await rollup({ ...cfg, plugins, input: pathname });
                bundle.modules.map(({ id }) => {
                    const d = id.match(pathREG).join('/').replace(root.match(pathREG).join('/') + '/', '')
                    const p = pathname.match(pathREG).join('/')
                    _.set(imports, [d, p], 1)
                })
                let { code, map } = await bundle.generate(output);
                if (build) {
                    code = UglifyJS.minify(code).code
                        || UglifyES.minify(code).code
                        || code
                }
                if (map) {
                    store._set(outputPath + '.map', JSON.stringify(map))
                    code += `\n//# sourceMappingURL=${map.file}.map`
                }
                resolve({
                    data: code,
                    outputPath
                })
            })())
        }
    };
    return {
        setBefore,
        onSet: render,
        outputFilter (pathname, type, build) {
            const p = pathname.match(pathREG)
            if (p && imports[p.join('/')]) {
                return false
            }
        },
        buildWatcher(pathname, type, build) {
            const p = pathname.match(pathREG)
            let importsMap
            if (p && (importsMap = imports[p.join('/')])) {
                Object.keys(importsMap).map(dep => {
                    build(dep)
                })
            }
        }
    };
};
