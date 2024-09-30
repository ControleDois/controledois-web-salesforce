import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private resource = 'company';

  constructor(
    private apiService: ApiService
  ) {
  }

  index(search: string, sorteBy?: string, orderBy?: string, page?: string, limit?: string): Observable<any> {
    const params = new HttpParams()
      .set('search', search)
      .set('sortedBy', sorteBy || 'name')
      .set('orderBy', orderBy || 'name')
      .set('page', page || '1')
      .set('limit', limit || '10');

    return this.apiService.on(this.resource, '', 'get-token-params', params);
  }

  show(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/${id}`, '', 'get-token');
  }

  select(id: string): Observable<any> {
    return this.apiService.on(`${this.resource}/select/${id}`, '', 'get-token');
  }
}
