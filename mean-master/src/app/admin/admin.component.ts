import { Component, OnInit, Input, AfterViewChecked } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { TdMediaService } from '@covalent/core/media';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  providers : [TdMediaService]
})
export class AdminComponent implements OnInit{
  
  userSubscription: Subscription;
  user: any;
  isSmall : boolean = false;

  constructor(
    public media: TdMediaService, 
     private authService: AuthService,
     private router: Router,
    ) {
}

  ngOnInit() {
    // alert('nam');
    // if(!this.authService.me()){
    //   this.router.navigate(['/auth/login']);
    // }
    // if(this.media.query('gt-xs')){
    //   this.isSmall = false;
    // }else{
    //   this.isSmall = true;
    // }
    this.authService.me().subscribe(data => {
      this.user = data.user;
    });

    // update this.user after login/register/logout
    this.userSubscription = this.authService.$userSource.subscribe((user) => {
      this.user = user;
      // this.navigate('/admin/list');
    });
  }

  logout(): void {
    this.authService.signOut();
    this.redirect('/auth/login');
  }

  navigate(link): void {
    this.router.navigate([link]);
  }

  redirect(link): void {
    this.router.navigateByUrl(link);
  }

  ngAfterViewChecked(){
   
  }

  ngOnDestroy() { 
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}


