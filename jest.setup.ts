import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util'

// These globals are only relevant in jsdom (browser-like) environments
if (typeof window !== 'undefined') {
  // jsdom doesn't implement scrollIntoView
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
}

// jsdom doesn't expose TextEncoder/TextDecoder as globals
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}
