import {HttpParams} from '@angular/common/http';
import {ApiService} from './api.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
  }

  receviementAndPayment(): Observable<any> {
    return this.apiService.on('dashReceviementAndPayment', '', 'get-token');
  }

  banksAccounts(): Observable<any> {
    return this.apiService.on('banksAccounts', '', 'get-token');
  }

  cashFlow(): Observable<any> {
    return this.apiService.on('cashFlow', '', 'get-token');
  }

  appSalesCount(): Observable<any> {
    const params = new HttpParams()
      .set('userId', this.storageService.getAuth().user.people.id);
    return this.apiService.on('appSalesCount', '', 'get-token-params', params);
  }

  appSalesFlow(): Observable<any> {
    const params = new HttpParams()
      .set('userId', this.storageService.getAuth().user.people.id);
    return this.apiService.on('appSalesFlow', '', 'get-token-params', params);
  }
}
