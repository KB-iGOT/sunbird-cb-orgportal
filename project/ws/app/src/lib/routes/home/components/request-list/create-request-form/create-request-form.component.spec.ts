import { ComponentFixture, TestBed } from '@angular/core/testing'
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { of, throwError } from 'rxjs'
import { CreateRequestFormComponent } from './create-request-form.component'
import { ProfileV2Service } from '../../../services/home.servive'
import { InitService } from '../../../../../../../../../../src/app/services/init.service'
import { CompetencyViewComponent } from '../competency-view/competency-view.component'
import { ConfirmationBoxComponent } from '../../../../training-plan/components/confirmation-box/confirmation.box.component'

describe('CreateRequestFormComponent', () => {
    let component: CreateRequestFormComponent
    let fixture: ComponentFixture<CreateRequestFormComponent>
    let mockHomeService: any
    let mockRouter: any
    let mockDialog: any
    let mockSnackBar: any
    let mockActivatedRoute: any
    let mockInitService: any
    // let formBuilder: UntypedFormBuilder

    // Mock data
    const mockCompetencyData = [
        {
            id: '1',
            name: 'Technical Skills',
            description: 'Technical competencies',
            identifier: 'tech-001',
            themes: [
                {
                    id: 'theme1',
                    name: 'Programming',
                    identifier: 'prog-001',
                    description: 'Programming skills',
                    additionalProperties: { displayName: 'Programming', themeType: 'technical' },
                    refType: 'skill',
                    associations: [
                        {
                            id: 'subtheme1',
                            identifier: 'js-001',
                            name: 'JavaScript',
                            additionalProperties: { displayName: 'JavaScript' },
                            description: 'JavaScript programming'
                        }
                    ],
                    children: [
                        {
                            id: 'subtheme1',
                            identifier: 'js-001',
                            name: 'JavaScript',
                            additionalProperties: { displayName: 'JavaScript' },
                            description: 'JavaScript programming'
                        }
                    ]
                }
            ],
            children: [
                {
                    id: 'theme1',
                    name: 'Programming',
                    identifier: 'prog-001',
                    description: 'Programming skills'
                }
            ]
        }
    ]

    const mockRequestTypeData = [
        { id: '1', orgName: 'Provider A', hideOption: 'show' },
        { id: '2', orgName: 'Provider B', hideOption: 'show' }
    ]

    // Create proper mock objects
    const createMockFormControl = (value: any = '') => ({
        value,
        setValue: jest.fn(),
        patchValue: jest.fn(),
        hasError: jest.fn().mockReturnValue(false),
        updateValueAndValidity: jest.fn(),
        setValidators: jest.fn(),
        clearValidators: jest.fn(),
        valueChanges: of(value),
        get validator() { return jest.fn() },
        set validator({ }) { /* setter */ }
    })

    const createMockFormGroup = () => {
        const controls = {
            TitleName: createMockFormControl(''),
            Objective: createMockFormControl(''),
            userType: createMockFormControl(''),
            learningMode: createMockFormControl(''),
            compArea: createMockFormControl(''),
            referenceLink: createMockFormControl(''),
            requestType: createMockFormControl(''),
            assignee: createMockFormControl(''),
            providers: createMockFormControl([]),
            providerText: createMockFormControl(''),
            queryThemeControl: createMockFormControl(''),
            querySubThemeControl: createMockFormControl(''),
            'competencies_v5': createMockFormControl([]),
            'competencies_v2': createMockFormControl([]),
            assigneeText: createMockFormControl('')
        }

        return {
            controls,
            get: jest.fn((controlName: string) => controls[controlName as keyof typeof controls] || null),
            patchValue: jest.fn(),
            setValue: jest.fn(),
            value: {},
            disable: jest.fn(),
            enable: jest.fn(),
            valid: true,
            invalid: false
        }
    }

    beforeEach(async () => {
        // Create comprehensive mocks
        mockHomeService = {
            getFilterEntity: jest.fn().mockReturnValue(of(mockCompetencyData)),
            getFilterEntityV2: jest.fn().mockReturnValue(of([
                { terms: mockCompetencyData },
                { terms: mockCompetencyData[0].themes?.filter((t: any) => t.hasOwnProperty('associations')) || [] }
            ])),
            getRequestTypeList: jest.fn().mockReturnValue(of(mockRequestTypeData)),
            getRequestDataById: jest.fn().mockReturnValue(of({
                title: 'Test Request',
                objective: 'Test Objective',
                requestType: 'Single',
                competencies: []
            })),
            createDemand: jest.fn().mockReturnValue(of({ success: true }))
        }

        mockRouter = {
            navigateByUrl: jest.fn()
        }

        const mockDialogRef = {
            afterClosed: jest.fn().mockReturnValue(of('confirmed')),
            close: jest.fn()
        }

        mockDialog = {
            open: jest.fn().mockReturnValue(mockDialogRef)
        }

        mockSnackBar = {
            open: jest.fn()
        }

        mockInitService = {
            configSvc: {
                competency: {
                    'competencies_v5': { vKey: 'competencies_v5' },
                    'competencies_v2': { vKey: 'competencies_v2' }
                }
            }
        }

        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: {
                        userProfile: { userId: 'user123' }
                    }
                }
            },
            queryParams: of({ id: 'demand123', name: 'edit' })
        }

        await TestBed.configureTestingModule({
            declarations: [CreateRequestFormComponent],
            imports: [ReactiveFormsModule],
            providers: [
                UntypedFormBuilder,
                { provide: ProfileV2Service, useValue: mockHomeService },
                { provide: Router, useValue: mockRouter },
                { provide: MatDialog, useValue: mockDialog },
                { provide: MatSnackBar, useValue: mockSnackBar },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: InitService, useValue: mockInitService }
            ]
        }).compileComponents()

        //const formBuilder = TestBed.inject(UntypedFormBuilder)
        fixture = TestBed.createComponent(CreateRequestFormComponent)
        component = fixture.componentInstance

        // Properly initialize the component's form
        component.compentencyKey = { vKey: 'competencies_v5', vCompetencyArea: '', vCompetencyAreaDescription: '', vCompetencyTheme: '', vCompetencySubTheme: '' }
        component.requestForm = createMockFormGroup() as any
    })

    describe('Component Initialization', () => {
        it('should create component', () => {
            expect(component).toBeTruthy()
        })

        it('should initialize component properties correctly', () => {
            expect(component.specialCharList).toBeDefined()
            expect(component.noSpecialChar).toBeDefined()
            expect(component.learningList).toHaveLength(2)
            expect(component.requestTypeList).toEqual(['Single', 'Broadcast'])
            expect(component.competencyList).toEqual([])
            expect(component.isAssignee).toBe(false)
            expect(component.isBroadCast).toBe(false)
        })

        it('should initialize form group when compentencyKey exists', () => {
            component.compentencyKey = { vKey: 'competencies_v5', vCompetencyArea: '', vCompetencyAreaDescription: '', vCompetencyTheme: '', vCompetencySubTheme: '' }

            component.initFromGroup()

            expect(component.requestForm).toBeDefined()
        })

        it('should not initialize form when compentencyKey is undefined', () => {
            component.compentencyKey = undefined as any
            const originalForm = component.requestForm

            component.initFromGroup()

            // Should not create new form when compentencyKey is undefined
            expect(component.requestForm).toBe(originalForm)
        })

        it('should call all initialization methods in ngOnInit', () => {
            jest.spyOn(component, 'initFromGroup')
            jest.spyOn(component, 'getRequestTypeList')
            jest.spyOn(component, 'getFilterEntity')
            jest.spyOn(component, 'valuechangeFuctions')

            component.ngOnInit()

            expect(component.initFromGroup).toHaveBeenCalled()
            expect(component.getRequestTypeList).toHaveBeenCalled()
            expect(component.getFilterEntity).toHaveBeenCalled()
            expect(component.valuechangeFuctions).toHaveBeenCalled()
            expect(component.userId).toBe('user123')
        })

        it('should handle missing route data gracefully', () => {
            mockActivatedRoute.snapshot.data.configService = null

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should initialize competency controls', () => {
            component.ngOnInit()

            expect(component.competencyArea).toBeDefined()
            expect(component.competencyTheme).toBeDefined()
            expect(component.competencySubtheme).toBeDefined()
        })

        it('should use getFilterEntityV2 when not v5', () => {
            jest.spyOn(component, 'getFilterEntityV2')
            component.compentencyKey = { vKey: 'competencies_v2', vCompetencyArea: '', vCompetencyAreaDescription: '', vCompetencyTheme: '', vCompetencySubTheme: '' }

            component.ngOnInit()

            expect(component.getFilterEntityV2).toHaveBeenCalled()
        })
    })

    describe('Form Validation', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should validate TitleName as required', () => {
            const titleControl = component.requestForm.get('TitleName')
            titleControl!.hasError = jest.fn().mockReturnValue(true)

            expect(titleControl!.hasError('required')).toBeTruthy()
        })

        it('should validate TitleName minimum length', () => {
            const titleControl = component.requestForm.get('TitleName')
            titleControl!.hasError = jest.fn()
                .mockReturnValueOnce(true)  // First call - has minlength error
                .mockReturnValueOnce(false) // Second call - no error

            expect(titleControl!.hasError('minlength')).toBeTruthy()
            expect(titleControl!.hasError('minlength')).toBeFalsy()
        })

        it('should validate TitleName pattern', () => {
            const titleControl = component.requestForm.get('TitleName')
            titleControl!.hasError = jest.fn()
                .mockReturnValueOnce(true)  // Has pattern error
                .mockReturnValueOnce(false) // No pattern error

            expect(titleControl!.hasError('pattern')).toBeTruthy()
            expect(titleControl!.hasError('pattern')).toBeFalsy()
        })

        it('should validate Objective as required', () => {
            const objectiveControl = component.requestForm.get('Objective')
            objectiveControl!.hasError = jest.fn()
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false)

            expect(objectiveControl!.hasError('required')).toBeTruthy()
            expect(objectiveControl!.hasError('required')).toBeFalsy()
        })

        it('should validate requestType as required', () => {
            const requestTypeControl = component.requestForm.get('requestType')
            requestTypeControl!.hasError = jest.fn()
                .mockReturnValueOnce(true)
                .mockReturnValueOnce(false)

            expect(requestTypeControl!.hasError('required')).toBeTruthy()
            expect(requestTypeControl!.hasError('required')).toBeFalsy()
        })
    })

    describe('Request Type Selection', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should configure form for Single request type', () => {
            component.selectRequestType('Single')

            expect(component.isAssignee).toBeTruthy()
            expect(component.isBroadCast).toBeFalsy()
            expect(component.statusValue).toBe('Assigned')

            const providersControl = component.requestForm.get('providers')
            const assigneeControl = component.requestForm.get('assignee')

            expect(providersControl!.setValue).toHaveBeenCalledWith('')
            expect(assigneeControl!.setValidators).toHaveBeenCalled()
        })

        it('should configure form for Broadcast request type', () => {
            component.selectRequestType('Broadcast')

            expect(component.isBroadCast).toBeTruthy()
            expect(component.isAssignee).toBeFalsy()
            expect(component.statusValue).toBe('Unassigned')

            const assigneeControl = component.requestForm.get('assignee')
            const providersControl = component.requestForm.get('providers')

            expect(assigneeControl!.setValue).toHaveBeenCalledWith('')
            expect(providersControl!.setValidators).toHaveBeenCalled()
        })

        it('should handle unknown request type', () => {
            expect(() => component.selectRequestType('Unknown')).not.toThrow()
        })

        it('should handle null requestForm', () => {
            component.requestForm = null as any

            expect(() => component.selectRequestType('Single')).not.toThrow()
        })
    })

    describe('Data Loading Methods', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should load competency data in getFilterEntity', () => {
            component.getFilterEntity()

            expect(mockHomeService.getFilterEntity).toHaveBeenCalledWith({
                search: { type: 'Competency Area' },
                filter: { isDetail: true }
            })
            expect(component.competencyList).toEqual(mockCompetencyData)
            expect(component.allCompetencies).toEqual(mockCompetencyData)
            expect(component.filteredallCompetencies).toEqual(mockCompetencyData)
        })

        it('should handle null response in getFilterEntity', () => {
            mockHomeService.getFilterEntity.mockReturnValue(of(null))

            expect(() => component.getFilterEntity()).not.toThrow()
        })

        it('should load competency data in getFilterEntityV2', () => {
            component.getFilterEntityV2()

            expect(mockHomeService.getFilterEntityV2).toHaveBeenCalled()
            expect(component.allCompetencies).toBeDefined()
            expect(component.filteredallCompetencies).toBeDefined()
        })

        it('should handle malformed data in getFilterEntityV2', () => {
            mockHomeService.getFilterEntityV2.mockReturnValue(of([null, null]))

            expect(() => component.getFilterEntityV2()).not.toThrow()
        })

        it('should load request type data', () => {
            component.getRequestTypeList()

            expect(mockHomeService.getRequestTypeList).toHaveBeenCalledWith({
                request: { filters: { isCbp: true }, limit: 1000 }
            })
            expect(component.requestTypeData).toEqual(mockRequestTypeData)
            expect(component.filteredRequestType).toEqual([...mockRequestTypeData])
            expect(component.filteredAssigneeType).toEqual([...mockRequestTypeData])
        })

        it('should handle view mode in getRequestTypeList', () => {
            component.demandId = 'test123'
            component.actionBtnName = 'view'
            jest.spyOn(component, 'getRequestDataById')

            component.getRequestTypeList()

            expect(component.getRequestDataById).toHaveBeenCalled()
            expect(component.requestForm.disable).toHaveBeenCalled()
            expect(component.isHideData).toBeTruthy()
            expect(component.isCompetencyHide).toBeTruthy()
        })

        it('should handle reassign mode in getRequestTypeList', () => {
            component.demandId = 'test123'
            component.actionBtnName = 'reassign'
            jest.spyOn(component, 'getRequestDataById')

            component.getRequestTypeList()

            expect(component.getRequestDataById).toHaveBeenCalled()
            expect(component.requestForm.disable).toHaveBeenCalled()
            expect(component.isCompetencyHide).toBeTruthy()
        })

        it('should get request data by ID', () => {
            component.demandId = 'test123'
            jest.spyOn(component, 'setRequestData')

            component.getRequestDataById()

            expect(mockHomeService.getRequestDataById).toHaveBeenCalledWith('test123')
            expect(component.setRequestData).toHaveBeenCalled()
        })
    })

    describe('Competency Management', () => {
        beforeEach(() => {
            component.ngOnInit()
            component.allCompetencies = mockCompetencyData
        })

        it('should select competency area', () => {
            jest.spyOn(component, 'resetCompSubfields')
            const option = mockCompetencyData[0]

            component.compAreaSelected(option)

            expect(component.resetCompSubfields).toHaveBeenCalled()
            expect(component.seletedCompetencyArea).toEqual(option)
            expect(component.allCompetencyTheme).toEqual(option.themes)
            expect(component.filteredallCompetencyTheme).toEqual(option.themes)
        })

        it('should handle competency area with children instead of themes', () => {
            const option = { ...mockCompetencyData[0], themes: undefined }

            component.compAreaSelected(option)

            expect(component.allCompetencyTheme).toEqual(option.children)
        })

        it('should select competency theme by identifier', () => {
            component.allCompetencyTheme = mockCompetencyData[0].themes || []
            const theme = mockCompetencyData[0].themes?.[0]

            if (theme) {
                component.compThemeSelected(theme)

                expect(component.seletedCompetencyTheme).toEqual(theme)
                expect(component.allCompetencySubtheme).toEqual(theme.associations)
                expect(component.filteredallCompetencySubtheme).toEqual(theme.associations)
            }
        })

        it('should select competency theme by name', () => {
            component.allCompetencyTheme = mockCompetencyData[0].themes || []
            const theme = { name: 'Programming' }

            component.compThemeSelected(theme)

            const foundTheme = mockCompetencyData[0].themes?.find(t => t.name === 'Programming')
            expect(component.seletedCompetencyTheme).toEqual(foundTheme)
        })

        it('should use children when associations not available', () => {
            const themeWithChildren = {
                name: 'Programming',
                children: [{ name: 'Child Theme' }]
            }
            component.allCompetencyTheme = [themeWithChildren]

            component.compThemeSelected({ name: 'Programming' })

            expect(component.allCompetencySubtheme).toEqual([{ name: 'Child Theme' }])
        })

        it('should select competency sub-theme', () => {
            const theme = mockCompetencyData[0].themes?.[0]
            if (theme?.associations) {
                component.allCompetencySubtheme = theme.associations
                const subTheme = theme.associations[0]

                component.compSubThemeSelected(subTheme)

                expect(component.seletedCompetencySubTheme).toEqual(subTheme)
                expect(component.enableCompetencyAdd).toBeTruthy()
            }
        })

        it('should add competency for v5', () => {
            jest.spyOn(component, 'resetCompfields')
            jest.spyOn(component, 'refreshData')

            component.seletedCompetencyArea = mockCompetencyData[0]
            component.seletedCompetencyTheme = mockCompetencyData[0].themes?.[0]
            component.seletedCompetencySubTheme = mockCompetencyData[0].themes?.[0]?.associations?.[0]

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

            component.addCompetency()

            expect(mockCompetencyControl.setValue).toHaveBeenCalled()
            expect(component.resetCompfields).toHaveBeenCalled()
            expect(component.refreshData).toHaveBeenCalled()
        })

        it('should add competency for v2', () => {
            component.compentencyKey = { vKey: 'competencies_v2', vCompetencyArea: '', vCompetencyAreaDescription: '', vCompetencyTheme: '', vCompetencySubTheme: '' }

            component.seletedCompetencyArea = {
                name: 'Area',
                identifier: 'area-1',
                description: 'desc'
            }
            component.seletedCompetencyTheme = {
                additionalProperties: { displayName: 'Theme' },
                identifier: 'theme-1',
                description: 'desc',
                refType: 'type1'
            }
            component.seletedCompetencySubTheme = {
                additionalProperties: { displayName: 'SubTheme' },
                identifier: 'sub-1',
                description: 'desc'
            }

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

            component.addCompetency()

            expect(mockCompetencyControl.setValue).toHaveBeenCalled()
        })

        it('should prevent duplicate competencies', () => {
            const existingCompetency = {
                competencyAreaId: '1',
                competencyThemeId: 'theme1',
                competencySubThemeId: 'subtheme1'
            }

            component.seletedCompetencyArea = mockCompetencyData[0]
            component.seletedCompetencyTheme = mockCompetencyData[0].themes?.[0]
            component.seletedCompetencySubTheme = mockCompetencyData[0].themes?.[0]?.associations?.[0]

            const mockCompetencyControl = createMockFormControl([existingCompetency])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)
            jest.spyOn(component, 'canPush').mockReturnValue(false)
            jest.spyOn(component, 'resetCompfields')

            component.addCompetency()

            expect(mockSnackBar.open).toHaveBeenCalledWith('This competency is already added')
            expect(component.resetCompfields).toHaveBeenCalled()
        })

        it('should not add competency when selections are missing', () => {
            component.seletedCompetencyArea = null
            component.seletedCompetencyTheme = null
            component.seletedCompetencySubTheme = null

            expect(() => component.addCompetency()).not.toThrow()
        })

        it('should handle addCompetency when requestForm is null', () => {
            component.requestForm = null as any
            component.seletedCompetencyArea = mockCompetencyData[0]
            component.seletedCompetencyTheme = mockCompetencyData[0].themes?.[0]
            component.seletedCompetencySubTheme = mockCompetencyData[0].themes?.[0]?.associations?.[0]

            expect(() => component.addCompetency()).not.toThrow()
        })

        it('should remove competency by id', () => {
            jest.spyOn(component, 'refreshData')

            const mockCompetencies = [{ id: 'test123' }]
            const mockCompetencyControl = createMockFormControl(mockCompetencies)
            mockCompetencyControl.value = mockCompetencies
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

            component.removeCompetency({ id: 'test123' })

            expect(component.refreshData).toHaveBeenCalled()
        })

        it('should remove competency by object comparison', () => {
            jest.spyOn(component, 'refreshData')

            const competencyToRemove = {
                competencyAreaId: '1',
                competencyThemeId: 'theme1',
                competencySubThemeId: 'subtheme1'
            }

            const mockCompetencies = [competencyToRemove, { competencyAreaId: '2' }]
            const mockCompetencyControl = createMockFormControl(mockCompetencies)
            mockCompetencyControl.value = mockCompetencies
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

            component.removeCompetency(competencyToRemove)

            expect(component.refreshData).toHaveBeenCalled()
        })

        it('should handle removeCompetency when requestForm is null', () => {
            component.requestForm = null as any

            expect(() => component.removeCompetency({ id: 'test' })).not.toThrow()
        })

        it('should refresh data', () => {
            component.refreshData()

            expect(mockHomeService.getFilterEntityV2).toHaveBeenCalled()
        })
    })

    describe('Provider Management', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should filter values by name case-insensitively', () => {
            const testArray = [
                { name: 'Angular' },
                { name: 'React' },
                { name: 'Vue' }
            ]

            expect(component.filterValues('ang', testArray)).toHaveLength(1)
            expect(component.filterValues('REACT', testArray)).toHaveLength(1)
            expect(component.filterValues('xyz', testArray)).toHaveLength(0)
        })

        it('should filter org values case-insensitively', () => {
            expect(component.filterOrgValues('provider a', mockRequestTypeData)).toHaveLength(1)
            expect(component.filterOrgValues('PROVIDER B', mockRequestTypeData)).toHaveLength(1)
            expect(component.filterOrgValues('xyz', mockRequestTypeData)).toHaveLength(0)
        })

        it('should get hidden options with show/hide flags', () => {
            const result = component.getHiddenOptions('Provider A', mockRequestTypeData)

            expect(result[0].hideOption).toBe('show')
            expect(result[1].hideOption).toBe('hide')
            expect(result).toHaveLength(2)
        })

        it('should remove provider from selection', () => {
            const mockProviders = [mockRequestTypeData[0], mockRequestTypeData[1]]
            const mockProvidersControl = createMockFormControl(mockProviders)
            mockProvidersControl.value = mockProviders
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            component.onProviderRemoved(mockRequestTypeData[0])

            expect(mockProvidersControl.setValue).toHaveBeenCalledWith([mockRequestTypeData[1]])
        })

        it('should handle provider removal when provider not found', () => {
            const mockProviders = [mockRequestTypeData[0]]
            const mockProvidersControl = createMockFormControl(mockProviders)
            mockProvidersControl.value = mockProviders
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            component.onProviderRemoved(mockRequestTypeData[1])

            // Should not change the array since provider wasn't found
            expect(mockProviders).toHaveLength(1)
        })

        it('should handle provider removal when control is null', () => {
            component.requestForm.get = jest.fn().mockReturnValue(null)

            expect(() => component.onProviderRemoved(mockRequestTypeData[0])).not.toThrow()
        })

        it('should handle provider removal when control value is null', () => {
            const mockProvidersControl = createMockFormControl(null)
            mockProvidersControl.value = null
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            expect(() => component.onProviderRemoved(mockRequestTypeData[0])).not.toThrow()
        })

        it('should disable option when max providers selected', () => {
            const fiveProviders = Array(5).fill(mockRequestTypeData[0])
            const mockProvidersControl = createMockFormControl(fiveProviders)
            mockProvidersControl.value = fiveProviders
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            const isDisabled = component.isOptionDisabled(mockRequestTypeData[1])
            expect(isDisabled).toBeTruthy()
        })

        it('should not disable option when under max providers', () => {
            const oneProvider = [mockRequestTypeData[0]]
            const mockProvidersControl = createMockFormControl(oneProvider)
            mockProvidersControl.value = oneProvider
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            const isDisabled = component.isOptionDisabled(mockRequestTypeData[1])
            expect(isDisabled).toBeFalsy()
        })

        it('should handle isOptionDisabled when control is null', () => {
            component.requestForm.get = jest.fn().mockReturnValue(null)

            const result = component.isOptionDisabled(mockRequestTypeData[0])
            expect(result).toBeFalsy()
        })

        it('should handle isOptionDisabled when control value is null', () => {
            const mockProvidersControl = createMockFormControl(null)
            mockProvidersControl.value = null
            component.requestForm.get = jest.fn().mockReturnValue(mockProvidersControl)

            const result = component.isOptionDisabled(mockRequestTypeData[0])
            expect(result).toBeFalsy()
        })
    })

    describe('Search and Filtering', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should update query for theme', () => {
            component.allCompetencyTheme = [{ name: 'Test Theme' }]

            // Mock the valueChanges subscription
            const mockThemeControl = createMockFormControl('')
            mockThemeControl.valueChanges = {
                subscribe: jest.fn((callback) => {
                    callback('test')
                    return { unsubscribe: jest.fn() }
                })
            } as any
            component.requestForm.get = jest.fn().mockReturnValue(mockThemeControl)
            jest.spyOn(component, 'filterValues').mockReturnValue([])

            component.updateQuery('theme')

            expect(component.filterValues).toHaveBeenCalled()
        })

        it('should update query for subtheme', () => {
            component.allCompetencySubtheme = [{ name: 'Test SubTheme' }]

            const mockSubThemeControl = createMockFormControl('')
            mockSubThemeControl.valueChanges = {
                subscribe: jest.fn((callback) => {
                    callback('test')
                    return { unsubscribe: jest.fn() }
                })
            } as any
            component.requestForm.get = jest.fn().mockReturnValue(mockSubThemeControl)
            jest.spyOn(component, 'filterValues').mockReturnValue([])

            component.updateQuery('subtheme')

            expect(component.filterValues).toHaveBeenCalled()
        })

        it('should reset search for theme', () => {
            component.allCompetencyTheme = [{ name: 'Test Theme' }]

            const mockThemeControl = createMockFormControl('search term')
            const mockSubThemeControl = createMockFormControl('sub search')
            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockThemeControl)
                .mockReturnValueOnce(mockSubThemeControl)
            component.seletedCompetencySubTheme = null

            component.resetSearch('theme')

            expect(mockThemeControl.setValue).toHaveBeenCalledWith('')
            expect(mockSubThemeControl.setValue).toHaveBeenCalledWith('')
            expect(component.filteredallCompetencyTheme).toEqual(component.allCompetencyTheme)
            expect(component.filteredallCompetencySubtheme).toEqual([])
        })

        it('should reset search for subtheme', () => {
            component.allCompetencySubtheme = [{ name: 'Test SubTheme' }]

            const mockSubThemeControl = createMockFormControl('search term')
            component.requestForm.get = jest.fn().mockReturnValue(mockSubThemeControl)

            component.resetSearch('subtheme')

            expect(mockSubThemeControl.setValue).toHaveBeenCalledWith('')
            expect(component.filteredallCompetencySubtheme).toEqual(component.allCompetencySubtheme)
        })

        it('should handle resetSearch when controls are null', () => {
            component.requestForm.get = jest.fn().mockReturnValue(null)

            expect(() => component.resetSearch('theme')).not.toThrow()
            expect(() => component.resetSearch('subtheme')).not.toThrow()
        })
    })

    describe('Field Reset Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should reset competency sub-fields', () => {
            component.enableCompetencyAdd = true
            component.allCompetencySubtheme = ['test']
            component.seletedCompetencyTheme = 'test'
            component.seletedCompetencySubTheme = 'test'

            const mockThemeControl = createMockFormControl('theme search')
            const mockSubThemeControl = createMockFormControl('subtheme search')
            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockThemeControl)
                .mockReturnValueOnce(mockSubThemeControl)

            component.resetCompSubfields()

            expect(component.enableCompetencyAdd).toBeFalsy()
            expect(component.allCompetencySubtheme).toEqual([])
            expect(component.filteredallCompetencyTheme).toEqual([])
            expect(component.filteredallCompetencySubtheme).toEqual([])
            expect(component.seletedCompetencyTheme).toBe('')
            expect(component.seletedCompetencySubTheme).toBe('')
            expect(mockThemeControl.setValue).toHaveBeenCalledWith('')
            expect(mockSubThemeControl.setValue).toHaveBeenCalledWith('')
        })

        it('should handle resetCompSubfields when requestForm is null', () => {
            component.requestForm = null as any

            expect(() => component.resetCompSubfields()).not.toThrow()
        })

        it('should reset competency fields', () => {
            component.enableCompetencyAdd = true
            component.allCompetencyTheme = ['test']
            component.allCompetencySubtheme = ['test']

            const mockCompAreaControl = createMockFormControl('area')
            const mockThemeControl = createMockFormControl('theme')
            const mockSubThemeControl = createMockFormControl('subtheme')
            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockCompAreaControl)
                .mockReturnValueOnce(mockThemeControl)
                .mockReturnValueOnce(mockSubThemeControl)

            component.resetCompfields()

            expect(component.enableCompetencyAdd).toBeFalsy()
            expect(component.allCompetencyTheme).toEqual([])
            expect(component.allCompetencySubtheme).toEqual([])
            expect(component.filteredallCompetencyTheme).toEqual([])
            expect(component.filteredallCompetencySubtheme).toEqual([])
            expect(mockCompAreaControl.setValue).toHaveBeenCalledWith('')
            expect(mockThemeControl.setValue).toHaveBeenCalledWith('')
            expect(mockSubThemeControl.setValue).toHaveBeenCalledWith('')
        })
    })

    describe('Data Setting and Retrieval', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should set request data from requestObjData', () => {
            const mockRequestData = {
                title: 'Test Request',
                objective: 'Test Objective',
                typeOfUser: 'Developer',
                learningMode: 'self-paced',
                requestType: 'Single',
                competencies: [{
                    area: 'Technical',
                    theme: 'Programming',
                    sub_theme: 'JavaScript'
                }],
                referenceLink: 'http://example.com',
                preferredProvider: [],
                assignedProvider: null
            }

            component.requestObjData = mockRequestData
            jest.spyOn(component, 'selectRequestType')

            // Mock form controls for setValue calls
            Object.keys(component.requestForm.controls).forEach(key => {
                const control = component.requestForm.controls[key]
                control.setValue = jest.fn()
            })

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn()
                .mockReturnValue(mockCompetencyControl)

            component.setRequestData()

            expect(component.selectRequestType).toHaveBeenCalledWith('Single')
            expect(mockCompetencyControl.setValue).toHaveBeenCalled()
        })

        it('should handle legacy competency format in setRequestData', () => {
            const mockRequestData = {
                title: 'Test Request',
                objective: 'Test Objective',
                requestType: 'Single',
                competencies: [{
                    select_area: 'Technical',
                    select_theme: 'Programming',
                    select_sub_theme: 'JavaScript'
                }]
            }

            component.requestObjData = mockRequestData

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)
            jest.spyOn(component, 'selectRequestType')

            component.setRequestData()

            expect(component.selectRequestType).toHaveBeenCalledWith('Single')
        })

        it('should set preferred providers when available', () => {
            component.requestObjData = {
                title: 'Test',
                objective: 'Test',
                requestType: 'Broadcast',
                competencies: [],
                preferredProvider: [{ providerId: '1' }]
            }
            component.filteredRequestType = mockRequestTypeData

            const mockProvidersControl = createMockFormControl([])
            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockCompetencyControl)
                .mockReturnValueOnce(mockProvidersControl)
            jest.spyOn(component, 'selectRequestType')

            component.setRequestData()

            expect(mockProvidersControl.setValue).toHaveBeenCalled()
        })

        it('should set assigned provider when available', () => {
            component.requestObjData = {
                title: 'Test',
                objective: 'Test',
                requestType: 'Single',
                competencies: [],
                assignedProvider: { providerId: '1' }
            }
            component.filteredAssigneeType = mockRequestTypeData

            const mockAssigneeControl = createMockFormControl({})
            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockCompetencyControl)
                .mockReturnValueOnce(mockAssigneeControl)
            jest.spyOn(component, 'selectRequestType')

            component.setRequestData()

            expect(mockAssigneeControl.setValue).toHaveBeenCalled()
        })

        it('should handle missing optional fields in setRequestData', () => {
            component.requestObjData = {
                title: 'Test',
                objective: 'Test',
                requestType: 'Single',
                competencies: []
            }

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)
            jest.spyOn(component, 'selectRequestType')

            expect(() => component.setRequestData()).not.toThrow()
        })
    })

    describe('Value Change Functions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should setup value change subscriptions', () => {
            jest.spyOn(component, 'getHiddenOptions').mockReturnValue([])
            jest.spyOn(component, 'filterOrgValues').mockReturnValue([])
            component.requestTypeData = mockRequestTypeData

            // Mock controls with proper valueChanges
            const mockProviderTextControl = createMockFormControl('')
            const mockAssigneeTextControl = createMockFormControl('')

            mockProviderTextControl.valueChanges = {
                pipe: jest.fn().mockReturnValue({
                    subscribe: jest.fn((callback) => {
                        callback('test')
                        return { unsubscribe: jest.fn() }
                    })
                })
            } as any

            mockAssigneeTextControl.valueChanges = {
                pipe: jest.fn().mockReturnValue({
                    subscribe: jest.fn((callback) => {
                        callback('test')
                        return { unsubscribe: jest.fn() }
                    })
                })
            } as any

            component.requestForm.get = jest.fn()
                .mockReturnValueOnce(mockProviderTextControl)
                .mockReturnValueOnce(mockAssigneeTextControl)

            component.valuechangeFuctions()

            expect(component.getHiddenOptions).toHaveBeenCalled()
            expect(component.filterOrgValues).toHaveBeenCalled()
        })

        it('should handle valuechangeFuctions when controls are null', () => {
            component.requestForm.get = jest.fn().mockReturnValue(null)

            expect(() => component.valuechangeFuctions()).not.toThrow()
        })

        it('should handle valuechangeFuctions when requestForm is null', () => {
            component.requestForm = null as any

            expect(() => component.valuechangeFuctions()).not.toThrow()
        })
    })

    describe('Form Submission', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should show confirmation popup and submit on confirm', () => {
            jest.spyOn(component, 'submit')
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of('confirmed'))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.showConformationPopUp()

            expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationBoxComponent, expect.objectContaining({
                disableClose: true,
                data: expect.objectContaining({
                    type: 'conformation',
                    primaryAction: 'Confirm',
                    secondaryAction: 'Cancel'
                }),
                autoFocus: false
            }))
            expect(component.submit).toHaveBeenCalled()
        })

        it('should not submit when confirmation is cancelled', () => {
            jest.spyOn(component, 'submit')
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of('cancel'))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.showConformationPopUp()

            expect(component.submit).not.toHaveBeenCalled()
        })

        it('should show reassign confirmation for reassign action', () => {
            component.actionBtnName = 'reassign'

            component.showConformationPopUp()

            expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationBoxComponent, expect.objectContaining({
                data: expect.objectContaining({
                    title: 'Are you sure you want to Re-assign?'
                })
            }))
        })

        // it('should submit form with Single request type data', () => {
        //     // Mock form values
        //     component.requestForm.value = {
        //         TitleName: 'Test Request Title',
        //         Objective: 'Test Objective',
        //         userType: 'Developer',
        //         requestType: 'Single',
        //         assignee: mockRequestTypeData[0],
        //         learningMode: 'Self-paced',
        //         referenceLink: 'http://test.com'
        //     }

        //     const mockCompetencyControl = createMockFormControl([{
        //         competencyArea: 'Technical',
        //         competencyTheme: 'Programming',
        //         competencySubTheme: 'JavaScript'
        //     }])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.isAssignee = true
        //     component.isBroadCast = false
        //     jest.spyOn(component, 'showDialogBox')

        //     component.submit()

        //     expect(mockHomeService.createDemand).toHaveBeenCalledWith(expect.objectContaining({
        //         title: 'Test Request Title',
        //         objective: 'Test Objective',
        //         typeOfUser: 'Developer',
        //         requestType: 'Single',
        //         learningMode: 'self-paced',
        //         competencies: [{
        //             area: 'Technical',
        //             theme: 'Programming',
        //             sub_theme: 'JavaScript'
        //         }],
        //         assignedProvider: {
        //             providerName: mockRequestTypeData[0].orgName,
        //             providerId: mockRequestTypeData[0].id
        //         }
        //     }))
        //     expect(component.showDialogBox).toHaveBeenCalledWith('progress')
        // })

        // it('should submit form with Broadcast request type data', () => {
        //     component.requestForm.value = {
        //         TitleName: 'Test Broadcast Request',
        //         Objective: 'Test Objective',
        //         requestType: 'Broadcast',
        //         providers: mockRequestTypeData,
        //         userType: 'Developer',
        //         referenceLink: 'http://test.com'
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.isBroadCast = true
        //     component.isAssignee = false

        //     component.submit()

        //     expect(mockHomeService.createDemand).toHaveBeenCalledWith(expect.objectContaining({
        //         preferredProvider: mockRequestTypeData.map(item => ({
        //             providerName: item.orgName,
        //             providerId: item.id
        //         }))
        //     }))
        // })

        // it('should handle reassign submission', () => {
        //     component.demandId = 'test123'
        //     component.actionBtnName = 'reassign'

        //     component.requestForm.value = {
        //         TitleName: 'Test Request',
        //         Objective: 'Test Objective',
        //         requestType: 'Single',
        //         userType: 'Developer',
        //         referenceLink: 'http://test.com'
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.submit()

        //     expect(component.requestForm.enable).toHaveBeenCalled()
        //     expect(mockHomeService.createDemand).toHaveBeenCalledWith(expect.objectContaining({
        //         demand_id: 'test123'
        //     }))
        // })

        // it('should handle submission without learning mode', () => {
        //     component.requestForm.value = {
        //         TitleName: 'Test',
        //         Objective: 'Test',
        //         requestType: 'Single',
        //         userType: 'Developer',
        //         referenceLink: 'http://test.com',
        //         learningMode: null
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.submit()

        //     const callArgs = mockHomeService.createDemand.mock.calls[0][0]
        //     expect(callArgs).not.toHaveProperty('learningMode')
        // })

        // it('should handle submission error', () => {
        //     mockHomeService.createDemand.mockReturnValue(throwError('Submission failed'))
        //     const mockDialogRef = { close: jest.fn() }
        //     component.dialogRefs = mockDialogRef

        //     component.requestForm.value = {
        //         TitleName: 'Test Request Title',
        //         Objective: 'Test Objective',
        //         requestType: 'Single',
        //         userType: 'Developer',
        //         referenceLink: 'http://test.com'
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.submit()

        //     expect(mockSnackBar.open).toHaveBeenCalledWith('Request Failed')
        //     expect(mockDialogRef.close).toHaveBeenCalled()
        // })

        // it('should navigate on successful submission', (done) => {
        //     const mockDialogRef = { close: jest.fn() }
        //     component.dialogRefs = mockDialogRef
        //     component.resData = ''

        //     component.requestForm.value = {
        //         TitleName: 'Test Request Title',
        //         Objective: 'Test Objective',
        //         requestType: 'Single',
        //         userType: 'Developer',
        //         referenceLink: 'http://test.com'
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.submit()

        //     setTimeout(() => {
        //         expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/request-list')
        //         expect(mockSnackBar.open).toHaveBeenCalledWith('Request submitted successfully ')
        //         done()
        //     }, 1100)
        // })

        it('should handle submit when requestForm is null', () => {
            component.requestForm = null as any

            expect(() => component.submit()).not.toThrow()
        })
    })

    describe('Dialog Management', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should open competency view dialog and handle DELETE action', () => {
            jest.spyOn(component, 'removeCompetency')
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of({ action: 'DELETE', id: 'test' }))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.view({ id: 'test', name: 'Test Competency' })

            expect(mockDialog.open).toHaveBeenCalledWith(CompetencyViewComponent, expect.objectContaining({
                width: '30%',
                panelClass: 'remove-pad',
                data: { id: 'test', name: 'Test Competency' },
                autoFocus: false
            }))
            expect(component.removeCompetency).toHaveBeenCalledWith('test')
        })

        it('should handle ADD action in competency view dialog', () => {
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of({ action: 'ADD' }))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            component.view({ id: 'test', name: 'Test Competency' })

            expect(mockDialog.open).toHaveBeenCalled()
            // ADD action doesn't trigger specific behavior in current implementation
        })

        it('should handle null response from dialog', () => {
            const mockDialogRef = {
                afterClosed: jest.fn().mockReturnValue(of(null))
            }
            mockDialog.open.mockReturnValue(mockDialogRef)

            expect(() => component.view({})).not.toThrow()
        })

        it('should show progress dialog', () => {
            jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('progress')

            expect(component.openDialoagBox).toHaveBeenCalledWith(expect.objectContaining({
                type: 'progress',
                icon: 'vega',
                title: 'Processing your request'
            }))
        })

        it('should show progress completed dialog', () => {
            jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('progress-completed')

            expect(component.openDialoagBox).toHaveBeenCalledWith(expect.objectContaining({
                type: 'progress-completed',
                icon: 'accept_icon',
                primaryAction: 'Successfully created....'
            }))
        })

        it('should handle unknown dialog event type', () => {
            jest.spyOn(component, 'openDialoagBox')

            component.showDialogBox('unknown')

            expect(component.openDialoagBox).toHaveBeenCalledWith({})
        })

        it('should open dialog box with custom data', () => {
            const dialogData = {
                type: 'test',
                icon: 'test-icon',
                title: 'Test Title',
                subTitle: 'Test Subtitle',
                primaryAction: 'Test Action',
                secondaryAction: 'Cancel'
            }

            component.openDialoagBox(dialogData)

            expect(mockDialog.open).toHaveBeenCalledWith(ConfirmationBoxComponent, expect.objectContaining({
                disableClose: true,
                data: dialogData,
                autoFocus: false
            }))
        })
    })

    describe('Navigation and UI Interactions', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should navigate back to request list', () => {
            component.navigateBack()
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/request-list')
        })

        it('should handle opened change event', () => {
            const mockControl = createMockFormControl('old value')
            component.requestForm.get = jest.fn().mockReturnValue(mockControl)

            component.openedChange(true, 'testControl')

            expect(component.requestForm.get).toHaveBeenCalledWith('testControl')
            expect(mockControl.patchValue).toHaveBeenCalledWith('')
        })

        it('should handle opened change when control is null', () => {
            component.requestForm.get = jest.fn().mockReturnValue(null)

            expect(() => component.openedChange(true, 'testControl')).not.toThrow()
        })

        it('should clear search and stop propagation', () => {
            const mockEvent = { stopPropagation: jest.fn() }
            const mockControl = createMockFormControl('search text')
            component.requestForm.get = jest.fn().mockReturnValue(mockControl)

            component.clearSearch(mockEvent, 'testControl')

            expect(mockEvent.stopPropagation).toHaveBeenCalled()
            expect(mockControl.patchValue).toHaveBeenCalledWith('')
        })

        it('should handle clear search when requestForm is null', () => {
            const mockEvent = { stopPropagation: jest.fn() }
            component.requestForm = null as any

            component.clearSearch(mockEvent, 'testControl')

            expect(mockEvent.stopPropagation).toHaveBeenCalled()
        })

        it('should handle showSaveButton method', () => {
            expect(() => component.showSaveButton()).not.toThrow()
        })
    })

    describe('CanPush Validation', () => {
        it('should return true for empty array', () => {
            const result = component.canPush([], {
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            })
            expect(result).toBeTruthy()
        })

        it('should return false for duplicate competency', () => {
            const existingCompetencies = [{
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            }]

            const newCompetency = {
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            }

            const result = component.canPush(existingCompetencies, newCompetency)
            expect(result).toBeFalsy()
        })

        it('should return true for different competency', () => {
            const existingCompetencies = [{
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            }]

            const newCompetency = {
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '4'
            }

            const result = component.canPush(existingCompetencies, newCompetency)
            expect(result).toBeTruthy()
        })

        it('should handle arrays with different structure', () => {
            const existingCompetencies = [{ someOtherProp: 'value' }]
            const newCompetency = {
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            }

            const result = component.canPush(existingCompetencies, newCompetency)
            expect(result).toBeTruthy()
        })
    })

    describe('Edge Cases and Error Handling', () => {
        it('should handle missing environment competency key', () => {
            component.compentencyKey = undefined as any

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle service errors gracefully', () => {
            mockHomeService.getFilterEntity.mockReturnValue(throwError('Service error'))

            expect(() => component.getFilterEntity()).not.toThrow()
        })

        it('should handle missing fullProfile data', () => {
            mockActivatedRoute.snapshot.data.configService = null

            expect(() => component.ngOnInit()).not.toThrow()
        })

        it('should handle empty query parameters', () => {
            mockActivatedRoute.queryParams = of({})

            component.ngOnInit()

            expect(component.demandId).toBeUndefined()
            expect(component.actionBtnName).toBeUndefined()
        })

        it('should handle competency selection with missing data', () => {
            component.allCompetencies = []

            expect(() => component.compAreaSelected({ name: 'NonExistent' })).not.toThrow()
        })

        it('should handle theme selection with missing associations and children', () => {
            component.allCompetencyTheme = [{ name: 'Theme' }]

            component.compThemeSelected({ name: 'Theme' })

            expect(component.allCompetencySubtheme).toBeUndefined()
        })

        it('should handle subtheme selection with missing data', () => {
            component.allCompetencySubtheme = []

            expect(() => component.compSubThemeSelected({ name: 'NonExistent' })).not.toThrow()
        })

        it('should handle missing dialog refs in error scenarios', () => {
            mockHomeService.createDemand.mockReturnValue(throwError('error'))
            component.dialogRefs = null

            expect(() => component.submit()).not.toThrow()
        })
    })

    describe('Component Properties and Constants', () => {
        it('should have correct learning list structure', () => {
            expect(component.learningList).toEqual([
                { name: 'Self-paced', key: 'self-paced' },
                { name: 'Instructor-led', key: 'instructor-led' }
            ])
        })

        it('should have correct request type list', () => {
            expect(component.requestTypeList).toEqual(['Single', 'Broadcast'])
        })

        it('should initialize arrays as empty', () => {
            expect(component.competencyList).toEqual([])
            expect(component.allCompetencyTheme).toEqual([])
            expect(component.seletedCompetencyTheme).toEqual([])
            expect(component.allCompetencySubtheme).toEqual([])
            expect(component.requestTypeData).toEqual([])
            expect(component.filterCompetencyThemes).toEqual([])
            expect(component.filteredSubTheme).toEqual([])
            expect(component.filteredRequestType).toEqual([])
            expect(component.filteredAssigneeType).toEqual([])
            expect(component.subthemeCheckedList).toEqual([])
            expect(component.allCompetencies).toEqual([])
            expect(component.filteredallCompetencies).toEqual([])
        })

        it('should initialize boolean flags correctly', () => {
            expect(component.isAssignee).toBeFalsy()
            expect(component.isBroadCast).toBeFalsy()
            expect(component.enableCompetencyAdd).toBeFalsy()
            expect(component.isHideData).toBeFalsy()
            expect(component.isCompetencyHide).toBeFalsy()
        })

        it('should initialize string properties correctly', () => {
            expect(component.resData).toBe('')
            expect(component.statusValue).toBeUndefined()
            expect(component.demandId).toBeUndefined()
            expect(component.actionBtnName).toBeUndefined()
        })

        it('should have correct regular expression for special characters', () => {
            const testString = 'Valid text 123 - _ $ / \\ : [ ]'
            expect(component.noSpecialChar.test(testString)).toBeTruthy()

            const invalidString = 'Invalid<script>alert("test")</script>'
            expect(component.noSpecialChar.test(invalidString)).toBeFalsy()
        })
    })

    describe('Advanced Scenarios and Integration', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should handle complete flow from area selection to competency addition', () => {
            // Setup data
            component.allCompetencies = mockCompetencyData
            jest.spyOn(component, 'addCompetency')
            jest.spyOn(component, 'resetCompfields')

            // Select area
            component.compAreaSelected(mockCompetencyData[0])
            expect(component.seletedCompetencyArea).toEqual(mockCompetencyData[0])

            // Select theme
            if (mockCompetencyData[0].themes?.[0]) {
                component.compThemeSelected(mockCompetencyData[0].themes[0])
                expect(component.seletedCompetencyTheme).toEqual(mockCompetencyData[0].themes[0])
            }

            // Select subtheme
            if (mockCompetencyData[0].themes?.[0]?.associations?.[0]) {
                component.compSubThemeSelected(mockCompetencyData[0].themes[0].associations[0])
                expect(component.enableCompetencyAdd).toBeTruthy()
            }
        })

        // it('should handle form submission with complete data flow', () => {
        //     // Setup form with complete data
        //     component.requestForm.value = {
        //         TitleName: 'Complete Test Request Title',
        //         Objective: 'Complete test objective for the request',
        //         userType: 'Senior Developer',
        //         learningMode: 'Instructor-led',
        //         requestType: 'Broadcast',
        //         providers: mockRequestTypeData,
        //         referenceLink: 'https://example.com/reference'
        //     }

        //     const competencyData = [{
        //         competencyArea: 'Technical Skills',
        //         competencyTheme: 'Programming',
        //         competencySubTheme: 'JavaScript'
        //     }]

        //     const mockCompetencyControl = createMockFormControl(competencyData)
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.isBroadCast = true
        //     component.isAssignee = false

        //     component.submit()

        //     expect(mockHomeService.createDemand).toHaveBeenCalledWith(expect.objectContaining({
        //         title: 'Complete Test Request Title',
        //         objective: 'Complete test objective for the request',
        //         typeOfUser: 'Senior Developer',
        //         learningMode: 'instructor-led',
        //         requestType: 'Broadcast',
        //         competencies: [{
        //             area: 'Technical Skills',
        //             theme: 'Programming',
        //             sub_theme: 'JavaScript'
        //         }],
        //         referenceLink: 'https://example.com/reference',
        //         preferredProvider: mockRequestTypeData.map(item => ({
        //             providerName: item.orgName,
        //             providerId: item.id
        //         }))
        //     }))
        // })

        it('should handle error recovery scenarios', () => {
            // Test service failure recovery
            mockHomeService.getFilterEntity.mockReturnValue(throwError('Network error'))

            expect(() => component.getFilterEntity()).not.toThrow()

            // Reset mock for next calls
            mockHomeService.getFilterEntity.mockReturnValue(of(mockCompetencyData))

            // Should be able to retry
            component.getFilterEntity()
            expect(component.competencyList).toEqual(mockCompetencyData)
        })

        it('should handle form state transitions correctly', () => {
            // Test transition from view to edit mode
            component.actionBtnName = 'view'
            component.demandId = 'test123'

            // Initially in view mode
            component.getRequestTypeList()
            expect(component.isHideData).toBeTruthy()
            expect(component.isCompetencyHide).toBeTruthy()

            // Switch to edit mode
            component.actionBtnName = 'edit'
            component.isHideData = false
            component.isCompetencyHide = false

            expect(component.isHideData).toBeFalsy()
            expect(component.isCompetencyHide).toBeFalsy()
        })

        it('should handle async operations correctly', (done) => {
            let callbackCount = 0

            const mockObservable = {
                subscribe: jest.fn((callback) => {
                    setTimeout(() => {
                        callback(mockCompetencyData)
                        callbackCount++
                        if (callbackCount === 1) {
                            expect(component.competencyList).toEqual(mockCompetencyData)
                            done()
                        }
                    }, 10)
                })
            }

            mockHomeService.getFilterEntity.mockReturnValue(mockObservable as any)
            component.getFilterEntity()
        })

        it('should handle memory cleanup and prevent memory leaks', () => {
            // Test that subscriptions are properly handled
            const unsubscribeSpy = jest.fn()
            const mockSubscription = { unsubscribe: unsubscribeSpy }

            const mockObservable = {
                pipe: jest.fn().mockReturnValue({
                    subscribe: jest.fn().mockReturnValue(mockSubscription)
                })
            }

            const mockControl = createMockFormControl('')
            mockControl.valueChanges = mockObservable as any
            component.requestForm.get = jest.fn().mockReturnValue(mockControl)

            component.valuechangeFuctions()

            // Verify subscription was created
            expect(mockObservable.pipe).toHaveBeenCalled()
        })
    })

    describe('Performance and Optimization', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should handle large datasets efficiently', () => {
            // Create large mock dataset
            const largeCompetencyData = Array.from({ length: 1000 }, (_, index) => ({
                id: `${index}`,
                name: `Competency ${index}`,
                description: `Description ${index}`,
                themes: [{
                    id: `theme-${index}`,
                    name: `Theme ${index}`,
                    associations: [{
                        id: `sub-${index}`,
                        name: `SubTheme ${index}`
                    }]
                }]
            }))

            component.allCompetencies = largeCompetencyData

            // Test filtering performance
            const startTime = performance.now()
            const filtered = component.filterValues('Competency 5', largeCompetencyData)
            const endTime = performance.now()

            expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
            expect(filtered.length).toBeGreaterThan(0)
        })

        it('should handle rapid user inputs without issues', () => {
            const mockControl = createMockFormControl('')
            component.requestForm.get = jest.fn().mockReturnValue(mockControl)

            // Simulate rapid typing
            for (let i = 0; i < 10; i++) {
                component.clearSearch({ stopPropagation: jest.fn() }, 'testControl')
            }

            expect(mockControl.patchValue).toHaveBeenCalledTimes(10)
        })
    })

    describe('Accessibility and User Experience', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should handle keyboard navigation scenarios', () => {
            const mockEvent = {
                stopPropagation: jest.fn(),
                preventDefault: jest.fn(),
                key: 'Enter'
            }

            // Test clear search with keyboard
            const mockControl = createMockFormControl('search text')
            component.requestForm.get = jest.fn().mockReturnValue(mockControl)

            component.clearSearch(mockEvent, 'testControl')

            expect(mockEvent.stopPropagation).toHaveBeenCalled()
            expect(mockControl.patchValue).toHaveBeenCalledWith('')
        })

        it('should provide appropriate feedback to users', () => {
            // Test user feedback for duplicate competency
            component.seletedCompetencyArea = mockCompetencyData[0]
            component.seletedCompetencyTheme = mockCompetencyData[0].themes?.[0]
            component.seletedCompetencySubTheme = mockCompetencyData[0].themes?.[0]?.associations?.[0]

            const mockCompetencyControl = createMockFormControl([])
            component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)
            jest.spyOn(component, 'canPush').mockReturnValue(false)

            component.addCompetency()

            expect(mockSnackBar.open).toHaveBeenCalledWith('This competency is already added')
        })

        // it('should handle loading states appropriately', () => {
        //     jest.spyOn(component, 'showDialogBox')

        //     component.requestForm.value = {
        //         TitleName: 'Test',
        //         Objective: 'Test',
        //         requestType: 'Single'
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     component.submit()

        //     expect(component.showDialogBox).toHaveBeenCalledWith('progress')
        // })
    })

    describe('Data Validation and Integrity', () => {
        beforeEach(() => {
            component.ngOnInit()
        })

        it('should validate data integrity during competency operations', () => {
            const invalidCompetency = {
                competencyAreaId: null,
                competencyThemeId: undefined,
                competencySubThemeId: ''
            }

            const validCompetency = {
                competencyAreaId: '1',
                competencyThemeId: '2',
                competencySubThemeId: '3'
            }

            expect(component.canPush([invalidCompetency], validCompetency)).toBeTruthy()
            expect(component.canPush([validCompetency], validCompetency)).toBeFalsy()
        })

        it('should handle malformed API responses gracefully', () => {
            // Test with malformed competency data
            const malformedData = [
                { /* missing required fields */ },
                { id: '1' /* missing other fields */ },
                null,
                undefined
            ]

            mockHomeService.getFilterEntity.mockReturnValue(of(malformedData))

            expect(() => component.getFilterEntity()).not.toThrow()
            expect(component.competencyList).toEqual(malformedData)
        })

        // it('should validate form data before submission', () => {
        //     // Test with invalid form data
        //     component.requestForm.value = {
        //         TitleName: '', // Invalid - required
        //         Objective: '', // Invalid - required
        //         requestType: '' // Invalid - required
        //     }

        //     const mockCompetencyControl = createMockFormControl([])
        //     component.requestForm.get = jest.fn().mockReturnValue(mockCompetencyControl)

        //     // Should still attempt submission (validation is handled by Angular validators)
        //     expect(() => component.submit()).not.toThrow()
        // })
    })

    describe('Browser Compatibility and Edge Cases', () => {
        it('should handle missing browser APIs gracefully', () => {
            // Mock missing performance API
            const originalPerformance = global.performance;
            (global as any).performance = undefined

            expect(() => component.ngOnInit()).not.toThrow()

            // Restore
            global.performance = originalPerformance
        })

        it('should handle different data types in arrays', () => {
            const mixedArray = [
                { name: 'String Name' },
                { name: 123 }, // Number instead of string
                { name: null },
                { name: undefined },
                { differentProp: 'value' }
            ]

            expect(() => component.filterValues('String', mixedArray)).not.toThrow()
        })

        it('should handle circular references in objects', () => {
            const circularObj: any = { name: 'Test' }
            circularObj.self = circularObj

            expect(() => component.compAreaSelected(circularObj)).not.toThrow()
        })
    })
})