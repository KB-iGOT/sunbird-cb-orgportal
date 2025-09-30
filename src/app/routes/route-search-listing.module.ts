import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { SearchListingModule } from '@sunbird-cb/search-listing'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SearchListingModule,
  ],
  exports: [
    SearchListingModule,
  ],
})
export class RouteSearchListingModule { }
