import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { DndSnippetComponent } from './dnd-snippet.component'

describe('DndSnippetComponent', () => {
  let component: DndSnippetComponent
  let fixture: ComponentFixture<DndSnippetComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DndSnippetComponent],
    })
    .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(DndSnippetComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
