'use strict'

const im = require('imagemagick')
const fs = require('fs')

const dstPath = '/tmp/thumbnails/'
if (!fs.existsSync(dstPath)) {
  fs.mkdirSync(dstPath)
}

class ThumbnailGenerator {
  constructor () {
    this.height = 100
    this.width = 100
    this.format = 'png'
  }

  generate (imagePath, id) {
    var filePath = dstPath + 'thumbnail-' + id + '.png'
    im.resize(
      {
        srcPath: imagePath,
        dstPath: filePath,
        height: this.height,
        width: this.width,
        format: this.format
      },
      err => {
        if (err) throw err
        console.log(`resized ${imagePath} to fit within ${this.width}x${this.height}px`)
      }
    )
    return filePath
  }
}

module.exports = ThumbnailGenerator
