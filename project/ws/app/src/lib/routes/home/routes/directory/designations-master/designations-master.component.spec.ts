import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesignationsMasterComponent } from './designations-master.component';

describe('DesignationsMasterComponent', () => {
  let component: DesignationsMasterComponent;
  let fixture: ComponentFixture<DesignationsMasterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DesignationsMasterComponent]
    });
    fixture = TestBed.createComponent(DesignationsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
