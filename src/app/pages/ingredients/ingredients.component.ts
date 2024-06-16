import { Component, OnInit } from '@angular/core';
import { QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { IngredientService } from 'src/app/services/ingredient.service';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.css']
})
export class IngredientsComponent implements OnInit {
  ingredients: Ingredient[] = [];
  lastIngredientDoc?: QueryDocumentSnapshot<Ingredient>;
  limit: number = 5;
  loading: boolean = false;
  allLoaded: boolean = false;

  constructor(private ingredientService: IngredientService) {}

  ngOnInit() {
    this.loadIngredients();
  }

  loadIngredients() {
    if (this.loading || this.allLoaded) return;
    this.loading = true;

    this.ingredientService.getIngredients(this.limit, this.lastIngredientDoc).subscribe((newIngredients: Ingredient[]) => {
      this.ingredients = this.ingredients.concat(newIngredients);
      if (newIngredients.length < this.limit) {
        this.allLoaded = true;
      } else {
        this.lastIngredientDoc = newIngredients[newIngredients.length - 1] as any;
      }
      this.loading = false;
    });
  }
}
