import { Component, OnInit } from '@angular/core';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { IngredientService } from 'src/app/services/ingredient.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { Observable } from 'rxjs';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef

@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.component.html',
  styleUrls: ['./pantry.component.css']
})
export class PantryComponent implements OnInit {

  userId: string = 'null';
  user: User = {};
  ingredientList: { ingredient: Ingredient, count: number }[] = [];
  consumedIngredientsList: Ingredient[] = [];
  currentView: string = 'existentes'; // Propiedad para realizar un seguimiento de la vista actual

  ingredientes: Observable<Ingredient[]>;

  constructor(
    private globalData: GlobalDataService,
    private router: Router,
    private userService: UserService,
    private ingredientService: IngredientService,
    private cdr: ChangeDetectorRef // Agregar ChangeDetectorRef en el constructor
  ) {
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
            if (!this.ingredientList.length) { // Verifica si la lista ya está inicializada
              this.initExistentesList();
            }
            if (!this.consumedIngredientsList.length) {
              this.initConsumidosList();
            }
          });
        }).catch(error => {
          console.error(error);
        });
      }
    });
  }

  initExistentesList() {
    this.ingredientList = []; // Limpia la lista antes de inicializar
    if (this.user.existentes) {
      this.user.existentes.forEach(element => {
        const [ingredientId, count] = element.split(':');
        this.ingredientService.getIngredientById(ingredientId).subscribe(ingredient => {
          const existingIngredientIndex = this.ingredientList.findIndex(item => item.ingredient.id === ingredientId);
          if (existingIngredientIndex === -1) {
            this.ingredientList.push({ ingredient, count: parseInt(count, 10) });
          } else {
            this.ingredientList[existingIngredientIndex].count += parseInt(count, 10);
          }
          this.ingredientList = [...this.ingredientList]; // Crear una copia de la lista para forzar la detección de cambios
          this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
        });
      });
    }
  }

  initConsumidosList() {
    if (this.user.consumidos) {
      this.user.consumidos.forEach(ingredientId => {
        this.ingredientService.getIngredientById(ingredientId).subscribe(ingredient => {
          if (!this.consumedIngredientsList.some(item => item.id === ingredientId)) {
            this.consumedIngredientsList.push(ingredient);
          }
          this.consumedIngredientsList = [...this.consumedIngredientsList]; // Crear una copia de la lista para forzar la detección de cambios
          this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
        });
      });
    }
  }

  incrementCount(index: number) {
    const item = this.ingredientList[index];
    this.userService.addIngredientToUser(this.userId, item.ingredient.id!).then(success => {
      if (success) {
        item.count += 1;
        this.ingredientList = [...this.ingredientList]; // Crear una copia de la lista para forzar la detección de cambios
        this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
      } else {
        console.error("Failed to increment ingredient count.");
      }
    });
  }

  decrementCount(index: number) {
    const item = this.ingredientList[index];
    if (item.count > 1) {
      this.userService.decrementIngredientFromUser(this.userId, item.ingredient.id!).then(success => {
        if (success) {
          item.count -= 1;
          this.ingredientList = [...this.ingredientList]; // Crear una copia de la lista para forzar la detección de cambios
          this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
        } else {
          console.error("Failed to decrement ingredient count.");
        }
      });
    } else {
      this.userService.decrementIngredientFromUser(this.userId, item.ingredient.id!).then(success => {
        if (success) {
          this.ingredientList.splice(index, 1);
          this.ingredientList = [...this.ingredientList]; // Crear una copia de la lista para forzar la detección de cambios
          this.consumedIngredientsList.push(item.ingredient);
          this.consumedIngredientsList = [...this.consumedIngredientsList]; // Crear una copia de la lista para forzar la detección de cambios
          this.userService.addIngredientToConsumidos(this.userId, item.ingredient.id!).then(() => {
            this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
          });
        } else {
          console.error("Failed to decrement ingredient count.");
        }
      });
    }
  }

  addToExistentes(index: number) {
    const item = this.consumedIngredientsList[index];
    this.userService.addIngredientToUser(this.userId, item.id!).then(success => {
      if (success) {
        this.consumedIngredientsList.splice(index, 1);
        this.consumedIngredientsList = [...this.consumedIngredientsList]; // Crear una copia de la lista para forzar la detección de cambios
        const existingItem = this.ingredientList.find(ingredientItem => ingredientItem.ingredient.id === item.id);
        if (existingItem) {
          existingItem.count += 1;
        } else {
          this.ingredientList.push({ ingredient: item, count: 1 });
        }
        this.ingredientList = [...this.ingredientList]; // Crear una copia de la lista para forzar la detección de cambios
        this.userService.removeIngredientFromConsumidos(this.userId, item.id!).then(() => {
          this.cdr.detectChanges(); // Forzar detección de cambios después de actualizar la lista
        });
      } else {
        console.error("Failed to add ingredient to existentes.");
      }
    });
  }

  showExistentes() {
    this.currentView = 'existentes';
    if (!this.ingredientList.length) {
      this.initExistentesList();
    }
  }

  showConsumidos() {
    this.currentView = 'consumidos';
    if (!this.consumedIngredientsList.length) {
      this.initConsumidosList();
    }
  }
}
