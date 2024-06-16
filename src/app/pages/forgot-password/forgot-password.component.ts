import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ResetPasswdService } from 'src/app/services/reset-passwd.service';
import { UserService } from 'src/app/services/user.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  form: FormGroup;
  errorMessage: string = '';

  constructor(
    private resetPasswdService: ResetPasswdService,
    private userService: UserService,
    private router: Router
  ) {
    this.form = new FormGroup({
      userEmail: new FormControl('', [Validators.required, Validators.email])
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.errorMessage = 'Por favor, introduzca un correo electrónico válido';
      return;
    }

    const email = this.form.get('userEmail')?.value;

    try {
      const userExists = await this.checkIfUserExists(email);
      if (userExists) {
        await this.resetPasswdService.resetPassword(email);
        this.openConfirmationModal();
      } else {
        this.errorMessage = 'El correo electrónico no se encuentra vinculado a ninguna cuenta';
      }
    } catch (error: any) {
      console.error(error);
      this.errorMessage = 'Ocurrió un error durante el proceso de recuperación';
    }
  }

  private async checkIfUserExists(email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.userService.getUser().subscribe(users => {
        const user = users.find(user => user.email === email);
        resolve(!!user);
      }, error => {
        reject(error);
      });
    });
  }

  openConfirmationModal() {
    $('#confirmationModal').modal('show');
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }
}
