import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { LogComponent } from 'src/app/home/log/log.component';
import { EditOwnerProfileComponent } from 'src/app/owner-panel/edit-owner-profile/edit-owner-profile.component';
import { FirebaseService } from 'src/app/services/firebase.service';
import { AuthenticationService } from 'src/app/shared/authentication-service';
import { EditProfileComponent } from 'src/app/tenant-panel/edit-profile/edit-profile.component';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.scss'],
})
export class SiteHeaderComponent implements OnInit {
  tenantUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public tenant: any;
  ownerUid: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  public owner: any;
  user: any = JSON.parse(localStorage.getItem('user') || '{}')['uid'];
  isModalOpen: boolean = false;
  isButtonDisabled: boolean = false;
  isMenuOpen = false;
  public notifBtn = new BehaviorSubject('bedspace');

  transaction: any[] = [];
  public bedTN:any[]=[];
  public roomTN:any[]=[];

  room: any[] = [];
  public bedON:any[]=[];
  public roomON:any[]=[];

  constructor(
    private firebaseService: FirebaseService,
    public authService: AuthenticationService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.getOwner();
    this.getTenant();

    ////Tenant Notification////
    combineLatest([
      this.firebaseService.read_transaction(),
      this.firebaseService.read_room(),
      this.firebaseService.read_owner(),
    ])
      .pipe(
        map(([transactions, rooms, owners]) => {
          return transactions
            .filter((a: any) => {
              return a.userId === this.tenantUid;
            })
            .map((b: any) => {
              b.roomData = rooms.find((c: any) => c.id == b.roomId);
              return b;
            })
            .map((d: any) => {
              d.ownerData = owners.find((e: any) => e.id == d.roomData?.ownerId);
              return d;
            });
        })
      )
      .subscribe((f: any) => {
        this.transaction = f;
        console.log('a', this.transaction);+
        this.TenantSortedBed();
        this.TenantSortedRoom();
        this.transaction = this.transaction.sort(
          (a: any, b: any) => (b.dateCreated || 0) - (a.dateCreated || 0)
        );
      });
    ////Tenant Notification////

    ////Owner Notification////
    combineLatest([
      this.firebaseService.read_tenant(),
      this.firebaseService.read_room(),
    ])
      .pipe(
        map(([tenants, rooms]) => {
          return rooms
            .filter((a: any) => {
              return a.OwnerId === this.ownerUid;
            })
            .map((b: any) => {
              b.tenantData = tenants.filter((c: any) => {
                return b.occupied?.userId == c.uid || b.Bed?.some((z: any) => z.occupied?.userId == c.uid);
              });
              return b;
            })
        })
      )
      .subscribe((f: any) => {
        this.room = f;
        this.OwnerSortedBed();
        this.OwnerSortedRoom();
      })
      ////Owner Notification////
  }
  ////Oninit////

  ////Others////
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeModal() {
    this.isModalOpen = false;
    this.modalController.dismiss();
  }

  isLogin(){
    if(this.user){
      return true;
    }
    else{
      return false;
    }
  }

