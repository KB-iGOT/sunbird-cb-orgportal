import { MetaTag } from './meta-tag.model'

describe('MetaTag', () => {
  it('should create an instance with all properties', () => {
    const tag = new MetaTag('og:title', 'My Title', true)
    expect(tag).toBeTruthy()
    expect(tag.name).toBe('og:title')
    expect(tag.value).toBe('My Title')
    expect(tag.isFacebook).toBe(true)
  })

  it('should set isFacebook to false', () => {
    const tag = new MetaTag('description', 'A description', false)
    expect(tag.isFacebook).toBe(false)
  })

  it('should allow empty string name and value', () => {
    const tag = new MetaTag('', '', false)
    expect(tag.name).toBe('')
    expect(tag.value).toBe('')
  })

  it('should store the exact values passed to constructor', () => {
    const name = 'twitter:card'
    const value = 'summary_large_image'
    const tag = new MetaTag(name, value, true)
    expect(tag.name).toBe(name)
    expect(tag.value).toBe(value)
    expect(tag.isFacebook).toBe(true)
  })
})
