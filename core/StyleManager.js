export default class StyleManager {
    static loaded_CSS = {};
    
    /**
     * Imports all stylesheets found inside a given container element.
     * @param {HTMLElement} container - The DOM element containing the stylesheets to import.
     * @returns {Promise<Object>} A promise that resolves to an object mapping stylesheets identifiers (id > src > i) to the result of their execution.
     */
    static async ImportAllStylesheetsFromContainer(container){
        const all_stylesheets = Array.from(container.querySelectorAll("link[rel=\"stylesheet\"]"));
        return Promise.all(all_stylesheets.map(stylesheet => this.ImportOneStylesheet(stylesheet)));
    }

    /**
     * Reads a stylesheet element and ensures its inclusion.
     * @param {HTMLLinkElement} link a <link type="stylesheet"> tag
     * @returns {Promise<HTMLLinkElement>} A promise that resolves when the CSS has been added to the app.
     */
    static async ImportOneStylesheet(link){
        if(this.loaded_CSS[link.getAttribute('href')] == null) {
            this.loaded_CSS[link.getAttribute('href')] = new Promise((resolve, reject) => {
                link.onload = () => {resolve(link)};
                document.head.appendChild(link);
            });
        }else{
            link.remove();
        }
        return this.loaded_CSS[link.getAttribute('href')];
    }

    /**
     * Loads and include one or many stylesheet(s).
     * @param {String|Array} src The source(s) of the stylesheet(s) you want to include
     * @returns {Promise<void>} A promise that resolves when the stylesheet is imported.
     */
    static async ImportFromURL(src){
        if(Array.isArray(src)){
            return Promise.all(src.map(url => StyleManager.ImportFromURL(url)));
        }else{
            const link = document.createElement('link');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', src);
            return this.ImportOneStylesheet(link);
        }
    }
}