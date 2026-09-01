import { ListPipePipe } from './list-pipe.pipe'
import * as _ from 'lodash'

describe('ListPipePipe', () => {
  let pipe: ListPipePipe

  beforeEach(() => {
    pipe = new ListPipePipe()
  })

  it('should be defined', () => {
    expect(pipe).toBeDefined()
  })

  it('should transform the input array into a string of values joined by <br />', () => {
    const input = [{ name: 'John' }, { name: 'Jane' }, { name: 'Doe' }]
    const args = 'name'

    const result = pipe.transform(input, args)

    expect(result).toBe('Doe<br />Jane<br />John')
  })

  it('should return an empty string if the input array is empty', () => {
    const input: any = []
    const args = 'name'

    const result = pipe.transform(input, args)

    expect(result).toBe('')
  })

  it('should handle undefined input gracefully', () => {
    const input = undefined
    const args = 'name'

    const result = pipe.transform(input, args)

    expect(result).toBe('')
  })

  it('should handle null input gracefully', () => {
    const input = null
    const args = 'name'

    const result = pipe.transform(input, args)

    expect(result).toBe('')
  })

  it('should return the correct transformation when no args are passed', () => {
    const input = [{ name: 'Apple' }, { name: 'Banana' }]
    const args = 'name'

    const result = pipe.transform(input, args)

    expect(result).toBe('Apple<br />Banana')
  })

  it('should handle when the property does not exist in the objects', () => {
    const input = [{ name: 'John' }, { name: 'Jane' }]
    const args = 'age'

    const result = pipe.transform(input, args)

    expect(result).toBe('')
  })
})
