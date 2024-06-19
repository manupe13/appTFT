import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { IngredientService } from 'src/app/services/ingredient.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ingredients',
  templateUrl: './ingredients.component.html',
  styleUrls: ['./ingredients.component.css']
})
export class IngredientsComponent implements OnInit {

  ingredients: Ingredient[] = [];
  loading: boolean = false;
  filtro: string = 'Todos';
  searchTerm: string = '';
  noResults: boolean = false;
  isLoggedIn: boolean = false;
  userRole: string = 'null';

  constructor(
    private ingredientService: IngredientService,
    private globalData: GlobalDataService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadIngredients();
    this.globalData.getLoggedInUserRol().subscribe(role => {
      this.userRole = role;
    });

    this.userService.userLogged().subscribe(user => {
      this.isLoggedIn = !!user;
    });
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

  createIngredient() {
    const navExtras: NavigationExtras = {
      queryParams: {
        action: 'create'
      }
    };
    this.router.navigate(['ingredient-create'], navExtras);
  }

  addIngredient() {
    // Lógica para añadir ingrediente a la despensa
  }
}
