'use strict'

const Duplex = require('stream').Duplex
const EventEmitter = require('events')

module.exports = class JSONsparser extends Duplex {
  constructor(options = {}) {
    // read JSONs from Stream
    options.readableObjectMode = true
    super(options)

    // JSON is complete when brackets count is 0
    this._brackets = 0
    // Raw character from source
    this._jsonStr = ''
    // Pending JSONs to push
    this._jsons = []
    // JSON availability notifier
    this._emitter = new EventEmitter()
  }

  _read() {
    // Wait if no json ready
    if(this._jsons.length === 0) {
      var self = this
      this._emitter.once('json', () => {
        self.push(self._jsons.shift())
      })
    } else {
      this._jsons.shift()
    }
  }

  _write(chunk, encoding, callback) {
    for(let char of chunk.toString()) {
      if(char === '{' || char === '[') this._brackets++
      if(this._brackets > 0) this._jsonStr += char
      if((char === '}' || char === ']') && this._brackets > 0) this._brackets--
      if(this._brackets === 0 && this._jsonStr.length !== 0) {
        let json
        try {
          json = JSON.parse(this._jsonStr)
        } catch(error) {
          return process.nextTick(() => {
            /// Emit error on parsing fail
            callback(error)
          })
        }
        this._jsons.push(json)
        this._jsonStr = ''
        // Notify pending jsons availability
        this._emitter.emit('json')
      }
    }
    process.nextTick(callback)
  }
}
