import { Component, OnInit } from '@angular/core';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { IngredientService } from 'src/app/services/ingredient.service';
import { UserService } from 'src/app/services/user.service';
import { RecipeService } from 'src/app/services/recipe.service';
import { User } from 'src/app/interfaces/user';
import { Recipe } from 'src/app/interfaces/recipe';
import { Observable } from 'rxjs';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { NavigationExtras, Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.component.html',
  styleUrls: ['./pantry.component.css']
})
export class PantryComponent implements OnInit {

  userId: string = 'null';
  user: User = {};
  existentesList: { ingredient: Ingredient, count: number }[] = [];
  consumidosList: { ingredient: Ingredient, count: number }[] = [];
  recommendedRecipes: Recipe[] = [];
  currentView: string = 'existentes';
  confirmationMessage: string = '';
  noRecommendations: boolean = false;

  ingredientes: Observable<Ingredient[]>;

  constructor(private globalData: GlobalDataService, private router: Router, private userService: UserService, private ingredientService: IngredientService, private recipeService: RecipeService) {
    this.ingredientes = this.ingredientService.getIngredients();
  }

  ngOnInit(): void {
    this.globalData.getLoggedUserId().subscribe(id => {
      this.userId = id;
      if (this.userId === 'null') {
        this.router.navigate(['/ingredients']);
      } else {
        this.userService.getUserById(this.userId).then(userObservable => {
          userObservable.subscribe(user => {
            this.user = user;
            this.initExistentesList();
            this.initConsumidosList();
          });
        }).catch(error => {
          console.error(error);
        });
      }
    });
  }

  initExistentesList() {
    this.existentesList = [];
    if (this.user?.existentes) {
      for (const item of this.user.existentes) {
        const [id, count] = item.split(':');
        this.ingredientService.getIngredientById(id).subscribe(ingredient => {
          if (ingredient) {
            this.existentesList.push({ ingredient, count: +count });
          }
        });
      }
    }
  }

  initConsumidosList() {
    this.consumidosList = [];
    if (this.user?.consumidos) {
      for (const item of this.user.consumidos) {
        const [id, count] = item.split(':');
        this.ingredientService.getIngredientById(id).subscribe(ingredient => {
          if (ingredient) {
            this.consumidosList.push({ ingredient, count: +count });
          }
        });
      }
    }
  }

  incrementCount(index: number) {
    const item = this.existentesList[index];
    if (item.ingredient.id) {
      item.count++;
      if (this.user && this.user.existentes) {
        this.user.existentes[index] = `${item.ingredient.id}:${item.count}`;
        this.userService.updateUser(this.userId, this.user).then(() => {
          console.log("Updated user existentes");
        }).catch(error => {
          console.error(error);
        });
      }
    }
  }

  decrementCount(index: number) {
    const item = this.existentesList[index];
    if (item.ingredient.id) {
      item.count--;
      if (item.count > 0) {
        if (this.user && this.user.existentes) {
          this.user.existentes[index] = `${item.ingredient.id}:${item.count}`;
        }
      } else {
        this.existentesList.splice(index, 1);
        if (this.user && this.user.existentes) {
          this.user.existentes.splice(index, 1);
          this.addToConsumidos(item.ingredient.id, 1);
          this.confirmationMessage = 'El ingrediente ha pasado a la lista de consumidos.';
          this.openConfirmationModal();
        }
      }
      this.userService.updateUser(this.userId, this.user).then(() => {
        console.log("Updated user existentes");
      }).catch(error => {
        console.error(error);
      });
    }
  }

  addExistentes(index: number) {
    const item = this.consumidosList[index];
    if (item.ingredient.id) {
      this.addToExistentes(item.ingredient.id, 1);
      this.consumidosList.splice(index, 1);
      if (this.user && this.user.consumidos) {
        this.user.consumidos.splice(index, 1);
        this.userService.updateUser(this.userId, this.user).then(() => {
          console.log("Updated user consumidos");
          this.confirmationMessage = 'El ingrediente se ha añadido a la lista de existentes.';
          this.openConfirmationModal();
        }).catch(error => {
          console.error(error);
        });
      }
    }
  }

  addToExistentes(ingredientId: string, count: number) {
    if (this.user?.existentes) {
      let found = false;
      for (let i = 0; i < this.user.existentes.length; i++) {
        const [id, currentCount] = this.user.existentes[i].split(':');
        if (id === ingredientId) {
          this.user.existentes[i] = `${id}:${+currentCount + count}`;
          found = true;
          break;
        }
      }
      if (!found) {
        this.user.existentes.push(`${ingredientId}:${count}`);
      }
    }
  }

  addToConsumidos(ingredientId: string, count: number) {
    if (this.user?.consumidos) {
      let found = false;
      for (let i = 0; i < this.user.consumidos.length; i++) {
        const [id, currentCount] = this.user.consumidos[i].split(':');
        if (id === ingredientId) {
          this.user.consumidos[i] = `${id}:${+currentCount + count}`;
          found = true;
          break;
        }
      }
      if (!found) {
        this.user.consumidos.push(`${ingredientId}:${count}`);
      }
    }
  }

  switchView(view: string) {
    this.currentView = view;
    if (view === 'recomendaciones') {
      this.loadRecommendedRecipes();
    }
  }

  goIngredientDetails(id: string) {
    const navExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };
    this.router.navigate(['ingredient-details'], navExtras);
  }

  goRecipeDetails(id: string) {
    const navExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };
    this.router.navigate(['recipe-details'], navExtras);
  }

  openConfirmationModal() {
    $('#confirmationModal').modal('show');
    setTimeout(() => {
      this.closeConfirmationModal();
    }, 2000);
  }

  closeConfirmationModal() {
    $('#confirmationModal').modal('hide');
  }

  loadRecommendedRecipes() {
    const ingredientNames = this.existentesList.map(item => this.normalizeAndExtractIngredient(item.ingredient.nombre!));
    this.recipeService.getRecipesByIngredients(ingredientNames).subscribe(recipes => {
      this.recommendedRecipes = recipes;
      this.noRecommendations = this.recommendedRecipes.length === 0;
    });
  }

  private normalizeAndExtractIngredient(ingredient: string): string {
    return ingredient.replace(/[\d.,]/g, '').replace(/\b(ml|g|kg|l|oz|tbsp|tsp)\b/gi, '').trim().toLowerCase();
  }

}
