import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { IngredientService } from 'src/app/services/ingredient.service';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.css']
})
export class IngredientsComponent implements OnInit {

  userRol: string = 'null';
  ingredients: Ingredient[] = [];
  loading: boolean = false;
  filtro: string = 'Todos';
  searchTerm: string = '';
  noResults: boolean = false;

  constructor(private ingredientService: IngredientService, private globalData: GlobalDataService, private router: Router) {}

  ngOnInit() {
    this.loadIngredients();

    this.globalData.getLoggedInUserRol().subscribe(rol => {
      this.userRol = rol;
    });
  }

  authorizedRol() {
    return this.userRol == 'Admin' || this.userRol == 'User';
  }

  authorizedRolAdmin() {
    return this.userRol == 'Admin';
  }

  createIngredient() {
    if (this.authorizedRolAdmin()) {
      const navExtras: NavigationExtras = {
        queryParams: {
          id: ''
        }
      };
      this.router.navigate(['ingredient-create'], navExtras);
    }
  }

  addIngredient() {
    if (this.authorizedRol()) {
      const navExtras: NavigationExtras = {
        queryParams: {
          id: ''
        }
      };
      this.router.navigate(['pantry'], navExtras);
    }
  }

  onFilterChange(event: any) {
    this.filtro = event.target.value;
    this.loadIngredients();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.searchIngredients();
  }

  loadIngredients() {
    if (this.loading) return;
    this.loading = true;

    this.ingredientService.getIngredients(this.filtro).subscribe((ingredients: Ingredient[]) => {
      this.ingredients = ingredients;
      this.loading = false;
      this.noResults = this.ingredients.length === 0;
    }, (error) => {
      console.error("Error loading ingredients:", error);
      this.loading = false;
    });
  }

  searchIngredients() {
    if (this.loading) return;
    this.loading = true;

    this.ingredientService.searchIngredientsByName(this.searchTerm, this.filtro).subscribe((ingredients: Ingredient[]) => {
      this.ingredients = ingredients;
      this.loading = false;
      this.noResults = this.ingredients.length === 0;
    }, (error) => {
      console.error("Error searching ingredients:", error);
      this.loading = false;
    });
  }

  goDetails(id: string) {
    const navExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };
    this.router.navigate(['ingredient-details'], navExtras);
  }
}
