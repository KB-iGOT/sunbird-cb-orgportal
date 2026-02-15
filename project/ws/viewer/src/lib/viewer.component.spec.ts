import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ViewerComponent } from './viewer.component'
import { NO_ERRORS_SCHEMA } from '@angular/core'

describe('ViewerComponent', () => {
  let component: ViewerComponent
  let fixture: ComponentFixture<ViewerComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NO_ERRORS_SCHEMA],
      declarations: [ViewerComponent],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
