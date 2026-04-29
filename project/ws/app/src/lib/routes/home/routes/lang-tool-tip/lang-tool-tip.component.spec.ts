import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LangToolTipComponent } from './lang-tool-tip.component';

describe('LangToolTipComponent', () => {
  let component: LangToolTipComponent;
  let fixture: ComponentFixture<LangToolTipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LangToolTipComponent]
    });
    fixture = TestBed.createComponent(LangToolTipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
