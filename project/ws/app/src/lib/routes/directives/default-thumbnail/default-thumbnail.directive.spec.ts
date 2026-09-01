import { DefaultThumbnailDirective } from './default-thumbnail.directive'

describe('DefaultThumbnailDirective', () => {
  let directive: DefaultThumbnailDirective

  beforeEach(() => {
    // Create an instance of the directive
    directive = new DefaultThumbnailDirective()
  })

  it('should create the directive', () => {
    expect(directive).toBeTruthy()
  })

  it('should update srcUrl when ngOnChanges is called with a valid src', () => {
    // Simulate input changes
    directive.src = 'new-src.jpg'
    directive.ngOnChanges()

    expect(directive.srcUrl).toBe('new-src.jpg')
  })

  it('should set srcUrl to wsUtilsDefaultThumbnail if error occurs and isSrcUpdateAttemptedForDefault is false', () => {
    // Simulate the inputs
    directive.wsUtilsDefaultThumbnail = 'default-thumbnail.jpg'
    directive.srcUrl = 'initial-src.jpg'
    directive.isSrcUpdateAttemptedForDefault = false

    // Simulate the error listener
    directive.updateSrc()

    // Check if the srcUrl was updated to the default thumbnail
    expect(directive.srcUrl).toBe('default-thumbnail.jpg')
    expect(directive.isSrcUpdateAttemptedForDefault).toBe(true)
  })

  it('should not change srcUrl if isSrcUpdateAttemptedForDefault is true', () => {
    // Simulate inputs
    directive.wsUtilsDefaultThumbnail = 'default-thumbnail.jpg'
    directive.srcUrl = 'initial-src.jpg'
    directive.isSrcUpdateAttemptedForDefault = true

    // Simulate the error listener
    directive.updateSrc()

    // Check if srcUrl remains unchanged
    expect(directive.srcUrl).toBe('initial-src.jpg')
  })
})