  filterTenant() {
    if (this.firebaseService.tenantUid.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }

  filterOwner() {
    if (this.firebaseService.ownerUid.includes(this.user)) {
      return true;
    } else {
      return false;
    }
  }
  ////Others////

  ////Login Modal////
  async gotoLogModalL() {
    const modalInstance = await this.modalController.create({
      component: LogComponent,
      backdropDismiss: false,
      cssClass: 'login-modal',
      componentProps: {
        button: 'login',
      }
    });
    return await modalInstance.present();
  }

  async gotoLogModalR() {
    const modalInstance = await this.modalController.create({
      component: LogComponent,
      backdropDismiss: false,
      cssClass: 'login-modal',
      componentProps: {
        button: 'register',
      }
    });
    return await modalInstance.present();
  }
  ////Login Modal////

  ////Tenant////
  async getTenant() {
    this.firebaseService.read_tenant().subscribe(() => {
      this.tenant = this.firebaseService.getTenant(this.tenantUid);
    });
  }

  async gotoEditProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.modalController.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.modalController.create({
      component: EditProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.tenant,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
  ////Tenant////

  ////Owner////
  async getOwner(){
    this.firebaseService.read_owner().subscribe(() => {
      this.owner = this.firebaseService.getOwner(this.ownerUid);
    });
  }

  async gotoEditOwnerProfile() {
    if (this.isButtonDisabled) {
      return;
    }
    this.isButtonDisabled = true;

    const previousModal = await this.modalController.getTop();
    if (previousModal) {
      await previousModal.dismiss();
    }

    const modalInstance = await this.modalController.create({
      component: EditOwnerProfileComponent,
      cssClass: 'create-modal',
      componentProps: {
        data: this.owner,
      },
      backdropDismiss: false,
    });

    modalInstance.onDidDismiss().then(() => {
      console.log('Modal 1 dismissed');
      this.isButtonDisabled = false;
    });

    return await modalInstance.present();
  }
  ////Owner////

  ////Tenant Sort////
  TenantSortedBed(): any {
    this.transaction.map((a: any) => {
      if (a.roomData && a.lineItems && a.type === 'bedspace-reservation') {
        if(a.roomData.Bed){
        const bed = a.roomData.Bed?.filter((z:any)=>{
          return a.lineItems?.some((x:any)=> z.uid === x.uid);
        });
          this.bedTN.push({
            Title: a.roomData.Title,
            RoomName: a.roomData.RoomName,
            Bed: bed.map((data:any)=> data.status),
            Id: bed.map((data:any)=> data.id),
            Date: a.dateCreated,
            Status: a.status,
          });
          this.bedTN = this.bedTN.sort((a:any,b:any)=>{
            return (b.Date || 0 ) - (a.Date || 0)
           });
          return bed;
        }
      }
      })
      console.log('bedTN',this.bedTN);
  }

  TenantSortedRoom(): any {
    this.transaction.map((a: any) => {
      if (a.roomData && a.lineItems && a.type === 'room-reservation') {
        if(a.roomData.occupied){
          this.roomTN.push({
            Title: a.roomData.Title,
            RoomName: a.roomData.RoomName,
            Date: a.dateCreated,
            Status: a.status,
          });
          this.roomTN = this.roomTN.sort((a:any,b:any)=>{
            return (b.Date || 0 ) - (a.Date || 0)
           });
        }
      }
      })
      console.log('roomTN',this.roomTN);
  }
  ////Tenant Sort////

  ////Owner Sort////
  OwnerSortedBed(): any {
    this.room.map((a: any) => {
      a.Bed?.map((b:any) =>{
      if (b.occupied) {
        const bed = a.tenantData.filter((z:any)=>{
          return b.occupied?.userId === z.uid;
        });
          this.bedON.push({
            FName: bed.map((data:any) => data.FName),
            LName: bed.map((data:any) => data.LName),
            Title: a.Title,
            RoomName: a.RoomName,
            Phone: bed.map((data:any) => data?.Phone),
            Email: bed.map((data:any) => data?.Email),
            Address: bed.map((data:any) => data?.Address),
            profpic: bed.map((data:any) => data.profpic),
            uid: b.id,
            bed: b.status,
            userId: b.occupied?.userId,
            date: b.occupied?.dateCreated,
            status: b.occupied?.status,
          });
          this.bedON = this.bedON.sort((a:any,b:any)=>{
           return (b.date || 0 ) - (a.date || 0)
          });
          return bed;
        }
      })
      })
    console.log('bedON', this.bedON);
  }

  OwnerSortedRoom() {
    this.room.map((a: any) => {
      if (a.occupied) {
        const room = a.tenantData.filter((z:any)=>{
          return a.occupied?.userId === z.uid;
        });
          this.roomON.push({
            FName: room.map((data:any) => data.FName),
            LName: room.map((data:any) => data.LName),
            Title: a.Title,
            RoomName: a.RoomName,
            Phone: room.map((data:any) => data?.Phone),
            Email: room.map((data:any) => data?.Email),
            Address: room.map((data:any) => data?.Address),
            profpic: room.map((data:any) => data.profpic),
            uid: a.id,
            userId: a.occupied?.userId,
            date: a.occupied?.dateCreated,
            status: a.occupied?.status,
          });
          this.roomON = this.roomON.sort((a:any,b:any)=>{
            return (b.date || 0 ) - (a.date || 0)
           });
          return room;
        }
      })
    console.log('roomON', this.roomON);
  }
  ////Owner Sort////
}
