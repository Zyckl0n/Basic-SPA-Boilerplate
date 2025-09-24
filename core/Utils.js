export default class Utils {
    static ParseBool(str){
        if(str == 'false' || str == '0') return false;
        return true;
    }
    
    static uid(){
        return Math.random().toString(36);
    }

    static IsPromise(obj){
        return typeof obj.then == 'function';
    }

    static Download(url, filename) {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    }

    static RemoveExtension(path) {
        return path.substring(0, path.lastIndexOf('.')) || path;
    }

    static ParseOrReturn(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    }
}

window.Utils = Utils;