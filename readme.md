# What is this ?
A basic "hello world" single page web app that you can copy / paste to quickly start a project without having 350 dependencies.

As I am pretty much always choosing the web to develop the front-end part of my project, I want to centralize and uniformise the structures of my code that run those UI. That's the reason this repo exists.

This repos is free to consult, copy, use or whatever you wanna do with the code :)

# How do i start ?

## <u>1. Clone this repository</u>
Use one of the options in the big green dropdown named "Code" or use this command :
```
git clone https://github.com/Zyckl0n/Basic-SPA-Boilerplate.git
```

## <u>2. Get a HTTP server</u>
You'll need a ```http(s)``` server, For a quick start on VS code, I recommand using the extension ["Live Server"](https://marketplace.visualstudio.com/items/?itemName=ritwickdey.LiveServer) (by Ritwick Dey)

Then open the settings 

![alt text](/assets/__readme/live_server_config_1.png)

Redirect every URL to "index.html" so the SPA can work correctly.

![alt text](/assets/__readme/live_server_config_2.png)

Then disable the auto reload for the same reason :

![alt text](/assets/__readme/live_server_config_3.png)

```json
{
    /* ... */

    "liveServer.settings.ignoreFiles": [
        "**/*",
        ".vscode/**",
        "**/*.scss",
        "**/*.sass",
        "**/*.ts"
    ]

    /* ... */
}
```

Then you should be good to go ! Hit the "Go Live" button on the bottom right corner

![alt text](/assets/__readme/live_server_config_4.png)
# How do i use it ?

## 1. Hello world
**pages/home/home.html** is where the home page is rendered, you can start here and mess around with the HTML

## 2. Creating a new Page
* Create a new directory in **/pages** give him a unique ID (For example ```example_page```)
* Create a HTML file named after the directory (For example ```example_page.html```)
* Your page is now ready to be shown, In the home page, add a button that'll navigate to your new page :
```html
<button onclick="ChangePage('example_page')">Go to your page</button>
```

## 3. Creating a new component
We're gonna make a counter as a example
* Create a new directory in **/components** give him a unique ID (For example ```counter```)
* Create a HTML file named after the directory (For example ```counter.html```)
```html
<div class="counter_component">
    <h3 data-role="count">0s</h3>
</div>
```
* Create a JS file named after the directory (For example ```counter.js```). this file must be a JS module and export the controller class of the component as default export.
```js
export default class Counter {
    static css_files = ['/components/counter/counter.css'];

    constructor(container){
        this.counter_div = container.querySelector('[data-role="count"]');
        this.count = 0;
        this.counter_div.style.color = container.getAttribute('config-color');
        setInterval(this.Count.bind(this), 1000);
    }

    Count(){
        this.counter_div.innerHTML = this.count + 's';
        this.count++;
    }
}
```
* Your component can now be shown, In a page, you can include it like this
```html
<component data-name="counter"></component>
```
* Your controller class constructor will be called on the component body.
* To configure your component, use the HTML attributes
```html
<component data-name="counter" config-color="blue"></component>
```
* Then you can recover it like you recover any HTML attribute, in the constructor : 
```js
let color = container.getAttribute('config-color');
```

# Quick overview of the project organisation

* **/assets :** Where i'm putting my images, video or decorative element such as fonts or icon.
* **/components :** Where the code of components in your apps should be, 
    * **/components/counter :** All the code for the counter component
        * **/components/counter/counter.html :** HTML of the component, Must be named as the component
        * **/components/counter/counter.js :** Javascript controller of the component, Must be named as the component
        * **/components/counter/counter.css :** Style of the component (Not included by default with the component)
* **/config :** Where I suggest you put the config of your project, So it will be accessible with a simple import in you components or pages
* **/pages :** The pages (Big naming skills here)
    * **/pages/home :** The first page that will be called
    * **/pages/example_page :** a second page to demonstrate how navigation work.
* **/sources :** The code making the SPA work, if you have to change something here, that mean i did something bad, or you want to do add things or remake it better than i did, wich is probably a good idea !
* **/stylesheets :** Every stylesheets that does not belong to any specific pages or components
    * **/stylesheets/master.css :** Call every other stylesheet (Just include master to include all the rest)
* **/index.html :** The empty HTML skeleton that will contain the App (Runing with JS)