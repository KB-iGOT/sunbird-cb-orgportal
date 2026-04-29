import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreContentComponent } from './explore-content.component';

describe('ExploreContentComponent', () => {
  let component: ExploreContentComponent;
  let fixture: ComponentFixture<ExploreContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExploreContentComponent]
    });
    fixture = TestBed.createComponent(ExploreContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
