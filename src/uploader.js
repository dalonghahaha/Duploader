/**
 * 打开上传控件
 * event 事件对象
 */
Duploader.prototype.open_uploader = function(event) {
    //this.debug(document.body);
    //this.debug(document.body.scrollWidth);
    //this.debug(document.body.scrollHeight);
    this.query_element(this._class.MASK).style.width = window.screen.availWidth + "px";
    this.query_element(this._class.MASK).style.height = (document.body.scrollTop + window.screen.availHeight) + "px";
    this.query_element(this._class.OPERATION).style.left = (document.body.scrollWidth - 600) / 2 + "px";
    this.query_element(this._class.OPERATION).style.top = (document.body.scrollTop + 300) + "px";
    this.query_element(this._class.MASK).remove_class(this._class.HIDDEN);
    this.query_element(this._class.OPERATION).remove_class(this._class.HIDDEN);
}

/**
 * 关闭上传控件
 * event 事件对象
 */
Duploader.prototype.close_uploader = function(event) {
    this.query_element(this._class.FILE_LIST).innerHTML = '';
    this.runtime.uploading = false;
    this.runtime.file_id = null;
    this.runtime.file_list = [];
    this.runtime.upload_count = 0;
    this.runtime.upload_result = [];
    this.query_element(this._class.MASK).add_class(this._class.HIDDEN);
    this.query_element(this._class.OPERATION).add_class(this._class.HIDDEN);
    this.query_element(this._class.FILE_LIST).add_class(this._class.HIDDEN);
}

/**
 * 打开文件选择框
 * @param  event   事件对象
 * @param  file_id 操作的文件标识，如果有此标识则为重新选择文件，如果没有则为新增文件
 */
Duploader.prototype.open_select = function(event, file_id) {
    this.debug("event open_select");
    if (this.runtime.uploading) {
        this.alert('文件已经在上传了');
        return false;
    }
    if (file_id) {
        this.runtime.selector.setAttribute("file_id", file_id);
    }
    this.runtime.selector.value = '';
    var evt = document.createEvent("MouseEvents");  
    evt.initEvent("click", true, true);  
    this.runtime.selector.dispatchEvent(evt);
}

/**
 * 切换文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_change = function(event) {
    var btn_file_change = event.target || event.srcElement;
    var file_id = btn_file_change.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.open_select(event, file_id);
    }
}

/**
 * 删除文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_remove = function(event) {
    var btn_file_remove = event.target || event.srcElement;
    var file_id = btn_file_remove.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.file_removed(file_id);
    }
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
 * 文件整体上传
 * @param  file_index  文件列表索引
 */
Duploader.prototype.file_whole_upload = function(file_index) {
    var file_info = this.runtime.file_list[file_index]; //文件信息
    var reader = new window.FileReader();
    reader.readAsDataURL(file_info);
    reader.onloadend = function() {
        var base64data_begin_index = reader.result.lastIndexOf(',') + 1;
        this.file_send({
            file_index: file_index,
            name: file_info.name,
            size: file_info.size,
            start: 0,
            end: file_info.size,
            index: 0,
            total: 1,
            data: reader.result.substr(base64data_begin_index)
        });
    }.bind(this);
};

/**
 * 文件切片上传
 * @param  file_index  文件列表索引
 * @param  slice_count 切片总数
 * @param  index       切片索引
 */
Duploader.prototype.file_slice_upload = function(file_index, slice_count, index) {
    if ((index + 1) > slice_count) {
        console.error('文件分片分片错误!');
        return;
    }
    var file_info = this.runtime.file_list[file_index]; //文件信息
    var index = index ? index : 0; //分片索引
    var start = index * this.config.chunk_size; //开始位置
    var end = Math.min(file_info.size, start + this.config.chunk_size); //结束位置
    var reader = new window.FileReader();
    reader.readAsDataURL(file_info.slice(start, end));
    reader.onloadend = function() {
        var base64data_begin_index = reader.result.lastIndexOf(',') + 1;
        this.file_send({
            file_index: file_index,
            name: file_info.name,
            size: file_info.size,
            start: start,
            end: end,
            index: index,
            total: slice_count,
            data: reader.result.substr(base64data_begin_index)
        });
    }.bind(this);
}

/**
 * 发送文件数据
 * @param  data 上传数据
 */
Duploader.prototype.file_send = function(data) {
    if(this.config.chunk){
        var file_info = this.runtime.file_list[data.file_index];
        var num = parseFloat(data.index + 1);
        var total = parseFloat(data.total);
        //显示上传进度
        this.change_progress_info(file_info.id, this.format_percent(num, total));
    }
    
    if (this.config.upload_type == "websocket" && this.runtime.socket) {
        this.websocket_send(data);
    } else {
        this.post_send(data);
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
