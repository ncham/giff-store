import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { Directory } from '@capacitor/filesystem/dist/esm/definitions';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  private GIF_STORAGE: string = 'gif-store';

  constructor(private storageService: StorageService) { }

  /**
   * Save image on device
   * @param url 
   * @param imageId 
   * @param fileName 
   */
  async storeImage(url: string, imageId: string, fileName: string) {
    let savedFile = await this.download(url, fileName);
    let savedFileData = await this.storageService.get('gif-store') ?? [];

    if (savedFile) {
      savedFileData.push({ imageId: imageId, savedLocation: savedFile.uri, fileName: fileName, dateSaved: Date.now() });

      await this.storageService.set('gif-store', savedFileData);
    }
  }

  /**
   * 
   * @param sortBy 
   * @param order 1:ASC, 2:DESC
   * @returns 
   */
  async loadSavedGifs(sortBy?: string, order = 1) {
    let savedFileData = await this.storageService.get('gif-store');

    if (sortBy) {
      await this.sortGifs(savedFileData, sortBy, order)
    }

    return new Promise(resolve => {
      savedFileData.forEach(async (file: any) => {
        const readFile = await Filesystem.readFile({
          path: file.savedLocation,
        });
        file.webviewPath = `data:image/gif;base64,${readFile.data}`;
      });
      resolve(savedFileData);
    })
  }

  /**
   * 
   * @param filesCollection 
   * @param sortBy 
   * @param order 1:ASC, 2:DESC
   * @returns 
   */
  sortGifs(filesCollection: Array<any>, sortBy: string, order: number): Promise<any> {

    return new Promise(resolve => {
      //Sort by Name
      if (sortBy == 'name') {
        filesCollection.sort((file1: any, file2: any) => {
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
        filesCollection.sort((file1: any, file2: any) => {
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
    })
  }


  /**
   * 
   */
  filterGifs(filesCollection: Array<any>, value: string): Promise<any> {
    return new Promise(resolve => {
      if (value) {
        let filtered = filesCollection.filter(element => element.fileName.toLowerCase().includes(value.toLowerCase()))
        resolve(filtered)
      } else {
        resolve(filesCollection)
      }
    })
  }


  /**
   * Download image from GIPHY
   * @param url 
   * @param fileName 
   */
  async download(url: string, fileName: string) {
    //let filename = new URL(url).pathname.split('/').pop()?.split('.')[0];
    //let filename = new URL(url).pathname.split('/').pop();
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
