jest.mock('@ws-widget/collection', () => ({
  NsContent: {},
}), { virtual: true })

import { AppTocSessionsComponent } from './app-toc-sessions.component'

function makeSession(startDate: string, startTime: string) {
  return { startDate, startTime, title: `Session ${startDate}` }
}

describe('AppTocSessionsComponent', () => {
  let component: AppTocSessionsComponent

  beforeEach(() => {
    component = new AppTocSessionsComponent()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default empty sessionList', () => {
    expect(component.sessionList).toEqual([])
  })

  describe('ngOnInit', () => {
    it('should not throw when batchData is undefined', () => {
      component.batchData = undefined
      expect(() => component.ngOnInit()).not.toThrow()
      expect(component.sessionList).toEqual([])
    })

    it('should not set sessionList when batchData.content[0] is missing', () => {
      component.batchData = { content: [] }
      component.ngOnInit()
      expect(component.sessionList).toEqual([])
    })

    it('should not set sessionList when batchAttributes is missing', () => {
      component.batchData = { content: [{}] }
      component.ngOnInit()
      expect(component.sessionList).toEqual([])
    })

    it('should not set sessionList when sessionDetails_v2 is empty array', () => {
      component.batchData = {
        content: [{
          batchAttributes: { sessionDetails_v2: [] },
        }],
      }
      component.ngOnInit()
      expect(component.sessionList).toEqual([])
    })

    it('should set sessionList when sessionDetails_v2 has entries', () => {
      const sessions = [
        makeSession('2024-01-02', '10:00 AM'),
        makeSession('2024-01-01', '09:00 AM'),
      ]
      component.batchData = {
        content: [{
          batchAttributes: { sessionDetails_v2: sessions },
        }],
      }
      component.ngOnInit()
      expect(component.sessionList.length).toBe(2)
    })

    it('should sort sessions by startDate ascending', () => {
      const sessions = [
        makeSession('2024-03-01', '10:00 AM'),
        makeSession('2024-01-01', '09:00 AM'),
        makeSession('2024-02-01', '08:00 AM'),
      ]
      component.batchData = {
        content: [{
          batchAttributes: { sessionDetails_v2: sessions },
        }],
      }
      component.ngOnInit()
      expect(component.sessionList[0].startDate).toBe('2024-01-01')
      expect(component.sessionList[1].startDate).toBe('2024-02-01')
      expect(component.sessionList[2].startDate).toBe('2024-03-01')
    })

    it('should sort by startTime when two sessions have the same startDate', () => {
      const sessions = [
        makeSession('2024-01-01', '03:00 PM'),
        makeSession('2024-01-01', '09:00 AM'),
        makeSession('2024-01-01', '12:00 PM'),
      ]
      component.batchData = {
        content: [{
          batchAttributes: { sessionDetails_v2: sessions },
        }],
      }
      component.ngOnInit()
      expect(component.sessionList[0].startTime).toBe('09:00 AM')
      expect(component.sessionList[1].startTime).toBe('12:00 PM')
      expect(component.sessionList[2].startTime).toBe('03:00 PM')
    })

    it('should handle single session without error', () => {
      const sessions = [makeSession('2024-01-01', '10:00 AM')]
      component.batchData = {
        content: [{
          batchAttributes: { sessionDetails_v2: sessions },
        }],
      }
      component.ngOnInit()
      expect(component.sessionList.length).toBe(1)
    })
  })
})
