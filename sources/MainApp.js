import ComponentManager from "./ComponentManager.js";
import PageManager from "./PageManager.js";
import config from "../config/config.js"

window.ChangePage = PageManager.ChangePage;
ComponentManager.LoadAllComponents(document.body);