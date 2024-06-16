import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { User } from 'src/app/interfaces/user';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  formAccount!: FormGroup;

  userId: string = '';

  user: User = {};

  userPasswd: string = '';

  editable: boolean = false;

  namePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]{3,}$/;
  surnamePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ]{3,}$/;
  phonePattern = /^(6|7|8|9)\d{8}$/;

  private initialUserData: User = {};


  constructor(private userService: UserService, private router: Router, private globalData: GlobalDataService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.formAccount = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      surname1: ['', [Validators.required, Validators.pattern(this.surnamePattern)]],
      surname2: ['', [Validators.required, Validators.pattern(this.surnamePattern)]],
      date: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]]
    });

    if (!this.userService.getCurrentUserId()) {
      this.router.navigate(['/login']);
    }

    this.globalData.getLoggedUserId().subscribe(id => {
      this.userId = id;
      if (this.userId) {
        this.userService.getUserData(this.userId).subscribe((userData: User) => {
          this.user = userData;
          this.initialUserData = { ...userData };
          console.log(this.user);
          this.formAccount.patchValue({
            name: this.user.nombre,
            surname1: this.user.apellido1,
            surname2: this.user.apellido2,
            date: this.user.date,
            country: this.user.country,
            phone: this.user.phone
          });
          if (this.user.password) {
            this.userPasswd = this.user.password.replace(/./g, "*");
          }
        },
        (error) => {
          console.log(error);
        });
      } else {
        this.userId = "no hay usuario";
      }
    });
  }

  setEditable(): void {
    this.editable = !this.editable;
  }

  logOut() {
    this.userService.logOut().then(() => {
      console.log('Sesión cerrada correctamente');
      this.globalData.setLoggedUserId('null');
      this.globalData.setLoggedInUserRol('null');
      this.router.navigate(['/login']);
      this.user = {};
      this.userId = 'null';
    }).catch((error) => {
      console.error(error);
    });
  }

  update() {
    if (this.formAccount.invalid) {
      this.formAccount.markAllAsTouched();
      console.log("El formulario no es válido");
      return;
    }
    console.log(this.userId);
    this.userService.updateUser(this.userId, this.user).then(updatedPromise => {
      if (updatedPromise) {
        console.log("Se ha actualizado");
        this.setEditable();
      } else {
        console.log("No se ha actualizado");
      }
    });
  }

  cancel() {
    this.formAccount.reset({
      name: this.initialUserData.nombre,
      surname1: this.initialUserData.apellido1,
      surname2: this.initialUserData.apellido2,
      date: this.initialUserData.date,
      country: this.initialUserData.country,
      phone: this.initialUserData.phone
    });
    this.setEditable();
  }

  confirmDelete() {
    $('#deleteModal').modal('show');
  }

  deleteAccount() {
    if (this.userId) {
      this.userService.deleteUser(this.userId).then(deleted => {
        if (deleted) {
          console.log("Usuario eliminado correctamente");
          this.userService.logOut().then(() => {
            this.globalData.setLoggedUserId('null');
            this.globalData.setLoggedInUserRol('null');
            this.router.navigate(['/login']);
            this.userId = 'null';
          });
        } else {
          console.log("No se pudo eliminar el usuario");
        }
      }).catch((error) => {
        console.error(error);
      }).finally(() => {
        $('#deleteModal').modal('hide');
      });
    }
  }

  get nombreNoValido(){
    return this.formAccount.get('name')?.invalid && this.formAccount.get('name')?.touched;
  }
  get surname1NoValido(){
    return this.formAccount.get('surname1')?.invalid && this.formAccount.get('surname1')?.touched;
  }
  get surname2NoValido(){
    return this.formAccount.get('surname2')?.invalid && this.formAccount.get('surname2')?.touched;
  }
  get dateNoValido(){
    return this.formAccount.get('date')?.invalid && this.formAccount.get('date')?.touched;
  }
  get countryNoValido(){
    return this.formAccount.get('country')?.invalid && this.formAccount.get('country')?.touched;
  }
  get phoneNoValido(){
    return this.formAccount.get('phone')?.invalid && this.formAccount.get('phone')?.touched && !this.phonePattern.test(this.formAccount.get('phone')?.value);
  }
}
