import {HttpParams} from '@angular/common/http';
import {ApiService} from './api.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private resource = 'sale';

  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {

  }

  index(search: string, date?: any, sorteBy?: string, orderBy?: string, page?: string, limit?: string, product?: boolean): Observable<any> {
    const params = new HttpParams()
      .set('role', '1')
      .set('search', search)
      .set('date', date)
      .set('sortedBy', sorteBy || '')
      .set('orderBy', orderBy || '')
      .set('page', page || '')
      .set('userId', this.storageService.getAuth().user.people.id || '')
      .set('limit', limit || '')
      .set('product', product || false);

    return this.apiService.on(this.resource, '', 'get-token-params', params);
  }

  store(body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}`, body, 'post-token');
  }

  show(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, '', 'get-token');
  }

  update(id: string, body: Object): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, body, 'put-token');
  }

  destroy(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, '', 'delete-token');
  }

  save(id: string, body: Object): Observable<any> {
    return id === 'new' ? this.store(body) : this.update(id, body);
  }
}
