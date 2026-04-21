import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { HandsOnDialogComponent } from './hands-on-dialog.component'
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog'

describe('HandsOnDialogComponent', () => {
  let component: HandsOnDialogComponent
  let fixture: ComponentFixture<HandsOnDialogComponent>

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [HandsOnDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: {} },
      ],
    })
      .compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(HandsOnDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
