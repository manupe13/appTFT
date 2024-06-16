import { Injectable } from '@angular/core';
import { Recipe } from '../interfaces/recipe';
import { AngularFirestore, QueryDocumentSnapshot } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  constructor(private af: AngularFirestore, private storage: Storage) { }

  getRecipes(limit: number, startAfterDoc?: QueryDocumentSnapshot<Recipe>): Observable<Recipe[]> {
    let query = this.af.collection<Recipe>('recetas', ref => {
      let q = ref.orderBy('nombre').limit(limit);
      if (startAfterDoc) {
        q = q.startAfter(startAfterDoc);
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
      const docRef = await this.af.collection<Recipe>('recetas').doc(recipe.nombre).set(recipe);
      return recipe.nombre!;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateRecipe(id: string, recipe: Recipe) {
    try {
      await this.af.collection<Recipe>('recetas').doc(id).update(recipe).then();
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
}
