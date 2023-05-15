import { formatDate } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { fork } from 'child_process';
import firebase from 'firebase/compat/app';
import { CollectionReference, getDocs, getDocsFromCache} from 'firebase/firestore';
import { Observable, combineLatest, forkJoin, map, mergeMap, of, switchMap, take, tap } from 'rxjs';

export interface User {
  uid: string;
  Email: string;
  LName: string;
  FName: string;
  email?: string;
}

export interface Message {
  createdAt: any;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

export interface Conversation{
  messages: Message[];
  createdAt: any;
  uid: string;
}

@Injectable({
  providedIn: 'root',
})
export class Chat {
  currentUser!: User;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    @Inject(LOCALE_ID) private locale: string,
  ) {
    this.afAuth.onAuthStateChanged((user: any) => {
      // console.log('Change:', user);
      this.currentUser = user;
    });
  }

  async signUp({ email, password }: any) {
    const credential = await this.afAuth.createUserWithEmailAndPassword(
      email,
      password
    );

    console.log('result: ', credential);
    const uid = credential.user?.uid;

    return this.afs.doc(`users/${uid}`).set({
      uid,
      email: credential.user?.email,
    });
  }

  signIn({ email, password }: any) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut() {
    return this.afAuth.signOut();
  }

  async getConversationList() {
    let userId = this.currentUser?.uid || JSON.parse(localStorage.getItem('user') || '{}')['uid'];

    try {
      const tenant = (await this.afs.collection('Tenant').doc(userId).ref.get()).data();
      // const owner = (await this.afs.collection('Owner').doc(userId).ref.get()).data();
      if (tenant) {
        return this.afs.collection('Tenant').doc(userId).collection('Conversations').valueChanges().pipe(
          mergeMap((conversations: any) => {
            const convoOwner: Observable<any>[] = conversations.map((conversation: any) => {
              const ownerId = conversation.conversation.split('#')[0];
              return this.afs.collection('Owner').doc(ownerId).valueChanges();
            });

            return combineLatest(convoOwner).pipe(
              map((owners: any) => {
                return conversations.map((conversation: any, index: number) => {
                  return { ...conversation, chatWith: owners[index] };
                });
              })
            ).pipe(
              take(1),
            );
          })
        );
      } else {
        return this.afs.collection('Owner').doc(userId).collection('Conversations').valueChanges().pipe(
          mergeMap((conversations: any) => {
            const convoOwner = conversations.map((conversation: any) => {
              const tenantId = conversation.conversation.split('#')[1];
              return this.afs.collection('Tenant').doc(tenantId).valueChanges();
            });
            return combineLatest(convoOwner).pipe(
              map((owners: any) => {
                return conversations.map((conversation: any, index: number) => {
                  return { ...conversation, chatWith: owners[index] };
                });
              })
            ).pipe(
              take(1),
            );
          })
        );
      }
    } catch(e) {
      console.log(e);
    }
  }

  async getConversation(convoId: any) {
    let localUserId = this.currentUser?.uid || JSON.parse(localStorage.getItem('user') || '{}')['uid'];
    let fuse = `${convoId}#${localUserId}`;
    let ownerId: string;
    let tenantId: string;

    // handle if conversationID is passed instead
    if (convoId.includes('#')) {
      fuse = convoId;
      [ownerId, tenantId] = convoId.split('#');
    } else {
      ownerId = convoId;
      tenantId = localUserId;
    }

    try {
      const convoDoc = (await this.afs.collection("Conversation").doc(fuse).ref.get()).data();

      if (!convoDoc) {
        await this.afs.collection('Conversation').doc(fuse).set({
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          messages: []
        });

        const initialConversation = {conversation : fuse, lastChat: '' };
        await this.afs.collection('Owner').doc(ownerId).collection('Conversations').doc(fuse).set(initialConversation);
        await this.afs.collection('Tenant').doc(tenantId).collection('Conversations').doc(fuse).set(initialConversation);
      }
    } catch(e) {
      console.log(e);
    }

    return [
      fuse,
      combineLatest([
      this.afs.collection('Conversation').doc(fuse).valueChanges() as Observable<Conversation>,
      this.afs.collection('Tenant').doc(tenantId).valueChanges() as Observable<User>,
      this.afs.collection('Owner').doc(ownerId).valueChanges() as Observable<User>,
      ])
        .pipe(
          map(([convo, tenant, owner]) => {
            const groupedMessages = convo.messages.map((m: any) => {
              m.fromName = m.from === tenant.uid ? tenant.FName : owner.FName;
              m.myMsg = m.from === this.currentUser.uid;
              return m;
            }).reduce((acc: any, curr: any) => {
              const date = formatDate(curr.createdAt, 'dd MMM YYYY', this.locale);
              if (!acc[date]) {
                acc[date] = [];
              }
              acc[date].push(curr);
              return acc;
            }, {});

            return Object.keys(groupedMessages).map((key) => ({
              date: key,
              messages: groupedMessages[key]
            }));
          })
        ),
      ownerId === localUserId
    ];
  }

  addRoomSystemMessage(conversationId: string, room: any) {
    const [ownerID, tenantID] = conversationId.split('#');
    const createdAt = Date.now();
    this.afs.collection('Owner').doc(ownerID).collection('Conversations').doc(conversationId).update({
      updatedAt: createdAt,
      linkedRoom: room.id
    });
    this.afs.collection('Tenant').doc(tenantID).collection('Conversations').doc(conversationId).update({
      updatedAt: createdAt,
      linkedRoom: room.id
    });
    return this.afs.collection('Conversation').doc(conversationId).update({
      dateUpdated: Date.now(),
      linkedRoom: room.id,
      messages: firebase.firestore.FieldValue.arrayUnion({
        type: 'system',
        linkedRoom: room.id,
        roomName: room.RoomName || 'Room',
        propertyName: room.Title,
        from: this.currentUser.uid,
        createdAt
      })
    });
  }

  addChatMessage(conversationId: string, msg: any,) {
    const [ownerID, tenantID] = conversationId.split('#');
    const createdAt = Date.now();
    this.afs.collection('Owner').doc(ownerID).collection('Conversations').doc(conversationId).update({lastChat: msg, updatedAt: createdAt});
    this.afs.collection('Tenant').doc(tenantID).collection('Conversations').doc(conversationId).update({lastChat: msg, updatedAt: createdAt});
    return this.afs.collection('Conversation').doc(conversationId).update({
      dateUpdated: Date.now(),
      lastMessage: msg,
      messages: firebase.firestore.FieldValue.arrayUnion({
        msg,
        from: this.currentUser.uid,
        createdAt
      })
    });
  }

  getChatMessage() {
    let users: [] = [];

    return this.getUsers().pipe(
      switchMap((res: any) => {
        console.log('res', res);
        users = res;

        return this.afs
          .collection('message', (ref) => ref.orderBy('createdAt'))
          .valueChanges({
            idField: 'id',
          }) as Observable<Message[]>;
      }),
      map((messages: any) => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser.uid === m.from;
        }
        console.log('all message: ', messages);
        return messages;
      }),
      tap((a: any) => {
        console.log('b', a);
      })
    );
  }

  getUsers() {
    return this.afs
      .collection('users')
      .valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  getUserForMsg(msgFromId: any, users: User[]) {
    for (let usr of users) {
      if (usr.uid == msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }

  async getUser(type: string, id: string) {
    return (await this.afs.collection(type).doc(id).ref.get()).data();
  }

}
