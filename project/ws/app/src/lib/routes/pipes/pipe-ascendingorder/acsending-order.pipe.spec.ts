import { AcsendingOrderPipe } from './acsending-order.pipe'
import { orderBy } from 'lodash'

// Mock lodash's orderBy function
jest.mock('lodash', () => ({
  orderBy: jest.fn((array, columns, orders) => {
    // Simple implementation for testing purposes
    if (columns[0] === 'name' && orders[0] === 'asc') {
      return array.slice().sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name))
    } else if (columns[0] === 'name' && orders[0] === 'desc') {
      return array.slice().sort((a: { name: any }, b: { name: string }) => b.name.localeCompare(a.name))
    } else if (columns[0] === 'age' && orders[0] === 'asc') {
      return array.slice().sort((a: { age: number }, b: { age: number }) => a.age - b.age)
    } else if (columns[0] === 'age' && orders[0] === 'desc') {
      return array.slice().sort((a: { age: number }, b: { age: number }) => b.age - a.age)
    }
    return array
  })
}))

describe('AcsendingOrderPipe', () => {
  let pipe: AcsendingOrderPipe

  beforeEach(() => {
    pipe = new AcsendingOrderPipe()
    jest.clearAllMocks()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  describe('with invalid inputs', () => {
    it('should return the original array when value is null or undefined', () => {
      expect(pipe.transform(null as any, 'asc')).toBe(null)
      expect(pipe.transform(undefined as any, 'asc')).toBe(undefined)
    })

    it('should return the original array when order is empty or not provided', () => {
      const array = [3, 1, 2]
      expect(pipe.transform(array, '')).toBe(array)
      expect(pipe.transform(array, null as any)).toBe(array)
      expect(pipe.transform(array, undefined as any)).toBe(array)
    })

    it('should return the original array when it has only one item', () => {
      const array = [1]
      expect(pipe.transform(array, 'asc', 'age')).toBe(array)
    })
  })

  describe('sorting 1D arrays', () => {
    it('should sort a numeric array in ascending order', () => {
      const array = [3, 1, 2]
      const result = pipe.transform(array, 'asc')
      expect(result).toEqual([1, 2, 3])
    })

    it('should sort a numeric array in descending order', () => {
      const array = [3, 1, 2]
      const result = pipe.transform(array, 'desc')
      expect(result).toEqual([3, 2, 1])
    })

    it('should sort a string array in ascending order', () => {
      const array = ['c', 'a', 'b']
      const result = pipe.transform(array, 'asc')
      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('should sort a string array in descending order', () => {
      const array = ['c', 'a', 'b']
      const result = pipe.transform(array, 'desc')
      expect(result).toEqual(['c', 'b', 'a'])
    })
  })

  describe('sorting by column', () => {
    it('should call lodash orderBy with correct parameters for ascending order', () => {
      const array = [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ]

      pipe.transform(array, 'asc', 'name')

      expect(orderBy).toHaveBeenCalledWith(array, ['name'], ['asc'])
    })

    it('should call lodash orderBy with correct parameters for descending order', () => {
      const array = [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ]

      pipe.transform(array, 'desc', 'age')

      expect(orderBy).toHaveBeenCalledWith(array, ['age'], ['desc'])
    })

    it('should sort objects by name in ascending order', () => {
      const array = [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ]

      const result = pipe.transform(array, 'asc', 'name')

      expect(result).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
        { name: 'John', age: 30 }
      ])
    })

    it('should sort objects by age in descending order', () => {
      const array = [
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 }
      ]

      const result = pipe.transform(array, 'desc', 'age')

      expect(result).toEqual([
        { name: 'Bob', age: 35 },
        { name: 'John', age: 30 },
        { name: 'Alice', age: 25 }
      ])
    })
  })
})