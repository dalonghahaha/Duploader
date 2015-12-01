/**
 * 类名样式表
 */
Duploader.prototype._class = {
    BASE: 'Duploader',
    HIDDEN: 'Hidden',
    MASK: 'Mask',
    OPERATION: 'operation',
    TITLE:'title',
    FILE_LIST: 'file-list',
    FILE_INFO: 'file-info',
    BUTTON:'button',
    BUTTON_BASE:'button-base',
    BUTTON_ADD:'button-add',
    BUTTON_UPLOAD:'button-upload',
    BUTTON_CANCEL:'button-cancel'
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
        var result = this.runtime.instance.querySelector(selector);
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
    this.runtime.instance = this.create_element(this._class.BASE);
    this.runtime.instance.appendChild(this.create_element([this._class.MASK,this._class.HIDDEN]));
    this.runtime.instance.appendChild(this.build_operation());
    document.body.appendChild(this.runtime.instance);
    setTimeout(this.on_uploader_build.bind(this), 100);
}

/**
 * 构造操作区
 */
Duploader.prototype.build_operation = function() {
    var operation = this.create_element([this._class.OPERATION,this._class.HIDDEN]);
    var title = this.create_element(this._class.TITLE,'请选择需要上传的文件:');
    var file_list = this.create_element(this._class.FILE_LIST);
    var button = this.build_button();
    operation.appendChild(title);
    operation.appendChild(file_list);
    operation.appendChild(button);
    return operation;
}

/**
 * 构造按钮区
 */
Duploader.prototype.build_button = function(){
    var button = this.create_element(this._class.BUTTON);
    button.appendChild(this.create_element([this._class.BUTTON_BASE,this._class.BUTTON_ADD],'添加文件'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE,this._class.BUTTON_UPLOAD],'上  传'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE,this._class.BUTTON_CANCEL],'取  消'));
    this.runtime._id = new Date().getTime() + Math.floor(Math.random() * 100);
    this.runtime.selector = document.createElement("input");
    this.runtime.selector.id = "file_" + this.runtime._id;
    this.runtime.selector.type = "file";
    this.runtime.selector.style.display = "none";
    if (this.config.accept_mime) {
        this.runtime.selector.setAttribute("accept", this.config.accept_mime);
    }
    button.appendChild(this.runtime.selector);
    return button;
}

/**
 * 新增文件信息
 * @param  file_info 文件信息
 */
Duploader.prototype.build_file_info = function(file_info){
    var file_info_div = this.create_element(this._class.FILE_INFO,file_info.name + "(" +this.format_size(file_info.size)+ ")");
    file_info_div.id = "file_info_" + file_info.id;
    this.query_element(this._class.FILE_LIST).appendChild(file_info_div);
}

/**
 * 修改文件信息
 * @param  file_info 文件信息
 */
Duploader.prototype.change_file_info = function(file_info) {
    var file_info_div = document.getElementById("file_info_" + file_info.id);
    if (file_info_div) {
        file_info_div.innerText = file_info.name;
    }
    this.runtime.selector.setAttribute("file_id", 0);
}

/**
 * 播放器DOM创建完毕回调
 */
Duploader.prototype.on_uploader_build = function() {
    //执行ready回调
    this.trigger('ready');
    //注册全局事件
    this.delegate_document_event();
    //注册video事件
    this.delegate_uploader_event();
}