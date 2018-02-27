////////////////////////////////////////////////////////////////////////////////
//
// caos-dashboard - CAOS dashboard
//
// Copyright © 2017, 2018 INFN - Istituto Nazionale di Fisica Nucleare (Italy)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
// Author: Fabrizio Chiarello <fabrizio.chiarello@pd.infn.it>
//
////////////////////////////////////////////////////////////////////////////////

import {
  Component,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

export interface Item<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'dropdown',
  templateUrl: 'dropdown.component.html',
})
export class DropdownComponent<T> {
  @Input() icon: string;

  private _items: Item<T>[];
  @Input()
  set items(items: Item<T>[]) {
    this._items = items;
    if(!this._selected_item && this.items && this.items.length > 0) {
      setTimeout(() => {
        this.value = this.items[0].value;
      });
    }
  }
  get items(): Item<T>[] {
    return this._items;
  }

  private _selected_item: Item<T>;
  get selected_item(): Item<T> {
    return this._selected_item;
  }

  @Output() valueChange: EventEmitter<T> = new EventEmitter<T>(null);

  @Input()
  set value(value: T) {
    for(let i of this.items) {
      if(i.value == value) {
        this._selected_item = i;
        this.valueChange.emit(value);
        return;
      }
    }
  };
  get value(): T {
    if(this._selected_item) {
      return this._selected_item.value;
    }
    return null;
  };

  constructor() { }

  is_item_selected(item: Item<T>): boolean {
    return item == this._selected_item;
  }
}
