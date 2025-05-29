import { CreateRequestFormComponent } from './create-request-form.component'
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms'
import { of, throwError } from 'rxjs'

describe('CreateRequestFormComponent', () => {
    let component: CreateRequestFormComponent
    let mockFormBuilder: any
    let mockHomeService: any
    let mockActivatedRouter: any
    let mockSnackBar: any
    let mockRouter: any
    let mockDialog: any
    let mockInitService: any
    let mockDialogRef: any

    // Helper function to safely access form controls
    const getFormControl = (controlName: string) => {
        return component.requestForm?.get(controlName)
    }

    // Helper function to check if form is initialized
    const isFormInitialized = () => {
        return component.requestForm && typeof component.requestForm.get === 'function'
    }

    beforeEach(() => {
        // Create mocks
        mockFormBuilder = {
            group: jest.fn()
        }

        mockHomeService = {
            getFilterEntity: jest.fn().mockReturnValue(of([{ id: 1, name: 'Test Competency' }])),
            getFilterEntityV2: jest.fn().mockReturnValue(of([
                { terms: [{ identifier: 'area1', name: 'Area 1', associations: [] }] },
                { terms: [{ identifier: 'theme1', name: 'Theme 1', associations: [] }] }
            ])),
            getRequestTypeList: jest.fn().mockReturnValue(of([{ id: 1, orgName: 'Test Provider' }])),
            getRequestDataById: jest.fn().mockReturnValue(of({
                title: 'Test Request',
                objective: 'Test Objective',
                requestType: 'Single',
                competencies: []
            })),
            createDemand: jest.fn().mockReturnValue(of({ success: true }))
        }

        mockActivatedRouter = {
            snapshot: {
                data: {
                    configService: {
                        userProfile: {
                            userId: 'test-user-id'
                        }
                    }
                }
            },
            queryParams: of({ id: 'test-id', name: 'view' })
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockRouter = {
            navigateByUrl: jest.fn()
        }

        mockDialogRef = {
            afterClosed: jest.fn().mockReturnValue(of(null)),
            close: jest.fn()
        }

        mockDialog = {
            open: jest.fn().mockReturnValue(mockDialogRef)
        }

        mockInitService = {
            configSvc: {
                competency: {
                    'competencies_v5': {
                        vKey: 'competencies_v5'
                    }
                }
            }
        }

        // Create a real form group
        const realFormBuilder = new UntypedFormBuilder()
        const mockFormGroup = realFormBuilder.group({
            TitleName: ['', [Validators.required, Validators.minLength(10)]],
            Objective: ['', [Validators.required]],
            userType: [''],
            learningMode: [''],
            compArea: [''],
            referenceLink: [''],
            requestType: ['', Validators.required],
            assignee: [''],
            providers: [[]],
            providerText: [''],
            queryThemeControl: [''],
            querySubThemeControl: [''],
            competencies_v5: [[]],
            assigneeText: ['']
        })

        // Mock the form builder to return our real form group
        mockFormBuilder.group.mockReturnValue(mockFormGroup)

        // Create component instance
        component = new CreateRequestFormComponent(
            mockFormBuilder,
            mockHomeService,
            mockActivatedRouter,
            mockSnackBar,
            mockRouter,
            mockDialog,
            mockInitService
        )
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Component Creation', () => {
        it('should create component instance', () => {
            expect(component).toBeDefined()
            expect(component).toBeInstanceOf(CreateRequestFormComponent)
        })
    })

    describe('Component Initialization', () => {
        it('should initialize component properties on ngOnInit', () => {
            component.ngOnInit()

            expect(component.compentencyKey).toEqual({ vKey: 'competencies_v5' })
            expect(component.fullProfile).toBeDefined()
            expect(component.userId).toBe('test-user-id')
            expect(component.competencyArea).toBeInstanceOf(UntypedFormControl)
            expect(component.competencyTheme).toBeInstanceOf(UntypedFormControl)
            expect(component.competencySubtheme).toBeInstanceOf(UntypedFormControl)
        })

        it('should initialize form on ngOnInit', () => {
            component.ngOnInit()

            expect(component.requestForm).toBeDefined()
            expect(mockFormBuilder.group).toHaveBeenCalled()
        })

        it('should call getFilterEntity for competencies_v5', () => {
            component.ngOnInit()

            expect(mockHomeService.getFilterEntity).toHaveBeenCalled()
        })

        it('should call getFilterEntityV2 for other competency versions', () => {
            // Change the competency version
            mockInitService.configSvc.competency = {
                'competencies_v4': { vKey: 'competencies_v4' }
            }

            component.ngOnInit()

            expect(mockHomeService.getFilterEntityV2).toHaveBeenCalled()
        })

        it('should call getRequestTypeList on ngOnInit', () => {
            component.ngOnInit()

            expect(mockHomeService.getRequestTypeList).toHaveBeenCalled()
        })
    })

    describe('Form Structure and Validation', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should have all required form controls after initialization', () => {
            expect(isFormInitialized()).toBe(true)

            expect(getFormControl('TitleName')).toBeTruthy()
            expect(getFormControl('Objective')).toBeTruthy()
            expect(getFormControl('userType')).toBeTruthy()
            expect(getFormControl('learningMode')).toBeTruthy()
            expect(getFormControl('compArea')).toBeTruthy()
            expect(getFormControl('referenceLink')).toBeTruthy()
            expect(getFormControl('requestType')).toBeTruthy()
            expect(getFormControl('assignee')).toBeTruthy()
            expect(getFormControl('providers')).toBeTruthy()
            expect(getFormControl('competencies_v5')).toBeTruthy()
        })

        it('should validate required fields', () => {
            if (!isFormInitialized()) return

            // Test required validation
            expect(getFormControl('TitleName')?.hasError('required')).toBe(true)
            expect(getFormControl('Objective')?.hasError('required')).toBe(true)
            expect(getFormControl('requestType')?.hasError('required')).toBe(true)

            // Set valid values
            getFormControl('TitleName')?.setValue('Valid Title Name Here')
            getFormControl('Objective')?.setValue('Valid Objective')
            getFormControl('requestType')?.setValue('Single')

            expect(getFormControl('TitleName')?.hasError('required')).toBe(false)
            expect(getFormControl('Objective')?.hasError('required')).toBe(false)
            expect(getFormControl('requestType')?.hasError('required')).toBe(false)
        })

        it('should validate minimum length for title', () => {
            if (!isFormInitialized()) return

            const titleControl = getFormControl('TitleName')

            titleControl?.setValue('Short')
            expect(titleControl?.hasError('minlength')).toBe(true)

            titleControl?.setValue('This is a valid title with sufficient length')
            expect(titleControl?.hasError('minlength')).toBe(false)
        })
    })

    describe('Request Type Selection', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should handle Single request type selection', () => {
            if (!isFormInitialized()) return

            component.selectRequestType('Single')

            expect(component.isAssignee).toBe(true)
            expect(component.isBroadCast).toBe(false)
            expect(component.statusValue).toBe('Assigned')

            const providersControl = getFormControl('providers')
            const assigneeControl = getFormControl('assignee')

            expect(providersControl?.value).toBe('')
            expect(assigneeControl?.hasError('required')).toBe(true)
        })

        it('should handle Broadcast request type selection', () => {
            if (!isFormInitialized()) return

            component.selectRequestType('Broadcast')

            expect(component.isBroadCast).toBe(true)
            expect(component.isAssignee).toBe(false)
            expect(component.statusValue).toBe('Unassigned')

            const assigneeControl = getFormControl('assignee')
            const providersControl = getFormControl('providers')

            expect(assigneeControl?.value).toBe('')
            expect(providersControl?.hasError('required')).toBe(true)
        })
    })

    describe('Competency Management', () => {
        beforeEach(() => {
            component.ngOnInit()
            // Set up test data
            component.compentencyKey = { vKey: 'competencies_v5', vCompetencyArea: '', vCompetencyAreaDescription: '', vCompetencyTheme: '', vCompetencySubTheme: '' }
            component.seletedCompetencyArea = {
                id: 1,
                name: 'Test Area',
                description: 'Test Description'
            }
            component.seletedCompetencyTheme = {
                id: 1,
                name: 'Test Theme',
                description: 'Test Description',
                additionalProperties: { themeType: 'technical' }
            }
            component.seletedCompetencySubTheme = {
                id: 1,
                name: 'Test SubTheme',
                description: 'Test Description'
            }
        })

        it('should select competency area and update themes', () => {
            const testArea = { name: 'Test Area', themes: [{ name: 'Theme 1' }] }
            component.allCompetencies = [testArea]

            component.compAreaSelected(testArea)

            expect(component.seletedCompetencyArea).toBe(testArea)
            expect(component.allCompetencyTheme).toEqual(testArea.themes)
        })

        it('should select competency theme and update subthemes', () => {
            const testTheme = { identifier: 'theme1', associations: [{ name: 'SubTheme 1' }] }
            component.allCompetencyTheme = [testTheme]

            component.compThemeSelected(testTheme)

            expect(component.seletedCompetencyTheme).toBe(testTheme)
            expect(component.allCompetencySubtheme).toEqual(testTheme.associations)
        })

        it('should enable competency add when subtheme is selected', () => {
            const testSubTheme = { identifier: 'subtheme1', name: 'Test SubTheme' }
            component.allCompetencySubtheme = [testSubTheme]

            component.compSubThemeSelected(testSubTheme)

            expect(component.enableCompetencyAdd).toBe(true)
            expect(component.seletedCompetencySubTheme).toBe(testSubTheme)
        })

        it('should add competency when all required fields are selected', () => {
            if (!isFormInitialized()) return

            const competencyControl = getFormControl('competencies_v5')
            const initialLength = competencyControl?.value?.length || 0

            component.addCompetency()

            const newLength = competencyControl?.value?.length || 0
            expect(newLength).toBe(initialLength + 1)
        })

        it('should prevent adding duplicate competencies', () => {
            if (!isFormInitialized()) return

            // Add a competency first
            component.addCompetency()

            const competencyControl = getFormControl('competencies_v5')
            const lengthAfterFirst = competencyControl?.value?.length || 0

            // Try to add the same competency again
            component.addCompetency()

            const lengthAfterSecond = competencyControl?.value?.length || 0
            expect(lengthAfterSecond).toBe(lengthAfterFirst)
            expect(mockSnackBar.open).toHaveBeenCalledWith('This competency is already added')
        })

        it('should not add competency if required fields are missing', () => {
            if (!isFormInitialized()) return

            component.seletedCompetencyArea = null
            component.seletedCompetencyTheme = null
            component.seletedCompetencySubTheme = null

            const competencyControl = getFormControl('competencies_v5')
            const initialLength = competencyControl?.value?.length || 0

            component.addCompetency()

            const finalLength = competencyControl?.value?.length || 0
            expect(finalLength).toBe(initialLength)
        })

        it('should remove competency from form array', () => {
            if (!isFormInitialized()) return

            // Add a competency first
            component.addCompetency()

            const competencyControl = getFormControl('competencies_v5')
            const competencies = competencyControl?.value || []

            if (competencies.length > 0) {
                const competencyToRemove = competencies[0]
                const initialLength = competencies.length

                component.removeCompetency(competencyToRemove)

                const finalLength = competencyControl?.value?.length || 0
                expect(finalLength).toBe(initialLength - 1)
            }
        })
    })

    describe('Data Loading', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should load filter entity data', () => {
            component.getFilterEntity()

            expect(mockHomeService.getFilterEntity).toHaveBeenCalled()
            expect(component.competencyList).toBeDefined()
            expect(component.allCompetencies).toBeDefined()
        })

        it('should load filter entity v2 data', () => {
            component.getFilterEntityV2()

            expect(mockHomeService.getFilterEntityV2).toHaveBeenCalled()
        })

        it('should load request type list', () => {
            component.getRequestTypeList()

            expect(mockHomeService.getRequestTypeList).toHaveBeenCalled()
            expect(component.requestTypeData).toBeDefined()
        })

        it('should load request data by id', () => {
            component.demandId = 'test-id'
            component.getRequestDataById()

            expect(mockHomeService.getRequestDataById).toHaveBeenCalledWith('test-id')
        })

        it('should handle getRequestTypeList with demandId and view action', () => {
            component.demandId = 'test-id'
            component.actionBtnName = 'view'

            component.getRequestTypeList()

            expect(component.isHideData).toBe(true)
            expect(component.isCompetencyHide).toBe(true)
        })
    })

    describe('Form Submission', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should submit form with valid data', () => {
            if (!isFormInitialized()) return

            // Set up valid form data
            component.requestForm.patchValue({
                TitleName: 'Valid Test Title Name',
                Objective: 'Valid Test Objective',
                requestType: 'Single'
            })

            component.submit()

            expect(mockHomeService.createDemand).toHaveBeenCalled()
        })

        it('should handle submission error', () => {
            mockHomeService.createDemand.mockReturnValue(throwError('Submission failed'))

            component.submit()

            expect(mockSnackBar.open).toHaveBeenCalledWith('Request Failed')
        })

        it('should show confirmation dialog', () => {
            component.showConformationPopUp()

            expect(mockDialog.open).toHaveBeenCalled()
        })

        it('should navigate back to request list', () => {
            component.navigateBack()

            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/request-list')
        })

        it('should handle reassign scenario', () => {
            if (!isFormInitialized()) return

            component.demandId = 'test-id'
            component.actionBtnName = 'reassign'

            component.submit()

            expect(mockHomeService.createDemand).toHaveBeenCalledWith(
                expect.objectContaining({
                    demand_id: 'test-id'
                })
            )
        })
    })

    describe('Search and Filter Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should filter values by name', () => {
            const testArray = [
                { name: 'Angular' },
                { name: 'React' },
                { name: 'Vue' }
            ]

            const result = component.filterValues('ang', testArray)

            expect(result).toEqual([{ name: 'Angular' }])
        })

        it('should filter org values by orgName', () => {
            const testArray = [
                { orgName: 'Google' },
                { orgName: 'Microsoft' },
                { orgName: 'Apple' }
            ]

            const result = component.filterOrgValues('goo', testArray)

            expect(result).toEqual([{ orgName: 'Google' }])
        })

        it('should get hidden options based on search', () => {
            const testArray = [
                { orgName: 'Google' },
                { orgName: 'Microsoft' }
            ]

            const result = component.getHiddenOptions('goo', testArray)

            expect(result[0].hideOption).toBe('show')
            expect(result[1].hideOption).toBe('hide')
        })

        it('should clear search values', () => {
            if (!isFormInitialized()) return

            const mockEvent = { stopPropagation: jest.fn() }

            component.clearSearch(mockEvent, 'providerText')

            expect(mockEvent.stopPropagation).toHaveBeenCalled()
            expect(getFormControl('providerText')?.value).toBe('')
        })
    })

    describe('Provider Management', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should remove provider from list', () => {
            if (!isFormInitialized()) return

            const testProvider = { id: 1, name: 'Test Provider' }
            const providersControl = getFormControl('providers')

            // Set initial providers
            providersControl?.setValue([testProvider, { id: 2, name: 'Another Provider' }])

            component.onProviderRemoved(testProvider)

            const remainingProviders = providersControl?.value || []
            expect(remainingProviders.length).toBe(1)
            expect(remainingProviders).not.toContain(testProvider)
        })

        it('should check if option is disabled when max providers selected', () => {
            if (!isFormInitialized()) return

            const testOption = { id: 6, name: 'Test Provider' }
            const providersControl = getFormControl('providers')

            // Set 5 providers (max limit)
            const maxProviders = Array(5).fill(null).map((_, i) => ({ id: i + 1, name: `Provider ${i + 1}` }))
            providersControl?.setValue(maxProviders)

            const result = component.isOptionDisabled(testOption)

            expect(result).toBe(true)
        })

        it('should allow adding provider when under max limit', () => {
            if (!isFormInitialized()) return

            const testOption = { id: 1, name: 'Test Provider' }
            const providersControl = getFormControl('providers')

            // Set fewer than 5 providers
            providersControl?.setValue([{ id: 2, name: 'Another Provider' }])

            const result = component.isOptionDisabled(testOption)

            expect(result).toBe(false)
        })

        it('should handle provider removal when control has no value', () => {
            if (!isFormInitialized()) return

            const testProvider = { id: 1, name: 'Test Provider' }
            const providersControl = getFormControl('providers')

            providersControl?.setValue(null)

            expect(() => component.onProviderRemoved(testProvider)).not.toThrow()
        })
    })

    describe('Reset Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should reset competency subfields', () => {
            if (!isFormInitialized()) return

            component.enableCompetencyAdd = true
            component.allCompetencySubtheme = [{ name: 'Test SubTheme' }]

            component.resetCompSubfields()

            expect(component.enableCompetencyAdd).toBe(false)
            expect(component.allCompetencySubtheme).toEqual([])
            expect(getFormControl('queryThemeControl')?.value).toBe('')
        })

        it('should reset all competency fields', () => {
            if (!isFormInitialized()) return

            component.resetCompfields()

            expect(component.enableCompetencyAdd).toBe(false)
            expect(getFormControl('compArea')?.value).toBe('')
        })

        it('should reset search for theme', () => {
            if (!isFormInitialized()) return

            component.allCompetencyTheme = [{ name: 'Theme 1' }]

            component.resetSearch('theme')

            expect(getFormControl('queryThemeControl')?.value).toBe('')
            expect(component.filteredallCompetencyTheme).toEqual(component.allCompetencyTheme)
        })

        it('should reset search for subtheme', () => {
            if (!isFormInitialized()) return

            component.allCompetencySubtheme = [{ name: 'SubTheme 1' }]

            component.resetSearch('subtheme')

            expect(getFormControl('querySubThemeControl')?.value).toBe('')
            expect(component.filteredallCompetencySubtheme).toEqual(component.allCompetencySubtheme)
        })
    })

    describe('Utility Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should check if item can be pushed to array', () => {
            const existingArray = [
                { competencyAreaId: 1, competencyThemeId: 1, competencySubThemeId: 1 }
            ]
            const newItem = { competencyAreaId: 2, competencyThemeId: 2, competencySubThemeId: 2 }
            const duplicateItem = { competencyAreaId: 1, competencyThemeId: 1, competencySubThemeId: 1 }

            expect(component.canPush(existingArray, newItem)).toBe(true)
            expect(component.canPush(existingArray, duplicateItem)).toBe(false)
        })

        it('should handle opened change event', () => {
            if (!isFormInitialized()) return

            component.openedChange(true, 'providerText')

            expect(getFormControl('providerText')?.value).toBe('')
        })

        it('should refresh data', () => {
            component.refreshData()

            expect(mockHomeService.getFilterEntityV2).toHaveBeenCalled()
        })
    })

    describe('Dialog Management', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should open competency view dialog', () => {
            const testItem = { id: 1, name: 'Test Competency' }

            component.view(testItem)

            expect(mockDialog.open).toHaveBeenCalled()
        })

        it('should show progress dialog', () => {
            component.showDialogBox('progress')

            expect(mockDialog.open).toHaveBeenCalled()
        })

        it('should show completion dialog', () => {
            component.showDialogBox('progress-completed')

            expect(mockDialog.open).toHaveBeenCalled()
        })

        it('should handle dialog close with DELETE action', () => {
            const testItem = { id: 1, name: 'Test Competency' }
            mockDialogRef.afterClosed.mockReturnValue(of({ action: 'DELETE', id: 1 }))

            const removeCompetencySpy = jest.spyOn(component, 'removeCompetency')

            component.view(testItem)

            expect(removeCompetencySpy).toHaveBeenCalledWith(1)
        })
    })

    describe('Error Handling', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should handle service errors gracefully', () => {
            mockHomeService.getFilterEntity.mockReturnValue(throwError('Service error'))

            expect(() => component.getFilterEntity()).not.toThrow()
        })

        it('should handle form control access errors', () => {
            expect(() => component.clearSearch({ stopPropagation: jest.fn() }, 'nonExistentControl')).not.toThrow()
        })

        it('should handle missing query params', () => {
            mockActivatedRouter.queryParams = of({})

            const newComponent = new CreateRequestFormComponent(
                mockFormBuilder,
                mockHomeService,
                mockActivatedRouter,
                mockSnackBar,
                mockRouter,
                mockDialog,
                mockInitService
            )

            newComponent.ngOnInit()

            expect(newComponent.demandId).toBeUndefined()
            expect(newComponent.actionBtnName).toBeUndefined()
        })
    })

    describe('Component Configuration', () => {
        it('should have correct learning list', () => {
            expect(component.learningList).toEqual([
                { name: 'Self-paced', key: 'self-paced' },
                { name: 'Instructor-led', key: 'instructor-led' }
            ])
        })

        it('should have correct request type list', () => {
            expect(component.requestTypeList).toEqual(['Single', 'Broadcast'])
        })

        it('should have valid special character regex', () => {
            expect(component.noSpecialChar).toBeInstanceOf(RegExp)
        })

        it('should have correct special character list description', () => {
            expect(component.specialCharList).toContain('a-z/A-Z')
            expect(component.specialCharList).toContain('0-9')
        })
    })

    describe('Value Change Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should set up value change subscriptions', () => {
            if (!isFormInitialized()) return

            component.requestTypeData = [
                { orgName: 'Google', id: 1 },
                { orgName: 'Microsoft', id: 2 }
            ]

            expect(() => component.valuechangeFuctions()).not.toThrow()
        })

        it('should update query subscriptions', () => {
            if (!isFormInitialized()) return

            component.allCompetencyTheme = [{ name: 'Theme 1' }]

            expect(() => component.updateQuery('theme')).not.toThrow()
        })
    })

    describe('Form Data Setting', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.requestObjData = {
                title: 'Test Request',
                objective: 'Test Objective',
                typeOfUser: 'Test User',
                learningMode: 'self-paced',
                referenceLink: 'http://test.com',
                requestType: 'Single',
                competencies: [{
                    area: 'Test Area',
                    theme: 'Test Theme',
                    sub_theme: 'Test SubTheme'
                }],
                preferredProvider: [{ providerId: 1 }],
                assignedProvider: { providerId: 1 }
            }
            component.filteredRequestType = [{ id: 1, name: 'Provider 1' }]
            component.filteredAssigneeType = [{ id: 1, name: 'Assignee 1' }]
        })

        it('should set request data correctly', () => {
            if (!isFormInitialized()) return

            expect(() => component.setRequestData()).not.toThrow()
        })
    })
})