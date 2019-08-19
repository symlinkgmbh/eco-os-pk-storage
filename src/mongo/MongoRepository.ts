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



import {
  Collection,
  InsertOneWriteOpResult,
  ObjectID,
  FindAndModifyWriteOpResultObject,
  DeleteWriteOpResultObject,
} from "mongodb";
import { PkStorage } from "@symlinkde/eco-os-pk-models";
import { injectable, inject } from "inversify";
import { STORAGE_TYPES } from "./StorageTypes";

@injectable()
export class MongoRepository<T> implements PkStorage.IMongoRepository<T>, PkStorage.IWrite<T>, PkStorage.IRead<T> {
  private mongoConnector: PkStorage.IMongoConnector;

  constructor(@inject(STORAGE_TYPES.IMongoConnector) connector: PkStorage.IMongoConnector) {
    this.mongoConnector = connector;
  }

  public async find(query: object): Promise<T[] | null> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result = await collection.find(query).toArray();
    return result;
  }

  public async findOne(id: string): Promise<T | null> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result = await collection.findOne({ _id: new ObjectID(id) });
    return result;
  }

  public async create(item: T): Promise<ObjectID> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result: InsertOneWriteOpResult = await collection.insertOne(item);
    return result.insertedId;
  }

  public async createMany<K>(docs: Array<K>): Promise<void> {
    const collection: Collection = await this.mongoConnector.getCollection();
    await collection.insertMany(docs);
    return;
  }

  public async update<K>(id: string, item: K): Promise<boolean> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result: FindAndModifyWriteOpResultObject = await collection.findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: item },
    );
    return !!result.ok;
  }

  public async updateWithQuery(id: string, query: object): Promise<boolean> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result: FindAndModifyWriteOpResultObject = await collection.findOneAndUpdate(
      { _id: new ObjectID(id) },
      query,
    );
    return !!result.ok;
  }

  public async delete(id: string): Promise<boolean> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result: DeleteWriteOpResultObject = await collection.deleteOne({ _id: new ObjectID(id) });
    return !!result.result.ok;
  }

  public async deleteMany(filter: object): Promise<boolean> {
    const collection: Collection = await this.mongoConnector.getCollection();
    const result: DeleteWriteOpResultObject = await collection.deleteMany(filter);
    return !!result.result.ok;
  }
}
