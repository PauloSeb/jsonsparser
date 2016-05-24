const assert = require('assert')
const JSONsparser = require('../jsonsparser')
const Readable = require('stream').Readable
describe('JSONsparser', () => {

  var jsonsparser
  var input

  beforeEach(() => {
    jsonsparser = new JSONsparser()
    input = new Readable()
  })

  it('should emit a single json read at once', (done) => {
    const data = '{"hello": "world"}'
    const expected = JSON.parse(data)
    jsonsparser.once('data', (data) => {
      assert.deepEqual(data, expected)
      done()
    })
    input.pipe(jsonsparser)
    input.push(data)
    input.push(null)
  })

  it('should emit a single json between incorrect data', (done) => {
    const data = 'world"}{"hello": "world"}{"hello'
    const expected = JSON.parse('{"hello": "world"}')
    jsonsparser.once('data', (data) => {
      assert.deepEqual(data, expected)
      done()
    })
    input.pipe(jsonsparser)
    input.push(data)
    input.push(null)
  })

  it('should emit a json received in parts', (done) => {
    const data1 = '{"hel'
    const data2 = 'lo":"world"}{'
    const expected = JSON.parse('{"hello": "world"}')
    jsonsparser.once('data', (data) => {
      assert.deepEqual(data, expected)
      done()
    })
    input.pipe(jsonsparser)
    input.push(data1)
    input.push(data2)
    input.push(null)
  })

  it('should emit both json', (done) => {
    const data1 = '{"hello'
    const data2 = '": "world"}{"hel'
    const data3 = 'lo": "world2"}'
    const expected1 = JSON.parse('{"hello": "world"}')
    const expected2 = JSON.parse('{"hello": "world2"}')
    onSecondJson = (data) => {
      assert.deepEqual(data, expected2)
      done()
    }
    onFirstJson = (data) => {
      assert.deepEqual(data, expected1)
      jsonsparser.once('data', onSecondJson)
    }
    jsonsparser.once('data', onFirstJson)
    input.pipe(jsonsparser)
    input.push(data1)
    input.push(data2)
    input.push(data3)
    input.push(null)
  })

  it('should emit error on invalid JSON', (done) => {
    const data = '{invalid}'
    jsonsparser.once('error', (error) => {
      assert(error instanceof Error)
      done()
    })
    input.pipe(jsonsparser)
    input.push(data)
    input.push(null)
  })

  it('should parse top-level array JSON (#1)', (done) => {
    const data = '[1, {"hello": "world"}]'
    const expected = JSON.parse('[1, {"hello": "world"}]')
    jsonsparser.once('data', (data) => {
      assert.deepEqual(data, expected)
      done()
    })
    input.pipe(jsonsparser)
    input.push(data)
    input.push(null)
  })

})
