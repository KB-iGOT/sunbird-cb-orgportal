import { NsAppRating } from './rating.model'

describe('NsAppRating interfaces', () => {
  it('should create a valid IRating object', () => {
    const rating: NsAppRating.IRating = {
      activityId: 'course123',
      userId: 'user456',
      activityType: 'Course',
      rating: 5,
      review: 'Excellent course',
      recommended: true,
    }
    expect(rating.activityId).toBe('course123')
    expect(rating.userId).toBe('user456')
    expect(rating.activityType).toBe('Course')
    expect(rating.rating).toBe(5)
    expect(rating.review).toBe('Excellent course')
    expect(rating.recommended).toBe(true)
  })

  it('should create a valid ILookupRequest object without optional fields', () => {
    const req: NsAppRating.ILookupRequest = {
      activityId: 'course123',
      activityType: 'Course',
      limit: 10,
    }
    expect(req.activityId).toBe('course123')
    expect(req.activityType).toBe('Course')
    expect(req.limit).toBe(10)
    expect(req.rating).toBeUndefined()
    expect(req.updateOn).toBeUndefined()
  })

  it('should create a valid ILookupRequest object with optional fields', () => {
    const req: NsAppRating.ILookupRequest = {
      activityId: 'course123',
      activityType: 'Course',
      rating: 4,
      limit: 20,
      updateOn: '2023-01-01',
    }
    expect(req.rating).toBe(4)
    expect(req.limit).toBe(20)
    expect(req.updateOn).toBe('2023-01-01')
  })
})
