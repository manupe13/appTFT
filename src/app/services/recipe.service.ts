import { Injectable } from '@angular/core';
import { Recipe } from '../interfaces/recipe';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  constructor(private af: AngularFirestore) { }

  getRecipeById(id: string): Observable<Recipe> {
    return this.af.collection<Recipe>('recetas').doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Recipe;
        const id = action.payload.id;
        return { id, ...data };
      })
    );
  }

  getRecipes(filtro?: string): Observable<Recipe[]> {
    let query = this.af.collection<Recipe>('recetas', ref => {
      let q = ref.orderBy('nombre');
      if (filtro && filtro !== 'Todos') {
        q = ref.where('filtro', '==', filtro).orderBy('nombre');
      }
      return q;
    });

    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Recipe;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  searchRecipesByName(name: string, filtro?: string): Observable<Recipe[]> {
    let lowerName = name.toLowerCase();
    let query = this.af.collection<Recipe>('recetas', ref => {
      let q = ref
        .where('nombre_lower', '>=', lowerName)
        .where('nombre_lower', '<=', lowerName + '\uf8ff');
      if (filtro && filtro !== 'Todos') {
        q = q.where('filtro', '==', filtro);
      }
      return q;
    });

    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Recipe;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  async createRecipe(recipe: Recipe): Promise<string | false> {
    try {
      recipe.nombre_lower = recipe.nombre ? recipe.nombre.toLowerCase() : '';
      await this.af.collection<Recipe>('recetas').doc(recipe.nombre).set(recipe);
      return recipe.nombre!;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateRecipe(id: string, recipe: Recipe) {
    try {
      recipe.nombre_lower = recipe.nombre ? recipe.nombre.toLowerCase() : '';
      await this.af.collection<Recipe>('recetas').doc(id).update(recipe);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteRecipe(id: string) {
    try {
      await this.af.collection<Recipe>('recetas').doc(id).delete();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  checkIfRecipeNameExists(nombre: string): Observable<boolean> {
    return this.af.collection<Recipe>('recetas', ref => ref.where('nombre_lower', '==', nombre.toLowerCase())).get().pipe(
      map(snapshot => !snapshot.empty)
    );
  }

  getRandomRecipes(limit: number): Observable<Recipe[]> {
    return this.af.collection<Recipe>('recetas').get().pipe(
      map(snapshot => {
        const recipes: Recipe[] = [];
        snapshot.forEach(doc => {
          recipes.push({ id: doc.id, ...doc.data() } as Recipe);
        });
        return this.shuffleArray(recipes).slice(0, limit);
      })
    );
  }

  private shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

}
