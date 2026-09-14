import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReusableUserGroupsModule } from '../../../project/ws/app/src/public-api'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReusableUserGroupsModule,
  ],
  exports: [
    ReusableUserGroupsModule,
  ],
})
export class RouteReusableUserGroupsModule { }
