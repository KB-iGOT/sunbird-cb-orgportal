import { MobileAppsService } from './mobile-apps.service'
import { NavigationExternalService } from './navigation-external.service'
import {
    CHAT_BOT_VISIBILITY,
    DISPLAY_SETTING,
    DOWNLOAD_REQUESTED,
    GO_OFFLINE,
    IOS_OPEN_IN_BROWSER,
} from '../models/mobile-events.model'

describe('MobileAppsService', () => {
    let service: MobileAppsService
    let navigateSvcMock: jest.Mocked<NavigationExternalService>

    // Backup original window properties to restore after tests
    const originalWindow = { ...window }
    let dispatchEventSpy: jest.SpyInstance

    beforeEach(() => {
        // Reset window to original state
        Object.defineProperty(global, 'window', { value: { ...originalWindow } })

        // Create mock for NavigationExternalService
        navigateSvcMock = {
            init: jest.fn(),
        } as unknown as jest.Mocked<NavigationExternalService>

        // Create service instance with mock dependencies
        service = new MobileAppsService(navigateSvcMock)

        // Setup spy on document.dispatchEvent
        dispatchEventSpy = jest.spyOn(document, 'dispatchEvent')
    })

    afterEach(() => {
        // Restore original window properties
        Object.defineProperty(global, 'window', { value: originalWindow })
        jest.clearAllMocks()
    })

    describe('init', () => {
        it('should setup global methods and initialize navigation service', () => {
            // Arrange
            const setupGlobalMethodsSpy = jest.spyOn(service, 'setupGlobalMethods')

            // Act
            service.init()

            // Assert
            expect(setupGlobalMethodsSpy).toHaveBeenCalled()
            expect(navigateSvcMock.init).toHaveBeenCalled()
        })
    })


    describe('isMobile', () => {


        it('should return false when not on mobile app', () => {
            // Arrange - window has neither appRef nor webkit.messageHandlers.appRef

            // Act & Assert
            expect(service.isMobile).toBe(false)
        })
    })

    describe('isAndroidApp', () => {


        it('should return false when window.appRef is undefined', () => {
            // Arrange - window.appRef is undefined

            // Act & Assert
            expect(service.isAndroidApp).toBe(false)
        })
    })

    describe('iOsAppRef', () => {


        it('should return null when not on iOS app', () => {
            // Arrange - window.webkit is undefined

            // Act & Assert
            expect(service.iOsAppRef).toBeNull()
        })

        it('should return null when webkit is defined but messageHandlers is not', () => {
            // Arrange

            // Act & Assert
            expect(service.iOsAppRef).toBeNull()
        })

        it('should return null when messageHandlers is defined but appRef is not', () => {


            // Act & Assert
            expect(service.iOsAppRef).toBeNull()
        })
    })



    describe('sendDataAppToClient', () => {


        it('should do nothing when not on mobile and dispatchEventFlag is false', () => {
            // Arrange
            const eventName = 'testEvent'
            const data = { key: 'value' }

            // Act
            service.sendDataAppToClient(eventName, data)

            // Assert
            expect(dispatchEventSpy).not.toHaveBeenCalled()
        })
    })


    describe('isFunctionAvailableInAndroid', () => {

        it('should return false when function is not available in Android', () => {
            // Arrange
            const functionName = 'testFunction'

            // Act & Assert
            expect(service.isFunctionAvailableInAndroid(functionName)).toBe(false)
        })

        it('should return false when not on Android app', () => {
            // Arrange
            const functionName = 'testFunction'
            // window.appRef is undefined

            // Act & Assert
            expect(service.isFunctionAvailableInAndroid(functionName)).toBe(false)
        })
    })

    describe('Mobile app actions', () => {
        beforeEach(() => {
            // Set up spy on sendDataAppToClient
            jest.spyOn(service, 'sendDataAppToClient')
        })

        it('should call sendDataAppToClient with GO_OFFLINE event', () => {
            // Act
            service.goOffline()

            // Assert
            expect(service.sendDataAppToClient).toHaveBeenCalledWith(GO_OFFLINE, {})
        })

        it('should call sendDataAppToClient with DISPLAY_SETTING event', () => {
            // Act
            service.viewSettings()

            // Assert
            expect(service.sendDataAppToClient).toHaveBeenCalledWith(DISPLAY_SETTING, {})
        })



        it('should call sendDataAppToClient with DOWNLOAD_REQUESTED event and content id', () => {
            // Arrange
            const contentId = 'content-id'

            // Act
            service.downloadResource(contentId)

            // Assert
            expect(service.sendDataAppToClient).toHaveBeenCalledWith(DOWNLOAD_REQUESTED, contentId)
        })

        it('should call sendDataAppToClient with CHAT_BOT_VISIBILITY event and visibility value', () => {
            // Arrange
            const isVisible = 'yes'

            // Act
            service.appChatbotVisibility(isVisible)

            // Assert
            expect(service.sendDataAppToClient).toHaveBeenCalledWith(CHAT_BOT_VISIBILITY, isVisible)
        })

        it('should call sendDataAppToClient with IOS_OPEN_IN_BROWSER event and url', () => {
            // Arrange
            const url = 'https://example.com'

            // Act
            service.iosOpenInBrowserRequest(url)

            // Assert
            expect(service.sendDataAppToClient).toHaveBeenCalledWith(IOS_OPEN_IN_BROWSER, { url })
        })
    })
})