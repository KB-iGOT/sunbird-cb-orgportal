import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { CreateRequestFormV2Component } from './components/create-request-form-v2/create-request-form-v2.component'

const routes: Routes = [
  {
    path: '',
    component: CreateRequestFormV2Component,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRequestRoutingModule { }
