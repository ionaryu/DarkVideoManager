'use strict'

const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { getFfmpegPath, getFfprobePath } = require('./media-paths.cjs')

test('media-paths: resolves ffmpeg and ffprobe from PATH or env', () => {
  const ffmpeg = getFfmpegPath()
  const ffprobe = getFfprobePath()

  assert.ok(typeof ffmpeg === 'string' && ffmpeg.length > 0, 'ffmpeg path is non-empty string')
  assert.ok(typeof ffprobe === 'string' && ffprobe.length > 0, 'ffprobe path is non-empty string')
  assert.ok(ffmpeg.toLowerCase().endsWith('.exe'), 'ffmpeg path ends with .exe on Windows')
  assert.ok(ffprobe.toLowerCase().endsWith('.exe'), 'ffprobe path ends with .exe on Windows')
})

test('media-paths: respects DVM_FFMPEG_PATH override', () => {
  const originalFfmpeg = getFfmpegPath()
  const originalEnv = process.env.DVM_FFMPEG_PATH

  try {
    process.env.DVM_FFMPEG_PATH = originalFfmpeg
    assert.equal(getFfmpegPath(), originalFfmpeg)
  } finally {
    if (originalEnv === undefined) {
      delete process.env.DVM_FFMPEG_PATH
    } else {
      process.env.DVM_FFMPEG_PATH = originalEnv
    }
  }
})
