import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export function apicall<T> (this: any, method: string, url: string, headers: any = {}, body?: any): Observable<T> {

  const token = localStorage.getItem('token');
  if (token && token != null) {
    headers = {
      ...headers,
      Authorization: `Bearer ${token}`
    };
  } 

  let result: any;
  if (method === 'GET') {
    result = this.http.get(url, { headers });
  }else if (method === 'POST') {
    result = this.http.post(url, body, { headers });
  }else if (method === 'PUT') {
    result = this.http.put(url, body, { headers });
  }else {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

    return result;
}

//bedain untuk public endpoint sama protected endpoint -> di interceptor nanti dicek apakah ini request dari public endpoint atau protected endpoint, kalau protected endpoint maka token harus ada di local storage, kalau gaada maka redirect ke login page
//nanti harus bisa di parsing ke parameter 