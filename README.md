# f2e-middleware
f2e-server middlewares


## template
with lodash template  
`npm i f2e-middleware-template --save-dev`

``` javascript
middlewares: [
    {
        test: /^test\/.*.html/,
        middleware: 'template'
    }
]

```

## markdown
compile `.md` to `.html`
`npm i f2e-middleware-markdown --save-dev`

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

## proxy
proxy url to local server
`npm i f2e-middleware-proxy --save-dev`

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