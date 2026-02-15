import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { ClassDiagramResultComponent } from './class-diagram-result.component'

describe('ClassDiagramResultComponent', () => {
  let component: ClassDiagramResultComponent
  let fixture: ComponentFixture<ClassDiagramResultComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClassDiagramResultComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassDiagramResultComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
