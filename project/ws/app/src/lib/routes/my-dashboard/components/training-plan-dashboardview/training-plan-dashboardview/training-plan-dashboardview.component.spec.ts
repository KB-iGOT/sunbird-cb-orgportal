import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingPlanDashboardviewComponent } from './training-plan-dashboardview.component';

describe('TrainingPlanDashboardviewComponent', () => {
  let component: TrainingPlanDashboardviewComponent;
  let fixture: ComponentFixture<TrainingPlanDashboardviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingPlanDashboardviewComponent]
    });
    fixture = TestBed.createComponent(TrainingPlanDashboardviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
