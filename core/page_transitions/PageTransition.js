export default class PageTransition {
    constructor(){
        
    }

    SetContext(old_page, new_page){
        this.old_page = old_page;
        this.new_page = new_page;
    }

    OnLoadingStart(){
        
    }

    OnNewPageLoaded(){
        if(this.old_page != null) this.old_page.remove();
    }
}