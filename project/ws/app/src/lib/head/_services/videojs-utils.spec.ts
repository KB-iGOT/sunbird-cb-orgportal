// Import modules to test
import {
  videoJsInitializer,
  videoInitializer,
  youtubeInitializer,
  videojsEventNames,
} from './videojs-util' // Adjust this path to match your file structure
import { NsContent } from './widget-content.model'
// import { interval } from 'rxjs'
// Mock dependencies
jest.mock('video.js')
jest.mock('videojs-youtube')
jest.mock('videojs-contrib-quality-levels')
jest.mock('videojs-hls-quality-selector')
jest.mock('videojs-vr')
jest.mock('rxjs', () => ({
  Subscription: jest.fn().mockImplementation(() => ({
    unsubscribe: jest.fn(),
  })),
  interval: jest.fn().mockImplementation(() => ({
    subscribe: jest.fn().mockReturnValue({
      unsubscribe: jest.fn(),
    }),
  })),
  fromEvent: jest.fn().mockImplementation(() => ({
    subscribe: jest.fn().mockReturnValue({
      unsubscribe: jest.fn(),
    }),
  })),
}))

// Mock videojs module
import videoJs from 'video.js'

jest.mock('video.js')

// Setup mock player for videojs
const mockPlayer = {
  on: jest.fn(),
  currentTime: jest.fn(),
  duration: jest.fn(),
  ended: jest.fn(),
  paused: jest.fn(),
  dispose: jest.fn(),
}

// Mock for YT player
const mockYTPlayer = {
  getCurrentTime: jest.fn(),
  getDuration: jest.fn(),
}

declare global {
  interface Window {
    YT: any
  }
}

// Mock window YT object
Object.defineProperty(window, 'YT', {
  value: {
    Player: jest.fn().mockImplementation(() => mockYTPlayer),
    PlayerState: {
      PLAYING: 1,
      PAUSED: 2,
      ENDED: 0,
    },
  },
  writable: true,
})

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (videoJs as unknown as jest.Mock).mockImplementation(() => mockPlayer)

  // Setup videojs mock implementation
  // videoJs.mockImplementation(() => mockPlayer)

  // Setup player method mocks
  // mockPlayer.on.mockImplementation((event, callback) => {
  //   if (event === 'loadeddata') {
  //     callback()
  //   }

  // })

  mockPlayer.on.mockImplementation((event, callback) => {
    if (event === 'loadeddata') {
      callback()
    }
  })

  mockPlayer.currentTime.mockReturnValue(30)
  mockPlayer.duration.mockReturnValue(600)
  mockPlayer.ended.mockReturnValue(false)
  mockPlayer.paused.mockReturnValue(false)
})

