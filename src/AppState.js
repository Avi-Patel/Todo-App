import { Controller } from "./controller.js";

export class TodoAppState {
  constructor() {
    this.controller = new Controller();
    this.controller.handleInitialisation();
  }
}
