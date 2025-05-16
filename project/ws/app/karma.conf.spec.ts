const path = require('path')

// Mock the required modules
jest.mock('karma-jasmine', () => 'karma-jasmine-mock')
jest.mock('karma-chrome-launcher', () => 'karma-chrome-launcher-mock')
jest.mock('karma-jasmine-html-reporter', () => 'karma-jasmine-html-reporter-mock')
jest.mock('karma-coverage-istanbul-reporter', () => 'karma-coverage-istanbul-reporter-mock')
jest.mock('@angular-devkit/build-angular/plugins/karma', () => 'angular-karma-plugin-mock')
jest.mock('path', () => ({
  join: jest.fn(() => '../../../coverage/ws/app')
}))

// Import the karma config module
const karmaConfig = require('./karma.conf')

describe('Karma Configuration', () => {
  let config: any

  beforeEach(() => {
    // Create a mock config object with a set method
    config = {
      set: jest.fn()
    }

    // Call the exported function with our mock config
    karmaConfig(config)
  })

  it('should export a function', () => {
    expect(typeof karmaConfig).toBe('function')
  })

  it('should call config.set with the correct configuration', () => {
    expect(config.set).toHaveBeenCalledTimes(1)

    // Extract the config object passed to set()
    const configObj = config.set.mock.calls[0][0]

    // Test the basic properties
    expect(configObj.basePath).toBe('')
    expect(configObj.frameworks).toEqual(['jasmine', '@angular-devkit/build-angular'])
    expect(configObj.port).toBe(9876)
    expect(configObj.colors).toBe(true)
    expect(configObj.logLevel).toBe(config.LOG_INFO)
    expect(configObj.autoWatch).toBe(true)
    expect(configObj.browsers).toEqual(['Chrome'])
    expect(configObj.singleRun).toBe(false)
    expect(configObj.restartOnFileChange).toBe(true)
  })

  it('should configure the required plugins', () => {
    const configObj = config.set.mock.calls[0][0]

    expect(configObj.plugins).toEqual([
      'karma-jasmine-mock',
      'karma-chrome-launcher-mock',
      'karma-jasmine-html-reporter-mock',
      'karma-coverage-istanbul-reporter-mock',
      'angular-karma-plugin-mock'
    ])
  })

  it('should configure client settings correctly', () => {
    const configObj = config.set.mock.calls[0][0]

    expect(configObj.client).toEqual({
      clearContext: false
    })
  })

  it('should configure reporters correctly', () => {
    const configObj = config.set.mock.calls[0][0]

    expect(configObj.reporters).toEqual(['progress', 'kjhtml'])
  })

  it('should configure coverage reporter correctly', () => {
    const configObj = config.set.mock.calls[0][0]

    expect(configObj.coverageIstanbulReporter).toEqual({
      dir: '../../../coverage/ws/app',
      reports: ['html', 'lcovonly', 'text-summary'],
      fixWebpackSourcePaths: true
    })

    // Verify path.join was called with the correct arguments
    expect(path.join).toHaveBeenCalledWith(__dirname, '../../../coverage/ws/app')
  })
})