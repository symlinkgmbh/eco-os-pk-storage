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



import "reflect-metadata";
import { Container, interfaces } from "inversify";
import { STORAGE_TYPES } from "./StorageTypes";
import { PkStorage } from "@symlinkde/eco-os-pk-models";
import { MongoConnector } from "./MongoConnector";
import { MongoRepository } from "./MongoRepository";
import { MongoStateLessConnector } from "./MongoStateLessConnector";
import { MongoExtendedConnector } from "./MongoExtendedConnector";

const storageContainer = new Container();
storageContainer
  .bind<PkStorage.IMongoConnector>(STORAGE_TYPES.IMongoConnector)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoConnector(
      context.container.get(STORAGE_TYPES.Database),
      context.container.get(STORAGE_TYPES.Collection),
      context.container.get(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI),
      context.container.get(STORAGE_TYPES.StorageTarget),
    );
  })
  .whenTargetTagged(STORAGE_TYPES.STATE_LESS, false);

storageContainer
  .bind<PkStorage.IMongoConnector>(STORAGE_TYPES.IMongoConnector)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoStateLessConnector(
      context.container.get(STORAGE_TYPES.Database),
      context.container.get(STORAGE_TYPES.Collection),
      context.container.get(STORAGE_TYPES.StorageTarget),
    );
  })
  .whenTargetTagged(STORAGE_TYPES.STATE_LESS, true);

storageContainer
  .bind<PkStorage.IMongoConnector>(STORAGE_TYPES.IMongoConnector)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoExtendedConnector(
      context.container.get(STORAGE_TYPES.Database),
      context.container.get(STORAGE_TYPES.Collection),
      context.container.get(STORAGE_TYPES.SECONDLOCK_REGISTRY_URI),
      context.container.get(STORAGE_TYPES.StorageTarget),
      context.container.get(STORAGE_TYPES.IndexConfig),
    );
  })
  .whenTargetTagged(STORAGE_TYPES.EXTEND_CONFIG, true);

storageContainer
  .bind<PkStorage.IMongoRepository<any>>(STORAGE_TYPES.IMongoRepository)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoRepository(
      context.container.getTagged(STORAGE_TYPES.IMongoConnector, STORAGE_TYPES.STATE_LESS, false),
    );
  })
  .inRequestScope()
  .whenTargetTagged(STORAGE_TYPES.STATE_LESS, false);

storageContainer
  .bind<PkStorage.IMongoRepository<any>>(STORAGE_TYPES.IMongoRepository)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoRepository(
      context.container.getTagged(STORAGE_TYPES.IMongoConnector, STORAGE_TYPES.STATE_LESS, true),
    );
  })
  .inRequestScope()
  .whenTargetTagged(STORAGE_TYPES.STATE_LESS, true);

storageContainer
  .bind<PkStorage.IMongoRepository<any>>(STORAGE_TYPES.IMongoRepository)
  .toDynamicValue((context: interfaces.Context) => {
    return new MongoRepository(
      context.container.getTagged(STORAGE_TYPES.IMongoConnector, STORAGE_TYPES.EXTEND_CONFIG, true),
    );
  })
  .inRequestScope()
  .whenTargetTagged(STORAGE_TYPES.EXTEND_CONFIG, true);

export { storageContainer };
