
import { EventEmitter } from '@angular/core'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'
import { DebounceClickDirective } from './DebounceClickDirective'

describe('DebounceClickDirective', () => {
  let directive: DebounceClickDirective
  let mockDebounceClick: EventEmitter<any>
  let mockClicks: Subject<any>
  let mockSubscription: any

  beforeEach(() => {
    // Create a mock for the EventEmitter
    mockDebounceClick = {
      emit: jest.fn(),
    } as unknown as EventEmitter<any>

    // Create a mock for the Subject
    mockClicks = new Subject()

    // Mock the Subscription's unsubscribe method
    mockSubscription = {
      unsubscribe: jest.fn(),
    }

    // Create an instance of the directive
    directive = new DebounceClickDirective()
    directive.debounceClick = mockDebounceClick
    directive['clicks'] = mockClicks // Use the Subject as the clicks stream
  })

  it('should create the directive', () => {
    expect(directive).toBeTruthy()
  })

  it('should set debounce time to default if no input provided', () => {
    expect(directive.debounceTime).toBe(500)
  })

  it('should set custom debounce time when provided via input', () => {
    directive.debounceTime = 1000
    expect(directive.debounceTime).toBe(1000)
  })

  it('should subscribe to the clicks subject in ngOnInit', () => {
    // Spy on the pipe method and subscription
    const pipeSpy = jest.spyOn(mockClicks, 'pipe')
    directive.ngOnInit()

    expect(pipeSpy).toHaveBeenCalledWith(debounceTime(directive.debounceTime))
    expect(directive['subscription']).toBeDefined()
  })

  it('should unsubscribe from the subscription in ngOnDestroy', () => {
    directive['subscription'] = mockSubscription
    directive.ngOnDestroy()

    expect(mockSubscription.unsubscribe).toHaveBeenCalled()
  })

  it('should emit debounceClick event after debounce time', (done) => {
    // Set a shorter debounce time for test purposes
    directive.debounceTime = 100
    directive.ngOnInit()

    // Simulate a click event
    const clickEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() }
    directive.clickEvent(clickEvent)

    // After a debounce time, check if debounceClick emits the event
    setTimeout(() => {
      expect(mockDebounceClick.emit).toHaveBeenCalledWith(clickEvent)
      done()
    }, 150) // wait longer than the debounce time to trigger emission
  })

  it('should emit debounceClick event after debounce time', (done) => {
    // Set a shorter debounce time for test purposes
    directive.debounceTime = 100
    directive.ngOnInit()

    // Simulate a click event
    const clickEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() }
    directive.clickEvent(clickEvent)

    // After a debounce time, check if debounceClick emits the event
    setTimeout(() => {
      expect(mockDebounceClick.emit).toHaveBeenCalledWith(clickEvent)
      done()
    }, 150) // wait longer than the debounce time to trigger emission
  }, 10000) // Increase the timeout for this specific test

})
