import PageTransition from "./PageTransition.js";

export default class PageTransitionFade extends PageTransition {
    OnLoadingStart(){
        const old_page = this.old_page;
        if(old_page != null){
            old_page.style.setProperty('transition', 'opacity .4s ease-in-out');
            old_page.style.setProperty('opacity', '1');
            
            requestAnimationFrame(() => {
                old_page.style.setProperty('opacity', '0');
                setTimeout(() => {
                    old_page.remove();
                }, 450);
            });
        }
    }

    BeforeNewPageInsertion(){
        this.new_page.style.setProperty('opacity', '0');
        this.new_page.style.setProperty('transition', 'opacity .4s ease-in-out');
    }

    AfterNewPageInsertion(){
        this.new_page.style.setProperty('opacity', '1');
    }
}