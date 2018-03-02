import { rollup, InputOptions, OutputOptions } from 'rollup'
import { join } from 'path'
import { existsSync } from 'fs'
import * as _ from 'lodash'

const uglify = require('rollup-plugin-uglify')
const configPath = join(process.cwd(), 'rollup.config.js')

export interface Options extends InputOptions {
    output?: OutputOptions
}
const pathREG = /[^\\/]+/g
let configBase: Options
if (existsSync(configPath)) {
    configBase = require(configPath)
}

module.exports = (conf, options) => {
    const { build, root } = conf
    const { setBefore, middleware, cfg = {} } = options;
    const finalCfg = Object.assign(configBase, cfg);
    const inputs = [].concat(finalCfg.input);

    let imports = {}
    const render = function (pathname, data, store) {
        if (~inputs.indexOf(pathname)) {
            return new Promise(resolve => (async function (params) {
                const { input, output = {}, plugins = [], ...cfg } = finalCfg;
                const outputPath = output.file || pathname.replace(/\.\w+$/, '.js');
                if (build) {
                    plugins.push(uglify())
                }
                const bundle = await rollup({ ...cfg, plugins, input: pathname });
                bundle.modules.map(({ id }) => {
                    const d = id.replace(root, '').match(pathREG).join('/')
                    const p = pathname.match(pathREG).join('/')
                    _.set(imports, [d, p], 1)
                })
                const { code, map } = await bundle.generate(output);
                if (map) {
                    store._set(outputPath + '.map', JSON.stringify(map))
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
