import { Injectable } from '@angular/core';
import { Filesystem } from '@capacitor/filesystem';
import { Directory } from '@capacitor/filesystem/dist/esm/definitions';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  private GIF_STORAGE: string = 'gif-store';

  constructor() { }

  /**
   * 
   * @param url 
   * @param fileName 
   */
  async download(url: string, fileName: string) {

    let gifStoragePath = this.GIF_STORAGE + new URL(url).pathname

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

    console.log(savedFile)
    return savedFile;
  }
}
