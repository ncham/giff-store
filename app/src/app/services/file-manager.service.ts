import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { Directory } from '@capacitor/filesystem/dist/esm/definitions';
import { Observable } from 'rxjs';
import { GiphyService } from './giphy.service';
import { StorageService } from './storage.service';
import { map, mergeMap } from 'rxjs/operators';
import * as constant from '../constants/constants';
import { GifItem } from '../interfaces/gif-item';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  private GIF_STORAGE: string = 'gif-store';

  private _savedFilesAll: GifItem[] | null = null;
  get savedFilesAll() {
    return this._savedFilesAll
  }
  set savedFilesAll(savedFilesAll) {
    this._savedFilesAll = savedFilesAll
  }

  private _giphySearchData: any | null = null;
  get giphySearchData() {
    return this._giphySearchData
  }
  set giphySearchData(giphySearchData) {
    this._giphySearchData = giphySearchData
  }

  limit = constant.api_call_gif_limit
  offset = 0
  searchValue: string = '';

  constructor(
    private storageService: StorageService,
    private giphyService: GiphyService) { }

  /**
   * Save gif on device
   * @param url 
   * @param imageId 
   * @param fileName 
   */
  async saveGif(url: string, imageId: string, fileName: string) {
    let savedFile = await this.download(url, fileName);
    let savedFiles = await this.storageService.get(constant.storage_key.gif_store) ?? [];

    if (savedFile) {
      let dateSavedLocale = new Date(Date.now()).toLocaleString()
      savedFiles.push({ imageId: imageId, savedLocation: savedFile.uri, fileName: fileName, dateSaved: Date.now(), dateSavedLocale: dateSavedLocale });

      await this.storageService.set(constant.storage_key.gif_store, savedFiles);
      await this.customOrderAddNew(imageId)

      this._savedFilesAll = savedFiles
      await this.setWebViewPath()
    }
  }

  /**
   * Search gif from GIPHY API
   * @param value 
   * @returns 
   */
  searchFromGiphy(value: string): Observable<any> {
    this.searchValue = value
    this.offset = 0
    return this.giphyService.search(value, this.limit, this.offset)
      .pipe(
        map(data => data.data),
        mergeMap(async data => this.isSavedFile(data)),
      )
  }

  /**
   * Load gif images from api by batch wise
   * @returns 
   */
  loadNextBatch() {
    this.offset = this.offset + this.limit
    return this.giphyService.search(this.searchValue, this.limit, this.offset)
      .pipe(
        map(data => data.data),
        mergeMap(async data => this.isSavedFile(data)),
      )
  }

  /**
   * Check whether the file is already saved in the device
   * @param data 
   * @returns 
   */
  isSavedFile = async (data: any) => {
    const savedFileData = await this.storageService.get(constant.storage_key.gif_store);
    const savedFileDataIds = savedFileData?.map((element: any) => element.imageId);

    return data.filter((item: any) => !savedFileDataIds?.includes(item.id));
  };

  /**
   * Load stored gifs on device
   * @param sortBy 
   * @param order 1:ASC, 2:DESC
   * @returns 
   */
  async loadSavedGifs(): Promise<GifItem[] | null> {
    let savedFileData = await this.storageService.get(constant.storage_key.gif_store) ?? [];

    this._savedFilesAll = savedFileData
    return await this.setWebViewPath()
  }

  /**
   * Set the image path from local storage
   * @returns 
   */
  setWebViewPath(): Promise<GifItem[] | null> {
    return new Promise(resolve => {
      this._savedFilesAll?.forEach(async (file: GifItem) => {
        Filesystem.readFile({
          path: file.savedLocation,
        }).then(readFile => {
          file.webviewPath = `data:image/gif;base64,${readFile.data}`;
        }).catch(e => {
          file.webviewPath = "../../assets/images/not_found.jpg"
        })
      });
      resolve(this._savedFilesAll)
    })
  }

  /**
   * Sort gifs collection
   * @param filesCollection 
   * @param sortBy 
   * @param order 1:ASC, 2:DESC
   * @returns 
   */
  sortGifs(filesCollection: GifItem[] | null, sortBy: string, order: number): Promise<GifItem[] | null> {

    return new Promise(async resolve => {
      //Sort by Name
      if (sortBy == 'name') {
        filesCollection?.sort((file1: GifItem, file2: GifItem) => {
          if (order == 1) {
            return file1.fileName.localeCompare(file2.fileName)
          } else if (order == 2) {
            return file2.fileName.localeCompare(file1.fileName)
          }
          else {
            return 0
          }
        })
        resolve(filesCollection)
      }

      //Sort by Date Saved
      if (sortBy == 'dateSaved') {
        filesCollection?.sort((file1: GifItem, file2: GifItem) => {
          if (order == 1) {
            return file1.dateSaved - file2.dateSaved
          } else if (order == 2) {
            return file2.dateSaved - file1.dateSaved
          } else {
            return 0;
          }
        })
        resolve(filesCollection)
      }

      //Sort by custom
      if (sortBy == 'custom') {
        let customOrder = await this.storageService.get(constant.storage_key.custom_order)
        // Sort the data based on the original order
        if (customOrder) {
          const sortedData = filesCollection?.sort((file1: GifItem, file2: GifItem) => {
            const file1Index = customOrder.indexOf(file1.imageId);
            const file2Index = customOrder.indexOf(file2.imageId);
            return file1Index - file2Index;
          });
        }
        resolve(filesCollection)
      }
    })
  }


  /**
   * Fileter gifs according to the search value
   */
  filterGifs(filesCollection: Array<GifItem> | null, value: string): Promise<GifItem[] | null> {
    return new Promise(resolve => {
      if (value) {
        let filtered = filesCollection?.filter(element => element.fileName.toLowerCase().includes(value.toLowerCase())) ?? []
        resolve(filtered)
      } else {
        resolve(filesCollection)
      }
    })
  }

  /**
   * Extract imageId of the item and store
   * @param filesCollection 
   */
  storeCustomOrder(filesCollection: GifItem[] | null) {
    if (filesCollection) {
      const imageIdCollection = filesCollection.map((element: GifItem) => element.imageId)
      this.storageService.set(constant.storage_key.custom_order, imageIdCollection)
    }
  }

  /**
   * Once after gif is downloaded, add it to the end of imageId collection
   * @param value 
   * @returns 
   */
  async customOrderAddNew(value: string) {
    return new Promise(async resolve => {
      if (value) {
        let imageIdCollection = await this.storageService.get(constant.storage_key.custom_order) ?? []
        imageIdCollection.push(value)
        await this.storageService.set(constant.storage_key.custom_order, imageIdCollection)
        resolve(imageIdCollection)
      }
    })
  }

  /**
   * Download image from GIPHY
   * @param url 
   * @param fileName 
   */
  async download(url: string, fileName: string) {
    let urlPath = new URL(url).pathname
    let fileNameToStore = urlPath.substring(0, urlPath.lastIndexOf("/")) + '/' + fileName + '.gif';

    let gifStoragePath = this.GIF_STORAGE + fileNameToStore

    // retrieve the image
    const response = await fetch(url);
    // convert to a Blob
    const blob = await response.blob();

    // helper function
    const convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
      const reader = new FileReader;
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

    // convert to base64 data, which the Filesystem plugin requires
    const base64Data = await convertBlobToBase64(blob) as string;

    const savedFile = await Filesystem.writeFile({
      path: gifStoragePath,
      data: base64Data,
      directory: Directory.Data,
      recursive: true,
    });

    return savedFile;
  }

}
