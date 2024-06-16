import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ResetPasswdService } from 'src/app/services/reset-passwd.service';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  formPass!: FormGroup;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\]^_{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\]^_{|}~]{8,}$/;
  newPasswordNoValido: boolean = false;
  confirmNewPasswordNoValido: boolean = false;
  incorrectCurrentPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private resetPasswdSvc: ResetPasswdService,
    private globalDataSvc: GlobalDataService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formPass = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
      confirmNewPassword: ['', [Validators.required]]
    });
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

  async update() {
    const currentPassword = this.formPass.get('currentPassword')?.value;
    const newPassword = this.formPass.get('newPassword')?.value;
    const confirmNewPassword = this.formPass.get('confirmNewPassword')?.value;

    // Reiniciar mensajes de error
    this.incorrectCurrentPassword = false;
    this.newPasswordNoValido = false;
    this.confirmNewPasswordNoValido = false;

    // Verificar si las contraseñas nuevas coinciden
    if (newPassword !== confirmNewPassword) {
      this.confirmNewPasswordNoValido = true;
    }

    // Verificar si la nueva contraseña cumple con el patrón
    if (!this.formPass.get('newPassword')?.valid) {
      this.newPasswordNoValido = true;
    }

    try {
      const isValidCurrentPassword = await this.resetPasswdSvc.confirmPassword(currentPassword);
      if (!isValidCurrentPassword) {
        this.incorrectCurrentPassword = true;
      }

      // Si alguna validación falla, no proceder con la actualización
      if (this.incorrectCurrentPassword || this.newPasswordNoValido || this.confirmNewPasswordNoValido) {
        return;
      }

      await this.resetPasswdSvc.updatePassword(newPassword);
      alert('Contraseña actualizada con éxito');
      this.router.navigate(['/account']);
    } catch (error) {
      console.log(error);
      alert('Error al actualizar la contraseña');
    }
  }

  cancel() {
    this.router.navigate(['/account']);
  }
}
