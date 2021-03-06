import { Component, OnInit, ViewChild, Input, Inject, Output, EventEmitter } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AddressService } from '../../../services/common/address.service';
import { TransactionService } from '../../../services/transaction.service';
import { PersonService } from '../../../services/person.service';
import { DialogService } from '../../../services/common/dialog.service';
import { RedbookService } from '../../../services/redbook.service';
import { AddPersonComponent } from '../add-person/add-person.component';
import { NzNotificationService } from 'ng-zorro-antd';
import { LoadingEffectService } from '../../../services/common/loading-effect.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-trans',
  templateUrl: './add-trans.component.html',
  styleUrls: ['./add-trans.component.css']
})
export class AddTransComponent implements OnInit {

  @Input() ownername : string;
  @Input() ownerId : string;
  @Input() rbId : string;
  @Output('addTransSuccess')  addTransSuccess : EventEmitter<null> = new EventEmitter();
  listOwner: any;
  isHasOwner: true;
  type: string;
  amount: Number = 0;
  date = new Date();
  detail: "";
  new_owner: "";
  isVisibleModal: boolean;
  breakpoint : number;

  rb_id: string;
  myOwner = new FormControl();
  listOwnerName = [];
  filteredOptions: Observable<string[]>;
  personFormGroup: FormGroup;
  personForm: FormGroup;

  @ViewChild("addPerson") addPersonForm: AddPersonComponent;

  constructor(
    private _formBuilder: FormBuilder,
    private router : Router,
    private addService: AddressService,
    private transService: TransactionService,
    private personService: PersonService,
    private dialog: DialogService,
    private rbService: RedbookService,
    private notify : NzNotificationService,
    private loading : LoadingEffectService

  ) {

  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 2; 
    this.personForm = this._formBuilder.group({
      fname: ['', Validators.required],
      mname: ['', Validators.required],
      lname: ['', Validators.required],
      birthDay: [new Date(), Validators.required],
      gender: ['2', Validators.required],
      card_id: ['', Validators.required],
    });
    this.updateListOwner();
    this.filteredOptions = this.myOwner.valueChanges
      .pipe(
        startWith(''),
        map(value => this._filter(value))
      );


    // this.personFormGroup = this._formBuilder.group({
    //   fname: ['', Validators.required],
    //   mname: ['', Validators.required],
    //   lname: ['', Validators.required],
    //   birthDay: [new Date(), Validators.required],
    //   gender: ['2', Validators.required],
    //   card_id: ['', Validators.required],
    // });
  }

  updateListOwner(){
    this.personService.getListPerson().subscribe((res: any) => {
      var i = 0;
      res.list_owner.forEach(owner => {
        if (owner._id) {
          this.listOwnerName.push({
            id: "OWNER120" + i,
            owner_id: owner._id,
            owner_name: owner.fullname,
            code: owner.fullname + "- OWNER120" + i
          });
          i++;
        }
      });
    })


  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.listOwnerName.filter(option => option.owner_name.toLowerCase().includes(filterValue));
    // return this.listOwnerName.filter(option => option.owner_name.toLowerCase().indexOf(filterValue) === 0);
  }

  addTrans() {
    if( !this.myOwner.value){
      this.dialog.showNotify('error', 'Thông báo', 'Nhập đầy đủ thông tin về giao dịch!');
      return;
    }
    if(this.amount == 0){
      this.dialog.showNotify('error', 'Thông báo', 'Nhập đầy đủ thông tin về giao dịch!');
      return;
    }
    if(!this.detail && !this.type){
      this.dialog.showNotify('error', 'Thông báo', 'Nhập đầy đủ thông tin về giao dịch!');
      return;
    }
    let transData: any = {
      rb_id: this.rbId,
      owner_old: this.ownerId,
      owner_id: this.getOnwerId(this.myOwner.value),
      transaction_amount: this.amount,
      type: this.transService.getType(this.type),
      created: this.addService.getDate(this.date),
      description: this.detail
    }

    this.transService.addTrans(transData).subscribe((res: any) => {
      this.loading.showLoading2();
      if (res.code == "1000") {
        this.rbService.changOwner({
          rb_id: this.rbId,
          owner_id: transData.owner_id
        }).subscribe((res: any) => {
          if (res.code == "1000") {
            this.notify.create( 'success', 'Thành công', 'Thêm mới giao dịch hữu thành công!');
            this.loading.stopLoading2();
            this.addTransSuccess.emit();
            // this.reload();
              // setTimeout( function() {
              //   window.location.reload();
              // }, 2000);
          }
        })
      } else {
        this.loading.stopLoading2();
        this.notify.create( 'error', 'Thất bại', 'Có lỗi khi thêm mới giao dịch!');
      }
    })
  }

  reload(){
    this.router.navigateByUrl('/admin/list', {skipLocationChange: true}).then(()=>
      this.router.navigate([''])); 
  }

  getOnwerId(code: string) {
    var pos_ = code.indexOf("-");
    var code = code.slice(pos_ + 2, code.length);
    var ownerid = "";
    this.listOwnerName.forEach(owner => {
      // alert(code)
      // alert(owner.id)

      if (owner.id === code) {
        ownerid = owner.owner_id;
      }
    })
    return ownerid;
    // alert(code.slice(0, pos_ ));
  }

  // displayWith(key) {
  //   if( this.listOwnerName){
  //     let selection : any = this.listOwnerName.filter(e => e.owner_id === key);
  //   if (selection)
  //   return selection.owner_name;
  //   }
  //  return ''; 
  // }
  displayModalPerson() {
    this.isVisibleModal = true;
  }

  cancelModal() {
    this.isVisibleModal = false;
  }

  addPerson() {
    if(!this.addPersonForm.address){
      if(!this.addPersonForm.personForm.valid){
        this.dialog.showNotify('error', 'Thông báo', 'Nhập đầy đủ thông tin về chủ sở hữu!');
        return;
      }
    }
    this.isVisibleModal = false;
    this.addService.addAdress(this.addPersonForm.getPostalAddr()).subscribe((res: any) => {
      if (res.code == '1000') {
        let addrPerson_id = res.addr_id;
        let personData = this.addPersonForm.getPersonData(addrPerson_id);
        // this.addPersonForm.personForm.reset();
        this.addPersonForm.uploadPersonData(personData).subscribe((res: any) => {
          if (res.code == '1000') {
            this.notify.create( 'success', 'Thành công', 'Thêm mới chủ sở hữu thành công!');
            this.updateListOwner();
          }else{
            if(res.code = '1001'){
              this.dialog.showNotify('error', 'Thông báo', 'Thiếu thông tin về số CMND!');
            }
            this.notify.create( 'error', 'Thất bại', 'Có lỗi khi thêm mới chủ sở hữu!');
          }
        })
      }
    });
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 1100) ? 1 : 2;
  }
}
