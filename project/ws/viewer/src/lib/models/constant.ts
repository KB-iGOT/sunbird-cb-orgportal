export namespace NsContent {
  export interface IContinueLearningData extends IContent {
    continueData: any
  }

  export interface IContinueLearningDataReq {
    request: {
      userId: string | undefined,
      courseId: string,
      contentIds: string[],
      batchId: string | undefined | null
      fields?: string[]
      language?: string
    }
  }

  export interface IContent {
    platform?: any
    addedOn: string
    appIcon: string
    artifactUrl: string
    averageRating?: any
    // this will be used to content form enrollment user list
    batches?: any
    batch?: any
    body?: string
    certificationList?: IRelatedContentMeta[]
    certificationStatus?: TCertificationStatus
    certificationSubmissionDate?: string
    certificationUrl: string
    childNodes?: string[]
    children: IContent[]
    childrenClassifiers?: string[]
    clients?: IClient[]
    collections?: IContent[]
    completionPercentage?: number | null
    completionStatus?: number
    complexityLevel: string
    difficultyLevel: string
    contentId: string
    contentType: EContentTypes
    contentUrlAtSource: string
    creatorContacts: ICreator[]

    creatorDetails: ICreator[]
    creatorLogo: string
    creatorPosterImage: string
    creatorThumbnail: string

    curatedTags: string[]
    description: string
    displayContentType: EDisplayContentTypes // For UI
    downloadUrl?: string
    duration: number
    enrolledDate?: string
    exclusiveContent?: boolean
    expiryDate?: string
    equivalentCertifications?: IRelatedContentMeta[]
    hasAccess: boolean
    hasAssessment?: string
    idealScreenSize?: string
    identifier: string
    introductoryVideo?: string
    introductoryVideoIcon?: string
    learningTrack?: string
    isExternal: boolean
    isIframeSupported: 'Yes' | 'No' | 'Maybe'
    isInIntranet?: boolean
    keywords?: string[]
    kArtifacts?: IRelatedContentMeta[]
    lastContentAccessTime?: string
    lastUpdatedOn: string
    learningMode?: TLearningMode
    learningObjective: string
    labels?: string[]
    locale?: string
    hasTranslations?: { identifier: string; locale: string }[]
    isTranslationOf?: { identifier: string; locale: string }[]
    me_totalSessionsCount: number
    mediaType: string
    mimeType: EMimeTypes
    msArtifactDetails?: IMSArtifactDetails
    mode?: ETagType
    name: string
    nextCertificationAttemptDate?: string
    parent?: string
    playgroundInstructions?: string
    playgroundResources?: IResourcePlayground[]
    postContents?: IPrePostContent[]
    posterImage?: string
    preContents?: IPrePostContent[]
    preRequisites: string
    price?: {
      currency: string
      value: number
    }
    primaryCategory: EPrimaryCategory,
    proctorUrl?: string
    progress?: IMarkAsCompleteProgress
    publishedOn: string
    recentCertificationAttemptScore?: number
    recommendationReasons?: string[]
    region?: string[]
    registrationUrl?: string
    registrationInstructions?: string
    resourceCategory?: string[]
    resourceType: string
    size?: number
    skills: ISkill[]
    softwareRequirements?: IResourceDetail[]
    sourceName: string
    sourceShortName: string
    sourceIconUrl?: string
    sourceUrl?: string
    ssoEnabled?: boolean
    lastReadContentId?: string
    status:
    | 'Draft'
    | 'InReview'
    | 'QualityReview'
    | 'Reviewed'
    | 'Processing'
    | 'Live'
    | 'Deleted'
    | 'MarkedForDeletion'
    | 'Expired'
    subTitle?: string
    subTitles?: ISubtitle[]
    studyMaterials?: IRelatedContentMeta[]
    systemRequirements?: string[]
    tags: ITag[]
    topics: IContentTopic[]
    totalLikes?: { [key: string]: number }
    totalRating?: number
    track: ITrack[]
    uniqueLearners?: number
    viewCount?: { [key: string]: number }
    reason?: string // required for Knowledge board
    trainingLHubCount?: number // for LHub trainings
    verifiers?: {
      // required for External Certifications
      name: string
      email: string
      id: string
    }[]
    references?: { url: string; title: string }[]
    resumePage?: number // For player WebModule in UI
    [key: string]: any
    optionalReading: boolean
    additionalTags?: string[]
  }

  export interface IContentResponse {
    id: string,
    params: any,
    responseCode: string,
    result: {
      content: IContent
    },
    ts: string,
    ver: string
  }

  export interface IBatch {
    batchId: string,
    createdBy: string,
    endDate: string | null,
    enrollmentType: string,
    identifier: string,
    name: string,
    startDate: string,
    status: number
    cert_templates?: null
    collectionId: string
    courseId: string
    createdDate: string
    createdFor: string[]
    description?: null
    enrollmentEndDate: string | null
    id: string
    mentors?: string[] | null
    tandc?: null
    updatedDate?: string | null
  }

  export interface IBatchListResponse {
    content?: IBatch[]
    count?: number,
    enrolled?: boolean,
    workFlow?: {
      wfInitiated?: boolean
      batch?: any
      wfItem?: any
    },
  }

  export interface ICourse {
    active: true
    addedBy: string
    batch: IBatch
    batchId: string
    certificates: []
    collectionId: string
    completedOn: string | null
    completionPercentage: number | null
    completionStatus?: number
    content: IContent
    contentId: string
    contentStatus: any
    courseId: string
    courseLogoUrl: string
    courseName: string
    dateTime: number
    description: string
    enrolledDate: string
    issuedCertificates: []
    lastContentAccessTime?: string
    lastReadContentId?: string
    lastReadContentStatus: string | null,
    lrcProgressDetails: any,
    recent_language: string
    leafNodesCount: number
    progress: number
    status: number
    userId: string
  }

  export interface IContentMinimal {
    appIcon: string
    artifactUrl: string
    difficultyLevel: string
    contentType: EContentTypes
    description: string
    displayContentType?: EDisplayContentTypes
    duration: number
    identifier: string
    hasAccess?: boolean
    isInIntranet?: boolean
    learningMode?: TLearningMode
    mimeType: EMimeTypes
    name: string
    creatorDetails: ICreator[]
    creatorContacts: ICreator[]
    posterImage: string
    primaryCategory: EPrimaryCategory
    resourceType?: string
    totalRating?: number
  }

  export interface ICollectionHierarchyResponse {
    data: IContent
    hasMore: boolean
    totalContents: number
  }

  export interface IRelatedContentMeta {
    identifier: string
    name: string
  }

  type TCertificationStatus = 'ongoing' | 'passed' | 'canAttempt' | 'cannotAttempt'
  export type TLearningMode = 'Self-Paced' | 'Instructor-Led' | 'Open' | 'Closed'

  interface IMarkAsCompleteProgress {
    progressStatus: 'open' | 'started' | 'completed'
    showMarkAsComplete: boolean
    markAsCompleteReason: string
    progressSupported: boolean
    progress: number | null
  }

  interface ITag {
    id: string
    type: string
    value: string
  }
  interface IMSArtifactDetails {
    channelId: string
    videoId: string
  }
  interface IClient {
    displayName: string
    id: string
    name: string
  }
  interface ISubtitle {
    srclang: string
    label: string
    url: string
  }
  interface IPrePostContent {
    identifier: string
    name: string
  }
  interface IResourceDetail {
    title?: string
    url?: string
  }
  interface IResourcePlayground {
    appIcon: string
    artifactUrl: string
    identifier: string
    name: string
  }
  interface ITrack {
    id: string
    name: string
    status: string
    visibility: string
  }
  interface ISkill {
    id: string
    category: string
    skill: string
    name: string
  }
  export interface ICreator {
    id: string
    name: string
    email: string
  }
  export interface IContentTopic {
    identifier: string
    name: string
  }
  // API Based

  export interface IContact {
    id: string
    name: string
    email: string
  }

  export interface IViewerContinueLearningRequest {
    resourceId: string
    contextPathId: string
    data: string
    dateAccessed: number
    contextType?: string
  }
  /**
    * @deprecated Enum EContentTypes should not be used in future
    */
  export enum EContentTypes {
    PROGRAMV2 = 'Program',
    PROGRAM = 'Learning Path',
    CHANNEL = 'Channel',
    COURSE = 'Course',
    KNOWLEDGE_ARTIFACT = 'Knowledge Artifact',
    KNOWLEDGE_BOARD = 'Knowledge Board',
    LEARNING_JOURNEY = 'Learning Journeys',
    MODULE = 'CourseUnit',
    RESOURCE = 'Resource',
  }
  export enum EPrimaryCategory {
    PROGRAM = 'Program',
    COURSE = 'Course',
    MODULE = 'Course Unit',
    RESOURCE = 'Learning Resource',
    GOALS = 'GOALS',
    PLAYLIST = 'PLAYLIST',
    PRACTICE_RESOURCE = 'Practice Question Set',
    FINAL_ASSESSMENT = 'Course Assessment',
    COMP_ASSESSMENT = 'Competency Assessment',
    FTB_QUESTION = 'FTB Question',
    MTF_QUESTION = 'MTF Question',
    MULTIPLE_CHOICE_QUESTION = 'Multiple Choice Question',
    SINGLE_CHOICE_QUESTION = 'Single Choice Question',
    MANDATORY_COURSE_GOAL = 'Mandatory Course Goal',
    STANDALONE_ASSESSMENT = 'Standalone Assessment',
    BLENDED_PROGRAM = 'Blended Program',
    OFFLINE_SESSION = 'Offline Session',
    CURATED_PROGRAM = 'Curated Program',
    // following will not be available soon
    /**
     * @deprecated The type should not be used
     */
    KNOWLEDGE_ARTIFACT = 'Knowledge Artifact',
    /**
    * @deprecated The type should not be used
    */
    KNOWLEDGE_BOARD = 'Knowledge Board',
    /**
    * @deprecated The type should not be used
    */
    LEARNING_JOURNEY = 'Learning Journeys',
    /**
    * @deprecated The type should not be used
    */
    CHANNEL = 'Channel',
  }

  export enum ECourseCategory {
    INVITE_ONLY_PROGRAM = 'Invite-Only Program',
    MODERATED_PROGRAM = 'Moderated Program',
    BLENDED_PROGRAM = 'Blended Program',
    CURATED_PROGRAM = 'Curated Program',
    COURSE = 'Course',
    MODERATED_COURSE = 'Moderated Course',
    STANDALONE_ASSESSMENT = 'Standalone Assessment',
    MODERATED_ASSESSEMENT = 'Moderated Assessment',
    CASE_STUDY = 'Case Study',
    LEARNING_PATHWAY = 'Learning Pathway',
  }

  export enum WFBlendedProgramStatus {
    INITIATE = 'INITIATE',
    SEND_FOR_MDO_APPROVAL = 'SEND_FOR_MDO_APPROVAL',
    SEND_FOR_PC_APPROVAL = 'SEND_FOR_PC_APPROVAL',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN',
    REMOVED = 'REMOVED',
    WITHDRAW = 'WITHDRAW',
  }
  export enum WFBlendedProgramApprovalTypes {
    ONE_STEP_PC = 'oneStepPCApproval',
    ONE_STEP_MDO = 'oneStepMDOApproval',
    TWO_STEP_MDO_PC = 'twoStepMDOAndPCApproval',
    TWO_STEP_PC_MDO = 'twoStepPCAndMDOApproval',
  }

  export const WFSTATUS_MSG_MAPPING: any = {
    INITIATE: '',
    SEND_FOR_MDO_APPROVAL: 'BatchEnrollL1Msg',
    SEND_FOR_PC_APPROVAL: 'BatchEnrollL2Msg',
    APPROVED: 'BatchEnrollApprovedMsg',
    REJECTED: 'BatchEnrollRejectedMsg',
    WITHDRAWN: 'BatchEnrollWithdrawMsg',
    REMOVED: 'BatchEnrollRemoveMsg',
    EXPIRED: 'BatchListExpiredMsg',
  }

  export enum EResourcePrimaryCategories {
    LEARNING_RESOURCE = 'Learning Resource',
    PRACTICE_RESOURCE = 'Practice Question Set',
    FINAL_ASSESSMENT = 'Course Assessment',
    COMP_ASSESSMENT = 'Competency Assessment',
    OFFLINE_SESSION = 'Offline Session',
  }

  export enum EMiscPlayerSupportedCollectionTypes {
    PLAYLIST = 'Playlist',
  }
  export const PLAYER_SUPPORTED_COLLECTION_TYPES: string[] = [
    EPrimaryCategory.COURSE,
    EPrimaryCategory.MODULE,
    EPrimaryCategory.PROGRAM,
    EPrimaryCategory.CURATED_PROGRAM,
    EPrimaryCategory.BLENDED_PROGRAM,
    EPrimaryCategory.STANDALONE_ASSESSMENT,
    EMiscPlayerSupportedCollectionTypes.PLAYLIST,
  ]
  export const KB_SUPPORTED_CONTENT_TYPES: EPrimaryCategory[] = [
    EPrimaryCategory.COURSE,
    EPrimaryCategory.MODULE,
    EPrimaryCategory.PROGRAM,
    EPrimaryCategory.RESOURCE,
  ]
  export const PLAYLIST_SUPPORTED_CONTENT_TYPES: EPrimaryCategory[] = [
    EPrimaryCategory.COURSE,
    EPrimaryCategory.MODULE,
    EPrimaryCategory.PROGRAM,
    EPrimaryCategory.RESOURCE,
  ]
  export enum EMimeTypes {
    COLLECTION = 'application/vnd.ekstep.content-collection',
    ZIP = 'application/vnd.ekstep.html-archive',
    ZIP2 = 'application/vnd.ekstep.ecml-archive',
    HTML = 'application/html',
    HTML_TEXT = 'text/html',
    ILP_FP = 'application/ilpfp',
    IAP = 'application/iap-assessment',
    M4A = 'audio/m4a',
    MP3 = 'audio/mpeg',
    MP4 = 'video/mp4',
    M3U8 = 'application/x-mpegURL',
    INTERACTION = 'video/interactive',
    PDF = 'application/pdf',
    QUIZ = 'application/quiz',
    DRAG_DROP = 'application/drag-drop',
    HTML_PICKER = 'application/htmlpicker',
    WEB_MODULE = 'application/web-module',
    WEB_MODULE_EXERCISE = 'application/web-module-exercise',
    YOUTUBE = 'video/x-youtube',
    HANDS_ON = 'application/integrated-hands-on',
    RDBMS_HANDS_ON = 'application/rdbms',
    CLASS_DIAGRAM = 'application/class-diagram',
    CHANNEL = 'application/channel',
    COLLECTION_RESOURCE = 'resource/collection',
    APPLICATION_JSON = 'application/json',
    PRACTICE_RESOURCE = 'application/vnd.sunbird.questionset',
    FINAL_ASSESSMENT = 'application/vnd.sunbird.questionset',
    OFFLINE_SESSION = 'application/offline',
    // Added on UI Only
    CERTIFICATION = 'application/certification',
    PLAYLIST = 'application/playlist',
    TEXT_WEB = 'text/x-url',
    SURVEY = 'application/survey',
    QUESTION_SET = 'application/vnd.sunbird.questionset',
    QUESTION = 'application/vnd.sunbird.question',
    UNKNOWN = 'application/unknown',
  }
  export enum EDisplayContentTypes {
    ASSESSMENT = 'ASSESSMENT',
    STANDALONE_ASSESSMENT = 'STANDALONE ASSESSMENT',
    PRACTICE_RESOURCE = 'Practice Question Set',
    FINAL_ASSESSMENT = 'Course Assessment',
    AUDIO = 'AUDIO',
    CERTIFICATION = 'CERTIFICATION',
    CHANNEL = 'Channel',
    CLASS_DIAGRAM = 'CLASS_DIAGRAM',
    COURSE = 'COURSE',
    DEFAULT = 'DEFAULT',
    DRAG_DROP = 'DRAG_DROP',
    EXTERNAL_CERTIFICATION = 'EXTERNAL_CERTIFICATION',
    EXTERNAL_COURSE = 'EXTERNAL_COURSE',
    GOALS = 'GOALS',
    HANDS_ON = 'HANDS_ON',
    IAP = 'IAP',
    INSTRUCTOR_LED = 'INSTRUCTOR_LED',
    INTERACTIVE_VIDEO = 'INTERACTIVE_VIDEO',
    KNOWLEDGE_ARTIFACT = 'KNOWLEDGE_ARTIFACT',
    MODULE = 'MODULE',
    PDF = 'PDF',
    SURVEY = 'SURVEY',
    PLAYLIST = 'PLAYLIST',
    PROGRAM = 'PROGRAM',
    QUIZ = 'QUIZ',
    RESOURCE = 'RESOURCE',
    RDBMS_HANDS_ON = 'RDBMS_HANDS_ON',
    VIDEO = 'VIDEO',
    WEB_MODULE = 'WEB_MODULE',
    WEB_PAGE = 'WEB_PAGE',
    YOUTUBE = 'YOUTUBE',
    LINK = 'LINK',
    KNOWLEDGE_BOARD = 'Knowledge Board',
    LEARNING_JOURNEY = 'Learning Journeys',
    BLENDED_PROGRAM = 'BLENDED PROGRAM',
    CURATED_PROGRAM = 'CURATED PROGRAM',
  }
  // for UI
  export enum EFilterCategory {
    ALL = 'ALL',
    LEARN = 'LEARN',
    PRACTICE = 'PRACTICE',
    ASSESS = 'ASSESS',
  }

  // for UI
  export enum ETagType {
    NEWLY_ADDED = 'NEWLY ADDED',
  }

  export const UN_SUPPORTED_DATA_TYPES_FOR_NON_BATCH_USERS: string[] = [
    // this is comment now for enabling links in the toc page for enrolled users
    // EMimeTypes.QUIZ,
    // EMimeTypes.APPLICATION_JSON,
    // EMimeTypes.WEB_MODULE_EXERCISE,

  ]
  export const PUBLIC_SUPPORTED_CONTENT_TYPES: EMimeTypes[] = [
    EMimeTypes.APPLICATION_JSON,
    EMimeTypes.FINAL_ASSESSMENT,
    EMimeTypes.HTML,
    EMimeTypes.HTML_TEXT,
    EMimeTypes.ZIP,
    EMimeTypes.ZIP2,
    EMimeTypes.M4A,
    EMimeTypes.MP3,
    EMimeTypes.MP4,
    EMimeTypes.PDF,
    EMimeTypes.YOUTUBE,
    EMimeTypes.TEXT_WEB,
    EMimeTypes.SURVEY,
  ]

  export interface ICompentencyKeys {
    vKey: string
    vCompetencyArea: string
    vCompetencyAreaDescription: string
    vCompetencyTheme: string
    vCompetencySubTheme: string
  }
  export enum EContextLockingType {
    COURSE_ASSESSMENT_ONLY = 'Course Assessment Only'
  }

  export const ICON_TYPE = {
  program: 'library_books',
  course: 'book',
  learningModule: 'folder',
  certificate: 'chrome_reader_mode',
  externalContent: 'open_in_new',
  internalContent: 'input',
  html: 'web',
  zip: 'compress',
  pdf: 'picture_as_pdf',
  survey: 'pic_as_survey',
  youtube: 'subscriptions',
  assessment: 'assessment',
  quiz: 'assignment_turned_in',
  dragNDrop: 'swap_vertical_circle',
  htmlPicker: 'web_asset',
  handsOn: 'code',
  iap: 'assignment_late',
  audio: 'audiotrack',
  video: 'video_library',
  default: 'file_copy',
  emptyFile: 'insert_drive_file',
  channel: 'chrome_reader_mode',
  kBoard: 'amp_stories',
}

export const MIME_TYPE = {
  collection: 'application/vnd.ekstep.content-collection',
  ecml: 'application/vnd.ekstep.ecml-archive',
  ePub: 'application/epub',
  h5p: 'application/vnd.ekstep.h5p-archive',
  html: 'application/html',
  ilpfp: 'application/ilpfp',
  iap: 'application/iap-assessment',
  mp3: 'audio/mpeg',
  mp4: 'application/x-mpegURL',
  interaction: 'video/interactive',
  pdf: 'application/pdf',
  survey: 'application/survey',
  quiz: 'application/quiz',
  webm: 'video/webm',
  webModule: 'application/web-module',
  youtube: 'video/x-youtube',
  handson: 'application/integrated-hands-on',
  htmlPicker: 'application/htmlpicker',
  dragDrop: 'application/drag-drop',
}


  export type IContentType =
    | 'Program'
    | 'Collection'
    | 'Course'
    | 'Resource'
    | 'Knowledge Artifact'
    | 'Knowledge Board'
    | 'Channel'
  export interface IContentMeta {
    accessPaths: string[]
    identifier: string
    transcoding: any
    bannerColor: string /*new*/
    name: string
    scoreType: string
    projectCode: string
    fileType: string
    description: string
    keywords: string[]
    additionalDownloadLink: string
    loadingMessage: string
    appIcon: string
    grayScaleAppIcon: string
    thumbnail: string
    contentLanguage: string[]
    plagScan: string
    mediaType: string
    subTitle: string
    contentDescription: string
    expiryDate: string
    locale: string
    isExternalCourse: boolean
    exclusiveContent: boolean
    courseType: 'Instructor-Led' | 'Self Paced'
    contentType: IContentType
    category: IContentType
    visibility: string
    posterImage: string
    language: string[]
    resourceType: string
    categoryType: string
    introductoryVideo: string
    introductoryVideoIcon: string
    isInIntranet: boolean
    msArtifactDetails: IMsArtifacts[]
    idealScreenSize: string
    sourceShortName: string
    sourceName: string
    sourceUrl: string
    playgroundInstructions: string
    registrationInstructions: string
    playgroundResources: any[]
    sourceIconUrl: string
    contentIdAtSource: string
    contentUrlAtSource: string
    extractedTextForSearch: string
    transcript: string
    unit: string
    trackOwner: string
    isIframeSupported: 'Yes' | 'No' | 'MayBe'
    trackContacts: IAuthorDetails[]
    catalogPaths: string[]
    isExternal: boolean
    skills: ISkill[]
    learningObjective: string
    preRequisites: string
    interactivityLevel: string
    complexityLevel: string
    audience: string[]
    duration: number
    size: number
    mimeType: string
    minLexVersion: string
    minOsVersion: number
    os: string[]
    checksum: string
    downloadUrl: string
    artifactUrl: string
    pkgVersion: string
    developer: string
    license: string
    competencies: string
    attributions: string[]
    copyright: string[]
    creator: string
    creatorDetails: IAuthorDetails[]
    portalOwner: string
    creatorContacts: IAuthorDetails[]
    submitterDetails: IAuthorDetails
    me_averageInteractionsPerMin: number
    me_totalSessionsCount: number
    me_totalTimespent: number
    me_averageTimespentPerSession: number
    me_totalDevices: number
    me_totalInteractions: number
    me_averageSessionsPerDevice: number
    me_totalSideloads: number
    me_totalComments: number
    me_totalRatings: number
    me_totalDownloads: number
    me_averageRating: number
    publisher: string
    region: string
    publisherDetails: IAuthorDetails[]
    owner: string
    collaborators: string[]
    collaboratorsDetails: IAuthorDetails[]
    voiceCredits: string
    soundCredits: string
    imageCredits: string
    forkable: boolean
    translatable: boolean
    templateType: string
    domain: string
    versionCreatedBy: string
    versionDate: string
    versionKey: string
    lastUpdatedOn: string
    lastUpdatedBy: string
    status: string
    releaseNotes: string
    certificationUrl: string
    preContents: IInternalReference[]
    postContents: IInternalReference[]
    systemRequirements: string[]
    softwareRequirements: IExternalReference[]
    etaTrack: string
    references: IExternalReference[]
    isStandAlone: boolean
    passPercentage: number
    isContentEditingDisabled: boolean
    isMetaEditingDisabled: boolean
    publicationId: string
    subTitles: ISubTitle[]
    isExternalCertificate: boolean
    concepts: IConcept[]
    collections: IDependentContent[]
    children: IContentMeta[]
    certificationList: any[]
    accessibility: string[]
    microsites: string[]
    comments: IComments[]
    stageIcons: string
    editorState: string
    hasAssessment: string
    isRejected: boolean
    resourceCategory: string[]
    customClassifiers: string[]
    clients: IClient[]
    body: string
    org: string[]
    dimension: string
    editors: IAuthorDetails[]
    equivalentCertifications: IInternalReference[]
    kArtifacts: IInternalReference[]
    learningTrack: string
    learningMode: string
    nodeType: string
    verifiers: IAuthorDetails[]
    studyMaterials: IInternalReference[]
    studyDuration: number
    sampleCertificates: IInternalReference[]
    creatorLogo: string
    creatorPosterImage: string
    creatorThumbnail: string
    maskedPhone: string
    rootOrgName: string
    subject: string[]
    channel: string
    updatedDate: string
    managedBy: string
    flagsValue: number
    id: string
    recoveryEmail: string
    profileVisibility: string
    updatedBy: string
    accesscode: string
    locationIds: string[]
    externalIds: string[]
    registryId: string
    rootOrgId: string
    prevUsedEmail: string
    firstName: string
    tncAcceptedOn: string
    phone: string
    dob: string
    grade: string[]
    currentLoginTime: string
    userType: string
    lastName: string
    gender: string
    roles: string[]
    prevUsedPhone: string
    stateValidated: boolean
    isDeleted: boolean
    organisations: IOrganisations[]
    countryCode: string
    maskedEmail: string
    tempPassword: string
    email: string
    rootOrg: IRootOrg
    profileSummary: string
    phoneVerified: boolean
    recoveryPhone: string
    userName: string
    userId: string
    lastLoginTime: string
    emailVerified: boolean
    framework: {}
    createdDate: string
    createdBy: string
    location: string
    tncAcceptedVersion: string
    primaryCategory: string
  }

  

  export interface ILanguage {
    label: string
    srclang: string
  }

  export interface IAuthorDetails {
    id: string
    name: string
  }

  export interface IComments {
    date: string
    name: string
    email: string
    comment: string
    action: string
  }

  export interface ISubTitle {
    url: string
    label: string
    srclang: string
  }

  export interface IExternalReference {
    title: string
    url: string
  }

  export interface IInternalReference {
    name: string
    identifier: string
  }

  export interface IMsArtifacts {
    videoId: string
    channelId: string
  }

  export interface ICatalog {
    id: string
    type: string
    value: string
  }


  export interface IConcept {
    identifier: string
    name: string
    objectType: string
    relation: string
    description: string
    index: string
    status: string
    depth: string
    mimeType: string
    visibility: string
    compatibilityLevel: string
  }

  export interface IDependentContent {
    identifier: string
    name: string
    objectType: string
    relation: string
    description: string
    index: string
    status: string
    depth: string
    mimeType: string
    visibility: string
    compatibilityLevel: string
  }

  export interface IContentMetaV2 {
    id: string
    ver: string
    ts: string
    params: {
      resmsgid: string
      msgid: string
      status: string
      err?: string
      errmsg?: string
    },
    responseCode: string
    result: {
      content: IContentMeta
    }
  }

  export interface IOrganisations {
    updatedBy: string
    organisationId: string
    orgName: string
    addedByName: string
    addedBy: string
    roles: string[]
    approvedBy: string
    updatedDate: string
    approvaldate: string
    isDeleted: boolean
    parentOrgId: string
    hashTagId: string
    isRejected: boolean
    position: string
    id: string
    orgjoindate: string
    isApproved: boolean
    orgLeftDate: string
  }

  export interface IRootOrg {
    dateTime: string
    preferredLanguage: string
    keys: {}
    channel: string
    approvedBy: string
    description: string
    updatedDate: string
    addressId: string
    orgType: string
    provider: string
    orgCode: string
    locationId: string
    theme: string
    id: string
    isApproved: boolean
    communityId: string
    slug: string
    email: string
    isSSOEnabled: boolean
    thumbnail: string
    updatedBy: string
    orgName: string
    locationIds: string[]
    externalId: string
    isRootOrg: boolean
    rootOrgId: string
    imgUrl: string
    approvedDate: string
    orgTypeId: string
    homeUrl: string
    isDefault: boolean
    createdDate: string
    contactDetail: string
    parentOrgId: string
    createdBy: string
    hashTagId: string
    noOfMembers: string
    status: number
  }

  


}
