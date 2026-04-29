import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { IapComponent } from './iap.component'

describe('IapComponent', () => {
  let component: IapComponent
  let fixture: ComponentFixture<IapComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [IapComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(IapComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
