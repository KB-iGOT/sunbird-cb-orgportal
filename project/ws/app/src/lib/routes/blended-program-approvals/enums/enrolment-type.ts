export enum IEnroleType {
  // Registration = 'Registration',
  Nomination = 'Nomination',
}
export enum IEnroleType2 {
  // Registration = 'Registration',
  // Nomination = 'Nomination',
  // SelectLearner = 'Select learner',
  BulkUploadLearner = 'Bulk upload learner',
}

export enum IRequestLearnerType {
  SelectLearnerRquest = 'Select learner Requests',
  BulkUploadLearnerRequest = 'Bulk upload learner Request',
}

export enum IBatchType {
  // Registration = 'Registration',
  // Nomination = 'Nomination',
  openBatch = 'Open Batch',
  closedBatch = 'Closed Batch',
}

export enum IQRCode {
  EnableQR = 'Enable QR',
  DisableQR = 'Disable QR',
}

export enum ISessionType {
  Offline = 'Offline',
  Online = 'Online',
}

export enum IUserProfileFields {
  existing = 'Available user filled iGOT profile',
  all = 'Full iGOT profile',
  custom = 'Custom iGOT profile',
}

export enum WFBlendedProgramApprovalTypes {
  ONE_STEP_PC = 'oneStepPCApproval',
  ONE_STEP_MDO = 'oneStepMDOApproval',
  TWO_STEP_MDO_PC = 'twoStepMDOAndPCApproval',
  TWO_STEP_PC_MDO = 'twoStepPCAndMDOApproval',
}
