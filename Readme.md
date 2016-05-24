# Jsonsparser

Jsonsparser (JSONs parser) is a node module to extract JSONs from a stream.  
It caches incoming data until a complete JSON can be parsed.  

## Compatibility

This module is written in es6, tested on node v6.2.0.

## Install

```
npm i jsonsparser
```

## Test

```
npm test
```

## Example

```javascript
const JSONsparser = require('jsonsparser')
const Readable = require('stream').Readable

// Initializing the parser
jsonsparser = new JSONsparser()
jsonsparser.on('data', (json) => {
  console.log('json', json)
})

// Initializing example source stream
input = new Readable()

// Piping source stream into the parser
input.pipe(jsonsparser)

// Sending test jsons (in parts because we can)
input.push('{"hello":')
input.push(' "world"}{"hello":')
input.push(' "world2"}')
input.push(null)
```

## License

MIT
