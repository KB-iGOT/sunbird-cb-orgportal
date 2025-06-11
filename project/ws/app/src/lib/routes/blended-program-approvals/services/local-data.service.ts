import { Injectable } from '@angular/core'
import { Data } from '@angular/router'
import { BehaviorSubject } from 'rxjs'
import { IBatch, IBatchUsersCount } from '../interface/content-batch.model'
import { IAuthorData } from '../interface/author-card.model'
@Injectable({
  providedIn: 'root',
})
export class LocalDataService {
  contentTitle: BehaviorSubject<string> = new BehaviorSubject<string>('')
  content: BehaviorSubject<any> = new BehaviorSubject<any>(null)
  currentBatch: BehaviorSubject<IBatch | null> = new BehaviorSubject<IBatch | null>(null)
  batchUsers: BehaviorSubject<IBatchUsersCount[]> = new BehaviorSubject<IBatchUsersCount[]>([])
  currentUser: BehaviorSubject<IAuthorData | null> = new BehaviorSubject<IAuthorData | null>(null)
  batchDefaults: BehaviorSubject<any | null> = new BehaviorSubject<any | null>(null)
  batchCreated: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  constructor() {
  }
  initData(data: Data) {
    this.contentTitle.next(data ? data.name : '')
    this.content.next(data)
  }
  initBatch(data: IBatch) {
    this.currentBatch.next(data)
  }

  batchUsersCount(data: IBatchUsersCount) {
    let existingIdx = -1
    this.batchUsers.getValue().forEach((b, idx) => {
      if (b.batchId === data.batchId) {
        existingIdx = idx
      }
    })
    if (existingIdx >= 0) {
      const newLst = this.batchUsers.getValue()
      newLst[existingIdx] = data
      this.batchUsers.next(newLst)
    } else {
      const newLst = this.batchUsers.getValue()
      newLst.push(data)
      this.batchUsers.next(newLst)
    }
  }
  setCurrentUser(userObj: any) {
    this.currentUser.next(userObj)
  }
}
