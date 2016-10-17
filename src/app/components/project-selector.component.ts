import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ApiService, Project } from '../api.service';

export const OVERALL_PROJECT: Project = <Project>({
  id: "__OVERALL",
  name: "OVERALL"
});

@Component({
  selector: 'project-selector',
  templateUrl: 'components/project-selector.component.html'
})
export class ProjectSelectorComponent implements OnInit {
  @Input() label: string;

  projects: Project[] = [];
  private _selected: { [id: string] : boolean } = {};
  private _searched: { [id: string] : boolean } = {};

  @Output() selection_changed = new EventEmitter();

  constructor(private _api: ApiService) {
    this.projects.push(OVERALL_PROJECT);
  }

  ngOnInit() {
    this._api.projects().subscribe(
      (projects: Project[]) => {
        for(let p of projects) {
          this.projects.push(p);
        }

        for(let p of this.projects) {
          this._selected[p.id] = false;
          this._searched[p.id] = true;
        }
      }
    );
  }

  search_text: string = '';
  clear_search() {
    this.search_text = '';
  }

  is_selected(p: Project): boolean {
    return this._selected[p.id];
  }

  toggle_selected(p: Project) {
    this._selected[p.id] = !this._selected[p.id];
    this.selection_changed.emit(this.selected_projects);
  }

  get selected_projects(): Project[] {
    return this.projects.filter((p: Project) => this.is_selected(p));
  }

  get searched_projects(): Project[] {
    if(!this.search_text) { return this.projects; }

    return this.projects.filter((p: Project) => (p.name.toLowerCase().indexOf(this.search_text.toLowerCase()) > -1));
  }

  select_all() {
    for(let k in this._selected) {
      this._selected[k] = true;
    }
    this.selection_changed.emit(this.selected_projects);
  }

  unselect_all() {
    for(let k in this._selected) {
      this._selected[k] = false;
    }
    this.selection_changed.emit(this.selected_projects);
  }
}
