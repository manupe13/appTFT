import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { NgModule } from '@angular/core';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { ReactiveFormsModule } from '@angular/forms';

import { AccountComponent } from './pages/account/account.component';
import { FooterComponent } from './components/footer/footer.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { HeaderComponent } from './components/header/header.component';
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

@NgModule({
  declarations: [
    AppComponent,
    AccountComponent,
    FooterComponent,
    ForgotPasswordComponent,
    HeaderComponent,
    HomeComponent,
    IngredientCreateComponent,
    IngredientDetailsComponent,
    IngredientsComponent,
    LoginComponent,
    PantryComponent,
    RecipeCreateComponent,
    RecipeDetailsComponent,
    RecipesComponent,
    RegisterComponent,
    UpdatePasswordComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideStorage (() => getStorage())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
