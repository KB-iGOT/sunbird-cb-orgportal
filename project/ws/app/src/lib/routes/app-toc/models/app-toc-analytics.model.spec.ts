import { NsAnalytics } from './app-toc-analytics.model'

describe('NsAnalytics interfaces', () => {
  it('should create a valid IObjPair object', () => {
    const pair: NsAnalytics.IObjPair = { key: 'video', value: 42 }
    expect(pair.key).toBe('video')
    expect(pair.value).toBe(42)
  })

  it('should create a valid IAnalyticsResponse shell object', () => {
    const response: Partial<NsAnalytics.IAnalyticsResponse> = {
      total: 100,
      trainingHours: 50,
      indexedOn: '2023-01-01',
      updatedOn: '2023-06-01',
    }
    expect(response.total).toBe(100)
    expect(response.trainingHours).toBe(50)
    expect(response.indexedOn).toBe('2023-01-01')
  })
})
