import { MobileAppsService } from './mobile-apps.service'
import { NsContent } from '@sunbird-cb/collection'
import {
    CHAT_BOT_VISIBILITY,
    DISPLAY_SETTING,
    DOWNLOAD_REQUESTED,
    GET_PLAYERCONTENT_JSON,
    GO_OFFLINE,
    IOS_OPEN_IN_BROWSER,
    NAVIGATION_DATA_INCOMING,
} from '../models/mobile-events.model'

// Mock the window object
interface IWindowMobileAppModified extends Window {
    appRef?: any
    webkit?: any
    navigateTo?: any
    getToken?: any
    getSessionId?: any
    isAuthenticated?: any
    dispatchEventFlag?: any
}

declare let window: IWindowMobileAppModified

// Mock NavigationExternalService
const mockNavigationExternalService = {
    init: jest.fn(),
}

describe('MobileAppsService', () => {
    let service: MobileAppsService
    let originalWindow: any
    let mockDispatchEvent: jest.SpyInstance

    beforeEach(() => {
        // Store original window properties
        originalWindow = {
            appRef: (window as any).appRef,
            webkit: (window as any).webkit,
            navigateTo: (window as any).navigateTo,
            dispatchEventFlag: (window as any).dispatchEventFlag,
        }

        // Clear window properties
        delete (window as any).appRef
        delete (window as any).webkit
        delete (window as any).navigateTo
        delete (window as any).dispatchEventFlag

        // Mock document.dispatchEvent
        mockDispatchEvent = jest.spyOn(document, 'dispatchEvent').mockImplementation(() => true)

        // Create service instance
        service = new MobileAppsService(mockNavigationExternalService as any)
    })

    afterEach(() => {
        // Restore original window properties
        (window as any).appRef = originalWindow.appRef;
        (window as any).webkit = originalWindow.webkit;
        (window as any).navigateTo = originalWindow.navigateTo;
        (window as any).dispatchEventFlag = originalWindow.dispatchEventFlag

        // Restore mocks
        mockDispatchEvent.mockRestore()
        jest.clearAllMocks()
    })

    describe('init', () => {
        it('should call setupGlobalMethods and navigateSvc.init', () => {
            const setupGlobalMethodsSpy = jest.spyOn(service, 'setupGlobalMethods')

            service.init()

            expect(setupGlobalMethodsSpy).toHaveBeenCalled()
            expect(mockNavigationExternalService.init).toHaveBeenCalled()
        })
    })

    describe('simulateMobile', () => {
        it('should set window.appRef and window.webkit to empty objects', () => {
            service.simulateMobile()

            expect((window as any).appRef).toEqual({})
            expect((window as any).webkit).toEqual({})
        })
    })

    describe('isMobile getter', () => {
        it('should return true when Android app is available', () => {
            (window as any).appRef = {}

            expect(service.isMobile).toBe(true)
        })

        it('should return true when iOS app is available', () => {
            (window as any).webkit = {
                messageHandlers: {
                    appRef: {}
                }
            }

            expect(service.isMobile).toBe(true)
        })

        it('should return false when no mobile app is available', () => {
            expect(service.isMobile).toBe(false)
        })
    })

    describe('isAndroidApp getter', () => {
        it('should return true when window.appRef exists', () => {
            (window as any).appRef = {}

            expect(service.isAndroidApp).toBe(true)
        })

        it('should return false when window.appRef does not exist', () => {
            expect(service.isAndroidApp).toBe(false)
        })
    })

    describe('iOsAppRef getter', () => {
        it('should return appRef when webkit messageHandlers appRef exists', () => {
            const mockAppRef = { someMethod: jest.fn() };
            (window as any).webkit = {
                messageHandlers: {
                    appRef: mockAppRef
                }
            }

            expect(service.iOsAppRef).toBe(mockAppRef)
        })

        it('should return null when webkit does not exist', () => {
            expect(service.iOsAppRef).toBeNull()
        })

        it('should return null when webkit.messageHandlers does not exist', () => {
            (window as any).webkit = {}

            expect(service.iOsAppRef).toBeNull()
        })

        it('should return null when webkit.messageHandlers.appRef does not exist', () => {
            (window as any).webkit = {
                messageHandlers: {}
            }

            expect(service.iOsAppRef).toBeNull()
        })
    })

    describe('canShowSettings getter', () => {
        it('should return true when Android app has DISPLAY_SETTING function', () => {
            (window as any).appRef = {
                [DISPLAY_SETTING]: jest.fn()
            }

            expect(service.canShowSettings).toBe(true)
        })

        it('should return true when iOS app is available', () => {
            (window as any).webkit = {
                messageHandlers: {
                    appRef: {}
                }
            }

            expect(service.canShowSettings).toBe(true)
        })

        it('should return false when no mobile app settings are available', () => {
            expect(service.canShowSettings).toBe(false)
        })

        it('should return false when Android app exists but no DISPLAY_SETTING function', () => {
            (window as any).appRef = {}

            expect(service.canShowSettings).toBe(false)
        })
    })

    describe('goOffline', () => {
        it('should call sendDataAppToClient with GO_OFFLINE event', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')

            service.goOffline()

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(GO_OFFLINE, {})
        })
    })

    describe('viewSettings', () => {
        it('should call sendDataAppToClient with DISPLAY_SETTING event', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')

            service.viewSettings()

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(DISPLAY_SETTING, {})
        })
    })

    describe('sendViewerData', () => {
        it('should call sendDataAppToClient with GET_PLAYERCONTENT_JSON event and viewer data', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')
            const mockViewerData: NsContent.IContent = { identifier: 'test-content' } as any

            service.sendViewerData(mockViewerData)

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(GET_PLAYERCONTENT_JSON, mockViewerData)
        })
    })

    describe('downloadResource', () => {
        it('should call sendDataAppToClient with DOWNLOAD_REQUESTED event and resource id', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')
            const resourceId = 'test-resource-id'

            service.downloadResource(resourceId)

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(DOWNLOAD_REQUESTED, resourceId)
        })
    })

    describe('appChatbotVisibility', () => {
        it('should call sendDataAppToClient with CHAT_BOT_VISIBILITY event and visibility status', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')

            service.appChatbotVisibility('yes')

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(CHAT_BOT_VISIBILITY, 'yes')
        })

        it('should handle "no" visibility status', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')

            service.appChatbotVisibility('no')

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(CHAT_BOT_VISIBILITY, 'no')
        })
    })

    describe('iosOpenInBrowserRequest', () => {
        it('should call sendDataAppToClient with IOS_OPEN_IN_BROWSER event and url object', () => {
            const sendDataAppToClientSpy = jest.spyOn(service, 'sendDataAppToClient')
            const testUrl = 'https://example.com'

            service.iosOpenInBrowserRequest(testUrl)

            expect(sendDataAppToClientSpy).toHaveBeenCalledWith(IOS_OPEN_IN_BROWSER, { url: testUrl })
        })
    })

    describe('setupGlobalMethods', () => {
        it('should set up window.navigateTo function', () => {
            service.setupGlobalMethods()

            expect(typeof (window as any).navigateTo).toBe('function')
        })

        it('should dispatch NAVIGATION_DATA_INCOMING event when navigateTo is called', () => {
            service.setupGlobalMethods()

            const testUrl = '/test-url'
            const testParams = { param1: 'value1' };

            (window as any).navigateTo(testUrl, testParams)

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                new CustomEvent(NAVIGATION_DATA_INCOMING, {
                    detail: { url: testUrl, params: testParams }
                })
            )
        })

        it('should dispatch NAVIGATION_DATA_INCOMING event when navigateTo is called without params', () => {
            service.setupGlobalMethods()

            const testUrl = '/test-url';

            (window as any).navigateTo(testUrl)

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                new CustomEvent(NAVIGATION_DATA_INCOMING, {
                    detail: { url: testUrl, params: undefined }
                })
            )
        })
    })

    describe('isFunctionAvailableInAndroid', () => {
        it('should return true when function exists in window.appRef', () => {
            const functionName = 'testFunction';
            (window as any).appRef = {
                [functionName]: jest.fn()
            }

            expect(service.isFunctionAvailableInAndroid(functionName)).toBe(true)
        })

        it('should return false when function does not exist in window.appRef', () => {
            const functionName = 'testFunction';
            (window as any).appRef = {}

            expect(service.isFunctionAvailableInAndroid(functionName)).toBe(false)
        })

        it('should return false when window.appRef does not exist', () => {
            const functionName = 'testFunction'

            expect(service.isFunctionAvailableInAndroid(functionName)).toBe(false)
        })
    })

    describe('sendDataAppToClient', () => {
        const testEventName = 'TEST_EVENT'
        const testData = { key: 'value' }

        it('should call Android app function with JSON stringified data for non-DISPLAY_SETTING events', () => {
            const mockFunction = jest.fn();
            (window as any).appRef = {
                [testEventName]: mockFunction
            }

            service.sendDataAppToClient(testEventName, testData)

            expect(mockFunction).toHaveBeenCalledWith(JSON.stringify(testData))
        })

        it('should call Android app function without parameters for DISPLAY_SETTING event', () => {
            const mockFunction = jest.fn();
            (window as any).appRef = {
                [DISPLAY_SETTING]: mockFunction
            }

            service.sendDataAppToClient(DISPLAY_SETTING, testData)

            expect(mockFunction).toHaveBeenCalledWith()
        })

        it('should call iOS app postMessage when iOS app is available and Android is not', () => {
            const mockPostMessage = jest.fn();
            (window as any).webkit = {
                messageHandlers: {
                    appRef: {
                        postMessage: mockPostMessage
                    }
                }
            }

            service.sendDataAppToClient(testEventName, testData)

            expect(mockPostMessage).toHaveBeenCalledWith(
                JSON.stringify({ eventName: testEventName, data: testData })
            )
        })

        it('should dispatch custom event when dispatchEventFlag is true and no mobile app is available', () => {
            (window as any).dispatchEventFlag = true

            service.sendDataAppToClient(testEventName, testData)

            expect(mockDispatchEvent).toHaveBeenCalledWith(
                new CustomEvent(testEventName, { detail: testData })
            )
        })

        it('should not dispatch custom event when dispatchEventFlag is false and no mobile app is available', () => {
            (window as any).dispatchEventFlag = false

            service.sendDataAppToClient(testEventName, testData)

            expect(mockDispatchEvent).not.toHaveBeenCalled()
        })

        it('should not dispatch custom event when dispatchEventFlag is undefined and no mobile app is available', () => {
            service.sendDataAppToClient(testEventName, testData)

            expect(mockDispatchEvent).not.toHaveBeenCalled()
        })

        it('should prioritize Android app over iOS app when both are available', () => {
            const mockAndroidFunction = jest.fn()
            const mockPostMessage = jest.fn();

            (window as any).appRef = {
                [testEventName]: mockAndroidFunction
            };
            (window as any).webkit = {
                messageHandlers: {
                    appRef: {
                        postMessage: mockPostMessage
                    }
                }
            }

            service.sendDataAppToClient(testEventName, testData)

            expect(mockAndroidFunction).toHaveBeenCalledWith(JSON.stringify(testData))
            expect(mockPostMessage).not.toHaveBeenCalled()
        })

        it('should not call Android function when function does not exist in appRef', () => {
            (window as any).appRef = {}
            const mockPostMessage = jest.fn();
            (window as any).webkit = {
                messageHandlers: {
                    appRef: {
                        postMessage: mockPostMessage
                    }
                }
            }

            service.sendDataAppToClient(testEventName, testData)

            expect(mockPostMessage).toHaveBeenCalledWith(
                JSON.stringify({ eventName: testEventName, data: testData })
            )
        })
    })
})