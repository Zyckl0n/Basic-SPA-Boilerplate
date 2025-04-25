export default class ComponentManager {
    static LoadAllComponents(container){
        const component_list = Array.from(container.getElementsByTagName('component'));
        component_list.forEach(DOMComponent => {
            ComponentManager.LoadComponentFromDOM(DOMComponent);
        });
    }

    static async LoadComponentFromDOM(DOMComponent){
        const component_name = DOMComponent.getAttribute('data-name');
        const prototype = await ComponentManager.FetchComponentPrototype(component_name);
        if(!prototype.preserve_initial_container) DOMComponent.innerHTML = await ComponentManager.FetchComponentHTML(component_name);
        let component_config = {};
        for (let i = 0; i < DOMComponent.attributes.length; i++) {
            if(DOMComponent.attributes[i].name.startsWith('config-')) component_config[DOMComponent.attributes[i].name.slice(7)] = DOMComponent.attributes[i].value;
        }
        return new prototype(DOMComponent, component_config);
    }

    static controller_classes = {};
    static async FetchComponentPrototype(component_name){
        if(ComponentManager.controller_classes[component_name] == null) {
            const raw_module_import = await import("/components/"+component_name+"/"+component_name+".js");
            ComponentManager.controller_classes[component_name] = raw_module_import.default;
        }
        return ComponentManager.controller_classes[component_name];
    }

    static async FetchComponentHTML(component_name){
        return await fetch('/components/'+component_name+'/'+component_name+'.html').then(response => response.text());
    }
}