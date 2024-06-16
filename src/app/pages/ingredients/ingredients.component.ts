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

  constructor(private ingredientService: IngredientService, private globalData: GlobalDataService,private router: Router) {}

  ngOnInit() {
    this.loadIngredients();

    this.globalData.getLoggedInUserRol().subscribe(rol => {
      this.userRol = rol;
    });
  }

  authorizedRol() {
    if(this.userRol == 'Admin' || this.userRol == 'User') {
      return true;
    } else {
      return false;
    }
  }

  authorizedRolAdmin() {
    if(this.userRol == 'Admin') {
      return true;
    } else {
      return false;
    }
  }

  createIngredient(){
    if(this.authorizedRolAdmin()){
      const navExtras: NavigationExtras = {
        queryParams: {
          id: ''
        }
      };
      this.router.navigate(['ingredient-create'], navExtras);
    }
  }

  /*Hay que darle la verdadera funcionalidad que es que cada vez que le de al boton,
    se añadirá en la lista de existente del usuario ++ */

  addIngredient(){
    if(this.authorizedRolAdmin()){
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

  loadIngredients() {
    if (this.loading) return;
    this.loading = true;

    this.ingredientService.getIngredients(this.filtro).subscribe((ingredients: Ingredient[]) => {
      this.ingredients = ingredients;
      this.loading = false;
    }, (error) => {
      console.error("Error loading ingredients:", error);
      this.loading = false;
    });
  }
}
