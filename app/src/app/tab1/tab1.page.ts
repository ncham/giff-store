import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { FileManagerService } from '../services/file-manager.service';
import { GiphyService } from '../services/giphy.service';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private giphyService: GiphyService,
    private fileManagerService: FileManagerService) { }

  imageurl = "";
  stateFlag = true;
  giphySearchData: any = null;

  search(target?: EventTarget | null) {
    let targetElement = target as HTMLInputElement
    if (target && targetElement.value) {
      const value = targetElement.value
      this.giphyService.search(value).subscribe((data: any) => {
        this.giphySearchData = data?.data
        console.log(this.giphySearchData?.length)
        console.log(this.giphySearchData)

        // console.log(data.data[1].images.preview_gif.url)
        // this.imageurl = data.data[2].images.downsized.url;
      });
    }
  }

  downloadGif(image: any, target: EventTarget | null) {
    let targetElement = target as HTMLInputElement
    targetElement.style.display = 'none';

    this.fileManagerService.download(image.images.original.url, image.id);
    console.log(image)
  }

  onIonInfinite(ev: Event) {
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  toggleTab(flag: boolean) {
    this.stateFlag = flag;
  }

}
