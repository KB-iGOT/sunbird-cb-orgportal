jest.mock('pdfjs-dist', () => ({ GlobalWorkerOptions: { workerSrc: '' }, getDocument: jest.fn() }))
jest.mock('pdfjs-dist/webpack', () => ({}))
jest.mock('worker-loader?esModule=false&filename=[name].[contenthash].js!pdfjs-dist/build/pdf.worker.js', () => ({}), { virtual: true })
jest.mock('../profile-certificate-dialog/profile-certificate-dialog.component', () => ({ ProfileCertificateDialogComponent: class { } }))
jest.mock('@sunbird-cb/collection', () => ({ WidgetUserService: jest.fn() }))

import { ProfileViewComponent } from './profile-view.component'
import { BlendedApporvalService } from '../../services/blended-approval.service'
import { WidgetUserService } from '@sunbird-cb/collection'
import { MatDialog } from '@angular/material/dialog'
import { Router, ActivatedRoute } from '@angular/router'
import { of, throwError } from 'rxjs'
import moment from 'moment'
import { ProfileCertificateDialogComponent } from '../profile-certificate-dialog/profile-certificate-dialog.component'

// Jest mocks
jest.mock('@angular/material/dialog')
jest.mock('../../services/blended-approval.service')
jest.mock('@angular/router')

