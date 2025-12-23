import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequestAdditionalDetailsComponent } from './create-request-additional-details.component';

describe('CreateRequestAdditionalDetailsComponent', () => {
  let component: CreateRequestAdditionalDetailsComponent;
  let fixture: ComponentFixture<CreateRequestAdditionalDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRequestAdditionalDetailsComponent]
    });
    fixture = TestBed.createComponent(CreateRequestAdditionalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
