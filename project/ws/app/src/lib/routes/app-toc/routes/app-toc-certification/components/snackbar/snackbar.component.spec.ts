import { SnackbarComponent } from './snackbar.component'

describe('SnackbarComponent', () => {
  let component: SnackbarComponent

  beforeEach(() => {
    component = new SnackbarComponent({ action: 'SUCCESS', code: 'cert-001' })
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set snackbarData from injected value', () => {
    expect(component.snackbarData).toEqual({ action: 'SUCCESS', code: 'cert-001' })
  })

  describe('ngOnInit()', () => {
    it('should keep existing snackbarData when data is provided', () => {
      component.ngOnInit()
      expect(component.snackbarData).toEqual({ action: 'SUCCESS', code: 'cert-001' })
    })

    it('should set default snackbarData when null is injected', () => {
      component = new SnackbarComponent(null as any)
      component.ngOnInit()
      expect(component.snackbarData).toEqual({ action: '', code: '' })
    })

    it('should set default snackbarData when undefined is injected', () => {
      component = new SnackbarComponent(undefined as any)
      component.ngOnInit()
      expect(component.snackbarData).toEqual({ action: '', code: '' })
    })
  })
})
