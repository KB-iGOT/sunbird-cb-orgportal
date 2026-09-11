import { FormControl } from '@angular/forms'
import { richTextLength, richTextValidator } from './rich-text.validator'

describe('richTextLength', () => {

  it('should count nothing for an empty value', () => {
    expect(richTextLength('')).toBe(0)
    expect(richTextLength(null)).toBe(0)
    expect(richTextLength(undefined)).toBe(0)
  })

  it('should count the visible text rather than the markup around it', () => {
    expect(richTextLength('<p>hello</p>')).toBe(5)
    expect(richTextLength('<p><strong>hello</strong></p>')).toBe(5)
  })

  /** The whole reason the validator exists: an untouched CKEditor holds this. */
  it('should count an empty editor paragraph as no text at all', () => {
    expect(richTextLength('<p>&nbsp;</p>')).toBe(0)
  })

  it('should read a non breaking space as an ordinary space', () => {
    expect(richTextLength('<p>a&nbsp;b</p>')).toBe(3)
    expect(richTextLength('<p>a&NBSP;b</p>')).toBe(3)
  })

  it('should ignore the whitespace around the text', () => {
    expect(richTextLength('<p>   hello   </p>')).toBe(5)
  })

  it('should count the text of a value that is not a string', () => {
    expect(richTextLength(12345)).toBe(5)
  })

  it('should keep the text of a list across its items', () => {
    expect(richTextLength('<ul><li>ab</li><li>cd</li></ul>')).toBe(4)
  })
})

describe('richTextValidator', () => {

  const validate = (value: any, min = 10, max = 20) =>
    richTextValidator(min, max)(new FormControl(value))

  it('should report required for an empty editor', () => {
    expect(validate('')).toEqual({ required: true })
    expect(validate(null)).toEqual({ required: true })
    expect(validate('<p>&nbsp;</p>')).toEqual({ required: true })
  })

  it('should report minlength on the visible text below the floor', () => {
    expect(validate('<p>short</p>')).toEqual({
      minlength: { requiredLength: 10, actualLength: 5 },
    })
  })

  it('should report maxlength on the visible text above the ceiling', () => {
    expect(validate(`<p>${'a'.repeat(21)}</p>`)).toEqual({
      maxlength: { requiredLength: 20, actualLength: 21 },
    })
  })

  it('should pass a value between the two bounds', () => {
    expect(validate('<p>a fine length</p>')).toBeNull()
  })

  it('should pass a value sitting exactly on either bound', () => {
    expect(validate('<p>aaaaaaaaaa</p>')).toBeNull()
    expect(validate(`<p>${'a'.repeat(20)}</p>`)).toBeNull()
  })

  /** Learning outcome is optional in length but still may not be left empty. */
  it('should skip the floor when no minimum is asked for', () => {
    expect(validate('<p>ab</p>', 0, 20)).toBeNull()
    expect(validate('', 0, 20)).toEqual({ required: true })
  })

  it('should skip the ceiling when no maximum is asked for', () => {
    expect(validate(`<p>${'a'.repeat(500)}</p>`, 0, 0)).toBeNull()
  })

  it('should report the shortfall before the overflow', () => {
    // a single validator only ever returns one error key, minlength is checked first
    expect(validate('<p>ab</p>', 10, 1)).toEqual({
      minlength: { requiredLength: 10, actualLength: 2 },
    })
  })
})
