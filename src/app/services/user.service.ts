import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, authState } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private auth: Auth, private af: AngularFirestore, private router: Router) { }

  getUser() {
    return this.af.collection<User>('usuarios').valueChanges();
  }

  async getUserById(id: string) {
    return this.af.collection<User>('usuarios').doc(id).snapshotChanges().pipe(
      map(doc => {
        const data = doc.payload.data();
        const id = doc.payload.id;
        return {id, ...data} as User;
      })
    );
  }

  async createUser(user: User): Promise<string>{
    try {
      return this.af.collection<User>('usuarios').add(user).then(
        (docRef => {
          return docRef.id;
        })
      );
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async updateUser(id: string, user: User) {
    try {
      await this.af.collection<User>('usuarios').doc(id).update(user).then();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async deleteUser(id: string) {
    try {
      await this.af.collection<User>('usuarios').doc(id).delete();
      await this.auth.currentUser?.delete();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  register(email: string, password: string, usuario: User) {
      return createUserWithEmailAndPassword(this.auth, email, password).then(userCredential =>{
        usuario.id = userCredential.user.uid;
        this.af.collection('usuarios').doc(userCredential.user.uid).set(usuario);
      })
  }

  logOut() {
    return signOut(this.auth);
  }

  userLogged(){
    return authState(this.auth);
  }

  getCurrentUserId(){
    return this.auth.currentUser?.uid;
  }

  getUserData(userId: string): Observable<User> {
    return this.af.collection('usuarios').doc(userId).valueChanges()
      .pipe(
        map((userData: any) => {
          const id = userId;
          return { id, ...userData } as User;
        })
      );
  }

}
