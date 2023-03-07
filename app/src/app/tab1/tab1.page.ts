import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent, ItemReorderEventDetail } from '@ionic/angular';
import { FileManagerService } from '../services/file-manager.service';
import { GiphyService } from '../services/giphy.service';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import * as constant from '../constants/constants';
import { timeStamp } from 'console';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private giphyService: GiphyService,
    public fileManagerService: FileManagerService,
    private alertController: AlertController,
    private storageService: StorageService) { }

  imageurl = "";
  stateFlag = true;
  giphySearchData: any = null;
  savedPhotos: any = null;
  searchValue = ""
  sortBy = ""
  order = 1
  isDisabled = true


  ngOnInit() {
    this.fileManagerService.loadSavedGifs().then(async data => {
      this.savedPhotos = data;

      //Get last sort by
      this.sortBy = await this.storageService.get(constant.storage_key.last_sort_by)
      this.order = await this.storageService.get(constant.storage_key.last_order)
      this.refreshGifs()
    });
  }


  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    this.savedPhotos = ev.detail.complete(this.savedPhotos);

    //this.storageService.set(constant.storage_key.gif_store, this.savedPhotos)
    this.fileManagerService.customOrderStore(this.savedPhotos)
  }


  /**
   * 
   * @param target 
   */
  searchFromGiphy(target?: EventTarget | null) {
    let targetElement = target as HTMLInputElement
    if (target && targetElement.value) {
      const value = targetElement.value

      this.fileManagerService.searchFromGiphy(value)
        .subscribe(data => {
          this.giphySearchData = data
        })
    }
  }

  /**
   * 
   * @param image 
   * @param target 
   */
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
          //Hide download button
          let targetElement = target as HTMLInputElement
          targetElement.style.display = 'none';

          await this.fileManagerService.saveGif(image.images.original.url, image.id, fileName);

          this.savedPhotos = this.fileManagerService.savedFilesAll
          this.refreshGifs()

        }
      }
    })
  }

  searchFromDeviceEvent(target: EventTarget | null) {
    let value = (target as HTMLInputElement).value
    this.searchValue = value as string
    this.isDisabled = this.sortBy !== 'custom' || (this.sortBy == 'custom' && this.searchValue !== "")

    this.refreshGifs()
  }

  handleSortByChange($e: Event) {
    const value = ($e as CustomEvent).detail.value
    this.isDisabled = (value !== 'custom')
    this.storageService.set(constant.storage_key.last_sort_by, this.sortBy)

    this.refreshGifs()
  }

  handleOrderChange($e: Event) {
    const value = ($e as CustomEvent).detail.value
    this.storageService.set(constant.storage_key.last_order, this.order)

    this.refreshGifs()
  }

  /**
   * Refresh 
   */
  async refreshGifs() {
    this.savedPhotos = this.fileManagerService.savedFilesAll.slice()

    if (this.searchValue) {
      this.savedPhotos = await this.fileManagerService.filterGifs(this.fileManagerService.savedFilesAll, this.searchValue)
    }

    if (this.sortBy) {
      this.fileManagerService.sortGifs(this.savedPhotos, this.sortBy, this.order)
    }

    if (this.sortBy && (this.sortBy == 'name' || this.sortBy == 'dateSaved') && this.order) {
      this.fileManagerService.sortGifs(this.savedPhotos, this.sortBy, this.order)
    }
  }

  /**
   * 
   * @param ev 
   */
  onIonInfinite(ev: Event) {
    this.fileManagerService.loadNextBatch().subscribe(data => {
      this.giphySearchData = this.giphySearchData ?? []
      this.giphySearchData = [...this.giphySearchData, ...data]
    })
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  toggleTab(flag: boolean) {
    this.stateFlag = flag;
  }

}
