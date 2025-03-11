import { Component, OnInit, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator, PageEvent } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { CommunityService } from '../../services/community.service'
import { FormControl } from '@angular/forms'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { Router } from '@angular/router'
interface Community {
  name: string
  startDate: Date
  createdBy: string
  publishedOn: Date
  members: number
  mods: number
}
@Component({
  selector: 'ws-app-community-dashboard',
  templateUrl: './community-dashboard.component.html',
  styleUrls: ['./community-dashboard.component.scss']
})





export class CommunityDashboardComponent implements OnInit {
  displayedColumns: string[] = ['name', 'startDate', 'createdBy', 'publishedOn', 'members', 'mods', 'actions'];
  dataSource: MatTableDataSource<Community>
  searchControl = new FormControl('');
  pageNumber = 0;
  pageSize = 10;
  totalElements = 0  // Add this to store total count
  currentSearchString = ''  // Add this to store current search
  currentStatus = 'active'
  selectedTabIndex = 0
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
    },
    {
      label: 'Archived',
      status: 'inactive',
      icon: 'archive'
    }
  ]

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(private router: Router, private communitySvc: CommunityService) {
    // Initialize with sample data
    const sampleData: Community[] = [
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      },
      {
        name: 'Community 1',
        startDate: new Date(),
        createdBy: 'John Doe',
        publishedOn: new Date(),
        members: 100,
        mods: 5
      }
      // Add more sample data as needed
    ]

    this.dataSource = new MatTableDataSource(sampleData)
    this.fetchCommunityData('')
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
    // this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  createNewCommunity() {
    // Implement community creation logic
    console.log('Create new community clicked')
  }

  onActionClick(action: string, community: Community) {
    // Implement action handling
    console.log(`${action} clicked for ${community.name}`)
  }



  onTabChange(event: any) {
    this.selectedTabIndex = event.index
    this.currentStatus = this.tabs[event.index].status
    this.pageNumber = 0 // Reset to first page on tab change
    this.fetchCommunityData(this.currentSearchString)
  }

  fetchCommunityData(searchString: string) {
    let req: any = {
      "filterCriteriaMap":
      {
        "status": this.currentStatus
      },
      "requestedFields": [],
      "pageNumber": this.pageNumber,
      "pageSize": this.pageSize,
      "facets": []
    }
    if (searchString) {
      req.filterCriteriaMap["searchString"] = searchString
    }
    this.communitySvc.communitySearch(req).subscribe((res) => {
      if (res.result && res.result.search_results
        && res.result.search_results.data
        && res.result.search_results.data.length > 0
      ) {
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
