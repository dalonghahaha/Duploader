/**
 * 类名样式表
 */
Duploader.prototype._class = {
    HIDDEN: 'hidden',
    BASE: 'Duploader',
    OPERATION: 'operation',
    FILE_LIST: 'file-list',
}

/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Duploader.prototype.create_element = function(class_name, inner_text) {
    var element = document.createElement('div');
    if(class_name instanceof Array){
        element.className = class_name.join(' ');
    } else {
        element.className = class_name;
    }
    if (inner_text) {
        element.innerText = inner_text;
    }
    return element;
}

/**
 * 根据类名定位元素
 * @param  class_name 类名
 */
Duploader.prototype.query_element = function(class_name){
    if(class_name){
        var selector = "." + class_name;
        var result = document.querySelector(selector);
        result.has_class = function(class_name){
            if (class_name.replace(/\s/g, '').length == 0) {
                return false;
            }
            return new RegExp(' ' + class_name + ' ').test(' ' + this.className + ' ');
        };
        result.add_class = function(class_name){
            if (!this.has_class(class_name)) {
                this.className = this.className == '' ? class_name : this.className + ' ' + class_name;
            }
        };
        result.remove_class = function(class_name){
            if (this.has_class(class_name)) {
                var newClass = ' ' + this.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + class_name + ' ') >= 0) {
                    newClass = newClass.replace(' ' + class_name + ' ', ' ');
                }
                this.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        };
        return result;
    } else {
        return null;
    }
}

/**
 * 构造控件
 */
Duploader.prototype.build_uploader = function() {
    this.runtime.instance = this.create_element([this._class.BASE,this._class.HIDDEN]);
    this.runtime.instance.style.width =  document.body.scrollWidth + "px";
    this.runtime.instance.style.height = document.body.scrollHeight + "px";

    var operation = this.build_operation();
    this.runtime.instance.appendChild(operation);
    document.body.appendChild(this.runtime.instance);
    setTimeout(this.on_uploader_build.bind(this), 100);
}

/**
 * 构造操作区
 */
Duploader.prototype.build_operation = function() {
    var operation = this.create_element(this._class.OPERATION);
    operation.style.left = (document.body.scrollWidth - 400) / 2 + "px";
    operation.style.top = (document.body.scrollHeight - 300) / 2 + "px";
    return operation;
}

/**
 * 播放器DOM创建完毕回调
 */
Duploader.prototype.on_uploader_build = function() {
    this.debug('上传控件构造完毕');
    //执行ready回调
    if (this.on_player_ready && this.on_player_ready instanceof Function) {
        this.on_player_ready();
    }
    //注册全局事件
    this.delegate_document_event();

    //注册video事件
    this.delegate_uploader_event();
}