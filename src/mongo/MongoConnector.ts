/**
 * Copyright 2018-2019 Symlink GmbH
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * 
 */



import { MongoClient, Collection } from "mongodb";
import { injectable, inject } from "inversify";
import { PkCore, MsConf } from "@symlinkde/eco-os-pk-models";
import { serviceContainer, ECO_OS_PK_CORE_TYPES } from "@symlinkde/eco-os-pk-core";
import { PkStorage } from "@symlinkde/eco-os-pk-models";
import { STORAGE_TYPES } from "./StorageTypes";

@injectable()
export class MongoConnector implements PkStorage.IMongoConnector {
  private db: string;
  private collectionName: string;
  private configClient: PkCore.IEcoConfigClient;
  private storage: string;
  private connection!: MongoClient;

  constructor(
    @inject(STORAGE_TYPES.Database) db: string,
    @inject(STORAGE_TYPES.Collection) collection: string,
    @inject(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI) registryUri: string,
    @inject(STORAGE_TYPES.StorageTarget) storageTarget: string,
  ) {
    this.db = db;
    this.collectionName = collection;
    this.storage = storageTarget;
    serviceContainer.rebind("SECONDLOCK_REGISTRY_URI").toConstantValue(registryUri);
    this.configClient = serviceContainer.get<PkCore.IEcoConfigClient>(ECO_OS_PK_CORE_TYPES.IEcoConfigClient);
  }

  public async getCollection(): Promise<Collection> {
    const mongoConfig: MsConf.IConfigEntry = await this.getMongoURI();

    if (!this.connection) {
      this.connection = await MongoClient.connect(mongoConfig[this.storage], {
        useNewUrlParser: true,
      });
    }

    const db = this.connection.db(this.db);
    return db.collection(this.collectionName);
  }

  public async closeConnection(): Promise<void> {
    if (this.connection) {
      this.connection.close();
    }

    return;
  }

  private async getMongoURI(): Promise<MsConf.IConfigEntry> {
    const result = await this.configClient.get(this.storage);
    return result.data;
  }
}
