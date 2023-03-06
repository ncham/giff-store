import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { FileManagerService } from '../services/file-manager.service';
import { GiphyService } from '../services/giphy.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private giphyService: GiphyService,
    private fileManagerService: FileManagerService,
    private alertController: AlertController) { }

  imageurl = "";
  stateFlag = true;
  giphySearchData: any = null;
  savedPhotos: any = null;
  savedPhotosDefault: any = null
  sortBy = ""
  order = 1

  ngOnInit() {
    this.fileManagerService.loadSavedGifs().then(data => {
      console.log(data)
      this.savedPhotos = data;
      this.savedPhotosDefault = data;
    });
  }

  searchFromGiphy(target?: EventTarget | null) {
    let targetElement = target as HTMLInputElement
    if (target && targetElement.value) {
      const value = targetElement.value

      // this.giphyService.search(value).subscribe((data: any) => {
      //   this.giphySearchData = data?.data
      //   console.log(this.giphySearchData?.length)
      //   console.log(this.giphySearchData)
      // });

      this.fileManagerService.searchFromGiphy(value)
        .subscribe(data =>
          this.giphySearchData = data
        )
    }
  }

  async searchFromDevice(target: EventTarget | null) {
    let value = (target as HTMLInputElement).value

    if (value) {
      this.savedPhotos = await this.fileManagerService.filterGifs(this.savedPhotosDefault, value)
      console.log(this.savedPhotos)
    } else {
      this.savedPhotos = this.savedPhotosDefault.slice();
    }
  }

  async downloadGif(image: any, target: EventTarget | null) {
    const alert = await this.alertController.create({
      header: 'Please enter filename',
      buttons: [{ text: 'OK', role: 'ok' }, { text: 'Cancel', role: 'cancel' }],
      inputs: [{ placeholder: 'Filename', value: image.title },],
    });

    await alert.present();
    alert.onDidDismiss().then(async data => {
      if (data.role == 'ok') {
        let fileName = data.data.values[0]
        if (fileName) {
          await this.fileManagerService.storeImage(image.images.original.url, image.id, fileName);

          this.savedPhotos = this.fileManagerService.savedPhotosDefault
          console.log(this.fileManagerService.savedPhotosDefault)

          let targetElement = target as HTMLInputElement
          targetElement.style.display = 'none';
        }
      }
    })

    console.log(image)
  }

  handleSortByChange($e: Event) {
    const value = ($e as CustomEvent).detail.value

    if (value) {
      this.fileManagerService.sortGifs(this.savedPhotos, value, this.order)
    } else {
      this.savedPhotos = this.savedPhotosDefault.slice();
    }
  }

  handleOrderChange($e: Event) {
    const value = ($e as CustomEvent).detail.value

    if (this.sortBy && value) {
      this.fileManagerService.sortGifs(this.savedPhotos, this.sortBy, value)
    }
  }

  onIonInfinite(ev: Event) {
    this.fileManagerService.loadNextBatch().subscribe(data => {

      console.log(this.giphySearchData)
      let xx = Object.assign(this.giphySearchData, data)
      console.log(data)
      console.log(xx)
    })
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  toggleTab(flag: boolean) {
    this.stateFlag = flag;
  }


}