describe('ProfileViewComponent', () => {
    let component: ProfileViewComponent
    let bpServiceMock: jest.Mocked<BlendedApporvalService>
    let userSvcMock: jest.Mocked<WidgetUserService>
    let dialogMock: jest.Mocked<MatDialog>
    let routerMock: jest.Mocked<Router>
    let routeMock: jest.Mocked<ActivatedRoute>

    const mockUserProfile = {
        profileDetails: {
            professionalDetails: [{ designation: 'Developer' }],
            academics: ['Math', 'Science'],
            interests: ['Reading', 'Writing'],
            verifiedKarmayogi: true,
        },
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        userId: '123',
        userName: 'john_doe',
        phone: '1234567890'
    }

    beforeEach(() => {
        // Manually mock the services with default return values
        bpServiceMock = {
            getUserById: jest.fn().mockReturnValue(of(mockUserProfile)),
            downloadCert: jest.fn().mockReturnValue(of({ result: { printUri: 'default_url' } })),
        } as unknown as jest.Mocked<BlendedApporvalService>

        userSvcMock = {
            fetchUserBatchList: jest.fn().mockReturnValue(of([])),
        } as unknown as jest.Mocked<WidgetUserService>

        dialogMock = {
            open: jest.fn().mockReturnValue({ afterClosed: () => of(null) }),
        } as unknown as jest.Mocked<MatDialog>

        routerMock = {
            getCurrentNavigation: jest.fn().mockReturnValue(null),
        } as unknown as jest.Mocked<Router>

        routeMock = {
            snapshot: {
                params: { userId: '123' },
                data: {
                    pageData: {
                        data: { tabs: [] },
                    },
                },
            } as any,
            data: of({}),
        } as jest.Mocked<ActivatedRoute>

        // Instantiate the component
        component = new ProfileViewComponent(
            dialogMock,
            routeMock,
            bpServiceMock,
            routerMock,
            userSvcMock,
        )
    })

    describe('Component Initialization', () => {
        it('should create the ProfileViewComponent', () => {
            expect(component).toBeTruthy()
            expect(component).toBeInstanceOf(ProfileViewComponent)
        })

        it('should initialize with default values', () => {
            expect(component.sticky).toBe(false)
            expect(component.elementPosition).toBeUndefined()
            // verifiedBadge is true because constructor fetches and route.data.subscribe sets it
            expect(component.verifiedBadge).toBe(true)
        })
    })

    describe('ngOnInit', () => {
        beforeEach(() => {
            // Ensure all service methods return observables by default
            bpServiceMock.getUserById.mockReturnValue(of(mockUserProfile))
            userSvcMock.fetchUserBatchList.mockReturnValue(of([]))
        })

        it('should fetch user data on init', () => {
            // Data is fetched in constructor, not ngOnInit
            expect(bpServiceMock.getUserById).toHaveBeenCalledWith('123')
            expect(userSvcMock.fetchUserBatchList).toHaveBeenCalledWith('123')
            expect(component.portalProfile).toEqual(mockUserProfile.profileDetails)
            expect(component.verifiedBadge).toBe(true)
            expect(component.academics).toEqual(mockUserProfile.profileDetails.academics)
            expect(component.hobbies).toEqual(mockUserProfile.profileDetails.interests)
        })

        it('should handle user data fetch error gracefully', () => {
            const errorMessage = 'Failed to fetch user data'
            bpServiceMock.getUserById.mockReturnValue(throwError(() => new Error(errorMessage)))
            // Re-create component so constructor runs with error mock
            const errorComponent = new ProfileViewComponent(
                dialogMock, routeMock, bpServiceMock, routerMock, userSvcMock,
            )
            expect(bpServiceMock.getUserById).toHaveBeenCalledWith('123')
            // portalProfile was never set due to error
            expect((errorComponent as any).portalProfile).toBeUndefined()
        })

        it('should handle batch list fetch error gracefully', () => {
            const errorMessage = 'Failed to fetch batch list'
            userSvcMock.fetchUserBatchList.mockReturnValue(throwError(() => new Error(errorMessage)))

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

            component.ngOnInit()

            expect(userSvcMock.fetchUserBatchList).toHaveBeenCalledWith('123')
            expect(component.portalProfile).toEqual(mockUserProfile.profileDetails)

            consoleSpy.mockRestore()
        })

        it('should handle user profile without profileDetails', () => {
            const userWithoutProfileDetails = {
                ...mockUserProfile,
                profileDetails: null,
            }
            bpServiceMock.getUserById.mockReturnValue(of(userWithoutProfileDetails))
            // Component sets portalProfile = res before the route.data.subscribe block
            const noProfileComponent = new ProfileViewComponent(
                dialogMock, routeMock, bpServiceMock, routerMock, userSvcMock,
            )
            // portalProfile = res (set before null-check) then overwritten inside route.data only if profileDetails exists
            expect(noProfileComponent.portalProfile).toEqual(userWithoutProfileDetails)
            expect(noProfileComponent.verifiedBadge).toBe(false)
        })

        it('should handle user profile with verifiedKarmayogi as false', () => {
            const userNotVerified = {
                ...mockUserProfile,
                profileDetails: {
                    ...mockUserProfile.profileDetails,
                    verifiedKarmayogi: false,
                },
            }
            bpServiceMock.getUserById.mockReturnValue(of(userNotVerified))
            const notVerifiedComponent = new ProfileViewComponent(
                dialogMock, routeMock, bpServiceMock, routerMock, userSvcMock,
            )
            expect(notVerifiedComponent.verifiedBadge).toBe(false)
        })
    })

    describe('downloadAllCertificate', () => {
        beforeEach(() => {
            // Reset the component's allCertificate array before each test
            component.allCertificate = []
        })

        it('should download all certificates correctly', () => {
            const mockCert = {
                identifier: 'cert123',
                issuedCertificates: [{ identifier: 'cert123', name: 'Test Certificate' }]
            }
            const mockResponse = { result: { printUri: 'url_to_certificate' } }

            bpServiceMock.downloadCert.mockReturnValue(of(mockResponse))

            const mockData = [{ issuedCertificates: [mockCert] }]

            component.downloadAllCertificate(mockData)

            expect(bpServiceMock.downloadCert).toHaveBeenCalledWith('cert123')
            expect(component.allCertificate).toEqual([
                {
                    identifier: 'cert123',
                    dataUrl: 'url_to_certificate',
                    content: undefined,
                    issuedCertificates: mockCert,
                },
            ])
        })

        it('should handle multiple certificates', () => {
            const mockCert1 = {
                identifier: 'cert123',
                issuedCertificates: [{ identifier: 'cert123' }]
            }
            const mockCert2 = {
                identifier: 'cert456',
                issuedCertificates: [{ identifier: 'cert456' }]
            }
            const mockResponse1 = { result: { printUri: 'url_to_certificate_1' } }
            const mockResponse2 = { result: { printUri: 'url_to_certificate_2' } }

            bpServiceMock.downloadCert
                .mockReturnValueOnce(of(mockResponse1))
                .mockReturnValueOnce(of(mockResponse2))

            const mockData = [{ issuedCertificates: [mockCert1, mockCert2] }]

            component.downloadAllCertificate(mockData)

            expect(bpServiceMock.downloadCert).toHaveBeenCalledTimes(2)
            expect(bpServiceMock.downloadCert).toHaveBeenCalledWith('cert123')
            expect(bpServiceMock.downloadCert).toHaveBeenCalledWith('cert456')
            expect(component.allCertificate).toHaveLength(2)
        })

        it('should handle empty certificate data', () => {
            component.downloadAllCertificate([])

            expect(bpServiceMock.downloadCert).not.toHaveBeenCalled()
            expect(component.allCertificate).toEqual([])
        })

        it('should handle certificate download error', () => {
            const mockCert = {
                identifier: 'cert123',
                issuedCertificates: [{ identifier: 'cert123' }]
            }
            const errorMessage = 'Download failed'

            bpServiceMock.downloadCert.mockReturnValue(throwError(() => new Error(errorMessage)))

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
            const mockData = [{ issuedCertificates: [mockCert] }]

            component.downloadAllCertificate(mockData)

            expect(bpServiceMock.downloadCert).toHaveBeenCalledWith('cert123')

            consoleSpy.mockRestore()
        })

        it('should handle data with empty issuedCertificates', () => {
            const mockData = [{ issuedCertificates: [] }]

            component.downloadAllCertificate(mockData)

            expect(bpServiceMock.downloadCert).not.toHaveBeenCalled()
            expect(component.allCertificate).toEqual([])
        })
    })

    describe('paDate', () => {
        it('should format date correctly in paDate method', () => {
            const date = '05-03-2025'
            const formattedDate = component.paDate(date)
            const expectedFormattedDate = moment(date, 'DD-MM-YYYY').toDate().toDateString()

            expect(formattedDate).toEqual(expectedFormattedDate)
        })

        it('should handle different date formats', () => {
            const date = '15-12-2024'
            const formattedDate = component.paDate(date)
            const expectedFormattedDate = moment(date, 'DD-MM-YYYY').toDate().toDateString()

            expect(formattedDate).toEqual(expectedFormattedDate)
        })

        it('should handle invalid date', () => {
            const invalidDate = 'invalid-date'
            const formattedDate = component.paDate(invalidDate)

            // moment will return 'Invalid Date' for invalid dates
            expect(formattedDate).toContain('Invalid Date')
        })

        it('should handle null or undefined date', () => {
            expect(() => component.paDate(null)).not.toThrow()
            expect(() => component.paDate(undefined)).not.toThrow()
        })
    })

    describe('handleScroll', () => {
        beforeEach(() => {
            // Reset global properties before each test
            Object.defineProperty(global, 'innerHeight', {
                writable: true,
                configurable: true,
                value: 500
            })
            Object.defineProperty(global, 'scrollY', {
                writable: true,
                configurable: true,
                value: 0
            })
        })

        it('should handle scroll and set sticky state to true', () => {
            component.elementPosition = 100
            Object.defineProperty(window, 'pageYOffset', { value: 150, writable: true, configurable: true })
            component.handleScroll()
            expect(component.sticky).toBe(true)
        })

        it('should handle scroll and set sticky state to false', () => {
            component.elementPosition = 100
            Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true, configurable: true })
            component.handleScroll()
            expect(component.sticky).toBe(false)
        })

        it('should handle scroll when elementPosition is 0', () => {
            component.elementPosition = 0
            Object.defineProperty(window, 'pageYOffset', { value: 10, writable: true, configurable: true })
            component.handleScroll()
            expect(component.sticky).toBe(true)
        })

        it('should handle scroll when scrollY equals elementPosition', () => {
            component.elementPosition = 100
            Object.defineProperty(window, 'pageYOffset', { value: 100, writable: true, configurable: true })
            component.handleScroll()
            // window.pageYOffset >= elementPosition (100 >= 100) is true, so sticky = true
            expect(component.sticky).toBe(true)
        })
    })

    describe('openCertificateDialog', () => {
        it('should open certificate dialog if issuedCertificates match identifier', () => {
            const mockItem = {
                identifier: 'cert123',
                issuedCertificates: { identifier: 'cert123' },
                dataUrl: 'certificate_url',
            }

            component.openCertificateDialog(mockItem)

            expect(dialogMock.open).toHaveBeenCalledWith(ProfileCertificateDialogComponent, {
                autoFocus: false,
                data: { cet: 'certificate_url', value: mockItem },
            })
        })

        it('should not open certificate dialog if issuedCertificates do not match identifier', () => {
            const mockItem = {
                identifier: 'cert123',
                issuedCertificates: { identifier: 'cert456' },
                dataUrl: 'certificate_url',
            }

            component.openCertificateDialog(mockItem)

            expect(dialogMock.open).not.toHaveBeenCalled()
        })

        it('should handle item with empty issuedCertificates', () => {
            const mockItem = {
                identifier: 'cert123',
                issuedCertificates: [],
                dataUrl: 'certificate_url',
            }
            component.openCertificateDialog(mockItem)
            expect(dialogMock.open).not.toHaveBeenCalled()
        })

        it('should handle item without identifier match', () => {
            const mockItem = {
                identifier: 'cert123',
                issuedCertificates: { identifier: 'cert456' },
                dataUrl: 'certificate_url',
            }
            component.openCertificateDialog(mockItem)
            expect(dialogMock.open).not.toHaveBeenCalled()
        })
    })

    describe('Route Parameters', () => {
        it('should extract userId from route parameters', () => {
            expect(routeMock.snapshot.params.userId).toBe('123')
        })

        it('should handle missing userId in route parameters', () => {
            const routeWithoutUserId = {
                snapshot: {
                    params: {},
                    data: {
                        pageData: {
                            data: { tabs: [] },
                        },
                    },
                } as any,
            } as jest.Mocked<ActivatedRoute>

            const componentWithoutUserId = new ProfileViewComponent(
                dialogMock,
                routeWithoutUserId,
                bpServiceMock,
                routerMock,
                userSvcMock,
            )

            expect(componentWithoutUserId).toBeTruthy()
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
})