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
        ComponentManager.loaded_controllers[component_name] = component_controller;

        // Loading HTML template
        component_controller.template = document.createElement('template');
        component_controller.template.innerHTML = await ComponentManager.FetchComponentHTML(component_name);

        // Loading CSS
        if(component_controller.css_files != undefined) ComponentManager.LoadCSSFiles(component_controller.css_files)
    }

    // Initialize a <component> tag
    static async InitializeCustomTag(DOMComponent){
        const component_name = DOMComponent.getAttribute('data-name');

        // Loading the component for the first time
        if(ComponentManager.loaded_controllers[component_name] == undefined) await ComponentManager.LoadComponent(component_name);

        const component_controller = ComponentManager.loaded_controllers[component_name];
        if(!component_controller.preserve_initial_container){
            DOMComponent.replaceChildren(component_controller.template.content.cloneNode(true));
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