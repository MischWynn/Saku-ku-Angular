import { Injectable, inject } from '@angular/core';
import { Users } from '../interface/model/model';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {

  private http = inject(HttpClient);
  private apiUrl = 'https://dummyjson.com/users';

  getAllUsers(): Observable<Users[]>{
    return this.http.get<{ users: Users[]}>(this.apiUrl).pipe(
      map(response => response.users)
    );
  }

  getUserById(id: number): Observable<Users> {
    return this.http.get<Users>(`${this.apiUrl}/${id}`);
  }

}
