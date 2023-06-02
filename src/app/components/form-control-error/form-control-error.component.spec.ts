import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormControlErrorComponent } from './form-control-error.component';

describe('FormControlErrorComponent', () => {
  let component: FormControlErrorComponent;
  let fixture: ComponentFixture<FormControlErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FormControlErrorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormControlErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
