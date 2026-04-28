import { CreateRequestFormV2Component } from './create-request-form-v2.component'
import { of, throwError, Subject } from 'rxjs'

describe('CreateRequestFormV2Component', () => {
  let component: CreateRequestFormV2Component
  let mockRouter: any
  let mockDialog: any
  let mockActivatedRoute: any
  let mockSnackBar: any
  let mockCreateRequestSvc: any
  let queryParamsSubject: Subject<any>

  beforeEach(() => {
    jest.useFakeTimers()

    queryParamsSubject = new Subject<any>()

    mockRouter = { navigateByUrl: jest.fn() }

    mockDialog = {
      open: jest.fn().mockReturnValue({
        afterClosed: jest.fn().mockReturnValue(of(null)),
        close: jest.fn(),
      }),
    }

    mockActivatedRoute = {
      queryParams: queryParamsSubject.asObservable(),
    }

    mockSnackBar = { open: jest.fn() }

    mockCreateRequestSvc = {
      createRequestForm: jest.fn().mockReturnValue(of({ success: true })),
    }

    component = new CreateRequestFormV2Component(
      mockRouter,
      mockDialog,
      mockActivatedRoute,
      mockSnackBar,
      mockCreateRequestSvc,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  // ─── creation ────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should default viewMode to "Create"', () => {
    expect(component.viewMode).toBe('Create')
  })

  it('should default isHideData to false', () => {
    expect(component.isHideData).toBe(false)
  })

  // ─── ngOnInit ────────────────────────────────────────────────────────────────

  describe('ngOnInit', () => {
    it('should call routeSubscription', () => {
      const spy = jest.spyOn(component, 'routeSubscription')
      component.ngOnInit()
      expect(spy).toHaveBeenCalled()
    })
  })

  // ─── routeSubscription ───────────────────────────────────────────────────────

  describe('routeSubscription', () => {
    it('should set viewMode from params.name when params has id', () => {
      component.routeSubscription()
      queryParamsSubject.next({ id: '123', name: 'EditMode' })
      expect(component.viewMode).toBe('EditMode')
    })

    it('should not change viewMode when params has no id', () => {
      component.routeSubscription()
      queryParamsSubject.next({})
      expect(component.viewMode).toBe('Create')
    })

    it('should handle multiple emissions and use the latest', () => {
      component.routeSubscription()
      queryParamsSubject.next({ id: '1', name: 'First' })
      queryParamsSubject.next({ id: '2', name: 'Second' })
      expect(component.viewMode).toBe('Second')
    })
  })

  // ─── navigateBack ────────────────────────────────────────────────────────────

  describe('navigateBack', () => {
    it('should navigate to /app/home/request-list', () => {
      component.navigateBack()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/request-list')
    })
  })

  // ─── onSubmit ────────────────────────────────────────────────────────────────

  describe('onSubmit', () => {
    it('should call showDialogBox with "progress" immediately', () => {
      const spy = jest.spyOn(component, 'showDialogBox')
      component.onSubmit({ title: 'test' })
      expect(spy).toHaveBeenCalledWith('progress')
    })

    it('should call createRequestForm with the request body', () => {
      const body = { title: 'Test Request' }
      component.onSubmit(body)
      expect(mockCreateRequestSvc.createRequestForm).toHaveBeenCalledWith(body)
    })

    it('should call showDialogBox with "progress-completed" on success', () => {
      const spy = jest.spyOn(component, 'showDialogBox')
      component.onSubmit({})
      expect(spy).toHaveBeenCalledWith('progress-completed')
    })

    it('should close dialog, navigate and show snackbar after 1s on success', () => {
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
        close: jest.fn(),
      }
      mockDialog.open.mockReturnValue(mockDialogRef)
      component.onSubmit({})
      jest.advanceTimersByTime(1000)
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/request-list')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Request submitted successfully ')
    })

    it('should not navigate/snackbar before 1s timeout', () => {
      component.onSubmit({})
      jest.advanceTimersByTime(500)
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })

    it('should close dialog and show error snackbar on error', () => {
      mockCreateRequestSvc.createRequestForm.mockReturnValue(
        throwError(() => ({ message: 'Server Error' }))
      )
      const mockDialogRef = {
        afterClosed: jest.fn().mockReturnValue(of(null)),
        close: jest.fn(),
      }
      mockDialog.open.mockReturnValue(mockDialogRef)
      component.onSubmit({})
      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Something went wrong, please try again.')
    })

    it('should not crash when response is falsy', () => {
      mockCreateRequestSvc.createRequestForm.mockReturnValue(of(null))
      expect(() => component.onSubmit({})).not.toThrow()
    })
  })

  // ─── showDialogBox ───────────────────────────────────────────────────────────

  describe('showDialogBox', () => {
    it('should open dialog with progress type data', () => {
      component.showDialogBox('progress')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: expect.objectContaining({ type: 'progress', icon: 'vega' }),
        })
      )
    })

    it('should open dialog with progress-completed type data', () => {
      component.showDialogBox('progress-completed')
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'progress-completed',
            icon: 'accept_icon',
            primaryAction: 'Successfully created....',
          }),
        })
      )
    })

    it('should close existing dialogRefs before opening a new one', () => {
      const existingRef = { close: jest.fn(), afterClosed: jest.fn().mockReturnValue(of(null)) }
      component.dialogRefs = existingRef
      component.showDialogBox('progress')
      expect(existingRef.close).toHaveBeenCalled()
    })

    it('should still call openDialoagBox even for an unknown event string', () => {
      const spy = jest.spyOn(component, 'openDialoagBox')
      component.showDialogBox('unknown-event')
      expect(spy).toHaveBeenCalledWith({})
    })

    it('should not call openDialoagBox when event is falsy', () => {
      const spy = jest.spyOn(component, 'openDialoagBox')
      component.showDialogBox(null)
      expect(spy).not.toHaveBeenCalled()
    })

    it('should not call openDialoagBox when event is empty string', () => {
      const spy = jest.spyOn(component, 'openDialoagBox')
      component.showDialogBox('')
      expect(spy).not.toHaveBeenCalled()
    })
  })

  // ─── openDialoagBox ──────────────────────────────────────────────────────────

  describe('openDialoagBox', () => {
    it('should call dialog.open with ConfirmationBoxComponent and disableClose=true', () => {
      component.openDialoagBox({ type: 'test', icon: 'icon', title: 'T', subTitle: 'S' })
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ disableClose: true })
      )
    })

    it('should pass dialogData fields to the dialog data', () => {
      const data = { type: 'progress', icon: 'vega', title: 'Title', subTitle: 'Sub', primaryAction: 'OK' }
      component.openDialoagBox(data)
      expect(mockDialog.open).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          data: expect.objectContaining({
            type: 'progress',
            icon: 'vega',
            title: 'Title',
            subTitle: 'Sub',
            primaryAction: 'OK',
          }),
        })
      )
    })

    it('should store the dialog reference in dialogRefs', () => {
      const mockRef = { afterClosed: jest.fn().mockReturnValue(of(null)), close: jest.fn() }
      mockDialog.open.mockReturnValue(mockRef)
      component.openDialoagBox({ type: 'x' })
      expect(component.dialogRefs).toBe(mockRef)
    })

    it('should subscribe to afterClosed without error', () => {
      expect(() =>
        component.openDialoagBox({ type: 'progress' })
      ).not.toThrow()
    })
  })
})
