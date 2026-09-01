import { FilterPipe } from './filter.pipe'

describe('FilterPipe', () => {
  let pipe: FilterPipe

  beforeEach(() => {
    pipe = new FilterPipe()
  })

  it('should create the pipe', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return the same items when no searchTerm is provided', () => {
    const items = [
      { userDetails: { first_name: 'John', last_name: 'Doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, '')
    expect(result).toEqual(items)
  })

  it('should return the same items when no items are provided', () => {
    const result = pipe.transform([], 'John')
    expect(result).toBeNull()
  })

  it('should filter items by first_name', () => {
    const items = [
      { userDetails: { first_name: 'John', last_name: 'Doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'John')
    expect(result.length).toBe(1)
    expect(result[0].userDetails.first_name).toBe('John')
  })

  it('should filter items by last_name', () => {
    const items = [
      { userDetails: { first_name: 'John', last_name: 'Doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'Smith')
    expect(result.length).toBe(1)
    expect(result[0].userDetails.last_name).toBe('Smith')
  })

  it('should handle case-insensitive search for first_name and last_name', () => {
    const items = [
      { userDetails: { first_name: 'john', last_name: 'doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'JOHN')
    expect(result.length).toBe(1)
    expect(result[0].userDetails.first_name).toBe('john')
  })

  it('should return an empty array when no matching items are found', () => {
    const items = [
      { userDetails: { first_name: 'John', last_name: 'Doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'NonExistentName')
    expect(result.length).toBe(0)
  })

  it('should use custom labelKey if provided', () => {
    const items = [
      { customData: { first_name: 'John', last_name: 'Doe' } },
      { customData: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'Jane', 'customData')
    expect(result.length).toBe(1)
    expect(result[0].customData.first_name).toBe('Jane')
  })

  it('should return an empty array if labelKey is missing in the item', () => {
    const items = [
      { userDetails: { first_name: 'John', last_name: 'Doe' } },
      { userDetails: { first_name: 'Jane', last_name: 'Smith' } },
    ]
    const result = pipe.transform(items, 'john', 'nonExistingKey')
    expect(result).toEqual([])
  })
})
