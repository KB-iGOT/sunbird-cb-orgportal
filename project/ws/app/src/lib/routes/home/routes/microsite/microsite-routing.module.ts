import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MicrositeV1Component } from './microsite-v1/microsite-v1.component'

const routes: Routes = [
  {
    path: '',
    component: MicrositeV1Component,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MicrositeRoutingModule { }
