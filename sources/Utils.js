export default class Utils {
    static htmlToElement(html) {
        var template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }
    
    static uid(){
        return Math.random().toString(36);
    }
    
    // Méthode recursive (Privé)
    static _getParent(element, selector){
        if(typeof element.matches != 'function') return null;
        if(element.matches(selector)){
            return element;
        }else{
            if(element.parentNode != undefined){
                return Utils._getParent(element.parentNode, selector);
            }else{
                return null;
            }
        }
    }
    
    // Renvois le parent de la balise {element} respectant le selecteur CSS {selector}. Pour eviter les boucle infini, hp est le nombre max de boucle.
    static GetParent(element, selector="*"){
        return Utils._getParent(element.parentNode, selector);
    }
    
    static FitContainerCrop(img){
        const ratio_width = img.naturalWidth / img.parentNode.clientWidth;
        const ratio_height = img.naturalHeight / img.parentNode.clientHeight;
        if(ratio_width < ratio_height){
            img.classList.remove('scale_height');
            img.classList.add('scale_width');
        }else{
            img.classList.remove('scale_width');
            img.classList.add('scale_height');
        }
    }
    
    static FitContainerContain(img){
        const ratio_width = img.naturalWidth / img.parentNode.clientWidth;
        const ratio_height = img.naturalHeight / img.parentNode.clientHeight;
        if(ratio_width < ratio_height){
            img.classList.remove('scale_width');
            img.classList.add('scale_height');
        }else{
            img.classList.remove('scale_height');
            img.classList.add('scale_width');
        }
    }

    static IsPromise(obj){
        return typeof obj.then == 'function';
    }
    
    static GetYoutubeVideoUrl(id, si){
        return 'https://www.youtube.com/embed/'+id+'?si='+si+'&autoplay=1&loop=1&controls=0&rel=0';
    }
    
    static SetYoutubePlaylist(iframe, playlist){
        iframe.playlist = playlist;
        iframe.currentIndex = -1;
        iframe.removeAttribute('onload');
        Utils.YoutubePlaylistIframeNext(iframe);
    }
    
    static YoutubePlaylistIframeNext(iframe){
        iframe.currentIndex = (iframe.currentIndex + 1) % iframe.playlist.length;
        iframe.parentNode.classList.add('loading');
        setTimeout(()=>{
            iframe.src = Utils.GetYoutubeVideoUrl(iframe.playlist[iframe.currentIndex].video_id, iframe.playlist[iframe.currentIndex].video_si);
            iframe.addEventListener('load', () => {
                setTimeout(() => {
                    iframe.parentNode.classList.remove('loading');
                }, 400);
                setTimeout(() => {
                    Utils.YoutubePlaylistIframeNext(iframe);
                }, iframe.playlist[iframe.currentIndex].duration * 1000)
            }, {once: true});
        }, 450) 
    }
    
    static SmoothlyReplaceInnerHTML(DOMNode, new_content){
        DOMNode.style.setProperty('transition', 'opacity .4s ease-in-out');
        requestAnimationFrame(() => {
            DOMNode.style.setProperty('opacity', 0);
            setTimeout(() => {
                DOMNode.innerHTML = new_content;
                DOMNode.style.setProperty('opacity', 1);
                setTimeout(() => {
                    DOMNode.style.removeProperty('opacity');
                    DOMNode.style.removeProperty('transition');
                }, 450);
            }, 450);
        })
    }
}

window.Utils = Utils;