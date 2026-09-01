import { FilterSearchPipe } from './filter-search.pipe'

describe('FilterSearchPipe', () => {
  let pipe: FilterSearchPipe

  beforeEach(() => {
    pipe = new FilterSearchPipe()
  })

  it('should create an instance of the pipe', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return an empty array if no items are provided', () => {
    const result = pipe.transform([], 'searchText')
    expect(result).toEqual([])
  })

  it('should return the same array if searchText is empty', () => {
    const items = [{ name: 'item1' }, { name: 'item2' }]
    const result = pipe.transform(items, '')
    expect(result).toEqual(items)
  })

  it('should filter items based on searchText', () => {
    const items = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Cherry' }
    ]
    const searchText = 'ban'
    const result = pipe.transform(items, searchText)
    expect(result).toEqual([{ name: 'Banana' }])
  })

  it('should return an empty array if no items match the searchText', () => {
    const items = [
      { name: 'Apple' },
      { name: 'Banana' },
      { name: 'Cherry' }
    ]
    const searchText = 'grape'
    const result = pipe.transform(items, searchText)
    expect(result).toEqual([])
  })

  it('should be case insensitive when filtering items', () => {
    const items = [
      { name: 'apple' },
      { name: 'Banana' },
      { name: 'cherry' }
    ]
    const searchText = 'APPLE'
    const result = pipe.transform(items, searchText)
    expect(result).toEqual([{ name: 'apple' }])
  })
})
