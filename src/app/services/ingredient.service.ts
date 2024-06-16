import { Injectable } from '@angular/core';
import { Ingredient } from '../interfaces/ingredient';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  constructor(private af: AngularFirestore) { }

  getIngredients(filtro?: string): Observable<Ingredient[]> {
    let query = this.af.collection<Ingredient>('ingredientes', ref => {
      let q = ref.orderBy('nombre');
      if (filtro && filtro !== 'Todos') {
        q = ref.where('filtro', '==', filtro).orderBy('nombre');
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
      await this.af.collection<Ingredient>('ingredientes').doc(ingredient.nombre).set(ingredient);
      return ingredient.nombre!;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateIngredient(id: string, ingredient: Ingredient) {
    try {
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
    return this.af.collection<Ingredient>('ingredientes', ref => ref.where('nombre', '==', nombre)).get().pipe(
      map(snapshot => !snapshot.empty)
    );
  }
}
