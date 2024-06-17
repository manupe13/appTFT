import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { IngredientService } from 'src/app/services/ingredient.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

declare var $: any;

@Component({
  selector: 'app-ingredient-details',
  templateUrl: './ingredient-details.component.html',
  styleUrls: ['./ingredient-details.component.css']
})
export class IngredientDetailsComponent implements OnInit {

  ingredient: Ingredient = {};

  private initialIngredientData: Ingredient = {};

  formIngredient!: FormGroup;
  selectedFile: File | null = null;
  ingredientId: string = '';

  editable: boolean = false;

  descriptionPattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s0-9]{3,}$/;

  constructor(
    private ingredientService: IngredientService,
    private router: Router,
    private fb: FormBuilder,
    private storage: Storage,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.formIngredient = this.fb.group({
      img: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.pattern(this.descriptionPattern)]],
      filter: ['', [Validators.required]]
    });

    this.route.queryParams.subscribe(params => {
      this.ingredientId = params['id'];
      if (this.ingredientId) {
        this.ingredientService.getIngredientById(this.ingredientId).subscribe((ingredientData: Ingredient) => {
          this.ingredient = ingredientData;
          this.initialIngredientData = { ...ingredientData };
          this.formIngredient.patchValue({
            img: this.ingredient.imgs,
            description: this.ingredient.descripcion,
            filter: this.ingredient.filtro
          });
        },
        (error) => {
          console.log(error);
        });
      }
    });
  }

  get imageNoValido() {
    return this.formIngredient.get('img')?.invalid && this.formIngredient.get('img')?.touched;
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

  setEditable(): void {
    this.editable = !this.editable;
  }

  update() {
    if (this.formIngredient.invalid) {
      this.formIngredient.markAllAsTouched();
      console.log("El formulario no es válido");
      return;
    }

    const updateData: Ingredient = {
      ...this.formIngredient.value,
      imgs: this.formIngredient.value.img
    };

    if (this.selectedFile) {
      const imgRef = ref(this.storage, `ingredients/${this.selectedFile.name}`);
      uploadBytes(imgRef, this.selectedFile).then(snapshot => {
        getDownloadURL(snapshot.ref).then(downloadURL => {
          updateData.imgs = [downloadURL];
          this.ingredientService.updateIngredient(this.ingredientId, updateData).then(updated => {
            if (updated) {
              console.log("Se ha actualizado");
              this.setEditable();
            } else {
              console.log("No se ha actualizado");
            }
          });
        });
      });
    } else {
      this.ingredientService.updateIngredient(this.ingredientId, updateData).then(updated => {
        if (updated) {
          console.log("Se ha actualizado");
          this.setEditable();
        } else {
          console.log("No se ha actualizado");
        }
      });
    }
  }

  cancel() {
    this.formIngredient.reset({
      img: this.initialIngredientData.imgs,
      description: this.initialIngredientData.descripcion,
      filter: this.initialIngredientData.filtro
    });
    this.setEditable();
  }

  confirmDelete() {
    $('#deleteModal').modal('show');
  }

  deleteIngredient() {
    this.ingredientService.deleteIngredient(this.ingredientId).then(deleted => {
      if (deleted) {
        console.log("Ingrediente eliminado correctamente");
        this.router.navigate(['/ingredients']);
      } else {
        console.log("No se pudo eliminar el ingrediente");
      }
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      $('#deleteModal').modal('hide');
    });
  }
}
