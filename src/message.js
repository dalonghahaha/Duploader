/**
 * 创建websocket链接
 */
Duploader.prototype.websocket_init = function(callback) {
    if (this.runtime.socket) {
        return;
    }

    this.runtime.socket = new WebSocket(this.config.upload_url);

    this.runtime.socket.onopen = function(event) {
        this.debug('websocket open');
        callback();
    }.bind(this);

    this.runtime.socket.onmessage = function(event) {
        this.debug('websocket recive message');
        this.websocket_message(event.data);
    }.bind(this);

    this.runtime.socket.onclose = function(event) {
        this.debug("websocket close");
    }.bind(this);

    this.runtime.socket.onerror = function(event) {
        this.error("websocket error");
    }.bind(this);
}

/**
 * 关闭websocket链接
 */
Duploader.prototype.websocket_close = function() {
    if (this.runtime.socket) {
        this.runtime.socket.close();
    } else {
        this.debug("websocket 未创建");
    }
}

/**
 * 发送websocket数据
 * @param  data 向服务器端提交的数据
 */
Duploader.prototype.websocket_send = function(data) {
    this.debug(data);
    if (this.runtime.socket && this.runtime.socket.readyState != this.runtime.socket.CLOSING && this.runtime.socket.readyState != this.runtime.socket.CLOSED) {
        this.runtime.socket.send(JSON.stringify(data));
    } else {
        this.debug("websocket 未创建或者已经关闭");
    }
}

/**
 * 接收websocket返回数据
 * @param  data 服务器端返回的数据
 */
Duploader.prototype.websocket_message = function(data) {
    this.debug(data);
    this.file_slice_uploaded(JSON.parse(data));
}

/**
 * post方式发送数据
 * @param  data 向服务器端提交的数据
 */
Duploader.prototype.post_send = function(data) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    this.post_message(JSON.parse(AjaxRequest.response));
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("上传过程出现错误");
    }.bind(this);
    var UploadForm = new FormData();
    if (UploadForm) {
        for (var p in data) {
            UploadForm.append(p, data[p]);
        }
        AjaxRequest.open('POST', this.config.upload_url, true);　
        AjaxRequest.send(UploadForm);
    } else {
        this.error("上传过程出现错误");
    }
}

/**
 * 接收post方式返回数据
 * @param  data 服务器端返回的数据
 */
Duploader.prototype.post_message = function(data) {
    this.debug(data);
    data.file_index = parseInt(data.file_index);
    data.size = parseInt(data.size);
    data.start = parseInt(data.start);
    data.end = parseInt(data.end);
    data.index = parseInt(data.index);
    data.total = parseInt(data.total);
    this.file_slice_uploaded(data);
}