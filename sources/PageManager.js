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
        options = PageManager.GetChangePageDefaultOptions(options);
        const path_to_html = PageManager.GetDefaultPageHTMLPath(page_name);
        const page_container = await PageManager.LoadDOMContent(path_to_html);
        PageManager.InitPageContainer(page_container, page_name);
        PageManager.main_page_container.appendChild(page_container);
        PageManager.Eval_All_Scripts(page_container);
        if(PageManager.current_page != null) PageManager.current_page.remove();
        PageManager.current_page = page_container;

        if(options.pushState) PageManager._PushURLInNavigatorState(page_name);
    }

    static GetChangePageDefaultOptions(options){
        if(options.pushState === undefined) options.pushState = true;
        return options;
    }

    static InitPageContainer(page_container, page_name){
        page_container.classList = 'page_container ' + page_name + '_page';
        return page_container;
    }

    static GetDefaultPageHTMLPath(page_name){
        return '/pages/'+page_name+'/'+page_name+'.html';
    }

    static async FetchPageHTML(page_name){
        return await FetchRawHTML(PageManager.GetDefaultPageHTMLPath(page_name));
    }

    /*********************************************************************/
    /* DOM Content Loading
    /*********************************************************************/
    static async LoadDOMContent(path){
        const raw_html = await PageManager.FetchRawHTML(path);
        const DOMContent = PageManager.CreateDOMContentFromHTML(raw_html);
        ComponentManager.LoadAllComponents(DOMContent);
        return DOMContent;
    }

    static CreateDOMContentFromHTML(html){
        const page_container = document.createElement('div');
        page_container.innerHTML = html;
        return page_container;
    }

    static async FetchRawHTML(path){
        return await fetch(path).then(response => response.text());
    }

    /*********************************************************************/
    /* Script Execution
    /*********************************************************************/
    static Eval_All_Scripts(container){
        Array.from(container.getElementsByTagName("script")).forEach((script) => {
            if(script.getAttribute('type') == 'module'){
                PageManager.ImportModuleFromTag(script);
            }else{
                PageManager.Eval_Script(script);
            }
        });
    }

    static ImportModuleFromTag(script){
        import(script.src);
    }

    static Eval_Script(script){
        const new_script = document.createElement('script');
        new_script.page = this;

        if (script.src) {
            new_script.src = script.src;
        } else if (script.textContent) {
            new_script.textContent = script.textContent;
        } else if (script.innerText) {
            new_script.innerText = script.innerText;
        }

        script.parentNode.insertBefore(new_script, script);
        script.parentNode.removeChild(script);

        return {
            type: 'script',
            data: new_script
        };
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