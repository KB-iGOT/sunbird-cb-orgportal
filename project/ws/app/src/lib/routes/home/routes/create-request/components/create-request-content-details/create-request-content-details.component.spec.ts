import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRequestContentDetailsComponent } from './create-request-content-details.component';

describe('CreateRequestContentDetailsComponent', () => {
  let component: CreateRequestContentDetailsComponent;
  let fixture: ComponentFixture<CreateRequestContentDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRequestContentDetailsComponent]
    });
    fixture = TestBed.createComponent(CreateRequestContentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
