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
    im.resize(
      {
        srcPath: imagePath,
        dstPath: dstPath + 'thumbnail-' + id + '.png',
        height: this.height,
        width: this.width,
        format: this.format
      },
      err => {
        if (err) throw err
        console.log(`resized ${imagePath} to fit within ${this.width}x${this.height}px`)
      }
    )
  }
}

module.exports = ThumbnailGenerator
