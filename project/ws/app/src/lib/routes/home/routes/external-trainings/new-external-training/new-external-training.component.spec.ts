import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewExternalTrainingComponent } from './new-external-training.component';

describe('NewExternalTrainingComponent', () => {
  let component: NewExternalTrainingComponent;
  let fixture: ComponentFixture<NewExternalTrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewExternalTrainingComponent]
    });
    fixture = TestBed.createComponent(NewExternalTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
