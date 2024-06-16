import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AccountComponent } from './pages/account/account.component';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { IngredientsComponent } from './pages/ingredients/ingredients.component';
import { PantryComponent } from './pages/pantry/pantry.component';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';
import { GoogleRegisterComponent } from './pages/google-register/google-register.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/home' },
  { path: 'home', component: HomeComponent },
  { path: 'account', component: AccountComponent,
    ...canActivate(() => redirectUnauthorizedTo(['/login']))
  },
  { path: 'register', component: RegisterComponent },
  { path: 'google-register', component: GoogleRegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'ingredients', component: IngredientsComponent },
  { path: 'pantry', component: PantryComponent,
    ...canActivate(() => redirectUnauthorizedTo(['/login']))
  },
  { path: 'recipes', component: RecipesComponent },
  { path: 'update-password', component: UpdatePasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
