import { LeftMenuComponent } from './left-menu.component'

describe('LeftMenuComponent', () => {
    let component: LeftMenuComponent
    let mockActivatedRoute: any
    let mockRouter: any

    beforeEach(() => {
        // Mock ActivatedRoute
        mockActivatedRoute = {
            snapshot: {
                fragment: 'test-fragment',
                firstChild: {
                    params: {
                        testParam: 'test-value'
                    }
                }
            }
        }

        // Mock Router
        mockRouter = {
            url: 'test-url?param=value'
        }

        // Initialize component with mocked dependencies
        component = new LeftMenuComponent(mockActivatedRoute, mockRouter)
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })

    describe('ngOnInit', () => {
        it('should initialize properties when widgetData is provided', () => {
            // Arrange
            const mockWidgetData = {
                widgetData: {
                    name: 'Test MDO',
                    logoPath: 'test-logo-path',
                    menusList: [{ name: 'Menu Item 1' }]
                }
            }
            component.widgetData = mockWidgetData

            // Act
            component.ngOnInit()

            // Assert
            expect(component.mdoname).toBe('Test MDO')
            expect(component.logo).toBe('test-logo-path')
            expect(component.menulist).toEqual([{ name: 'Menu Item 1' }])
        })

        it('should initialize properties with defaults when widgetData is not provided', () => {
            // Arrange
            component.widgetData = null

            // Act
            component.ngOnInit()

            // Assert
            expect(component.mdoname).toBe('')
            expect(component.logo).toBe('../assets/icons/govtlogo.jpg')
            expect(component.menulist).toEqual([])
        })
    })

    describe('isLinkActive', () => {
        it('should return true when url matches fragment and index is provided', () => {
            // Act
            const result = component.isLinkActive('test-fragment', 1)

            // Assert
            expect(result).toBe(true)
        })

        it('should return true when index is 0', () => {
            // Act
            const result = component.isLinkActive(undefined, 0)

            // Assert
            expect(result).toBe(true)
        })

        it('should return false when url does not match fragment', () => {
            // Act
            const result = component.isLinkActive('non-matching-fragment', 1)

            // Assert
            expect(result).toBe(false)
        })

        it('should return false when no url or index is provided', () => {
            // Act
            const result = component.isLinkActive()

            // Assert
            expect(result).toBe(false)
        })
    })

    describe('isLinkActive2', () => {
        it('should return true when url matches router url path', () => {
            // Arrange
            mockRouter.url = '/test-path?param=value'

            // Act
            const result = component.isLinkActive2('/test-path')

            // Assert
            expect(result).toBe(true)
        })

        it('should return false when url does not match router url path', () => {
            // Arrange
            mockRouter.url = '/different-path?param=value'

            // Act
            const result = component.isLinkActive2('/test-path')

            // Assert
            expect(result).toBe(false)
        })

        it('should return false when url is not provided', () => {
            // Act
            const result = component.isLinkActive2()

            // Assert
            expect(result).toBe(false)
        })
    })

    describe('getLink', () => {
        it('should replace parameter in routerLink when tab has customRouting and paramaterName', () => {
            // Arrange
            const tab = {
                customRouting: true,
                paramaterName: 'testParam',
                routerLink: '/test/<param>/route'
            }

            // Act
            const result = component.getLink(tab)

            // Assert
            expect(result).toBe('/test/test-value/route')
        })

        it('should return undefined when tab is missing required properties', () => {
            // Arrange
            const tab = {
                customRouting: false,
                routerLink: '/test/<param>/route'
            }

            // Act
            const result = component.getLink(tab)

            // Assert
            expect(result).toBeUndefined()
        })
    })

    describe('isAllowed', () => {
        beforeEach(() => {
            component.widgetData = {
                userRoles: new Set(['user', 'admin'])
            }
        })

        it('should return true when user has required role', () => {
            // Arrange
            const tab = {
                requiredRoles: ['admin', 'superuser']
            }

            // Act
            const result = component.isAllowed(tab)

            // Assert
            expect(result).toBe(true)
        })

        it('should return false when user does not have required role', () => {
            // Arrange
            const tab = {
                requiredRoles: ['superuser', 'manager']
            }

            // Act
            const result = component.isAllowed(tab)

            // Assert
            expect(result).toBe(false)
        })

        it('should return true when tab has no requiredRoles', () => {
            // Arrange
            const tab = {
                requiredRoles: []
            }

            // Act
            const result = component.isAllowed(tab)

            // Assert
            expect(result).toBe(true)
        })

        it('should return true when tab has no requiredRoles property', () => {
            // Arrange
            const tab = {}

            // Act
            const result = component.isAllowed(tab)

            // Assert
            expect(result).toBe(true)
        })
    })
})