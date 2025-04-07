import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { CommunityService } from '../../services/community.service'
import { FormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { ActivatedRoute, Router } from '@angular/router'
import * as _ from 'lodash'
interface Community {
  name: string
  startDate: Date
  createdBy: string
  publishedOn: Date
  members: number
  mods: number
  createdByUserId?: string
  communityId?: string

}
@Component({
  selector: 'ws-app-community-dashboard',
  templateUrl: './community-dashboard.component.html',
  styleUrls: ['./community-dashboard.component.scss']
})





export class CommunityDashboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'startDate', 'createdBy', 'publishedOn', 'members', 'mods', 'actions'];
  dataSource: MatTableDataSource<Community>
  userProfile: any
  searchControl = new FormControl('');
  pageNumber = 0;
  pageSize = 10;
  additionalUserInfo: any = {}
  totalElements = 0  // Add this to store total count
  currentSearchString = ''  // Add this to store current search
  currentStatus = 'active'
  tabs = [
    {
      label: 'Community',
      status: 'active',
      icon: 'people' // Optional: Add Material icons
    },
    {
      label: 'Draft',
      status: 'draft',
      icon: 'edit'
    }
    // {
    //   label: 'Archived',
    //   status: 'inactive',
    //   icon: 'archive'
    // }
  ]
  selectedTabIndex = 0

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(private router: Router, private communitySvc: CommunityService, private activatedRoute: ActivatedRoute) {
    // Initialize with sample data
    const sampleData: Community[] = [

    ]

    this.dataSource = new MatTableDataSource(sampleData)
    this.getRouteSubscription()
    this.fetchCommunityData('')
  }

  getRouteSubscription() {
    if (_.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser')) {
      this.userProfile = _.get(this.activatedRoute, 'snapshot.data.configService.unMappedUser')
    }
  }

  ngOnInit() {
    // Setup search subscription with debounce
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Wait 300ms after last input
      distinctUntilChanged() // Only emit if value has changed
    ).subscribe(searchString => {
      this.fetchCommunityData(searchString || '')
    })
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      switch (property) {
        case 'name': return item.communityName?.toLowerCase() || ''
        case 'startDate': return new Date(item.createdOn).getTime()
        case 'createdBy': return this.additionalUserInfo[item.createdBy]?.first_name?.toLowerCase() || ''
        case 'publishedOn': return new Date(item.updatedOn).getTime()
        case 'members': return item.countOfPeopleJoined || 0
        case 'mods': return item.countOfModerators || 0
        default: return item[property]
      }
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }



  onActionClick(action: string, community: Community) {
    // Implement action handling
    if (action === 'edit') {
      this.router.navigate(['/app/home/community/edit', community.communityId])
    }
  }

  canEdit(community: Community) {
    return community.createdBy === this.userProfile.id
  }

  canArchive(community: Community) {
    return community.createdBy === this.userProfile.id
  }

  canDelete(community: Community) {
    return community.createdBy === this.userProfile.id
  }



  onTabChange(event: any) {
    this.selectedTabIndex = event.index
    this.currentStatus = this.tabs[event.index].status
    this.pageNumber = 0 // Reset to first page on tab change
    if (event.index === 1) {
      this.displayedColumns = ['name', 'startDate', 'createdBy', 'members', 'mods', 'actions']
    } else {
      this.displayedColumns = ['name', 'startDate', 'createdBy', 'publishedOn', 'members', 'mods', 'actions']

    }
    this.fetchCommunityData(this.currentSearchString)
  }

  fetchCommunityData(searchString: string) {
    let req: any = {
      "filterCriteriaMap":
      {
        "status": this.currentStatus,
        "orgId": this.userProfile.rootOrgId,
      },
      "requestedFields": [],
      "pageNumber": this.pageNumber,
      "pageSize": this.pageSize,
      "facets": [],
      "orderBy": "createdOn",
      "orderDirection": "DESC"
    }
    if (searchString) {
      req["searchString"] = searchString
    }
    this.communitySvc.communitySearch(req).subscribe((res) => {
      if (res.result && res.result.search_results
        && res.result.search_results.data
        && res.result.search_results.data.length > 0
      ) {
        this.additionalUserInfo = res.result.search_results.additionalInfo.reduce((acc: any, item: any) => {
          acc[item.user_id] = item
          return acc
        }, {})
        this.dataSource.data = res.result.search_results.data || []
        this.totalElements = res.result.search_results.totalCount || 0  // Update total count
      } else {
        this.dataSource.data = []
        this.totalElements = 0
      }
    })
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize
    this.pageNumber = event.pageIndex
    this.fetchCommunityData(this.currentSearchString)
  }

  changeToDefaultImg($event: any) {
    $event.target.src = '/assets/instances/eagle/app_logos/default.png'
  }

  onCreateCommunity() {
    this.router.navigate(['/app/home/community/create'])
  }

}
