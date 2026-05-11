import { ComponentCanDeactivate } from './componentCanDeactivate'

// Concrete implementation for testing the abstract class
class TestableComponent extends ComponentCanDeactivate {
  private _canDeactivate = true

  canDeactivate(): boolean {
    return this._canDeactivate
  }

  setCanDeactivate(val: boolean) {
    this._canDeactivate = val
  }
}

describe('ComponentCanDeactivate', () => {
  let component: TestableComponent

  beforeEach(() => {
    component = new TestableComponent()
  })

  it('should create the component instance', () => {
    expect(component).toBeTruthy()
  })

  describe('canDeactivate()', () => {
    it('should return true when navigation is allowed', () => {
      component.setCanDeactivate(true)
      expect(component.canDeactivate()).toBe(true)
    })

    it('should return false when navigation should be blocked', () => {
      component.setCanDeactivate(false)
      expect(component.canDeactivate()).toBe(false)
    })
  })

  describe('unloadNotification()', () => {
    it('should set $event.returnValue to true when canDeactivate returns false', () => {
      component.setCanDeactivate(false)
      const event: any = {}
      component.unloadNotification(event)
      expect(event.returnValue).toBe(true)
    })

    it('should not set $event.returnValue when canDeactivate returns true', () => {
      component.setCanDeactivate(true)
      const event: any = {}
      component.unloadNotification(event)
      expect(event.returnValue).toBeUndefined()
    })

    it('should not throw when event object is empty', () => {
      component.setCanDeactivate(false)
      expect(() => component.unloadNotification({})).not.toThrow()
    })

    it('should handle truthy canDeactivate and not mutate event', () => {
      component.setCanDeactivate(true)
      const event: any = { returnValue: false }
      component.unloadNotification(event)
      // returnValue should remain unchanged (false) since canDeactivate is true
      expect(event.returnValue).toBe(false)
    })
  })
})
