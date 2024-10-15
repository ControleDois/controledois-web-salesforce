import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB('controledois_web_salesforce', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('people')) {
          const peopleStore = db.createObjectStore('people', { keyPath: 'id', autoIncrement: true });

          peopleStore.createIndex('name', 'name', { unique: false });
          peopleStore.createIndex('document', 'document', { unique: false });
          peopleStore.createIndex('social_name', 'social_name', { unique: false });
        }
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });

          productStore.createIndex('name', 'name', { unique: false });
        }
      },
    });
  }

  async addData(data: any, storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).add(data);
  }

  async getData(id: number, storeName: string): Promise<any | undefined> {
    const db = await this.dbPromise;
    return db.transaction(storeName).objectStore(storeName).get(id);
  }

  async getAllData(storeName: string): Promise<any[]> {
    const db = await this.dbPromise;
    return db.transaction(storeName).objectStore(storeName).getAll();
  }

  async deleteData(id: number, storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
  }

  async clearData(storeName: string) {
    const db = await this.dbPromise;
    return db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
  }

  async batchInsert(dataArray: any[], storeName: string, batchSize: number) {
    const db = await this.dbPromise;

    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);

      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const data of batch) {
        await store.add(data);
      }

      await tx.done; // aguarda a finalização da transação
    }
  }

  getCountStore(storeName: string): Promise<number> {
    return this.getAllData(storeName).then(data => data.length);
  }
}
