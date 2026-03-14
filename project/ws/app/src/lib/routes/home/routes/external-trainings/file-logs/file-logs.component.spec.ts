import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileLogsComponent } from './file-logs.component';

describe('FileLogsComponent', () => {
  let component: FileLogsComponent;
  let fixture: ComponentFixture<FileLogsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileLogsComponent]
    });
    fixture = TestBed.createComponent(FileLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
