import { Injectable } from '@angular/core';
import { Ingredient } from '../interfaces/ingredient';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  constructor(private af: AngularFirestore) { }

  getIngredientById(id: string): Observable<Ingredient> {
    return this.af.collection<Ingredient>('ingredientes').doc(id).snapshotChanges().pipe(
      map(action => {
        const data = action.payload.data() as Ingredient;
        const id = action.payload.id;
        return { id, ...data };
      })
    );
  }

  getIngredients(filtro?: string): Observable<Ingredient[]> {
    let query = this.af.collection<Ingredient>('ingredientes', ref => {
      let q = ref.orderBy('nombre');
      if (filtro && filtro !== 'Todos') {
        q = ref.where('filtro', '==', filtro);
      }
      return q;
    });

    return query.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Ingredient;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  searchIngredientsByName(name: string, filtro?: string): Observable<Ingredient[]> {
    let lowerName = name.toLowerCase();
    let query = this.af.collection<Ingredient>('ingredientes', ref => {
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
        const data = a.payload.doc.data() as Ingredient;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  async createIngredient(ingredient: Ingredient): Promise<string | false> {
    try {
      ingredient.nombre_lower = ingredient.nombre ? ingredient.nombre.toLowerCase() : '';
      await this.af.collection<Ingredient>('ingredientes').doc(ingredient.nombre).set(ingredient);
      return ingredient.nombre!;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateIngredient(id: string, ingredient: Ingredient) {
    try {
      ingredient.nombre_lower = ingredient.nombre ? ingredient.nombre.toLowerCase() : '';
      await this.af.collection<Ingredient>('ingredientes').doc(id).update(ingredient);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteIngredient(id: string) {
    try {
      await this.af.collection<Ingredient>('ingredientes').doc(id).delete();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  checkIfIngredientNameExists(nombre: string): Observable<boolean> {
    return this.af.collection<Ingredient>('ingredientes', ref => ref.where('nombre_lower', '==', nombre.toLowerCase())).get().pipe(
      map(snapshot => !snapshot.empty)
    );
  }

  getRandomIngredients(limit: number): Observable<Ingredient[]> {
    return this.af.collection<Ingredient>('ingredientes').get().pipe(
      map(snapshot => {
        const ingredients: Ingredient[] = [];
        snapshot.forEach(doc => {
          ingredients.push({ id: doc.id, ...doc.data() } as Ingredient);
        });
        return this.shuffleArray(ingredients).slice(0, limit);
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
