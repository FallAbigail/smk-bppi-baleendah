import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const processes = [
  {
    label: 'API',
    command: process.execPath,
    args: ['--watch', 'server/index.mjs', 'dev'],
  },
  {
    label: 'WEB',
    command: process.execPath,
    args: [resolve(root, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1'],
  },
]

const children = []
let stopping = false

function stop(exitCode = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) {
    if (child.exitCode === null) child.kill('SIGTERM')
  }
  const timeout = setTimeout(() => {
    for (const child of children) {
      if (child.exitCode === null) child.kill('SIGKILL')
    }
  }, 5000)
  timeout.unref()
  process.exitCode = exitCode
}

for (const item of processes) {
  const child = spawn(item.command, item.args, { cwd: root, env: process.env, stdio: 'inherit' })
  children.push(child)
  child.on('error', (error) => {
    process.stderr.write(`[${item.label}] ${error.message}\n`)
    stop(1)
  })
  child.on('exit', (code) => {
    if (!stopping) stop(code ?? 1)
  })
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
