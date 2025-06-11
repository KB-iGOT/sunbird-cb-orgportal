import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentNominateLearnerComponent } from './content-nominate-learner.component';

describe('ContentNominateLearnerComponent', () => {
  let component: ContentNominateLearnerComponent;
  let fixture: ComponentFixture<ContentNominateLearnerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ContentNominateLearnerComponent]
    });
    fixture = TestBed.createComponent(ContentNominateLearnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
