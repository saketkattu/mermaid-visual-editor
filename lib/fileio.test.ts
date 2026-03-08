/* eslint-disable @typescript-eslint/no-explicit-any */
import { test, describe, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import { loadDiagramJson } from './fileio.ts'

describe('loadDiagramJson', () => {
  let originalDocument: any
  let originalFileReader: any

  beforeEach(() => {
    originalDocument = global.document
    originalFileReader = global.FileReader
  })

  afterEach(() => {
    global.document = originalDocument
    global.FileReader = originalFileReader
  })

  test('rejects with error for invalid JSON syntax', async () => {
    const mockFile = { text: '{ invalid JSON }' }
    const mockInput = {
      type: '',
      accept: '',
      files: [mockFile],
      click: function() {
        if (this.onchange) {
          this.onchange({} as Event)
        }
      },
      onchange: null as any
    }

    global.document = {
      createElement: (tag: string) => {
        if (tag === 'input') return mockInput
        return {}
      }
    } as any

    global.FileReader = class MockFileReader {
      onload: any = null
      readAsText(file: any) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: file.text } })
          }
        }, 0)
      }
    } as any

    await assert.rejects(
      loadDiagramJson(),
      (err: Error) => err instanceof SyntaxError
    )
  })

  test('rejects with error for valid JSON but missing nodes or edges', async () => {
    const mockFile = { text: '{"wrong": "format"}' }
    const mockInput = {
      type: '',
      accept: '',
      files: [mockFile],
      click: function() {
        if (this.onchange) {
          this.onchange({} as Event)
        }
      },
      onchange: null as any
    }

    global.document = {
      createElement: (tag: string) => {
        if (tag === 'input') return mockInput
        return {}
      }
    } as any

    global.FileReader = class MockFileReader {
      onload: any = null
      readAsText(file: any) {
        setTimeout(() => {
          if (this.onload) {
            this.onload({ target: { result: file.text } })
          }
        }, 0)
      }
    } as any

    await assert.rejects(
      loadDiagramJson(),
      { message: 'Invalid diagram file' }
    )
  })
})
