import { Component } from '@angular/core';
import { GiphySearchService } from '../services/giphy-search.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private giphySearchService: GiphySearchService) {}

  imageurl="";

  clickMe(){
    this.giphySearchService.search().subscribe((data: any) => {
      data.data.forEach((element: any) => {
          console.log(element)
      });
      console.log(data.data[1].images.preview_gif.url)
      this.imageurl = data.data[1].images.downsized.url;
    });
  }

}
