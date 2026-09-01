

import { ElementRef } from '@angular/core'
import { OptionComponent } from './option.component'


describe('OptionComponent', () => {
    let component: OptionComponent
    let mockNativeElement: HTMLDivElement

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()

        // Use a real DOM element so fromEvent works
        mockNativeElement = document.createElement('div')
        const host: ElementRef = { nativeElement: mockNativeElement }

        component = new OptionComponent(host)
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })

    it('should expose the native element via element getter', () => {
        expect(component.element).toBe(mockNativeElement)
    })

    it('should initialize click observable on ngOnInit', () => {
        component.value = 'test-value'
        component.ngOnInit()
        expect(component.click).toBeDefined()
        expect(typeof component.click.subscribe).toBe('function')
    })

    it('should emit the value when the element is clicked', done => {
        component.value = 'option-123'
        component.ngOnInit()

        component.click.subscribe((emitted: string) => {
            expect(emitted).toBe('option-123')
            done()
        })

        mockNativeElement.dispatchEvent(new MouseEvent('click'))
    })

    it('should emit a different value when value input changes', done => {
        component.value = 'another-value'
        component.ngOnInit()

        component.click.subscribe((emitted: string) => {
            expect(emitted).toBe('another-value')
            done()
        })

        mockNativeElement.dispatchEvent(new MouseEvent('click'))
    })
})