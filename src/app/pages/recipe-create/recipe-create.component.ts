import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { Recipe } from 'src/app/interfaces/recipe';
import { RecipeService } from 'src/app/services/recipe.service';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Component({
  selector: 'app-recipe-create',
  templateUrl: './recipe-create.component.html',
  styleUrls: ['./recipe-create.component.css']
})
export class RecipeCreateComponent {

  receta: Recipe = {};

  recipe: any = {
    img: [],
    name: null,
    people: null,
    duration: null,
    difficulty: null,
    filter: null,
    ingredient: null,
    preparation: null
  };

  formRecipe!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;

  namePattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]{3,}$/;
  preparationPattern = /^(?=.*[A-Za-zÁáÉéÍíÓóÚúÜüÑñ])[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s0-9.,()]{3,}$/;

  constructor(private recipeService: RecipeService, private router: Router, private fb: FormBuilder, private storage: Storage) {
    this.crearFormulario();
  }

  crearFormulario() {
    this.formRecipe = this.fb.group({
      img: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.pattern(this.namePattern)]],
      people: ['', [Validators.required]],
      duration: ['', [Validators.required]],
      difficulty: ['', [Validators.required]],
      filter: ['', [Validators.required]],
      ingredient: ['', [Validators.required, Validators.pattern(this.preparationPattern)]],
      preparation: ['', [Validators.required, Validators.pattern(this.preparationPattern)]]
    });
  }

  get imageNoValido() {
    return this.formRecipe.get('img')?.invalid && this.formRecipe.get('img')?.touched;
  }

  get nameNoValido() {
    return this.formRecipe.get('name')?.invalid && this.formRecipe.get('name')?.touched;
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

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.formRecipe.patchValue({ img: file.name });
      this.formRecipe.get('img')?.updateValueAndValidity();
    }
  }

  async onSubmit() {
    if (!this.selectedFile) {
      return;
    }

    const filePath = `recetas/${this.selectedFile.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      const snapshot = await uploadBytes(storageRef, this.selectedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      this.receta.imgs = [downloadURL];
      this.receta.nombre = this.recipe.name;
      this.receta.personas = this.recipe.people;
      this.receta.duracion = this.recipe.duration;
      this.receta.dificultad = this.recipe.difficulty;
      this.receta.filtro = this.recipe.filter;
      this.receta.ingredientes = this.recipe.ingredient;
      this.receta.preparacion = this.recipe.preparation;

      this.recipeService.checkIfRecipeNameExists(this.receta.nombre!).subscribe(async (exists) => {
        if (exists) {
          this.errorMessage = 'La receta ya existe.';
          return;
        }

        const docId = await this.recipeService.createRecipe(this.receta);
        if (docId) {
          this.receta.id = docId;
          await this.recipeService.updateRecipe(docId, this.receta);
          const navExtras: NavigationExtras = {
            queryParams: {
              id: docId
            }
          };
          this.router.navigate(['recipe-details'], navExtras);
        } else {
          console.error('Error al crear la receta');
        }
      });

    } catch (error) {
      console.error('Error al subir la imagen: ', error);
    }
  }

  cancel() {
    this.router.navigate(['/recipes']);
  }
}
