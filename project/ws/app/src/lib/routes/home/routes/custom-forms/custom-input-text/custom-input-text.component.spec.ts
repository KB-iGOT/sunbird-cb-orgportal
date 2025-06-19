import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInputTextComponent } from './custom-input-text.component';

describe('CustomInputTextComponent', () => {
  let component: CustomInputTextComponent;
  let fixture: ComponentFixture<CustomInputTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomInputTextComponent]
    });
    fixture = TestBed.createComponent(CustomInputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
