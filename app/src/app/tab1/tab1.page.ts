import { Component } from '@angular/core';
import { InfiniteScrollCustomEvent, ItemReorderEventDetail, LoadingController } from '@ionic/angular';
import { FileManagerService } from '../services/file-manager.service';
import { AlertController } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import * as constant from '../constants/constants';
import { GifItem } from '../interfaces/gif-item';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private alertController: AlertController,
    private storageService: StorageService,
    private loadingController: LoadingController,
    public fileManagerService: FileManagerService) { }

  stateFlag = true;
  giphySearchData: any | null = null;
  savedPhotos: GifItem[] | null = null;
  searchValue = ""
  sortBy = ""
  order = 1
  isDisabled = true


  ngOnInit() {
    this.fileManagerService.loadSavedGifs().then(async (data: GifItem[] | null) => {
      this.savedPhotos = data;

      //Get last sort by
      this.sortBy = await this.storageService.get(constant.storage_key.last_sort_by)
      this.order = await this.storageService.get(constant.storage_key.last_order) ?? 1
      this.refreshGifs()
    });
  }

  /**
   * Search gif images from GIPHY
   * @param target 
   */
  searchFromGiphy(target?: EventTarget | null) {
    let targetElement = target as HTMLInputElement
    if (target && targetElement.value) {
      const value = targetElement.value

      this.fileManagerService.searchFromGiphy(value)
        .subscribe(data => {
          this.giphySearchData = data
          console.log(data)
        })
    }
  }

  /**
   * Download gif from GIPHY
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

          const loading = await this.loadingController.create();
          loading.present();

          //Save the gif file on device
          await this.fileManagerService.saveGif(image.images.downsized.url, image.id, fileName);
          loading.dismiss()

          this.savedPhotos = this.fileManagerService.savedFilesAll
          this.refreshGifs()
        }
      }
    })
  }

  /**
   * Event
   * Handle custom reorder
   * @param ev 
   */
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    if (this.savedPhotos) {
      this.savedPhotos = ev.detail.complete(this.savedPhotos);
    }

    this.fileManagerService.storeCustomOrder(this.savedPhotos)
  }

  /**
   * Event
   * Search items in the device
   * @param target 
   */
  searchFromDeviceEvent(target: EventTarget | null) {
    let value = (target as HTMLInputElement).value
    this.searchValue = value as string
    this.isDisabled = this.sortBy !== 'custom' || (this.sortBy == 'custom' && this.searchValue !== "")

    this.refreshGifs()
  }

  /**
   * Event
   * Sort items by sort order
   * @param $e 
   */
  handleSortByChange($e: Event) {
    const value = ($e as CustomEvent).detail.value
    this.isDisabled = value !== 'custom' || (value == 'custom' && this.searchValue !== "")
    this.storageService.set(constant.storage_key.last_sort_by, this.sortBy)

    this.refreshGifs()
  }

  /**
   * Event
   * Arrange items according to the order
   * @param $e 
   */
  handleOrderChange($e: Event) {
    this.order = (this.order == 1 ? 2 : 1);
    // const value = ($e as CustomEvent).detail.value
    this.storageService.set(constant.storage_key.last_order, this.order)

    this.refreshGifs()
  }

  /**
   * Refresh gif images and maintain the state
   */
  async refreshGifs() {
    this.savedPhotos = this.fileManagerService.savedFilesAll?.slice() ?? null

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
   * Event
   * When the screen is scrolled to bottom, next batch of gifs are loaded from api
   * @param ev 
   */
  onIonInfinite(ev: Event) {
    if (this.giphySearchData) {
      this.fileManagerService.loadNextBatch().subscribe(data => {
        this.giphySearchData = this.giphySearchData ?? []
        this.giphySearchData = [...this.giphySearchData, ...data]
      })
      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    }else{
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }

  toggleTab(flag: boolean) {
    this.stateFlag = flag;
  }

}
