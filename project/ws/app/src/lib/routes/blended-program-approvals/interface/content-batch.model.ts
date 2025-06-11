import { IAuthorData } from './author-card.model'

export interface IBatch {
  collectionId: any
  batchId: string
  createdFor: []
  endDate: string
  enrollmentEndDate: string
  enrollmentType: string
  name: string
  startDate: string
  status: number
  identifier?: string
  learners?: number
  newrequestsCount: any
  currentBatchSize: any
  batchAttributes: any
  learnersCount?: any
  primaryCategory: string
}

export interface IBatchUsersCount {
  batchId: string
  count?: number
  learners?: IAuthorData[]
  newrequests?: IAuthorData[]
  rejectedrequests?: IAuthorData[]
}
export interface IBatchLearnerProgress {
  batchId: string
  courseId: string
  userId: string
  firstName: string
  // lastName: string
  name: string
  profileImage: string
  email: string
  designation: string
  department: string
  completionPercentage: number | null
  issuedCertificates: IIssuedCertificates[]
  progress: number
  status: number

}

export interface IIssuedCertificates {
  identifier: string
  lastIssuedOn: string
  name: string
  token: string
}
