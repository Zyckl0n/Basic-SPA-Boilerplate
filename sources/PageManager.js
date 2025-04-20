import ComponentManager from "./ComponentManager.js";

export default class PageManager {
    static main_page_container;
    static Intialize(){
        PageManager.current_page = document.body.querySelector('.page_container');
        PageManager.main_page_container = document.body.querySelector('#main_body');

        // URLS Management
        if(history.state != null && history.state.page_id != null) {
            PageManager.ChangePage(history.state.page_id, {pushState: false});
        }else{
            PageManager.ChangePage('home', {pushState: false});
        }
        addEventListener('popstate', this.OnBrowserStateChange.bind(this))
    }

    /*********************************************************************/
    /* Page Switching
    /*********************************************************************/
    static current_page = null;
    
    static async ChangePage(page_name, options={}){
        options = PageManager.GetDefaultOptions(options);

        const page_html = await PageManager.FetchPageHTML(page_name);
        const page_container = PageManager.CreatePageFromHTML(page_html, page_name);
        ComponentManager.LoadAllComponents(page_container);
        PageManager.main_page_container.appendChild(page_container);
        if(PageManager.current_page != null) PageManager.current_page.remove();
        PageManager.current_page = page_container;

        if(options.pushState) PageManager._PushURLInNavigatorState(page_name);
    }

    static GetDefaultOptions(options){
        if(options.pushState === undefined) options.pushState = true;
        return options;
    }

    static CreatePageFromHTML(html, page_name){
        const page_container = document.createElement('div');
        page_container.classList = 'page_container ' + page_name + '_page';
        page_container.innerHTML = html;
        return page_container;
    }

    static async FetchPageHTML(page_name){
        return await fetch('/pages/'+page_name+'/'+page_name+'.html').then(response => response.text());
    }

    /*********************************************************************/
    /* URLS Management
    /*********************************************************************/
    static _PushURLInNavigatorState(page_id){
        history.pushState({page_id: page_id}, "", page_id);
    }

    static OnBrowserStateChange(event){
        if(event.state != null && event.state.page_id != null){
            PageManager.ChangePage(event.state.page_id, {pushState: false});
        }else{
            PageManager.ChangePage('home', {pushState: false});
        }
    }
}

PageManager.Intialize();