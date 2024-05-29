interface LaunchQueue {
  setConsumer(consumer: LaunchConsumer): void
}

interface LaunchParams {
  readonly targetURL?: string
  readonly files?: FileSystemHandle[]
}

interface LaunchConsumer {
  (params: LaunchParams): void
}

declare global {
  interface Window {
    LaunchParams?: LaunchParams
    readonly launchQueue?: LaunchQueue
  }
}

function setConsumer(
  callback: (fileHandles: NonNullable<LaunchParams['files']>) => void
) {
  window.launchQueue?.setConsumer((launchParams) => {
    if (!launchParams.files?.length) {
      return
    }

    callback(launchParams.files)
  })
}

function isFileHandle(
  fileHandle: FileSystemHandle
): fileHandle is FileSystemFileHandle {
  return fileHandle.kind === 'file'
}

export default { setConsumer, isFileHandle }
