import { MentorManageComponent } from './mentor-manage.component'
import { of, Subject } from 'rxjs'

// Mock dependencies
const mockDialog = {
    open: jest.fn()
}

const mockActivatedRoute = {
    snapshot: {
        params: { tab: 'verified' },
        parent: {
            data: {
                configService: {
                    userProfile: { userId: 'test-user-id' },
                    unMappedUser: {
                        profileDetails: { profileStatus: 'VERIFIED' },
                        rootOrg: { rootOrgId: 'test-root-org' },
                        roles: ['MDO_ADMIN']
                    }
                }
            }
        }
    },
    parent: {
        snapshot: {
            data: {
                configService: {
                    userProfile: { userId: 'test-user-id' },
                    unMappedUser: {
                        profileDetails: { profileStatus: 'VERIFIED' },
                        rootOrg: { rootOrgId: 'test-root-org' },
                        roles: ['MDO_ADMIN']
                    }
                }
            }
        }
    }
}

const mockRouter = {
    navigate: jest.fn()
}

const mockEventService = {
    handleTabTelemetry: jest.fn(),
    raiseInteractTelemetry: jest.fn()
}

const mockLoaderService = {
    changeLoad: {
        next: jest.fn()
    }
}

const mockDomSanitizer = {
    bypassSecurityTrustHtml: jest.fn().mockReturnValue('sanitized-html')
}

const mockUsersService = {
    mentorList$: new Subject(),
    getAllUsersV3: jest.fn()
}

