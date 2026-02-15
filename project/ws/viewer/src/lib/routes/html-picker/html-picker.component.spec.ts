import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { HtmlPickerComponent } from './html-picker.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('HtmlPickerComponent', () => {
  let component: HtmlPickerComponent
  let fixture: ComponentFixture<HtmlPickerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HtmlPickerComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HtmlPickerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
