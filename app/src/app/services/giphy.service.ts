import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GiphyService {

  constructor(private httpClient: HttpClient) { }

  /**
   * Search images from GIPHY
   * @param value 
   * @param limit 
   * @param offset 
   * @returns 
   */
  search(value: string, limit = 10, offset = 0): Observable<any> {
    let giphyApiUrl = "https://api.giphy.com/v1/gifs/search";

    let queryParams = new HttpParams();
    queryParams = queryParams.append("api_key", "ymwnFbnizeLvqPVxZZ6QA2S9dZKboJrb");
    queryParams = queryParams.append("q", value);
    queryParams = queryParams.append("limit", limit);
    queryParams = queryParams.append("offset", offset);

    return this.httpClient.get(giphyApiUrl, { params: queryParams });
  }

}
