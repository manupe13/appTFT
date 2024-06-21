import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IngredientService } from 'src/app/services/ingredient.service';
import { Ingredient } from 'src/app/interfaces/ingredient';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { UserService } from 'src/app/services/user.service';

declare var $: any;

@Component({
  selector: 'app-ingredient-details',
  templateUrl: './ingredient-details.component.html',
  styleUrls: ['./ingredient-details.component.css']
})
export class IngredientDetailsComponent implements OnInit {

  formIngredient!: FormGroup;
  ingredient: Ingredient = {};
  selectedFile: File | null = null;
  editable: boolean = false;
  initialIngredientData: Ingredient = {};

  descriptionPattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s0-9.,()/]{3,}$/;

  isLoggedIn: boolean = false;
  userRole: string = 'null';

  constructor(
    private ingredientService: IngredientService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private storage: Storage,
    private globalData: GlobalDataService, private userService: UserService) { }

  ngOnInit(): void {
    this.formIngredient = this.fb.group({
      img: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.pattern(this.descriptionPattern)]],
      filter: ['', [Validators.required]]
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.ingredientService.getIngredientById(id).subscribe((ingredient: Ingredient) => {
        this.ingredient = ingredient;
        this.initialIngredientData = { ...ingredient };
        this.formIngredient.patchValue({
          img: ingredient.imgs ? ingredient.imgs[0] : '',
          description: ingredient.descripcion,
          filter: ingredient.filtro
        });
      });
    }

    this.globalData.getLoggedInUserRol().subscribe(role => {
      this.userRole = role;
    });

    this.userService.userLogged().subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  setEditable(): void {
    this.editable = !this.editable;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.formIngredient.patchValue({ img: file.name });
      this.formIngredient.get('img')?.updateValueAndValidity();
    }
  }

  async update() {
    if (this.formIngredient.invalid) {
      this.formIngredient.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const filePath = `ingredientes/${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      this.ingredient.imgs = [downloadURL];
    }

    this.ingredient.descripcion = this.formIngredient.value.description;
    this.ingredient.filtro = this.formIngredient.value.filter;

    this.ingredientService.updateIngredient(this.ingredient.id!, this.ingredient).then(() => {
      this.setEditable();
    });
  }

  cancel() {
    this.formIngredient.reset({
      img: this.initialIngredientData.imgs ? this.initialIngredientData.imgs[0] : '',
      description: this.initialIngredientData.descripcion,
      filter: this.initialIngredientData.filtro
    });
    this.editable = false;
  }

  confirmDelete() {
    $('#deleteModal').modal('show');
  }

  deleteIngredient() {
    this.ingredientService.deleteIngredient(this.ingredient.id!).then(() => {
      $('#deleteModal').modal('hide');
      this.router.navigate(['/ingredients']);
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
}
