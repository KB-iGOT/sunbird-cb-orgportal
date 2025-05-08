import { Component, Input } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, startWith } from 'rxjs/operators'
import { CommunityService } from '../../services/community.service'

import { ActivatedRoute } from '@angular/router'
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete'


export interface User {
  name: string,
  firstName: string,
  profileDetails?: {
    personalDetails?: {
      primaryEmail?: string
      firstName?: string
      lastName?: string
    }
  }
}
@Component({
  selector: 'ws-app-add-moderator',
  templateUrl: './add-moderator.component.html',
  styleUrls: ['./add-moderator.component.scss']
})
export class AddModeratorComponent {
  @Input() communityDetailsForm!: FormGroup
  @Input() openMode: any
  myControl = new FormControl<string | User>('');
  options: User[] = [];
  filteredOptions!: Observable<User[]>
  userProfile: any
  selectedUser: any = []
  displayModerators: boolean = false
  defaultModeratorsLength = 2
  ngOnInit() {
    if (this.openMode === 'edit') {
      this.selectedUser = this.communityDetailsForm.value.moderators
    }
    this.getUserDetails('')
    this.filteredOptions = of(this.options)
    this.myControl.valueChanges.pipe(
      startWith(''),
      map((value: any) => {
        const name = typeof value === 'string' ? value : value?.profileDetails?.personalDetails?.primaryEmail
        return name ? this._filter(name as string) : this.options.slice()
      }),
    ).subscribe(options => {
      this.filteredOptions = of(options)
    })
  }

  displayFn(user: User): string {
    if (!user) return ''
    return user.profileDetails?.personalDetails?.primaryEmail ||
      user.name ||
      ''
  }

  private _filter(value: string): User[] {
    const filterValue = value.toLowerCase()

    return this.options.filter((option: any) => {
      console.log('option', option)
      const email = option.profileDetails?.personalDetails?.primaryEmail || ''
      const name = option.firstName || ''
      return email.toLowerCase().includes(filterValue) ||
        name.toLowerCase().includes(filterValue)
    })
  }


  constructor(private activeRouter: ActivatedRoute, private communitySvc: CommunityService) {

    if (this.activeRouter.parent && this.activeRouter.parent.snapshot.data.configService) {
      this.userProfile = this.activeRouter.parent.snapshot.data.configService.unMappedUser
    }
  }
  getUserDetails(searchQuery: string) {
    // API call to get user details
    let req = {
      "request": {
        "filters": {
          "rootOrgId": this.userProfile && this.userProfile.rootOrgId || "",
          "profileDetails.profileStatus": [
            "VERIFIED"
          ],
          "roles.role": "COMMUNITY_MODERATOR"
        },
        "limit": 20,
        "offset": 0,
        "query": searchQuery,
        "sort_by": {
          "firstName": "asc"
        }
      }
    }
    this.communitySvc.getUserDetails(req).subscribe((data: any) => {
      this.options = data.result.response.content
      this.options = this.options.map((user: any) => {
        // if (!user.name && user.profileDetails?.personalDetails) {
        //   const pd = user.profileDetails.personalDetails

        // }
        return user
      })
      this.filteredOptions = this.options.length > 0 ? of(this.options) : of([])
    }
    )
  }
  onOptionSelected(event: MatAutocompleteSelectedEvent) {
    // Save the selected user details to a variable'

    let selectedUser = event.option.value
    let email = selectedUser.profileDetails && selectedUser.profileDetails.personalDetails && selectedUser.profileDetails.personalDetails.primaryEmail
    let userObj = {
      moderatorId: selectedUser.identifier,
      moderatorName: selectedUser.firstName,
      moderatorEmail: email || ''
    }
    this.selectedUser = [...this.communityDetailsForm.value.moderators, userObj]
    this.myControl.reset('')
    this.patchValueToForm()
    // You can access all the user details from this.selectedUser now
  }
  isUserSelected(user: any): boolean {
    // return this.selectedUser.some((selectedUser: any) =>
    //   selectedUser.moderatorId !== user.identifier
    // )
    return this.communityDetailsForm.value.moderators.some((selectedUser: any) =>
      selectedUser.moderatorId === user.identifier
    )
  }
  removeUser(user: any) {
    let id = user.identifier || user.moderatorId
    this.selectedUser = this.selectedUser.filter((selectedUser: any) => selectedUser.moderatorId !== id)

    this.patchValueToForm()
  }
  patchValueToForm() {
    this.communityDetailsForm.patchValue({
      moderators: this.selectedUser
    })
  }
  clearAll() {
    this.selectedUser = []
    this.patchValueToForm()
  }
}