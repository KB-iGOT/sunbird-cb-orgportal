import { DisableButtonOnSubmitDirective } from "./DisableButtonOnSubmitDirective"


describe('DisableButtonOnSubmitDirective', () => {
  let directive: DisableButtonOnSubmitDirective
  let mockElementRef: { nativeElement: { setAttribute: jest.Mock, removeAttribute: jest.Mock } }

  beforeEach(() => {
    // Mock the ElementRef
    mockElementRef = {
      nativeElement: {
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      }
    }

    // Instantiate the directive with the mocked ElementRef
    directive = new DisableButtonOnSubmitDirective(mockElementRef as any)
  })

  it('should disable the button on click and enable it after 1500ms', () => {
    // Trigger the click event
    directive.clickEvent()

    // Check if the setAttribute method is called with 'disabled' as the argument
    expect(mockElementRef.nativeElement.setAttribute).toHaveBeenCalledWith('disabled', 'true')

    // Fast-forward the timer to simulate the timeout
    jest.advanceTimersByTime(1500)

    // Check if the removeAttribute method is called after 1500ms
    expect(mockElementRef.nativeElement.removeAttribute).toHaveBeenCalledWith('disabled')
  })
})
