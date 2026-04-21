import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { VideoComponent } from './video.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

describe('VideoComponent', () => {
  let component: VideoComponent
  let fixture: ComponentFixture<VideoComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VideoComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
