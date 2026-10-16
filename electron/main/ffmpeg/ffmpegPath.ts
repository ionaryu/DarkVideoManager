import { app } from 'electron'
import { existsSync } from 'fs'
import { delimiter, join } from 'path'

function findInPath(executableName: string): string | null {
  const pathDirectories = (process.env.PATH ?? '')
    .split(delimiter)
    .map((directory) => directory.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean)

  for (const directory of pathDirectories) {
    const candidate = join(directory, executableName)
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

// Check environment overrides, bundled binaries, or system PATH.
function getMediaPath(name: 'ffmpeg' | 'ffprobe'): string {
  if (process.platform !== 'win32' || process.arch !== 'x64') {
    throw new Error('미디어 런타임은 Windows x64에서 지원됩니다.')
  }

  // 1. Explicit environment variable override
  const envVar =
    name === 'ffmpeg'
      ? (process.env['DVM_FFMPEG_PATH'] || process.env['FFMPEG_PATH'])
      : (process.env['DVM_FFPROBE_PATH'] || process.env['FFPROBE_PATH'])
  if (envVar && existsSync(envVar)) {
    return envVar
  }

  // 2. Bundled resource (packaged app or pre-built in repo)
  try {
    const resources = app.isPackaged
      ? process.resourcesPath
      : join(app.getAppPath(), 'resources')
    const executable = join(resources, 'media', 'win32-x64', `${name}.exe`)
    if (existsSync(executable)) {
      return executable
    }
  } catch {
    // app may not be ready in some contexts
  }

  // 3. System PATH lookup
  const systemExecutable = findInPath(`${name}.exe`)
  if (systemExecutable) {
    return systemExecutable
  }

  throw new Error(
    `${name} 실행 파일을 찾을 수 없습니다. 시스템 PATH에 ${name}.exe가 등록되어 있거나 DVM_${name.toUpperCase()}_PATH 환경변수를 설정하거나, 개발 환경에서는 npm run setup:media를 실행해 주세요.`,
  )
}

export function getFfmpegPath(): string {
  return getMediaPath('ffmpeg')
}

export function getFfprobePath(): string {
  return getMediaPath('ffprobe')
}
