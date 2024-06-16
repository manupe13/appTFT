import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';
import { RegisterComponent } from './pages/register/register.component';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { ReactiveFormsModule } from '@angular/forms';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { AccountComponent } from './pages/account/account.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { IngredientsComponent } from './pages/ingredients/ingredients.component';
import { PantryComponent } from './pages/pantry/pantry.component';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { UpdatePasswordComponent } from './pages/update-password/update-password.component';
import { GoogleRegisterComponent } from './pages/google-register/google-register.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    HomeComponent,
    AccountComponent,
    ForgotPasswordComponent,
    IngredientsComponent,
    PantryComponent,
    RecipesComponent,
    UpdatePasswordComponent,
    GoogleRegisterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFirestoreModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth())
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
