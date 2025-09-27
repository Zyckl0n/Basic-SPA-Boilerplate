import ComponentManager from "/core/ComponentManager.js";
import PageTransitionFade from "/core/page_transitions/PageTransitionFade.js";
import ScriptsManager from "/core/ScriptsManager.js";
import StyleManager from "/core/StyleManager.js";
import CONFIG from "/config.js";

export default class PageManager {
    static main_page_container;
    static default_transition_class = PageTransitionFade;

    // Collect some DOMElements and load the first page
    static Intialize(){
        PageManager.current_page = document.body.querySelector('.page_container');
        PageManager.main_page_container = document.body.querySelector('#main_app_container');
        PageManager.LoadPageOnInit();
    }

    /*********************************************************************/
    /* Page Switching
    /*********************************************************************/
    static current_page = null;
    
    /**
     * Load a page HTML, initialise it's content and insert it in the DOM, replacing the one before
     * @param {String} path_to_html Path to the HTML files
     * @param {Object} _options a list of options
     */
    static async ChangePage(path_to_html, _options={}){
        const page_path_no_ext = Utils.RemoveExtension(path_to_html);
        const options  = PageManager.GetChangePageDefaultOptions(_options);
        const old_page = PageManager.current_page;
        const new_page = PageManager.InitPageContainer();
        new_page.setAttribute('page_path', page_path_no_ext);

        const transition = options.transition;
        transition.SetContext(old_page, new_page, options.transition_options);
        transition.OnLoadingStart();

        const page_container = await PageManager.LoadHTMLFragment(path_to_html, new_page);
        
        transition.BeforeNewPageInsertion();

        PageManager.main_page_container.appendChild(page_container);
        PageManager.RunAutoplay(page_container);
        PageManager.current_page = page_container;
        
        if(options.pushState) PageManager.PushURLInNavigatorState(page_path_no_ext, path_to_html);
        if(options.scroll != null) PageManager.HandleStartingScroll(page_container, options.scroll);
        setTimeout(transition.AfterNewPageInsertion.bind(transition), 10);
    }

    /**
     * Replace every undefined options with there default values
     * @param {Object} options The options choosed by the user
     * @returns The same options object, but every undefined field has been updated with default values
     */
    static GetChangePageDefaultOptions(options){
        if(options.pushState === undefined) options.pushState = true;
        if(options.transition === undefined) options.transition = new this.default_transition_class();
        if(options.scroll === undefined) options.scroll = null;
        return options;
    }

    /**
     * Create a empty <div> tag corresponding to a page container
     * @returns {HTMLDivElement} The newly created <div>
     */
    static InitPageContainer(){
        let page_container = document.createElement('div');
        page_container.classList = 'page_container ';
        return page_container;
    }

    /*********************************************************************/
    /* DOM Content Loading
    /*********************************************************************/
    /**
     * Load a HTML files into a container.
     * @param {String} path Path to the HTML file
     * @param {HTMLElement} container The tag where you want to insert the HTML into
     * @returns The updated container
     */
    static async LoadHTMLFragment(path, container = null){
        if(container == null) container = this.InitPageContainer();
        container.innerHTML = await fetch(path).then(response => response.text());
        ComponentManager.LoadAllComponents(container);
        await ScriptsManager.ImportAllScriptsFromContainer(container);
        await StyleManager.ImportAllStylesheetsFromContainer(container);
        return container;
    }

    /**
     * Make sure every <video> tag with autoplay is playing
     * @param {HTMLElement} container Any HTML tag
     */
    static async RunAutoplay(container) {
        container.querySelectorAll('video[autoplay]').forEach(video => {
            if(video.paused) video.play();
        });
    }

    /*********************************************************************/
    /* URLS Management
    /*********************************************************************/
    // Load the page targeted by current URL
    static LoadPageOnInit() {
        if(history.state != null && history.state.path_to_html != null) {
            PageManager.ChangePage(history.state.path_to_html, {pushState: false});
        }else{
            if(window.location.pathname != '/'){
                PageManager.ChangePage(window.location.pathname + ".html", {pushState: false});
            }else{
                PageManager.ChangePage(CONFIG.home_path, {pushState: false});
            }
        }
        addEventListener('popstate', this.OnBrowserPopState.bind(this));
    }

    // Change the URL & Push a page in the history
    static PushURLInNavigatorState(url, path_to_html){
        history.pushState({path_to_html: path_to_html}, "", url);
    }

    // Browser event : the user poped a state out of the history
    static OnBrowserPopState(event){
        if(event.state != null && event.state.path_to_html != null){
            PageManager.ChangePage(event.state.path_to_html, {pushState: false});
        }else{
            PageManager.ChangePage(CONFIG.home_path, {pushState: false});
        }
    }

    /*********************************************************************/
    /* Utils & Options
    /*********************************************************************/
    static HandleStartingScroll(page_container, scrollTarget){
        const element = page_container.querySelector(scrollTarget);
        if(element != null) {
            element.scrollIntoView();
            page_container.scrollBy(0, -20);
        }
    }
}

PageManager.Intialize();
window.PageManager = PageManager;