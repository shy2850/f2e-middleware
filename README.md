# f2e-middleware
f2e-server middlewares


## template
with lodash template
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