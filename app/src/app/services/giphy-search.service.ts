import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GiphySearchService {

  constructor(private httpClient: HttpClient) { }

  search(): Observable<any> {
    //"https://api.giphy.com/v1/gifs/search?api_key=ymwnFbnizeLvqPVxZZ6QA2S9dZKboJrb&q=apple&limit=25&offset=0&rating=g&lang=en"
    let giphyApiUrl = "https://api.giphy.com/v1/gifs/search";

    let queryParams = new HttpParams();
    queryParams = queryParams.append("api_key", "ymwnFbnizeLvqPVxZZ6QA2S9dZKboJrb");
    queryParams = queryParams.append("q", "apple");
    queryParams = queryParams.append("limit", "10");

    // this.httpClient.get(giphyApiUrl, { params: queryParams }).subscribe((data: any) => {
    //   console.log(data.data);
    // })

    return this.httpClient.get(giphyApiUrl, { params: queryParams });
  }

}
