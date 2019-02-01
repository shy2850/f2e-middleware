# f2e-middleware
[f2e-middleware](https://githu.com/shy2850/f2e-middleware) middlewares

## Docs
[f2e-server 中间件开发](https://f2e-server.com/zhong-jian-jian-kai-fa.html)

## middlewares

### template
with lodash template  
`npm i f2e-middle-template --save-dev`

``` javascript
middlewares: [
    {
        test: /^test\/.*.html/,
        middleware: 'template'
    }
]

```

### markdown
compile `.md` to `.html`  
`npm i f2e-middle-markdown --save-dev`

``` javascript
middlewares: [
    {
        test: /\.md$/,
        middleware: 'markdown',
        suffix: 'md',
        outputSuffix: 'html',
    }
]

```

### proxy
proxy url to local server  
`npm i f2e-middle-proxy --save-dev`

``` javascript
middlewares: [
    {
        test: /^docs/,
        middleware: 'proxy',
        url: 'https://f2e-server.com',
        pathname: ''
    },
]

```
### qrcode
show QRcode of url
`npm i f2e-middle-qrcode --save-dev`

``` javascript
middlewares: [
    {
        test: /^qrcode/,
        middleware: 'qrcode'
    },
]

```

### dest
rename resources dest  
`npm i f2e-middle-dest --save-dev`

``` javascript
middlewares: [
    {
        test: /^scss/,
        middleware: 'dest',
        dest: 'css'
    },
]

```
### typescript
with typescript compiler 
`npm i f2e-middle-typescript --save-dev`  
use `tsconfig.json`

``` javascript
middlewares: [
    {
        middleware: 'typescript',
        getModuleId: pathname => pathname.replace('src\/', '')
    }
]

```