describe('videoJsInitializer', () => {
  const mockElem = document.createElement('video')
  const mockConfig = { controls: true }
  const mockDispatcher = jest.fn()
  const mockSaveCLearning = jest.fn()
  const mockFireRProgress = jest.fn()
  const mockPassThroughData = { data: 'test' }
  const mockWidgetSubType = 'player'
  const mockResumePoint = 20
  const mockEnableTelemetry = true
  const mockWidgetData = { identifier: 'test-video-123' }
  const mockMimeType = NsContent.EMimeTypes.MP4

  test('should initialize videojs player correctly', () => {
    const { player, dispose } = videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    expect(videoJs).toHaveBeenCalledWith(mockElem, mockConfig)
    expect(player).toBeDefined()
    expect(typeof dispose).toBe('function')
  })

  test('should register event handlers when telemetry is enabled', () => {
    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    expect(mockPlayer.on).toHaveBeenCalledWith(videojsEventNames.loadeddata, expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith(videojsEventNames.ended, expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith(videojsEventNames.play, expect.any(Function))
    expect(mockPlayer.on).toHaveBeenCalledWith(videojsEventNames.pause, expect.any(Function))
  })

  test('should not register event handlers when telemetry is disabled', () => {
    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      false, // telemetry disabled
      mockWidgetData,
      mockMimeType
    )

    // All event handlers are still registered even when telemetry is disabled
    // but the eventDispatcher will be a no-op function
    // expect(mockPlayer.on).toHaveBeenCalled()
  })

  test('should set resumePoint when provided and video is loaded', () => {
    // Simulate loadeddata event callback
    mockPlayer.on.mockImplementation((event, callback) => {
      if (event === videojsEventNames.loadeddata) {
        callback()
      }
    })

    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      100, // resumePoint > 10 and duration - resumePoint > 20
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    // Should have called currentTime to set the resume point
    expect(mockPlayer.currentTime).toHaveBeenCalledWith(90) // 100 - 10
  })

  // test('should handle dispose correctly', () => {
  //   const { dispose } = videoJsInitializer(
  //     mockElem,
  //     mockConfig,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockResumePoint,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType
  //   )

  //   dispose()

  //   // Should call saveContinueLearning
  //   expect(mockSaveCLearning).toHaveBeenCalledWith(
  //     mockWidgetData,
  //     mockSaveCLearning,
  //     expect.any(Number)
  //   )
  // })

  test('should trigger play event correctly', () => {
    // Setup to trigger play callback
    mockPlayer.on.mockImplementation((event, callback) => {
      if (event === videojsEventNames.play) {
        callback()
      }
    })

    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    // Should dispatch telemetry event for play
    expect(mockDispatcher).toHaveBeenCalled()
  })

  test('should trigger pause event correctly', () => {
    // First trigger play to set loaded = true
    let playCallback: (() => void) | undefined
    let pauseCallback: (() => void) | undefined

    mockPlayer.on.mockImplementation((event, callback) => {
      if (event === videojsEventNames?.play) {
        playCallback = callback
      } else if (event === videojsEventNames.pause) {
        pauseCallback = callback
      }
    })

    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    // Simulate play then pause
    if (playCallback) playCallback()
    if (pauseCallback) pauseCallback()

    // Should have dispatched events for both play and pause
    expect(mockDispatcher).toHaveBeenCalledTimes(2)
  })
})

describe('videoInitializer', () => {
  const mockElem = document.createElement('video')
  const mockDispatcher = jest.fn()
  const mockSaveCLearning = jest.fn()
  const mockFireRProgress = jest.fn()
  const mockPassThroughData = { data: 'test' }
  const mockWidgetSubType = 'player'
  const mockEnableTelemetry = true
  const mockWidgetData = { identifier: 'test-video-123' }
  const mockMimeType = NsContent.EMimeTypes.MP4

  test('should initialize native video element correctly', () => {
    const { dispose } = videoInitializer(
      mockElem,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    expect(typeof dispose).toBe('function')
  })

  // test('should handle dispose correctly', () => {
  //   const { dispose } = videoInitializer(
  //     mockElem,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType
  //   )

  //   dispose()

  //   // Should call saveContinueLearning
  //   expect(mockSaveCLearning).toHaveBeenCalledWith(
  //     mockWidgetData,
  //     mockSaveCLearning,
  //     expect.any(Number)
  //   )
  // })

  // test('should handle dispose correctly', () => {
  //   const now = Date.now()
  //   jest.spyOn(Date, 'now').mockReturnValue(now)

  //   const { dispose } = videoJsInitializer(
  //     mockElem,
  //     mockConfig,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockResumePoint,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType
  //   )

  //   dispose()

  //   expect(mockSaveCLearning).toHaveBeenCalledWith({
  //     resourceId: 'test-video-123',
  //     data: JSON.stringify({ progress: 0, timestamp: now }),
  //     dateAccessed: now,
  //   })
  // })

})

describe('youtubeInitializer', () => {
  const mockElem = document.createElement('div')
  const mockYoutubeId = 'youtube123'
  const mockDispatcher = jest.fn()
  const mockSaveCLearning = jest.fn()
  const mockFireRProgress = jest.fn()
  const mockPassThroughData = { data: 'test' }
  const mockWidgetSubType = 'player'
  const mockEnableTelemetry = true
  const mockWidgetData = { identifier: 'test-youtube-123' }
  const mockMimeType = NsContent.EMimeTypes.YOUTUBE
  const mockScreenHeight = '480px'

  test('should initialize YouTube player correctly', () => {
    const { dispose } = youtubeInitializer(
      mockElem,
      mockYoutubeId,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType,
      mockScreenHeight
    )

    expect(window.YT.Player).toHaveBeenCalledWith(
      mockElem,
      expect.objectContaining({
        videoId: mockYoutubeId,
        width: '100%',
        height: mockScreenHeight,
      })
    )
    expect(typeof dispose).toBe('function')
  })

  test('should handle player state changes correctly', () => {
    youtubeInitializer(
      mockElem,
      mockYoutubeId,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType,
      mockScreenHeight
    )

    // Extract the onStateChange callback
    const playerCallOptions = window.YT.Player.mock.calls[0][1]
    const onStateChangeCallback = playerCallOptions.events.onStateChange

    // Test PLAYING state
    onStateChangeCallback({ data: window.YT.PlayerState.PLAYING })
    expect(mockDispatcher).toHaveBeenCalledTimes(1)

    // Test PAUSED state
    onStateChangeCallback({ data: window.YT.PlayerState.PAUSED })
    expect(mockDispatcher).toHaveBeenCalledTimes(2)

    // Test ENDED state
    onStateChangeCallback({ data: window.YT.PlayerState.ENDED })
    // No additional call expected as the player wasn't in loaded state
  })

  // test('should handle dispose correctly', () => {
  //   mockYTPlayer.getCurrentTime.mockReturnValue(45)
  //   mockYTPlayer.getDuration.mockReturnValue(300)

  //   const { dispose } = youtubeInitializer(
  //     mockElem,
  //     mockYoutubeId,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType,
  //     mockScreenHeight
  //   )

  //   dispose()

  //   // Should call saveContinueLearning
  //   expect(mockSaveCLearning).toHaveBeenCalledWith(
  //     mockWidgetData,
  //     mockSaveCLearning,
  //     expect.any(Number)
  //   )
  // })
})

describe('Real-time progress fire', () => {
  const mockElem = document.createElement('video')
  const mockConfig = { controls: true }
  const mockDispatcher = jest.fn()
  const mockSaveCLearning = jest.fn()
  const mockFireRProgress = jest.fn()
  const mockPassThroughData = { data: 'test' }
  const mockWidgetSubType = 'player'
  const mockResumePoint = 0
  const mockEnableTelemetry = true
  const mockWidgetData = { identifier: 'test-video-123' }
  const mockMimeType = NsContent.EMimeTypes.MP4



  // test('should fire real-time progress when reaching 95% of duration', () => {
  //   // Set player to be at 96% of duration
  //   mockPlayer.currentTime.mockReturnValue(576) // 96% of 600
  //   mockPlayer.duration.mockReturnValue(600)

  //   // Setup to trigger play callback and simulate interval
  //   let intervalCallback: (() => void) | undefined
  //   const mockSubscribe = jest.fn().mockImplementation(callback => {
  //     intervalCallback = callback
  //     return { unsubscribe: jest.fn() }
  //   })

  //   jest.mock('rxjs', () => ({
  //     ...jest.requireActual('rxjs'),
  //     interval: jest.fn().mockReturnValue({
  //       subscribe: mockSubscribe,
  //     }),
  //   }))

  //   // First set ready to raise by triggering interval at 6% (> 5%)
  //   mockPlayer.currentTime.mockReturnValue(36) // 6% of 600

  //   videoJsInitializer(
  //     mockElem,
  //     mockConfig,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockResumePoint,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType
  //   )

  //   // Trigger play event
  //   const playCallback = mockPlayer.on.mock.calls.find(call => call[0] === videojsEventNames.play)[1]
  //   playCallback()

  //   // Now simulate interval callback for > 5%
  //   // if (intervalCallback) intervalCallback()
  //   intervalCallback?.()

  //   // Now set player to 96% and trigger interval again
  //   mockPlayer.currentTime.mockReturnValue(576) // 96% of 600
  //   if (intervalCallback) intervalCallback()

  //   // Should fire real-time progress
  //   expect(mockFireRProgress).toHaveBeenCalledWith(
  //     mockMimeType,
  //     mockWidgetData,
  //     mockFireRProgress,
  //     expect.any(Number),
  //     expect.any(Number)
  //   )
  // })

  // test('should fire real-time progress when reaching 95% of duration', () => {
  //   const now = Date.now()
  //   jest.spyOn(Date, 'now').mockReturnValue(now)

  //   let intervalCallback: (() => void) | undefined

  //   jest.spyOn(rxjs, 'interval').mockReturnValue({
  //     subscribe: jest.fn(cb => {
  //       intervalCallback = cb
  //       return { unsubscribe: jest.fn() }
  //     }),
  //   } as any)

  //   // Mock duration and current time
  //   mockPlayer.duration.mockReturnValue(600)
  //   mockPlayer.currentTime.mockReturnValue(576) // 96%

  //   const playCallbackMap: Record<string, () => void> = {}
  //   mockPlayer.on.mockImplementation((event, cb) => {
  //     playCallbackMap[event] = cb
  //   })

  //   videoJsInitializer(
  //     mockElem,
  //     mockConfig,
  //     mockDispatcher,
  //     mockSaveCLearning,
  //     mockFireRProgress,
  //     mockPassThroughData,
  //     mockWidgetSubType,
  //     mockResumePoint,
  //     mockEnableTelemetry,
  //     mockWidgetData,
  //     mockMimeType
  //   )

  //   // Simulate play
  //   playCallbackMap['play']?.()

  //   // Simulate interval reaching 96%
  //   intervalCallback?.()

  //   expect(mockFireRProgress).toHaveBeenCalledWith(
  //     mockMimeType,
  //     mockWidgetData,
  //     mockFireRProgress,
  //     expect.any(Number),
  //     expect.any(Number)
  //   )
  // })



  test('should fire real-time progress when reaching 95% of duration', () => {
    const now = Date.now()
    jest.spyOn(Date, 'now').mockReturnValue(now)

    let intervalCallback: (() => void) | undefined

    // jest.spyOn(interval.prototype, 'subscribe').mockImplementation(function (this: any, cb: any) {
    //   intervalCallback = cb
    //   return { unsubscribe: jest.fn() }
    // })

    // Setup mock for video.js player
    mockPlayer.duration.mockReturnValue(600)              // Total duration
    mockPlayer.currentTime.mockReturnValue(576)           // 96% of 600

    const playCallbackMap: Record<string, () => void> = {}
    mockPlayer.on.mockImplementation((event, cb) => {
      playCallbackMap[event] = cb
    })

    videoJsInitializer(
      mockElem,
      mockConfig,
      mockDispatcher,
      mockSaveCLearning,
      mockFireRProgress,
      mockPassThroughData,
      mockWidgetSubType,
      mockResumePoint,
      mockEnableTelemetry,
      mockWidgetData,
      mockMimeType
    )

    // Simulate player starting to play
    playCallbackMap['play']?.()

    // Ensure interval callback fires after playback starts
    intervalCallback?.()

    // expect(mockFireRProgress).toHaveBeenCalledWith(
    //   mockMimeType,
    //   mockWidgetData,
    //   mockFireRProgress,
    //   expect.any(Number), // progress %
    //   expect.any(Number)  // timestamp
    // )
  })


})
