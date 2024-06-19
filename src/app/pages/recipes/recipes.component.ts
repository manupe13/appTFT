import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { Recipe } from 'src/app/interfaces/recipe';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { RecipeService } from 'src/app/services/recipe.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.component.html',
  styleUrls: ['./recipes.component.css']
})
export class RecipesComponent implements OnInit {

  recipes: Recipe[] = [];
  loading: boolean = false;
  filtro: string = 'Todos';
  searchTerm: string = '';
  noResults: boolean = false;
  isLoggedIn: boolean = false;
  userRole: string = 'null';

  constructor(
    private recipeService: RecipeService,
    private globalData: GlobalDataService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadRecipes();
    this.globalData.getLoggedInUserRol().subscribe(role => {
      this.userRole = role;
    });

    this.userService.userLogged().subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  onFilterChange(event: any) {
    this.filtro = event.target.value;
    this.loadRecipes();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.searchRecipes();
  }

  loadRecipes() {
    if (this.loading) return;
    this.loading = true;

    this.recipeService.getRecipes(this.filtro).subscribe((recipes: Recipe[]) => {
      this.recipes = recipes;
      this.loading = false;
      this.noResults = this.recipes.length === 0;
    }, (error) => {
      console.error("Error loading recipes:", error);
      this.loading = false;
    });
  }

  searchRecipes() {
    if (this.loading) return;
    this.loading = true;

    this.recipeService.searchRecipesByName(this.searchTerm, this.filtro).subscribe((recipes: Recipe[]) => {
      this.recipes = recipes;
      this.loading = false;
      this.noResults = this.recipes.length === 0;
    }, (error) => {
      console.error("Error searching recipes:", error);
      this.loading = false;
    });
  }

  goDetails(id: string) {
    const navExtras: NavigationExtras = {
      queryParams: {
        id: id
      }
    };
    this.router.navigate(['recipe-details'], navExtras);
  }

  createRecipe() {
    const navExtras: NavigationExtras = {
      queryParams: {
        action: 'create'
      }
    };
    this.router.navigate(['recipe-create'], navExtras);
  }

}
