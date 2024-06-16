import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  usuario:User = { };

  user:any = {
    name:null,
    surname1:null,
    surname2:null,
    date:null,
    country:null,
    phone:null,
    email:null,
    password:null
  };

  formReg!: FormGroup;
  errorMessage: string = '';

  namePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]{3,}$/;
  surnamePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}$/;
  phonePattern = /^(6|7|8|9)\d{8}$/;
  emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;

  constructor( private userService: UserService, private router: Router, private fb:FormBuilder, private globalData: GlobalDataService) {
    this.crearFormulario();
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

  crearFormulario(){
    this.formReg = this.fb.group({
      name:['', [Validators.required, Validators.pattern(this.namePattern)]],
      surname1:['', [Validators.required, Validators.pattern(this.surnamePattern)]],
      surname2:['', [Validators.required, Validators.pattern(this.surnamePattern)]],
      date:['', [Validators.required]],
      country:['', [Validators.required]],
      phone:['', [Validators.required, Validators.pattern(this.phonePattern)]],
      email:['', [Validators.required, Validators.pattern(this.emailPattern)]],
      password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]]
    })
  }

  get nombreNoValido(){
    return this.formReg.get('name')?.invalid && this.formReg.get('name')?.touched;
  }
  get surname1NoValido(){
    return this.formReg.get('surname1')?.invalid && this.formReg.get('surname1')?.touched;
  }
  get surname2NoValido(){
    return this.formReg.get('surname2')?.invalid && this.formReg.get('surname2')?.touched;
  }
  get dateNoValido(){
    return this.formReg.get('date')?.invalid && this.formReg.get('date')?.touched;
  }
  get countryNoValido(){
    return this.formReg.get('country')?.invalid && this.formReg.get('country')?.touched;
  }
  get phoneNoValido(){
    return this.formReg.get('phone')?.invalid && this.formReg.get('phone')?.touched && !this.phonePattern.test(this.formReg.get('phone')?.value);
  }
  get emailNoValido(){
    return this.formReg.get('email')?.invalid && this.formReg.get('email')?.touched && !this.emailPattern.test(this.formReg.get('email')?.value);
  }
  get passwordNoValido(){
    return this.formReg.get('password')?.invalid && this.formReg.get('password')?.touched && !this.passwordPattern.test(this.formReg.get('password')?.value);
  }

  onSubmit() {
    this.usuario.nombre = this.user.name;
    this.usuario.apellido1 = this.user.surname1;
    this.usuario.apellido2 = this.user.surname2;
    this.usuario.date = this.user.date;
    this.usuario.country = this.user.country;
    this.usuario.phone = this.user.phone;
    this.usuario.email = this.user.email;
    this.usuario.password = this.user.password;
    this.usuario.existentes = [];
    this.usuario.consumidos = [];
    this.usuario.rol = 'User';
    this.userService.register(this.user.email, this.user.password, this.usuario).then(() => {
      const userID = this.userService.getCurrentUserId();
      if(userID){
        this.usuario.id = userID;
        this.globalData.setLoggedUserId(userID);
        this.updateUserRol(userID);
        this.userService.updateUser(userID, { id: userID }).then(() => {
          this.router.navigate(['/account']);
        });
      }
    }).catch((error) => {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        this.errorMessage = 'El correo electrónico ya está vinculado a una cuenta existente';
      } else {
        this.errorMessage = 'Ocurrió un error durante el registro';
      }
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
