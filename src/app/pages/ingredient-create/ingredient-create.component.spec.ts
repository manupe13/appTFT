import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngredientCreateComponent } from './ingredient-create.component';

describe('IngredientCreateComponent', () => {
  let component: IngredientCreateComponent;
  let fixture: ComponentFixture<IngredientCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IngredientCreateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngredientCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
