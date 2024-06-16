import { Injectable } from '@angular/core';
import { Recipe } from '../interfaces/recipe';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage, list, ref, getDownloadURL } from '@angular/fire/storage';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  constructor(private af: AngularFirestore, private storage: Storage) { }

  getRecipe() {
    return this.af.collection<Recipe>('recetas').valueChanges();
  }

  async getRecipeById(id: string) {
    return this.af.collection<Recipe>('recetas').doc(id).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        return {id, ...data} as Recipe;
      })
    );
  }

  async createRecipe(recipe: Recipe) {
    try {
      const docRef = await this.af.collection<Recipe>('recetas').add(recipe);
      return docRef.id;
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

  getUserDocuments(id: string): Observable<any[]> {
    const storageRef = ref(this.storage, 'recetas/'+id);
    return new Observable<any[]>((observer) => {
      list(storageRef)
        .then((listResult) => {
          const documents = listResult.items.map(async (itemRef) => {
            const downloadUrl = await getDownloadURL(itemRef);
            return {
              name: itemRef.name,
              downloadUrl: downloadUrl,
            };
          });
          Promise.all(documents)
            .then((resolvedDocuments) => {
              observer.next(resolvedDocuments);
              observer.complete();
            })
            .catch((error) => {
              observer.error(error);
            });
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

}
