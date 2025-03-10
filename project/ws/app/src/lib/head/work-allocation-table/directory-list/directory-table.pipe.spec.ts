
import * as _ from 'lodash'
import { ListPipePipe } from './directory-table.pipe'

describe('ListPipePipe', () => {
  let pipe: ListPipePipe

  beforeEach(() => {
    pipe = new ListPipePipe() // Create an instance of the pipe
  })

  it('should be created', () => {
    expect(pipe).toBeTruthy()
  })

  it('should transform the list correctly', () => {
    // Test data
    const input = [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 20 },
      { name: 'Doe', age: 30 }
    ]

    const expected = 'Jane<br />John<br />Doe' // Expected transformed result
    const args = 'name' // The argument to be accessed from each object

    // Call the transform method
    const result = pipe.transform(input, args)

    // Check if the result matches the expected outcome
    expect(result).toBe(expected)
  })

  it('should handle empty arrays', () => {
    const input: any = []
    const args = 'name'
    const result = pipe.transform(input, args)
    expect(result).toBe('')
  })

  it('should handle undefined or null input', () => {
    const input = undefined
    const args = 'name'
    const result = pipe.transform(input, args)
    expect(result).toBe('')
  })

  it('should return a correctly ordered and formatted result', () => {
    const input = [
      { name: 'Zara', age: 35 },
      { name: 'Anna', age: 22 },
      { name: 'Bob', age: 28 }
    ]
    const args = 'name'

    const expected = 'Anna<br />Bob<br />Zara' // Expected sorted result

    const result = pipe.transform(input, args)

    // Check if it orders the names alphabetically and joins them with <br />
    expect(result).toBe(expected)
  })
})
