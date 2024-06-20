import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecipeService } from 'src/app/services/recipe.service';
import { Recipe } from 'src/app/interfaces/recipe';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { GlobalDataService } from 'src/app/services/global-data.service';
import { UserService } from 'src/app/services/user.service';

declare var $: any;

@Component({
  selector: 'app-recipe-details',
  templateUrl: './recipe-details.component.html',
  styleUrls: ['./recipe-details.component.css']
})
export class RecipeDetailsComponent implements OnInit{

  formRecipe!: FormGroup;
  recipe: Recipe = {};
  selectedFile: File | null = null;
  editable: boolean = false;
  initialRecipeData: Recipe = {};

  preparationPattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s0-9.,()/]{3,}$/;

  isLoggedIn: boolean = false;
  userRole: string = 'null';

  constructor(
    private recipeService: RecipeService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private storage: Storage,
    private globalData: GlobalDataService, private userService: UserService) { }

  ngOnInit(): void {
    this.formRecipe = this.fb.group({
      img: ['', [Validators.required]],
      people: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      filter: ['', [Validators.required]],
      ingredient: ['', [Validators.required, Validators.pattern(this.preparationPattern)]],
      preparation: ['', [Validators.required, Validators.pattern(this.preparationPattern)]]
    });

    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.recipeService.getRecipeById(id).subscribe((recipe: Recipe) => {
        this.recipe = recipe;
        this.initialRecipeData = { ...recipe };
        this.formRecipe.patchValue({
          img: recipe.imgs ? recipe.imgs[0] : '',
          people: recipe.personas,
          duration: recipe.duracion,
          difficulty: recipe.dificultad,
          filter: recipe.filtro,
          ingredient: recipe.ingredientes,
          preparation: recipe.preparacion
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
      this.formRecipe.patchValue({ img: file.name });
      this.formRecipe.get('img')?.updateValueAndValidity();
    }
  }

  async update() {
    if (this.formRecipe.invalid) {
      this.formRecipe.markAllAsTouched();
      return;
    }

    if (this.selectedFile) {
      const filePath = `recetas/${this.selectedFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const snapshot = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      this.recipe.imgs = [downloadURL];
    }

    this.recipe.preparacion = this.formRecipe.value.preparation;
    this.recipe.filtro = this.formRecipe.value.filter;

    this.recipeService.updateRecipe(this.recipe.id!, this.recipe).then(() => {
      this.setEditable();
    });
  }

  cancel() {
    this.formRecipe.reset({
      img: this.initialRecipeData.imgs ? this.initialRecipeData.imgs[0] : '',
      preparation: this.initialRecipeData.preparacion,
      filter: this.initialRecipeData.filtro
    });
    this.editable = false;
  }

  confirmDelete() {
    $('#deleteModal').modal('show');
  }

  deleteRecipe() {
    this.recipeService.deleteRecipe(this.recipe.id!).then(() => {
      $('#deleteModal').modal('hide');
      this.router.navigate(['/recipes']);
    });
  }

  get imageNoValido() {
    return this.formRecipe.get('img')?.invalid && this.formRecipe.get('img')?.touched;
  }

  get peopleNoValido() {
    return this.formRecipe.get('people')?.invalid && this.formRecipe.get('people')?.touched;
  }

  get durationNoValido() {
    return this.formRecipe.get('duration')?.invalid && this.formRecipe.get('duration')?.touched;
  }

  get difficultyNoValido() {
    return this.formRecipe.get('difficulty')?.invalid && this.formRecipe.get('difficulty')?.touched;
  }

  get filterNoValido() {
    return this.formRecipe.get('filter')?.invalid && this.formRecipe.get('filter')?.touched;
  }

  get ingredientNoValido() {
    return this.formRecipe.get('ingredient')?.invalid && this.formRecipe.get('ingredient')?.touched;
  }

  get preparationNoValido() {
    return this.formRecipe.get('preparation')?.invalid && this.formRecipe.get('preparation')?.touched;
  }

}
