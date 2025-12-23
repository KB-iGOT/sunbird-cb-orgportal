import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequestFormV2Component } from './create-request-form-v2.component';

describe('CreateRequestFormV2Component', () => {
  let component: CreateRequestFormV2Component;
  let fixture: ComponentFixture<CreateRequestFormV2Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRequestFormV2Component]
    });
    fixture = TestBed.createComponent(CreateRequestFormV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
