import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

import { AccountComponent } from './pages/account/account.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HomeComponent } from './pages/home/home.component';
import { IngredientCreateComponent } from './pages/ingredient-create/ingredient-create.component';
import { IngredientDetailsComponent } from './pages/ingredient-details/ingredient-details.component';
import { IngredientsComponent } from './pages/ingredients/ingredients.component';
import { LoginComponent } from './pages/login/login.component';
import { PantryComponent } from './pages/pantry/pantry.component';
import { RecipeCreateComponent } from './pages/recipe-create/recipe-create.component';
import { RecipeDetailsComponent } from './pages/recipe-details/recipe-details.component';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { RegisterComponent } from './pages/register/register.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';

const routes: Routes = [
  { path: 'account', component: AccountComponent,...canActivate(() => redirectUnauthorizedTo(['/login']))},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent },
  { path: 'ingredient-create', component: IngredientCreateComponent },
  { path: 'ingredient-details', component: IngredientDetailsComponent },
  { path: 'ingredients', component: IngredientsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'pantry', component: PantryComponent,...canActivate(() => redirectUnauthorizedTo(['/login']))},
  { path: 'recipe-create', component: RecipeCreateComponent },
  { path: 'recipe-details', component: RecipeDetailsComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'update-password', component: UpdatePasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
