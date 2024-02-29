'use strict'
import path from 'node:path'
import _fs from 'node:fs/promises'
import readline from 'node:readline'
import { constants, statSync } from 'node:fs'
import process from 'node:process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)
const TERMUX_ROOT = path.resolve(__dirname, './storage/shared/')
const TEST_ROOT = path.resolve(__dirname, '../test')
const IS_TEST = !!statSync(TEST_ROOT, { throwIfNoEntry: false })?.isDirectory()
const ROOT = IS_TEST ? TEST_ROOT : TERMUX_ROOT

export const fs = {
  constants,
  access: (p, m) => _fs.access(path.join(ROOT, p), m),
  stat: p => _fs.stat(path.join(ROOT, p)),
  readdir: p => _fs.readdir(path.join(ROOT, p)),
  rm: (p, o) => {
    if (!IS_TEST)
      return _fs.rm(path.join(ROOT, p), o)
  },
}

export function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}
