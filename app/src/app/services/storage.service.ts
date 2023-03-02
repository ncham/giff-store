import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    if (this._storage != null) {
      return;
    }
    const storage = await this.storage.create();
    this._storage = storage;
  }

  // Create and expose methods that users of this service can
  // call, for example:
  public async set(key: string, value: any): Promise<any> {
    await this.init();
    return this._storage?.set(key, value);
  }

  public async get(key: string): Promise<any> {
    await this.init();
    return this._storage?.get(key);
  }

  public async clear(): Promise<any> {
    await this.init();
    return this._storage?.clear();
  }
  
}
