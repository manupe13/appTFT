import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  user:any = {
    email: '',
    password: ''
  };

  formLogin: FormGroup;
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router, private globalData: GlobalDataService) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    })
  }

  togglePasswordVisibility(inputId: string, iconId: string) {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const icon = document.getElementById(iconId) as HTMLElement;
    if (input.type === 'password') {
      input.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      input.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  }

  loginUser() {
    this.userService.login(this.user.email, this.user.password).then((userCredential) => {
      const userId = userCredential.user?.uid;
      if (userId) {
        this.globalData.setLoggedUserId(userId);
        this.updateUserRol(userId);
      }
      this.router.navigate(['/account']);
    }).catch((error) => {
      console.error(error);
      this.errorMessage = 'Correo electrónico o contraseña incorrectos';
    });
  }

  updateUserRol(id: string) {
    this.userService.getUserById(id).then(userPromise => {
      from(userPromise).subscribe(user => {
        if(user.rol) {
          this.globalData.setLoggedInUserRol(user.rol);
        }
      })
    });
  }

}
