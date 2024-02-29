'use strict'
import path from 'node:path'
import colors from 'colors/safe.js'
import { ask, fs } from './utils.js'
import rules from './rules.js'

async function scan(dir = '') {
  const children = await fs.readdir(dir)
  let remain = 0
  const result = await children.reduce(async (prev, current) => {
    let list = await prev
    const full = path.join(dir, current)
    try {
      await fs.access(full, fs.constants.R_OK | fs.constants.W_OK)
      const state = await fs.stat(full)
      const isDirectory = state.isDirectory()
      const isFile = state.isFile()
      if (isDirectory || isFile) {
        const fullPath = isDirectory ? `${full}/` : full
        switch (rules(fullPath)) {
          case 1:
            list.push(fullPath)
            break
          case 0: {
            if (isDirectory) {
              const { remain: subRemain, result: subResult } = await scan(full)
              if (Array.isArray(subResult) && subResult.length)
                list = list.concat(subResult)

              if (subRemain === 0)
                list.push(fullPath)
              else
                remain++
            }
            else {
              remain++
            }
            break
          }
          default:
            remain++
        }
      }
      else {
        remain++
      }
    }
    catch (e) {
      remain++
      // console.log(e);
    }
    return list
  }, [])
  return { result, remain }
}

async function main() {
  const { result } = await scan()
  if (Array.isArray(result) && result.length) {
    for (const item of result)
      console.log(colors.green(item))

    if (await ask('DELETE(y/N)? ') === 'y') {
      for (const item of result)
        await fs.rm(item, { force: true, recursive: true })
    }
  }
}

main()
