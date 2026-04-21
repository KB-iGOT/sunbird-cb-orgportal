import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { PvDashboardComponent, PvCreateComponent } from '@sunbird-cb/consumption'

const routes: Routes = [
  {
    path: '',
    component: PvDashboardComponent
  },
  {
    path: 'new',
    component: PvCreateComponent
  },
  {
    path: 'edit/:id',
    component: PvCreateComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PeerValidationRoutingModule { }
