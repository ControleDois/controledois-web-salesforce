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
          peopleStore.createIndex('city', 'address.city', { unique: false });
          peopleStore.createIndex('state', 'address.state', { unique: false });
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

  async filterPeopleByText(searchText: string): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('people', 'readonly');
    const store = transaction.objectStore('people');

    const allPeople = await store.getAll();

    // Filtrar os dados pelos campos name, document, social_name, city e state
    const filteredPeople = allPeople.filter(person => {
      const nameMatch = person.name?.toLowerCase().includes(searchText.toLowerCase());
      const documentMatch = person.document?.toLowerCase().includes(searchText.toLowerCase());
      const socialNameMatch = person.social_name?.toLowerCase().includes(searchText.toLowerCase());

      const cityMatch = person.address?.city?.toLowerCase().includes(searchText.toLowerCase());
      const stateMatch = person.address?.state?.toLowerCase().includes(searchText.toLowerCase());

      return nameMatch || documentMatch || socialNameMatch || cityMatch || stateMatch;
    });

    return filteredPeople;
  }

  async filterProductByText(searchText: string): Promise<any[]> {
    const db = await this.dbPromise;
    const transaction = db.transaction('products', 'readonly');
    const store = transaction.objectStore('products');

    const allProducts = await store.getAll();

    const filteredProducts = allProducts.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchText.toLowerCase());

      return nameMatch;
    });

    return filteredProducts;
  }
}
