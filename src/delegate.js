/**
 * 代理注册器
 * @param  class_name 类名
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Duploader.prototype.delegate = function(class_name, event_name, fun) {
    var root = this.runtime.instance;
    root.addEventListener(event_name, function(event) { 
        var target = event.target || event.srcElement;
        var path = [target.className];
        while(target.parentElement && target != root){
            path.push(target.parentElement.className);
            target = target.parentElement;
        }
        if(class_name){
            var target = event.target || event.srcElement;
            if (this.index_of(path, class_name)) {
                fun(event);
            };
        } else {
            fun(event);
        }
        return false;
    }.bind(this));
}

/**
 * 注册全局事件
 */
Duploader.prototype.delegate_document_event = function() {

}

/**
 * 注册控件事件
 */
Duploader.prototype.delegate_uploader_event = function() {
    var btn_open = document.getElementById(this.config.btn_open);
    btn_open.addEventListener('click',this.open_uploader.bind(this));
    this.runtime.selector.addEventListener("change", this.file_selected.bind(this));
    this.delegate(this._class.BUTTON_ADD,'click',this.open_select.bind(this));
    this.delegate(this._class.BUTTON_UPLOAD,'click',this.upload.bind(this));
    this.delegate(this._class.BUTTON_CANCEL,'click',this.close_uploader.bind(this));
}
