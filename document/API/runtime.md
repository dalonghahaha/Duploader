# Duploader运行时

***

###运行时:Duploader.runtime

```js
{
    //uoloader标识
    _id: 0,

    //websocket链接
    socket: null,

    //选择文件按钮
    btn_add: null,

    //上传按钮
    btn_upload: null,

    //选择文件控件
    selector: null,

    //上传锁
    uploading:false,

    //文件列表
    file_list: [],

    //上传计数
    upload_count: 0,

    //上传结果
    upload_result:[]
}
```

###发送到服务器端的数据
```js
{
    file_index: 文件索引,
    name: 文件名,
    size: 文件大小,
    start: 切片开始标记,
    end: 切片结束标记,
    index: 切片索引,
    total: 切片总数,
    data: 切片数据(base64加密)
}
```

###服务器端返回数据
```js
{
    file_index: 文件索引,
    name: 文件名,
    size: 文件大小,
    start: 切片开始标记,
    end: 切片结束标记,
    index: 切片索引,
    total: 切片总数,
    result: 上传结果，1为成功，负数为失败
    real_url: 真实文件路径，该节点默认在最后一个切片上传完成后返回
}
```
