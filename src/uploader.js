
Duploader.prototype.open_uploader = function(event){
    this.runtime.instance.style.width =  document.body.scrollWidth + "px";
    this.runtime.instance.style.height = document.body.scrollHeight + "px";
    this.query_element(this._class.OPERATION).style.left = (document.body.scrollWidth - 400) / 2 + "px";
    this.query_element(this._class.OPERATION).style.top = (document.body.scrollHeight - 300) / 2 + "px";
    this.query_element(this._class.BASE).remove_class(this._class.HIDDEN);
}

/**
 * 打开文件选择框
 * @param  event   事件对象
 * @param  file_id 操作的文件标识，如果有此标识则为重新选择文件，如果没有则为新增文件
 */
Duploader.prototype.open_select = function(event, file_id) {
    this.debug("open_select");
    if (this.runtime.uploading) {
        this.alert('文件已经在上传了');
        return false;
    }
    if (file_id) {
        this.runtime.selector.setAttribute("file_id", file_id);
    }
    this.runtime.selector.value = '';
    this.runtime.selector.dispatchEvent(new Event("click"));
}

/**
 * 开始上传
 * event 事件对象
 */
Duploader.prototype.upload = function(event) {
    if (this.runtime.uploading) {
        this.alert('文件已经在上传了');
        return false;
    }
    if (this.runtime.file_list.length > 0) {
        this.debug('upload begin');
        //文件上传锁
        this.runtime.uploading = true;
        if (this.config.upload_type == "websocket" && !this.runtime.socket) {
            this.websocket_init(function() {
                this.file_upload(0);
            }.bind(this));
        } else {
            this.file_upload(0);
        }
    } else {
        this.alert("请先选择需要上传文件 ！");
    }
}

/**
 * 文件选择回调函数
 * @param  event 事件对象
 */
Duploader.prototype.file_selected = function(event) {
    var file_info = this.runtime.selector.files[0];
    if (!file_info) {
        this.error('获取文件信息失败');
        return false;
    }
    //文件后缀名校验
    if (!this.check_file_extend(file_info)) {
        return false;
    }
    //文件大小校验
    if (!this.check_file_size(file_info)) {
        return false;
    }
    //自定义校验
    if (this.config.on_file_selected && this.config.on_file_selected instanceof Function) {
        if (!this.config.on_file_selected(file_info)) {
            return false;
        }
    }
    //尝试获取断点
    file_info.begin_index = this.get_file_broken_point(file_info);
    //根据不同状态调用不同的处理函数
    if (this.config.multiple) {
        if (this.runtime.selector.getAttribute("file_id") && this.runtime.selector.getAttribute("file_id") != 0) {
            file_info.id = this.runtime.selector.getAttribute("file_id");
            this.file_changed(event, file_info);
        } else {
            file_info.id = new Date().getTime();
            this.file_added(event, file_info);
        }
    } else {
        if (this.runtime.file_id) {
            file_info.id = this.runtime.file_id;
            this.file_changed(event, file_info);
        } else {
            file_info.id = new Date().getTime();
            this.file_added(event, file_info);
        }
    }
}

/**
 * 检测文件后缀名是否符合规范
 * @param  file_info 文件信息
 */
Duploader.prototype.check_file_extend = function(file_info) {
    if (this.config.extend_limited && this.config.extend_limited.length > 0) {
        var file_name = file_info.name;
        var extend = file_name.substring(file_name.lastIndexOf(".") + 1);
        var is_ok = false;
        var extend_limited_info = '';
        for (var i = 0; i < this.config.extend_limited.length; i++) {
            extend_limited_info += extend_limited_info ? "," + this.config.extend_limited[i] : this.config.extend_limited[i];
            if (extend == this.config.extend_limited[i]) {
                is_ok = true;
            }
        }
        if (!is_ok) {
            this.alert('文件类型不符合要求,后缀名只能为：' + extend_limited_info);
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 检测文件大小是否符合规范
 * @param  file_info 文件信息
 */
Duploader.prototype.check_file_size = function(file_info) {
    if (this.config.size_limited && this.config.size_limited > 0) {
        var file_size = file_info.size;
        if (file_size > this.config.size_limited) {
            this.alert('文件大小不符合要求,最大只能为：' + this.format_size(this.config.size_limited));
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 获取文件上传断点
 * @param  file_info 文件信息
 */
Duploader.prototype.get_file_broken_point = function(file_info) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            //尝试从localStorage中读取进度
            var key = window.btoa(escape(file_info.name) + "|" + file_info.size);
            var uploaded_data = localStorage.getItem(key);
            if (uploaded_data) {
                this.debug(uploaded_data);
                var data = JSON.parse(uploaded_data);
                return data.index + 1;
            } else {
                return 0;
            }
        }
    } else {
        return 0;
    }
}

/**
 * 记录已经上传完成信息
 * @param  data 上传完成数据
 */
Duploader.prototype.record_file_broken_point = function(data) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            if (window.localStorage) {
                var key = window.btoa(escape(data.name) + "|" + data.size);
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    }
}

/**
 * 删除断点记录 
 * @param  data 上传完成数据
 */
Duploader.prototype.remove_file_broken_point = function(data) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            if (window.localStorage) {
                var key = window.btoa(escape(data.name) + "|" + data.size);
                localStorage.removeItem(key);
            }
        }
    }
}
