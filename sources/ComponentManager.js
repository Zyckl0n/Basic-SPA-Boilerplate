export default class ComponentManager {
    static loaded_controllers = {};

    static async LoadAllComponents(container){
        const component_list = Array.from(container.getElementsByTagName('component'));
        await Promise.all(component_list.map(ComponentManager.InitializeCustomTag));
    }

    // Load the controller of a component.
    static async LoadComponent(component_name) {
        // Loading the controller class
        const component_controller = (await import("/components/"+component_name+"/"+component_name+".js")).default;

        // Loading HTML template
        component_controller.template = document.createElement('template');
        component_controller.template.innerHTML = await ComponentManager.FetchComponentHTML(component_name);

        // Loading CSS
        if(component_controller.css_files != undefined) ComponentManager.LoadCSSFiles(component_controller.css_files)

        // Finishing
        ComponentManager.loaded_controllers[component_name] = component_controller;
        return component_controller;
    }

    // Fetch the controller class of a component and store it in "loaded_controllers"
    static async GetComponentController(component_name){
        // First time loading
        if(ComponentManager.loaded_controllers[component_name] == undefined) ComponentManager.loaded_controllers[component_name] = ComponentManager.LoadComponent(component_name);

        if(Utils.IsPromise(ComponentManager.loaded_controllers[component_name])){
            // If the controller is still loading (Controller is a promise)
            return await ComponentManager.loaded_controllers[component_name];
        }else{
            // If it already loaded 
            return ComponentManager.loaded_controllers[component_name];
        }
    }

    // Initialize a <component> tag
    static async InitializeCustomTag(DOMComponent){
        const component_name = DOMComponent.getAttribute('data-name');

        // Loading the component
        const component_controller = await ComponentManager.GetComponentController(component_name);
        if(!component_controller.preserve_initial_container){
            const new_body = component_controller.template.content.cloneNode(true);
            Array.from(DOMComponent.children).forEach(child => {
                const slot = child.getAttribute('slot');
                if(slot != null) new_body.querySelector('[slot="'+slot+'"]').replaceChildren(...child.children);
            });
            DOMComponent.replaceChildren(new_body);
            await ComponentManager.LoadAllComponents(DOMComponent);
        }

        DOMComponent.controller = new component_controller(DOMComponent);
        return DOMComponent.controller;
    }

    // Get the raw innerHTML of a component
    static async FetchComponentHTML(component_name){
        return await fetch('/components/'+component_name+'/'+component_name+'.html').then(response => response.text());
    }

    /************************************************************************/
    /* Components CSS
    /************************************************************************/
    static included_css = {};

    static async LoadCSSFiles(CSSPaths){
        CSSPaths.forEach(filepaths => {
            ComponentManager.InsertCSS(filepaths);
        });
    }

    static InsertCSS(filepath){
        if(this.included_css[filepath] != null) return;
        var stylesheet = document.createElement( "link" );
        stylesheet.href = filepath;
        stylesheet.type = "text/css";
        stylesheet.rel = "stylesheet";
        this.included_css[filepath] = stylesheet;
        document.head.appendChild(stylesheet);
    }
}