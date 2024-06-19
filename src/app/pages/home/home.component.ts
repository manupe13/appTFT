import { Component, OnInit } from '@angular/core';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { RecipeService } from 'src/app/services/recipe.service';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { Recipe } from 'src/app/interfaces/recipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  loggedUserId: string = 'null';
  ingredients: Ingredient[] = [];
  ingredientsToShow: number = 4;
  recipes: Recipe[] = [];
  recipesToShow: number = 4;

  constructor(private globalData: GlobalDataService, private ingredientService: IngredientService, private recipeService: RecipeService) { }

  ngOnInit(): void {
    this.globalData.getLoggedUserId().subscribe(id => {
      this.loggedUserId = id;
    });

    this.loadIngredients();
    this.loadRecipes();
  }

  loadIngredients(): void {
    this.ingredientService.getRandomIngredients(4).subscribe(data => {
      this.ingredients = data;
    });
  }

  loadRecipes(): void {
    this.recipeService.getRandomRecipes(4).subscribe(data => {
      this.recipes = data;
    });
  }
}
