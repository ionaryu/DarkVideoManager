// Development/test helpers. Packaged apps resolve these resources through Electron.
const { existsSync } = require('node:fs')
const path = require('node:path')

function findInPath(executableName) {
  const pathDirectories = (process.env.PATH ?? '')
    .split(path.delimiter)
    .map((directory) => directory.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean)

  for (const directory of pathDirectories) {
    const candidate = path.join(directory, executableName)
    try {
      if (existsSync(candidate)) {
        return candidate
      }
    } catch {
      // Ignore unreadable entries
    }
  }
  return null
}

function getMediaPath(name) {
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('The media runtime supports Windows x64. Use Windows x64 Node.js.')
  }

  // 1. Explicit environment variable override
  const envVar =
    name === 'ffmpeg'
      ? (process.env.DVM_FFMPEG_PATH || process.env.FFMPEG_PATH)
      : (process.env.DVM_FFPROBE_PATH || process.env.FFPROBE_PATH)
  if (envVar && existsSync(envVar)) {
    return envVar
  }

  // 2. Bundled resource (pre-built or packaged)
  const executable = path.resolve(__dirname, '..', 'resources', 'media', 'win32-x64', `${name}.exe`)
  if (existsSync(executable)) {
    return executable
  }

  // 3. System PATH lookup
  const systemExecutable = findInPath(`${name}.exe`)
  if (systemExecutable) {
    return systemExecutable
  }

  throw new Error(`${name} is missing at ${executable} and not found in PATH. Run npm run setup:media or install FFmpeg.`)
}

exports.getFfmpegPath = () => getMediaPath('ffmpeg')
exports.getFfprobePath = () => getMediaPath('ffprobe')
