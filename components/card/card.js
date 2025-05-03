export default class CardController {
    static css_files = ['/components/card/card.css'];

    constructor(container) {
        this.DOMContainer = container;

        // Recover every editable DOM Elements for setters and getters, So we dont have to do querySelector every time
        this.title_container = this.DOMContainer.querySelector('.card_title');
        this.desc_container  = this.DOMContainer.querySelector('.card_desc');

        // Initialize the slideshow
        this.InitializeCovers();

        // Setting the description & Title
        this.title = container.getAttribute('title');
        this.desc = container.getAttribute('desc');
    }

    // Initialize the "slideshow" with images in the "covers" attribute
    InitializeCovers(){
        // We recover the controller of the slideshow
        this.cover_slideshow = this.DOMContainer.querySelector('.cover_slideshow').controller;

        // We add all the images contained in the attribute "covers"
        let covers = JSON.parse(this.DOMContainer.getAttribute('covers'));
        covers.forEach(image => {
            this.cover_slideshow.AddImage(image);
        });

        // If the slideshow wasn't already playing, start it
        if(!this.cover_slideshow.isPlaying) this.cover_slideshow.Start();
    }

    /*********************************************************************************/
    /* Getters & Setters (Update the DOM and the value)
    /*********************************************************************************/
    set title(value){
        this.title_container.innerText = value;
        this._title = value;
    }

    get title(){
        return this._title;
    }

    set desc(value){
        this.desc_container.innerText = value;
        this._desc = value;
    }

    get desc(){
        return this._desc;
    }
}