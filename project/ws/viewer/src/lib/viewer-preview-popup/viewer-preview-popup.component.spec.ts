import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ViewerPreviewPopupComponent } from './viewer-preview-popup.component'

describe('ViewerPreviewPopupComponent', () => {
  let component: ViewerPreviewPopupComponent
  let fixture: ComponentFixture<ViewerPreviewPopupComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewerPreviewPopupComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewerPreviewPopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
