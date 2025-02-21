import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingCheckboxComponent } from './floating-checkbox.component';

describe('FloatingCheckboxComponent', () => {
  let component: FloatingCheckboxComponent;
  let fixture: ComponentFixture<FloatingCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingCheckboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
