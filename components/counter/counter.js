export default class Counter {
    constructor(container){
        this.DOMContainer = container;
        this.counter = this.DOMContainer.querySelector('[data-role="count"]');
        this.count = 0;
        setInterval(this.Count.bind(this), 1000);
    }

    TimestampToHumanTime(timestamp){
        const seconds = Math.floor(timestamp % 60);
        const minutes = Math.floor((timestamp / 60) % 60);
        const hour = Math.floor((timestamp / 3600) % 60);
        let ret = '';
        if(hour > 0) ret += hour + 'h ';
        if(minutes > 0) ret += minutes + 'm ';
        ret += seconds + 's ';
        return ret;
    }

    Count(){
        this.counter.innerHTML = this.TimestampToHumanTime(this.count);
        this.count++;
    }
}