describe('MentorManageComponent', () => {
    let component: MentorManageComponent

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks()

        // Create component instance
        component = new MentorManageComponent(
            mockDialog as any,
            mockActivatedRoute as any,
            mockRouter as any,
            mockEventService as any,
            mockLoaderService as any,
            mockDomSanitizer as any,
            mockUsersService as any
        )
    })

    describe('Constructor', () => {
        it('should initialize component with correct default values', () => {
            expect(component.currentFilter).toBe('verified')
            expect(component.isLoading).toBe(false)
            expect(component.currentOffset).toBe(0)
            expect(component.limit).toBe(20)
            expect(component.pageIndex).toBe(0)
            expect(component.searchQuery).toBe('')
            expect(component.Math).toBe(Math)
        })

        it('should set current user from config service', () => {
            expect(component.currentUser).toBe('test-user-id')
        })

        it('should set current user status from config service', () => {
            expect(component.currentUserStatus).toBe('VERIFIED')
        })

        it('should set isMdoAdmin to true when user has MDO_ADMIN role', () => {
            expect(component.isMdoAdmin).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            // Mock service responses
            mockUsersService.getAllUsersV3.mockReturnValue(of({
                content: [{ userId: 'user1', firstName: 'John' }],
                count: 1,
                facets: []
            }))
        })

        it('should set current filter from route params', () => {
            component.ngOnInit()
            expect(component.currentFilter).toBe('verified')
        })

        it('should set rootOrgId from route data', () => {
            component.ngOnInit()
            expect(component.rootOrgId).toBe('test-root-org')
        })

        it('should initialize reports note list', () => {
            component.ngOnInit()
            expect(component.reportsNoteList).toHaveLength(3)
            expect(component.reportsNoteList[0]).toContain('All Verified Users')
        })

        it('should subscribe to mentorList$ and call user methods', (done) => {
            jest.spyOn(component, 'getAllVerifiedUsers')
            jest.spyOn(component, 'getMentorUsers')

            component.ngOnInit()

            // Trigger the subscription
            mockUsersService.mentorList$.next()

            setTimeout(() => {
                expect(component.getAllVerifiedUsers).toHaveBeenCalledWith('')
                expect(component.getMentorUsers).toHaveBeenCalledWith('')
                done()
            }, 1100)
        })
    })

    describe('sanitizeHtml', () => {
        it('should sanitize HTML using DomSanitizer', () => {
            const htmlString = '<p>Test HTML</p>'
            const result = component.sanitizeHtml(htmlString)

            expect(mockDomSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(htmlString)
            expect(result).toBe('sanitized-html')
        })
    })

    describe('openVideoPopup', () => {
        it('should open dialog with correct configuration', () => {
            component.openVideoPopup()

            expect(mockDialog.open).toHaveBeenCalledWith(
                expect.any(Function),
                {
                    data: {
                        videoLink: 'https://www.youtube.com/embed/tgbNymZ7vqY?autoplay=1&mute=1',
                    },
                    disableClose: true,
                    width: '50%',
                    height: '60%',
                    panelClass: 'overflow-visable',
                }
            )
        })
    })

    describe('filter', () => {
        beforeEach(() => {
            jest.spyOn(component, 'filterData')
        })

        it('should update filter properties and call filterData', () => {
            component.filter('mentor')

            expect(component.currentFilter).toBe('mentor')
            expect(component.pageIndex).toBe(0)
            expect(component.currentOffset).toBe(0)
            expect(component.limit).toBe(20)
            expect(component.searchQuery).toBe('')
            expect(component.filterData).toHaveBeenCalledWith('')
        })
    })

    describe('tabTelemetry', () => {
        it('should handle tab telemetry with correct data', () => {
            const label = 'Test Tab'
            const index = 1

            component.tabTelemetry(label, index)

            expect(mockEventService.handleTabTelemetry).toHaveBeenCalledWith(
                'USER_TAB',
                { label, index }
            )
        })
    })

    describe('filterData', () => {
        beforeEach(() => {
            jest.spyOn(component, 'getAllVerifiedUsers')
            jest.spyOn(component, 'getMentorUsers')
        })

        it('should call getAllVerifiedUsers when filter is verified', () => {
            component.currentFilter = 'verified'
            component.filterData('test-query')

            expect(component.getAllVerifiedUsers).toHaveBeenCalledWith('test-query')
        })

        it('should call getMentorUsers when filter is mentor', () => {
            component.currentFilter = 'mentor'
            component.filterData('test-query')

            expect(component.getMentorUsers).toHaveBeenCalledWith('test-query')
        })
    })

    describe('showEditUser', () => {
        it('should return true when user is MDO_ADMIN and roles exist', () => {
            component.isMdoAdmin = true
            const roles = ['MENTOR', 'USER']

            const result = component.showEditUser(roles)

            expect(result).toBe(true)
        })

        it('should return true when user is not MDO_ADMIN', () => {
            component.isMdoAdmin = false
            const roles = ['USER']

            const result = component.showEditUser(roles)

            expect(result).toBe(true)
        })

        it('should return true when user is MDO_ADMIN but no roles provided', () => {
            component.isMdoAdmin = true
            const roles = null

            const result = component.showEditUser(roles)

            expect(result).toBe(true)
        })
    })

    describe('getAllVerifiedUsers', () => {
        const mockResponse = {
            content: [
                { userId: 'user1', firstName: 'John', profileDetails: { profileStatus: 'VERIFIED' } }
            ],
            count: 1,
            facets: [{ name: 'group', values: [] }]
        }

        beforeEach(() => {
            mockUsersService.getAllUsersV3.mockReturnValue(of(mockResponse))
            component.rootOrgId = 'test-root-org'
            component.limit = 20
            component.pageIndex = 0
        })

        it('should call loader service and fetch verified users', async () => {
            await component.getAllVerifiedUsers('')

            expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(true)
            expect(mockUsersService.getAllUsersV3).toHaveBeenCalled()
            expect(component.verifiedUsersData).toEqual(mockResponse.content)
            expect(component.verifiedUsersDataCount).toBe(mockResponse.count)
            expect(component.filterFacets).toEqual(mockResponse.facets)
        })

        it('should build correct request body for verified users', async () => {
            await component.getAllVerifiedUsers('')

            const expectedReqBody = {
                request: {
                    filters: {
                        rootOrgId: 'test-root-org',
                        status: 1,
                        'profileDetails.profileStatus': 'VERIFIED',
                    },
                    fields: [
                        'rootOrgId',
                        'profileDetails',
                        'userId',
                        'roles',
                    ],
                    limit: 20,
                    offset: 0,
                    query: '',
                    sort_by: { firstName: 'asc' },
                },
            }

            expect(mockUsersService.getAllUsersV3).toHaveBeenCalledWith(expectedReqBody)
        })
    })

    describe('getMentorUsers', () => {
        const mockResponse = {
            content: [
                { userId: 'mentor1', firstName: 'Jane', roles: [{ role: 'MENTOR' }] }
            ],
            count: 1,
            facets: []
        }

        beforeEach(() => {
            mockUsersService.getAllUsersV3.mockReturnValue(of(mockResponse))
            component.rootOrgId = 'test-root-org'
            component.limit = 20
            component.pageIndex = 0
        })

        it('should call loader service and fetch mentor users', async () => {
            await component.getMentorUsers('')

            expect(mockLoaderService.changeLoad.next).toHaveBeenCalledWith(true)
            expect(mockUsersService.getAllUsersV3).toHaveBeenCalled()
            expect(component.mentorUsersData).toEqual(mockResponse.content)
            expect(component.mentorUsersDataCount).toBe(mockResponse.count)
        })

        it('should build correct request body for mentor users', async () => {
            await component.getMentorUsers('')

            const expectedReqBody = {
                request: {
                    filters: {
                        rootOrgId: 'test-root-org',
                        'roles.role': 'MENTOR',
                        'profileDetails.profileStatus': 'VERIFIED',
                    },
                    fields: [
                        'rootOrgId',
                        'profileDetails',
                        'userId',
                        'roles',
                    ],
                    limit: 20,
                    offset: 0,
                    query: '',
                    sort_by: { firstName: 'asc' },
                },
            }

            expect(mockUsersService.getAllUsersV3).toHaveBeenCalledWith(expectedReqBody)
        })
    })

    describe('Filter helper methods', () => {
        const mockQuery = {
            filters: {
                group: ['Engineering'],
                designation: ['Senior Developer'],
                roles: ['MENTOR'],
                tags: ['Angular', 'TypeScript']
            }
        }

        it('should return group filter when query has group filters', () => {
            const result = component.getFilterGroup(mockQuery)
            expect(result).toEqual(['Engineering'])
        })

        it('should return designation filter when query has designation filters', () => {
            const result = component.getFilterDesignation(mockQuery)
            expect(result).toEqual(['Senior Developer'])
        })

        it('should return roles filter when query has roles filters', () => {
            const result = component.getFilterRoles(mockQuery)
            expect(result).toEqual(['MENTOR'])
        })

        it('should return tags filter when query has tags filters', () => {
            const result = component.getFilterTags(mockQuery)
            expect(result).toEqual(['Angular', 'TypeScript'])
        })

        it('should return undefined when no filters are provided', () => {
            expect(component.getFilterGroup({})).toBeUndefined()
            expect(component.getFilterDesignation({})).toBeUndefined()
            expect(component.getFilterRoles({})).toBeUndefined()
            expect(component.getFilterTags({})).toBeUndefined()
        })
    })

    describe('getSearchText', () => {
        it('should return search text from query', () => {
            const query = { searchText: 'test search' }
            const result = component.getSearchText(query)

            expect(result).toBe('test search')
            expect(component.searchText).toBe('test search')
        })

        it('should return empty string when no search text provided', () => {
            const result = component.getSearchText({})

            expect(result).toBe('')
            expect(component.searchText).toBe('')
        })
    })

    describe('getSortOrder', () => {
        it('should return firstName asc for alphabetical sort', () => {
            const query = { sortOrder: 'alphabetical' }
            const result = component.getSortOrder(query)

            expect(result).toEqual({ firstName: 'asc' })
        })

        it('should return createdDate desc for oldest sort', () => {
            const query = { sortOrder: 'oldest' }
            const result = component.getSortOrder(query)

            expect(result).toEqual({ createdDate: 'desc' })
        })

        it('should return createdDate asc for newest sort', () => {
            const query = { sortOrder: 'newest' }
            const result = component.getSortOrder(query)

            expect(result).toEqual({ createdDate: 'asc' })
        })

        it('should return default firstName asc when no sort order provided', () => {
            const result = component.getSortOrder({})

            expect(result).toEqual({ firstName: 'asc' })
        })
    })

    describe('clickHandler', () => {
        beforeEach(() => {
            jest.spyOn(component, 'onCreateClick')
            jest.spyOn(component, 'onUploadClick')
        })

        it('should call onCreateClick for createUser event', () => {
            component.clickHandler({ type: 'createUser' })

            expect(component.onCreateClick).toHaveBeenCalled()
        })

        it('should call onUploadClick for upload event', () => {
            component.clickHandler({ type: 'upload' })

            expect(component.onUploadClick).toHaveBeenCalled()
        })
    })

    describe('onCreateClick', () => {
        it('should navigate to create user page and raise telemetry', () => {
            component.onCreateClick()

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/create-user'])
            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'CREATE_BTN',
                    id: 'create-user-btn',
                },
                {}
            )
        })
    })

    describe('onUploadClick', () => {
        beforeEach(() => {
            jest.spyOn(component, 'filter')
        })

        it('should call filter with upload parameter', () => {
            component.onUploadClick()

            expect(component.filter).toHaveBeenCalledWith('upload')
        })
    })

    describe('onRoleClick', () => {
        it('should navigate to user details and raise telemetry', () => {
            const user = { userId: 'test-user-123' }

            component.onRoleClick(user)

            expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/users/test-user-123/details'])
            expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
                {
                    type: 'CLICK',
                    subType: 'CARD_CONTENT',
                    id: 'USER_ROW',
                },
                {
                    id: 'test-user-123',
                    type: 'USER',
                }
            )
        })
    })

    describe('onEnterkySearch', () => {
        beforeEach(() => {
            jest.spyOn(component, 'filterData')
        })

        it('should set search query and call filterData', () => {
            const searchValue = 'test search'

            component.onEnterkySearch(searchValue)

            expect(component.searchQuery).toBe(searchValue)
            expect(component.filterData).toHaveBeenCalledWith(searchValue)
        })
    })

    describe('onPaginateChange', () => {
        beforeEach(() => {
            jest.spyOn(component, 'filterData')
        })

        it('should update pagination properties and call filterData', () => {
            const event = {
                pageIndex: 2,
                pageSize: 50
            }

            component.searchQuery = 'existing search'
            component.onPaginateChange(event as any)

            expect(component.pageIndex).toBe(2)
            expect(component.limit).toBe(50)
            expect(component.filterData).toHaveBeenCalledWith('existing search')
        })
    })

    describe('ngOnDestroy', () => {
        it('should complete without errors', () => {
            expect(() => component.ngOnDestroy()).not.toThrow()
        })
    })
})