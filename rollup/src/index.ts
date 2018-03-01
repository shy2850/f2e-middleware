import { rollup, InputOptions, OutputOptions } from 'rollup'
import { join } from 'path'
import { existsSync } from 'fs'

const uglify = require('rollup-plugin-uglify')
const configPath = join(process.cwd(), 'rollup.config.js')

export interface Options extends InputOptions {
    output?: OutputOptions
}
let configBase: Options
if (existsSync(configPath)) {
    configBase = require(configPath)
}

module.exports = (conf, options) => {
    const { build } = conf
    const { setBefore, middleware, cfg = {} } = options;
    const finalCfg = Object.assign(configBase, cfg);
    const inputs = [].concat(finalCfg.input);
    const render = function (pathname, data, store) {
        if (~inputs.indexOf(pathname)) {
            return new Promise(resolve => (async function (params) {
                const { input, output = {}, plugins = [], ...cfg } = finalCfg;
                const outputPath = output.file || pathname.replace(/\.\w+$/, '.js');
                if (build) {
                    plugins.push(uglify())
                }
                const bundle = await rollup({ ...cfg, plugins, input: pathname });
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
        onSet: render
    };
};
