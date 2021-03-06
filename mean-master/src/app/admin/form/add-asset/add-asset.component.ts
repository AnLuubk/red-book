import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from 'angularfire2/storage';
import { DialogService } from '../../../services/common/dialog.service'
import { AssetService } from '../../../services/asset.service';
import { AddressService } from '../../../services/common/address.service';


@Component({
  selector: 'app-add-asset',
  templateUrl: './add-asset.component.html',
  styleUrls: ['./add-asset.component.css']
})
export class AddAssetComponent implements OnInit {
  @Input() assetForm: FormGroup;
  @Output() onComplete: EventEmitter<any> = new EventEmitter<any>();
  image1: any;
  image2: any;
  images: Array<string>;
  uploadProgress: any;
  breakpoint : number;
  isSmall : boolean;
  taskUpload: AngularFireUploadTask;

  constructor(
    private _formBuilder: FormBuilder,
    private afStorage: AngularFireStorage,
    private assetService: AssetService,
    private dialogSeervice: DialogService,
    private addrService: AddressService, ) {
    this.images = new Array(2);
  }

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 1100) ? 1 : 3; 
    if(window.innerWidth <= 1100){
      this.isSmall = true;
    }
    this.assetForm = this._formBuilder.group({
      area: ['', Validators.required],
      type: ['0', Validators.required],
      created: [new Date(), Validators.required],
      detail: ['', Validators.required],
    })
  }

  onChangeImage(event, name) {
    if (name == 'image1') {
      this.image1 = event.target.files[0];
    } else {
      this.image2 = event.target.files[0];
    }
  }

  uploadMediaAsset(asseId: string, rbId: string) {
    if(!this.image1){
      if(!this.image2){
        return;
      }
    }
    const randomId1 = Math.random().toString(36).substring(2);
    const randomId2 = Math.random().toString(36).substring(2);

    let ref1 = this.afStorage.ref(randomId1);
    let ref2 = this.afStorage.ref(randomId2);

    ref1.put(this.image1).then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {
      ref2.put(this.image2).then((uploadSnapshot: firebase.storage.UploadTaskSnapshot) => {

        this.afStorage.ref(randomId1).getDownloadURL().subscribe(url => {
          this.images.push(url);
          this.afStorage.ref(randomId2).getDownloadURL().subscribe(url => {
            this.images.push(url);
    
            let imageData = {
              rb_id: rbId,
              asset_id: asseId,
              images: this.images
            }
            console.log(url);
            this.assetService.uploadImage(imageData).subscribe((res: any) => {
              if (res.code == "1000") {
                this.dialogSeervice.showNotify('success', "Upload ảnh", "Upload ảnh thành công");
                this.dialogSeervice.showNotification("Upload ảnh", "Upload ảnh thành công", "success");
                setTimeout( function() {
                  window.location.reload();
                }, 2000);
              } else {
                this.dialogSeervice.showNotification("Upload ảnh", "Upload ảnh thất bại", "success");
              }
            })
          })
        });

       });
     });;

  }

  getDataAsset(rbId: string) {

    var dateTime = this.assetForm.get('created').value;
    var asset: any = {
      rb_id: rbId,
      type: this.assetService.getType(this.assetForm.get('type').value),
      area: this.assetForm.get('area').value,
      detail_info: this.assetForm.get('detail').value,
      date: dateTime.getDate() + '/' + dateTime.getMonth() + '/' + dateTime.getFullYear()
    }
    return asset;
  }

  uploadAsset(data) {
    return this.assetService.addAsset(data);
  }

  uploadImage(data) {
    return this.assetService.uploadImage(data);
  }


  confirmComplete() {
    if(!this.assetForm.valid){
      this.dialogSeervice.showNotify('error','Thông báo','Thiếu dữ liệu, vui lòng nhập đầy đủ!');
      return;
    }
    this.dialogSeervice.openConfirm('Xác nhận', 'Bạn đã kiểm tra kĩ các thông tin, vui lòng đồng ý để tiếp tục!')
      .afterClosed().subscribe((accept: boolean) => {
        if (accept) {
          this.onComplete.emit();
        } else {

        }
      });
  }

  onResize(event) {
    this.breakpoint = (event.target.innerWidth <= 1100) ? 1 : 3;
  }
  

}
