import { ListPipePipe } from './list-pipe.pipe'
import * as _ from 'lodash'

describe('ListPipePipe', () => {
  let pipe: ListPipePipe

  beforeEach(() => {
    // Create a new instance of the pipe before each test
    pipe = new ListPipePipe()
  })

  it('should create the pipe', () => {
    // Ensure that the pipe is instantiated correctly
    expect(pipe).toBeTruthy()
  })

  it('should transform an array of objects based on the provided key', () => {
    const inputArray = [
      { name: 'John' },
      { name: 'Jane' },
      { name: 'Doe' }
    ]
    const transformed = pipe.transform(inputArray, 'name')
    expect(transformed).toBe('Doe<br />Jane<br />John')
  })

  it('should return an empty string if the input is null or undefined', () => {
    expect(pipe.transform(null, 'name')).toBe('')
    expect(pipe.transform(undefined, 'name')).toBe('')
  })

  it('should return an empty string if the input array is empty', () => {
    expect(pipe.transform([], 'name')).toBe('')
  })

  it('should handle invalid keys gracefully', () => {
    const inputArray = [
      { name: 'John' },
      { name: 'Jane' },
      { name: 'Doe' }
    ]
    const transformed = pipe.transform(inputArray, 'age')  // Key that doesn't exist
    expect(transformed).toBe('')
  })

  it('should sort the values in ascending order based on the provided key', () => {
    const inputArray = [
      { name: 'John', age: 25 },
      { name: 'Jane', age: 22 },
      { name: 'Doe', age: 30 }
    ]
    const transformed = pipe.transform(inputArray, 'age')
    expect(transformed).toBe('22<br />25<br />30')
  })
})
