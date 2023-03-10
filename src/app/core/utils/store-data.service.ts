import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StoreDataService {
  private storeDataSubject = new BehaviorSubject<any>(null);
  private data = {}

  set(event: any) {
    this.data = {...this.data, ...event}
    this.storeDataSubject.next(this.data)
  }

  get() {
    return this.storeDataSubject.getValue();
  }

  clear() {
    this.data = null;
    this.storeDataSubject.next(this.data);
  }
}
