import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { SubmitQuizDialogComponent } from './submit-quiz-dialog.component'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('SubmitQuizDialogComponent', () => {
  let component: SubmitQuizDialogComponent
  let fixture: ComponentFixture<SubmitQuizDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SubmitQuizDialogComponent],
      imports: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: {} },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmitQuizDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
