import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GuestComponent} from '../guest/guest.component';
import {RedbooksComponent} from '../components/redbook/redbooks/redbooks.component';
import { RedbookInfoComponent } from '../components/redbook/redbook-info/redbook-info.component';
import {AddressMapComponent} from '../components/address-map/address-map.component';
const routes: Routes = [
  {
  path: 'control',
  component: GuestComponent,
  children: [
    {
      path: 'query',
      component: RedbooksComponent,
    },
    {
      path: 'detail/:redbook_id',
      component: RedbookInfoComponent,
    },
    {
      path: 'testmap',
      component: AddressMapComponent,
    },
  ]
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class GuestRoutingModule { }
