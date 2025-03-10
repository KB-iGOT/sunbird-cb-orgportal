
import { ActivatedRouteSnapshot } from '@angular/router'
import { of } from 'rxjs'
import { forkJoin } from 'rxjs'
import { InitResolver } from './init-resolve.service'

// Mock the services that are commented out in the original code
jest.mock('rxjs', () => ({
  of: jest.fn(),
  forkJoin: jest.fn(),
}))

describe('InitResolver', () => {
  let resolver: InitResolver

  beforeEach(() => {
    // Initialize resolver, dependencies are not needed because they are commented out
    resolver = new InitResolver()
  })

  it('should create an instance of InitResolver', () => {
    expect(resolver).toBeTruthy()
  })

  it('should return an observable with undefined when route data does not contain "ckeditor"', () => {
    const route: ActivatedRouteSnapshot = {
      data: {
        load: []
      },
    } as any;

    // Mock the forkJoin method to return an observable of undefined
    (of as jest.Mock).mockReturnValue(of(undefined));
    (forkJoin as jest.Mock).mockReturnValue(of(undefined))

    resolver.resolve(route).subscribe(result => {
      expect(result).toEqual(undefined)
    })

    // Verify that forkJoin is being called correctly
    expect(forkJoin).toHaveBeenCalledWith([of(undefined)])
  })

  it('should call forkJoin when route data contains "ckeditor"', () => {
    const route: ActivatedRouteSnapshot = {
      data: {
        load: ['ckeditor']
      },
    } as any;

    // Mock the forkJoin method to return an observable of undefined
    (of as jest.Mock).mockReturnValue(of(undefined));
    (forkJoin as jest.Mock).mockReturnValue(of(undefined))

    resolver.resolve(route).subscribe(result => {
      expect(result).toEqual(undefined)
      // Ensure forkJoin is called
      expect(forkJoin).toHaveBeenCalled()
    })
  })

  it('should handle an empty load array in route data', () => {
    const route: ActivatedRouteSnapshot = {
      data: {
        load: []
      },
    } as any;

    // Mock the forkJoin method to return an observable of undefined
    (of as jest.Mock).mockReturnValue(of(undefined));
    (forkJoin as jest.Mock).mockReturnValue(of(undefined))

    resolver.resolve(route).subscribe(result => {
      expect(result).toEqual(undefined)
      expect(forkJoin).toHaveBeenCalledWith([of(undefined)])
    })
  })

  it('should handle missing load array in route data', () => {
    const route: ActivatedRouteSnapshot = {
      data: {} // No load property
    } as any;

    // Mock the forkJoin method to return an observable of undefined
    (of as jest.Mock).mockReturnValue(of(undefined));
    (forkJoin as jest.Mock).mockReturnValue(of(undefined))

    resolver.resolve(route).subscribe(result => {
      expect(result).toEqual(undefined)
      expect(forkJoin).toHaveBeenCalledWith([of(undefined)])
    })
  })
})
