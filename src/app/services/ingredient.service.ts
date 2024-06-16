import { Injectable } from '@angular/core';
import { Ingredient } from '../interfaces/ingredient';
import { AngularFirestore, QueryDocumentSnapshot, QuerySnapshot } from '@angular/fire/compat/firestore';
import { Storage, list, ref, getDownloadURL } from '@angular/fire/storage';
import { Observable, map, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {

  constructor(private af: AngularFirestore, private storage: Storage) { }

  getIngredients(limit: number, startAfterDoc?: QueryDocumentSnapshot<Ingredient>): Observable<Ingredient[]> {
    let query = this.af.collection<Ingredient>('ingredientes', ref => {
      let q = ref.orderBy('nombre').limit(limit);
      if (startAfterDoc) {
        q = q.startAfter(startAfterDoc);
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

  async getIngredientById(id: string) {
    return this.af.collection<Ingredient>('ingredientes').doc(id).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        return { id, ...data } as Ingredient;
      })
    );
  }

  async createIngredient(ingredient: Ingredient): Promise<string | false> {
    try {
      const docRef = await this.af.collection<Ingredient>('ingredientes').doc(ingredient.nombre).set(ingredient);
      return ingredient.nombre!;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async updateIngredient(id: string, ingredient: Ingredient) {
    try {
      await this.af.collection<Ingredient>('ingredientes').doc(id).update(ingredient).then();
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

  getUserDocuments(id: string): Observable<any[]> {
    const storageRef = ref(this.storage, 'ingredientes/' + id);
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
