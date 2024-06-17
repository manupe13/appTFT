import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { IngredientService } from 'src/app/services/ingredient.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-ingredient-create',
  templateUrl: './ingredient-create.component.html',
  styleUrls: ['./ingredient-create.component.css']
})
export class IngredientCreateComponent {

  ingrediente: Ingredient = {};

  ingredient: any = {
    img: [],
    name: null,
    description: null,
    filter: null
  };

  formIngredient!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  namePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]{3,}$/;
  descriptionPattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s0-9]{3,}$/;

  constructor(private ingredientService: IngredientService, private router: Router, private fb: FormBuilder, private storage: Storage) {
    this.crearFormulario();
  }

  crearFormulario() {
    this.formIngredient = this.fb.group({
      img: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      description: ['', [Validators.required, Validators.pattern(this.descriptionPattern)]],
      filter: ['', [Validators.required]]
    });
  }

  get imageNoValido() {
    return this.formIngredient.get('img')?.invalid && this.formIngredient.get('img')?.touched;
  }

  get nameNoValido() {
    return this.formIngredient.get('name')?.invalid && this.formIngredient.get('name')?.touched;
  }

  get descriptionNoValido() {
    return this.formIngredient.get('description')?.invalid && this.formIngredient.get('description')?.touched;
  }

  get filterNoValido() {
    return this.formIngredient.get('filter')?.invalid && this.formIngredient.get('filter')?.touched;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.formIngredient.patchValue({ img: file.name });
      this.formIngredient.get('img')?.updateValueAndValidity();
    }
  }

  async onSubmit() {
    if (!this.selectedFile) {
      return;
    }

    const filePath = `ingredientes/${this.selectedFile.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      this.ingrediente.imgs = [downloadURL];
      this.ingrediente.nombre = this.ingredient.name;
      this.ingrediente.descripcion = this.ingredient.description;
      this.ingrediente.filtro = this.ingredient.filter;

      this.ingredientService.checkIfIngredientNameExists(this.ingrediente.nombre!).subscribe(async (exists) => {
        if (exists) {
          this.errorMessage = 'El ingrediente ya existe.';
          return;
        }

        const docId = await this.ingredientService.createIngredient(this.ingrediente);
        if (docId) {
          this.ingrediente.id = docId;
          await this.ingredientService.updateIngredient(docId, this.ingrediente);
          const navExtras: NavigationExtras = {
            queryParams: {
              id: docId
            }
          };
          this.router.navigate(['ingredient-details'], navExtras);
        } else {
          console.error('Error al crear el ingrediente');
        }
      });

    } catch (error) {
      console.error('Error al subir la imagen: ', error);
    }
  }

  cancel() {
    this.router.navigate(['/ingredients']);
  }
}
