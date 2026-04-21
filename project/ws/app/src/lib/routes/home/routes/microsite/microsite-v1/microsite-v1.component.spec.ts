import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MicrositeV1Component } from './microsite-v1.component';

describe('MicrositeV1Component', () => {
  let component: MicrositeV1Component;
  let fixture: ComponentFixture<MicrositeV1Component>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MicrositeV1Component]
    });
    fixture = TestBed.createComponent(MicrositeV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
