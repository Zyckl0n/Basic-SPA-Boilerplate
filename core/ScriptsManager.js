import Utils from "/core/Utils.js";

export default class ScriptsManager {
    static loaded_modules = {};
    static loaded_scripts = {};

    /**
     * Imports all <script> tags found inside a given container element.
     * @param {HTMLElement} container - The DOM element containing the <script> tags to import.
     * @returns {Promise<Object>} A promise that resolves to an object mapping script identifiers (id > src > i) to the result of their execution.
     */
    static async ImportAllScriptsFromContainer(container){
        const all_scripts = Array.from(container.getElementsByTagName("script"));

        const results = await Promise.all(
            all_scripts.map(script => this.ImportScriptTag(script))
        );

        const resultObject = {};
        all_scripts.forEach((script, i) => {
            const key = script.id || script.getAttribute('src') || `script_${i}`;
            resultObject[key] = results[i];
        });

        return resultObject;
    }

    /**
     * Reads a <script> element and ensures its execution.
     * @param {HTMLScriptElement} script a <script> tag
     * @returns {Promise<Module>} A promise that resolves when the script has run.
     */
    static async ImportScriptTag(script){
        if (!(script instanceof HTMLScriptElement)) return Promise.reject(new Error("Argument must be a <script> element"));

        if(script.hasAttribute('required_js') || script.hasAttribute('required_mod'))  await this.HandleDependencies(script);
        
        const script_type = script.getAttribute('type') ?? "text/javascript";
        switch(script_type) {
            case 'module':
                return this.ImportScriptTag_Module(script);
            default :
                return this.ImportScriptTag_TextJavascript(script);
        }
    }

    /**
     * Loads and executes a classic JavaScript <script> (type="text/javascript").
     * @param {HTMLScriptElement} script - A <script> tag with classic JavaScript code.
     * @returns {Promise<HTMLScriptElement>} A promise that resolves when the script has finished executing.
     */
    static ImportScriptTag_TextJavascript(script) {
        // Get a ID for the script
        const script_identifier = script.id || script.getAttribute('src') || null;

        // Prevent multiple inclusion Option.
        if(script.hasAttribute('include_once')){
            if(script_identifier){
                if(this.loaded_scripts[script_identifier] != null) return this.loaded_scripts[script_identifier];
            }else{
                console.warn('Cannot apply "include_once" option on ', script, 'because it does not have a identifier attributes ("src" or "id").');
            }
        }

        // Create the promise
        const load_promise = new Promise((resolve, reject) => {
            const tmp_running_script = this.CloneScriptTag(script);

            const cleanup = () => {
                tmp_running_script.remove();
                ScriptsManager.fragment_script_runner_swap_map.delete(tmp_running_script);
            }

            ScriptsManager.fragment_script_runner_swap_map.set(tmp_running_script, script);

            if(script.hasAttribute('src')){
                tmp_running_script.onload  = () => {cleanup(); resolve(script)};
                tmp_running_script.onerror = (err) => {cleanup(); reject(err)};
                document.head.appendChild(tmp_running_script);
            }else{
                document.head.appendChild(tmp_running_script);
                cleanup();
                resolve(script);
            }
        });

        // Save the script for multiple inclusion
        if(script_identifier) this.loaded_scripts[script_identifier] = load_promise;

        return load_promise;
    }

    /**
     * Loads and executes an ES module <script> (type="module").
     * @param {HTMLScriptElement} script - A <script type="module"> tag.
     * @returns {Promise<Module>} A promise that resolves when the module has finished executing.
     */
    static ImportScriptTag_Module(script){
        script.remove();
        const src = script.getAttribute('src');
        if(this.loaded_modules[src] == null) this.loaded_modules[src] = import(src);
        return this.loaded_modules[src];
    }

    /**
     * Loads and executes a script.
     * @param {String} src The sources of the script you want to include
     * @param {String} type "text/javascript" or "module" 
     * @returns {Promise<void>} A promise that resolves when the script has finished executing.
     */
    static ImportFromURL(src, type = 'text/javascript', include_once = false){
        const script = document.createElement('script');
        script.setAttribute('type', type);
        script.setAttribute('src', src);
        if(include_once) script.setAttribute('include_once', true);
        return this.ImportScriptTag(script);
    }

    /**
     * Clone a <script> tag
     * @param {HTMLScriptElement} source The script you want to clone
     * @returns {HTMLScriptElement} a clone of this script
     */
    static CloneScriptTag(source){
        const newScript = document.createElement("script");

        for (const { name, value } of source.attributes) {
            newScript.setAttribute(name, value);
        }

        newScript.textContent = source.textContent;

        return newScript;
    }

    /**
     * Parse and import all dependencies of a <script required_js="..." required_modules="...">
     * @param {HTMLScriptElement} script A <script> tag
     * @returns {Promise<Void>} a promise that resolves all dependencies has been loaded
     */
    static async HandleDependencies(script){
        let load_queue = [];

        if(script.hasAttribute('required_js')){
            try {
                const required_js = Utils.ParseOrReturn(script.getAttribute('required_js'));
                if(Array.isArray(required_js)) {
                    load_queue = load_queue.concat(required_js.map(src => this.ImportFromURL(src, 'text/javascript', true)))
                }else{
                    load_queue.push(this.ImportFromURL(required_js, 'text/javascript', true));
                }
            }catch(e){
                console.warn('Cannot handle script required Javascript', e);
            }
        }

        if(script.hasAttribute('required_modules')){
            try {
                const required_modules = Utils.ParseOrReturn(script.getAttribute('required_modules'));
                if(Array.isArray(required_modules)) {
                    load_queue = load_queue.concat(required_modules.map(src => this.ImportFromURL(src, 'module')))
                }else{
                    load_queue.push(this.ImportFromURL(required_modules, 'module'));
                }
            }catch(e){
                console.warn('Cannot handle script required Modules', script, e);
            }
        }

        return Promise.all(load_queue);
    }

    /**********************************************************************/
    /* Fragment script runner
    /**********************************************************************/
    static native_current_script_getter;
    static fragment_script_runner_swap_map;

    /**
     * Initialise the Fragment script Runner by overriding `document.currentScript` to return the mapped virtual script
     * whenever the browser is executing a cloned one.
     * 
     * Allow <script> elements to be executed "off-DOM" (in fragments, before insertion).
     * Ensure APIs like `document.currentScript`, `parentNode`, `nextSibling`, etc. behave as if the script were in its real DOM position.
     */
    static InitializeFragmentScriptsRunner(){
        // Capture the browser’s native currentScript getter once.
        const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'currentScript');
        this.native_current_script_getter = desc && desc.get;

        // Map: real script tag -> virtual/original script tag
        this.fragment_script_runner_swap_map = new WeakMap();

        // Override document.currentScript to transparently swap back to the virtual script.
        Object.defineProperty(Document.prototype, 'currentScript', {
            configurable: true,
            get() {
                const real = ScriptsManager.native_current_script_getter.call(this);
                return (real && ScriptsManager.fragment_script_runner_swap_map.get(real)) || real;
            }
        });
    }
}

ScriptsManager.InitializeFragmentScriptsRunner();