import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GiphyService {

  constructor(private httpClient: HttpClient) { }

  /**
   * 
   * @param value 
   * @param limit 
   * @param offset 
   * @returns 
   */
  search(value: string, limit?: number, offset?: number): Observable<any> {
    let giphyApiUrl = "https://api.giphy.com/v1/gifs/search";

    let queryParams = new HttpParams();
    queryParams = queryParams.append("api_key", "ymwnFbnizeLvqPVxZZ6QA2S9dZKboJrb");
    queryParams = queryParams.append("q", value);
    queryParams = queryParams.append("limit", "11");
    queryParams = queryParams.append("offset", "2");

    return this.httpClient.get(giphyApiUrl, { params: queryParams });
  }

}
