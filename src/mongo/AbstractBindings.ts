/**
 * Copyright 2018-2020 Symlink GmbH
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




import { IAbstractBindings } from "./IAbstractBindings";
import { Container, injectable, unmanaged } from "inversify";

@injectable()
export abstract class AbstractBindings implements IAbstractBindings {
  private container: Container;

  constructor(@unmanaged() container: Container) {
    this.container = container;
  }

  public initDynamicBinding(types: Array<string | symbol>, values: Array<any>): void {
    for (const index in types) {
      if (index) {
        if (this.container.isBound(types[index])) {
          this.container.rebind(types[index]).toDynamicValue(() => {
            return values[index];
          });
        } else {
          this.container.bind(types[index]).toDynamicValue(() => {
            return values[index];
          });
        }
      }
    }
  }

  public initStaticBinding(types: Array<string | symbol>, values: Array<any>): void {
    for (const index in types) {
      if (index) {
        if (this.container.isBound(types[index])) {
          this.container.rebind(types[index]).toConstantValue(values[index]);
        } else {
          this.container.bind(types[index]).toConstantValue(values[index]);
        }
      }
    }
  }

  public getContainer(): Container {
    return this.container;
  }
}
