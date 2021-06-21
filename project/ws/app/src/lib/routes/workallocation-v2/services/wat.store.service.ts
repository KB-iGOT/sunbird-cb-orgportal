import { Injectable } from '@angular/core'
// tslint:disable
import _ from 'lodash'
// tslint:enable
import { BehaviorSubject, Observable } from 'rxjs'
import { NSWatActivity } from '../models/activity-wot.model'
import { NSWatCompetency } from '../models/competency-wat.model'
import { NSWatOfficer } from '../models/officer-wat.model'

@Injectable()
export class WatStoreService {
  private activitiesGroup = new BehaviorSubject<NSWatActivity.IActivityGroup[]>([])
  private competencyGroup = new BehaviorSubject<NSWatCompetency.ICompActivityGroup[]>([])
  private officerGroup = new BehaviorSubject<NSWatOfficer.IOfficerGroup[]>([])
  private _competencyGroup = new BehaviorSubject<NSWatCompetency.ICompActivity[]>([])
  private currentProgress = new BehaviorSubject<number>(0)
  private errorCount = new BehaviorSubject<number>(0)
  private finalCompDetail = new BehaviorSubject<NSWatCompetency.ICompActivity[]>([])
  private initCount = 100
  constructor() {

  }

  public get getactivitiesGroup(): Observable<NSWatActivity.IActivityGroup[]> {
    return this.activitiesGroup.asObservable()
  }
  setgetactivitiesGroup(data: NSWatActivity.IActivityGroup[]) {
    this.activitiesGroup.next(data)
  }
  public get getcompetencyGroup(): Observable<NSWatCompetency.ICompActivityGroup[]> {
    return this.competencyGroup.asObservable()
  }
  setgetcompetencyGroup(data: NSWatCompetency.ICompActivityGroup[]) {
    this.competencyGroup.next(data)
    this.setCompGroup()
  }
  updateCompGroup(val: NSWatCompetency.ICompActivity[]) {
    this.finalCompDetail.next(val)
  }
  public get getUpdateCompGroupO() {
    return this.finalCompDetail.asObservable()
  }
  public getUpdateCompGroupById(locallId: number) {
    return _.first(_.filter(this.finalCompDetail.value, { localId: locallId }))
  }

  setCompGroup() {
    const complist: NSWatCompetency.ICompActivity[] = []
    _.each(_.get(this.competencyGroup, 'value'), (itm: NSWatCompetency.ICompActivityGroup) => {
      if (itm && itm.competincies) {
        itm.competincies.forEach(a => {
          const existing = this.getUpdateCompGroupById(a.localId) || null
          if (existing && a.compName && (a.localId === existing.localId)) {
            const level = _.get(a, 'compLevel') || _.get(existing, 'compLevel')
            const compType = _.get(a, 'compType') || _.get(existing, 'compType')
            const compArea = _.get(a, 'compArea') || _.get(existing, 'compArea')
            const newA = { ...a, level, compType, compArea }
            complist.push(newA)
          } else {
            complist.push(a)
          }
        })
      }
    })
    this._competencyGroup.next(complist)
  }
  public get get_compGrp() {
    return this._competencyGroup.asObservable()
  }
  public get getOfficerGroup(): Observable<NSWatOfficer.IOfficerGroup[]> {
    return this.officerGroup.asObservable()
  }
  setOfficerGroup(data: NSWatOfficer.IOfficerGroup[]) {
    this.officerGroup.next(data)
  }
  public setCurrentProgress(progress: number) {
    this.currentProgress.next(progress)
  }
  public get getCurrentProgress(): Observable<number> {
    return this.currentProgress.asObservable()
  }
  public setErrorCount(count: number) {
    this.errorCount.next(count)
  }
  public get getErrorCount(): Observable<number> {
    return this.errorCount.asObservable()
  }
  public get getID() {
    // tslint:disable-next-line
    return ++this.initCount
  }

  clear() {
    this.activitiesGroup = new BehaviorSubject<NSWatActivity.IActivityGroup[]>([])
    this.competencyGroup = new BehaviorSubject<NSWatCompetency.ICompActivityGroup[]>([])
    this.officerGroup = new BehaviorSubject<NSWatOfficer.IOfficerGroup[]>([])
    this._competencyGroup = new BehaviorSubject<NSWatCompetency.ICompActivity[]>([])
    this.finalCompDetail = new BehaviorSubject<NSWatCompetency.ICompActivity[]>([])
    this.currentProgress = new BehaviorSubject<number>(0)
    this.errorCount = new BehaviorSubject<number>(0)
  }
}
