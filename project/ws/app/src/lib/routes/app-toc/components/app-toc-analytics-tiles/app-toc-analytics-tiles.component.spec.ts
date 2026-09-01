import { AppTocAnalyticsTilesComponent } from './app-toc-analytics-tiles.component'
import { EventEmitter } from '@angular/core'

describe('AppTocAnalyticsTilesComponent', () => {
  let component: AppTocAnalyticsTilesComponent

  beforeEach(() => {
    component = new AppTocAnalyticsTilesComponent()
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should call ngOnInit without errors', () => {
    expect(() => component.ngOnInit()).not.toThrow()
  })

  it('should initialize clickEvent as an EventEmitter', () => {
    expect(component.clickEvent).toBeInstanceOf(EventEmitter)
  })

  it('should emit clickEvent with correct type when onClick is called', () => {
    const emitSpy = jest.spyOn(component.clickEvent, 'emit')
    component.onClick('users')
    expect(emitSpy).toHaveBeenCalledWith('users')
  })

  it('should emit clickEvent with any string type', () => {
    const emitSpy = jest.spyOn(component.clickEvent, 'emit')
    component.onClick('completions')
    expect(emitSpy).toHaveBeenCalledWith('completions')
  })

  it('should accept and store Input properties', () => {
    component.uniqueUsers = 42
    component.description = 'Test description'
    component.title = 'Test Title'
    component.category1 = 'Cat1'
    component.category2 = 'Cat2'
    component.category3 = 'Cat3'
    component.analyticsDataClient = { data: [] }

    expect(component.uniqueUsers).toBe(42)
    expect(component.description).toBe('Test description')
    expect(component.title).toBe('Test Title')
    expect(component.category1).toBe('Cat1')
    expect(component.category2).toBe('Cat2')
    expect(component.category3).toBe('Cat3')
    expect(component.analyticsDataClient).toEqual({ data: [] })
  })
})
