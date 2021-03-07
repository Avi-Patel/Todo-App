import view from "./view.js";
import { Model } from "./model.js";
import { Controller } from "./controller.js";

export class TodoAppState {
  constructor() {
    this.model = new Model();
    this.controller = new Controller(view, this.model);
    this.controller.handleInitialisation();
  }
}
