import Utils from "/sources/Utils.js";

export default class Slideshow {
    static preserve_initial_container = true;
    static css_files = ['/components/slideshow/slideshow.css'];
    
    constructor(container){
        this.DOMContainer = container;
        this.images = Array.from(this.DOMContainer.querySelectorAll('img'));
        if(this.images.length > 0) this.Start();
    }

    Start(){
        this.currentIndex = -1;
        this.isPlaying = true;
        this.NextSlide();
    }

    Stop(){
        clearTimeout(this.next_timeout);
        this.isPlaying = false;
    }

    AddImage(src){
        const img = document.createElement('img');
        img.src = src;
        this.images.push(img);
        this.DOMContainer.appendChild(img);
    }
    
    NextSlide(){
        if(this.images[this.currentIndex] != null) this.images[this.currentIndex].classList.remove('revealed');
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.images[this.currentIndex].classList.add('revealed');
        if(this.isPlaying) this.next_timeout = setTimeout(this.NextSlide.bind(this), 5000);
        Utils.FitContainerContain(this.images[this.currentIndex]);
    }
}