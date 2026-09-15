export interface IUserGroupColumn {
  key: string
  displayName: string
  type: 'title' | 'text' | 'owner' | 'reach' | 'actions'
  sortable?: boolean
  sortField?: string
}

export interface IUserGroupAction {
  key?: string
  label: string
  icon?: string
  allowedRoles?: string[]
}

export interface IUserGroupsTableConfig {
  columns: IUserGroupColumn[]
  reachAction: IUserGroupAction
  rowActions: IUserGroupAction[]
  conditionLabel: { singular: string, plural: string }
  emptyStateText: string
  pageSize: number
  pageSizeOptions: number[]
}

export interface IRoleBanner {
  role?: string
  title: string
  description: string
}

export interface IUserGroupsConfig {
  mainHeading: string
  createButton: IUserGroupAction
  roleBanner: { icon: string, roles: IRoleBanner[], default: IRoleBanner }
  search: { filters: Record<string, any>, sortBy: string, sortOrder: 'asc' | 'desc' }
  table: IUserGroupsTableConfig
}

export interface IUserGroupSearchRequest {
  filters: Record<string, any>
  pageSize: number
  pageNumber: number
  sortBy: string
  sortOrder: string
}

export interface IUserGroupResult {
  usergroupid: string
  usergroupname: string
  criteria?: TUserGroupCondition[]
  orgid?: string
  status?: string
  createdby?: string
  updatedby?: string
  createddate?: string
  updateddate?: string
}

export interface IUserGroupSearchResponse {
  responseCode?: string
  result?: { count?: number, content?: IUserGroupResult[] }
}

export interface IUserGroupCriteria {
  criteriaKey: string
  criteriaValue: string[]
}

export interface IUserGroupReadResult {
  usergroupid: string
  usergroupname: string
  criteria?: IUserGroupCriteria[]
  orgid?: string
  status?: string
  createdby?: string
  updatedby?: string
  createddate?: string
  updateddate?: string
}

export interface IUserGroupReadResponse {
  responseCode?: string
  result?: IUserGroupReadResult
}

export interface IUserGroupCreateRequest {
  userGroupName: string
  criteria: IUserGroupCriteria[]
}

export interface IUserGroupCreateResponse {
  responseCode?: string
  result?: IUserGroupReadResult
}

export type TUserGroupCondition = IUserGroupCriteria | Record<string, string[]>

export interface IUserGroupReach {
  count: number
  checkedAt: string
}

export interface IUserSearchCountResponse {
  result?: { response?: { count?: number } }
}

export interface IUsableTrainingPlan {
  id: string
  reportingYear: string
  timeline: string
  title: string
  subtitle: string
  status: string
}

export interface IUseInPlanDialogData {
  groupId: string
  groupName: string
}

export interface IUserGroup {
  id: string
  name: string
  conditionCount: number
  criteria: TUserGroupCondition[]
  owner: string
  ownerRole?: string
  status?: string
  updatedOn?: string
}
