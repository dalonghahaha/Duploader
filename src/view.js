/**
 * 类名样式表
 */
Duploader.prototype._class = {
    BASE: 'Duploader',
    HIDDEN: 'Duploader-Hidden',
    CLEAR: 'Duploader-Clear',
    MASK: 'Mask',
    OPERATION: 'operation',
    TITLE: 'title',
    FILE_LIST: 'file-list',
    FILE: 'file',
    FILE_SECTION: 'file-section',
    FILE_INFO: 'file-info',
    FILE_CHANGE: 'file-change',
    FILE_REMOVE: 'file-remove',
    PROGRESS_SECTION: 'progress-section',
    PROGRESS_BAR: 'progress-bar',
    PROGRESS_INFO: 'progress-info',
    PROGRESS_TEXT: 'progress-text',
    BUTTON: 'button',
    BUTTON_BASE: 'button-base',
    BUTTON_ADD: 'button-add',
    BUTTON_UPLOAD: 'button-upload',
    BUTTON_CANCEL: 'button-cancel'
}

/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Duploader.prototype.create_element = function(class_name, inner_text) {
    var element = document.createElement('div');
    if (class_name instanceof Array) {
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
Duploader.prototype.query_element = function(class_name) {
    if (class_name) {
        var selector = "." + class_name;
        var result = this.runtime.instance.querySelector(selector);
        result.has_class = function(class_name) {
            if (class_name.replace(/\s/g, '').length == 0) {
                return false;
            }
            return new RegExp(' ' + class_name + ' ').test(' ' + this.className + ' ');
        };
        result.add_class = function(class_name) {
            if (!this.has_class(class_name)) {
                this.className = this.className == '' ? class_name : this.className + ' ' + class_name;
            }
        };
        result.remove_class = function(class_name) {
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
    this.runtime.instance.appendChild(this.create_element([this._class.MASK, this._class.HIDDEN]));
    this.runtime.instance.appendChild(this.build_operation());
    document.body.appendChild(this.runtime.instance);
    setTimeout(this.on_uploader_build.bind(this), 100);
}

/**
 * 构造操作区
 */
Duploader.prototype.build_operation = function() {
    var operation = this.create_element([this._class.OPERATION, this._class.HIDDEN]);
    var title = this.create_element(this._class.TITLE, '请选择需要上传的文件:');
    var file_list = this.create_element([this._class.FILE_LIST, this._class.HIDDEN]);
    var button = this.build_button();
    operation.appendChild(title);
    operation.appendChild(file_list);
    operation.appendChild(button);
    return operation;
}

/**
 * 构造按钮区
 */
Duploader.prototype.build_button = function() {
    var button = this.create_element(this._class.BUTTON);
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_ADD], '添加文件'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_UPLOAD], '上  传'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_CANCEL], '取  消'));
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
Duploader.prototype.build_file_info = function(file_info) {
    var file_container = this.create_element(this._class.FILE);
    file_container.id = "file_section_" + file_info.id;
    file_container.appendChild(this.build_file_section(file_info));
    file_container.appendChild(this.build_progress_section(file_info));
    this.query_element(this._class.FILE_LIST).appendChild(file_container);
    this.query_element(this._class.FILE_LIST).remove_class(this._class.HIDDEN);
}

Duploader.prototype.build_file_section = function(file_info) {
    var file_section = this.create_element(this._class.FILE_SECTION);
    var file_name = this.create_element(this._class.FILE_INFO, file_info.name + "(" + this.format_size(file_info.size) + ")");
    file_name.id = "file_info_" + file_info.id;
    file_section.appendChild(file_name);
    if (this.config.multiple) {
        var btn_remove = this.create_element(this._class.FILE_REMOVE, '删  除');
        btn_remove.setAttribute("file_id", file_info.id);
        file_section.appendChild(btn_remove);
        var btn_change = this.create_element(this._class.FILE_CHANGE, '修  改');
        btn_change.setAttribute("file_id", file_info.id);
        file_section.appendChild(btn_change);
    }
    file_section.appendChild(this.create_element(this._class.CLEAR));
    return file_section;
}

Duploader.prototype.build_progress_section = function(file_info) {
    var progress_section = this.create_element([this._class.PROGRESS_SECTION, this._class.HIDDEN]);
    progress_section.id = 'progress_section_' + file_info.id;

    var progress_bar = this.create_element(this._class.PROGRESS_BAR);
    var progress_info = this.create_element(this._class.PROGRESS_INFO);
    progress_info.id = 'progress_info_' + file_info.id;
    progress_bar.appendChild(progress_info);
    var progress_text = this.create_element(this._class.PROGRESS_TEXT, '0%');
    progress_text.id = 'progress_text_' + file_info.id;
    progress_section.appendChild(progress_bar);
    progress_section.appendChild(progress_text);
    progress_section.appendChild(this.create_element(this._class.CLEAR));
    return progress_section;
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

Duploader.prototype.remove_file_info = function(file_info) {
    var file_section = document.getElementById('file_section_' + file_info.id);
    file_section.parentNode.removeChild(file_section);
    if (this.runtime.file_list.length == 0) {
        this.query_element(this._class.FILE_LIST).add_class(this._class.HIDDEN);
    }
}

/**
 * 显示上传进度
 * @param  percent 进度百分比
 */
Duploader.prototype.change_progress_info = function(file_id, percent) {
    this.remove_class(document.getElementById('progress_section_' + file_id), this._class.HIDDEN);
    document.getElementById('progress_info_' + file_id).style.width = percent + "%";
    document.getElementById('progress_text_' + file_id).innerText = percent + "%";
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
