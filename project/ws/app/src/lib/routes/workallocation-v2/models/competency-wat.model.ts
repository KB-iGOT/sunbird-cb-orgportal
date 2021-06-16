export namespace NSWatCompetency {
  export interface ICompActivity {
    localId: number
    compId: string
    compName: string
    compDescription: string
    compLevel?: string
    compType?: string
    compArea?: string
    // assignedTo: string
  }
  // In UI it's Role
  export interface ICompActivityGroup {
    roleId: string
    roleName: string
    roleDescription: string
    competincies: ICompActivity[]
  }
}
