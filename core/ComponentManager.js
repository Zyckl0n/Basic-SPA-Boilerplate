import StyleManager from "/core/StyleManager.js";

export default class ComponentManager {
    static loaded_controllers = {};

    /**
     * Scan a container for <component> tags and initialize them.
     * @param {Element} container - Any DOM element to scan for <component> tags.
     * @returns {Promise<void>} - Resolves once all components inside have been initialized.
     */
    static async LoadAllComponents(container){
        await Promise.all(Array.from(container.getElementsByTagName('component')).map(ComponentManager.InitializeCustomTag));
    }

    /**
     * Load a component definition (controller, template, and styles) into the app.
     * @param {string} component_name - The name/ID of the component (from `data-name`).
     * @returns {Promise<Class>} - A promise resolving to the component’s controller class, with its template attached.
     */
    static async LoadComponent(component_name) {
        const [JSModule, HTML, CSS] = await Promise.all([
            import("/components/"+component_name+"/"+component_name+".js"), // JS
            fetch('/components/'+component_name+'/'+component_name+'.html').then(response => response.text()),            // HTML
            StyleManager.ImportFromURL("/components/"+component_name+"/"+component_name+".css")      // CSS
        ]);

        const component_controller = JSModule.default;
        component_controller.template = document.createElement('template');
        component_controller.template.innerHTML = HTML;

        return component_controller;
    }

    /**
     * Retrieve (and cache) the controller class for a given component.
     * @param {string} component_name - The name of the component (from `data-name`).
     * @returns {Promise<Class>} - A promise resolving to the component’s controller class.
     */
    static async GetComponentController(component_name){
        if(ComponentManager.loaded_controllers[component_name] == undefined) ComponentManager.loaded_controllers[component_name] = ComponentManager.LoadComponent(component_name);
        return ComponentManager.loaded_controllers[component_name];
    }

    /**
     * Initialize a <component> tag by loading its controller, template, and slots.
     * @param {Element} DOMComponent - The <component> tag to transform.
     * @returns {Promise<Object>} - The instantiated controller bound to the component’s DOM
     */
    static async InitializeCustomTag(DOMComponent){
        const component_name = DOMComponent.getAttribute('data-name');
        const component_controller_class = await ComponentManager.GetComponentController(component_name);

        if(!component_controller_class.preserve_initial_container){
            const new_body = component_controller_class.template.content.cloneNode(true);
            Array.from(DOMComponent.children).forEach(child => {
                const slot = child.getAttribute('slot');
                if(slot != null) new_body.querySelector('[slot="'+slot+'"]').replaceChildren(...child.children);
            });
            DOMComponent.replaceChildren(new_body);
            await ComponentManager.LoadAllComponents(DOMComponent);
        }

        DOMComponent.controller = new component_controller_class(DOMComponent);
        return DOMComponent.controller;
    }
}