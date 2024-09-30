import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private resource = 'product';

  constructor(
    private apiService: ApiService
  ) { }

  index(search: string, sorteBy?: string, orderBy?: string, page?: number, limit?: number): Observable<any> {
    const params = new HttpParams()
      .set('role', '0')
      .set('search', search)
      .set('sortedBy', sorteBy || 'name')
      .set('orderBy', orderBy || 'name')
      .set('page', page || '1')
      .set('shop', true)
      .set('limit', limit || '10');

    return this.apiService.on(this.resource, '', 'get-token-params', params);
  }
}
