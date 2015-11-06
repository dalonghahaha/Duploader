# Duploader配置项

***

###multiple
* **描述:**是否多文件上传模式
* **可选项:**true | false
* **默认值:**false

###debug
* **描述:**调试开关,开启后可在浏览器控制台看到相关调试信息
* **可选项:**true | false
* **默认值:**false

###chunk
* **描述:**是否分片上传
* **可选项:**true | false
* **默认值:**false

###chunk_size
* **描述:**分片大小,默认2M
* **可选项:**任意数值
* **默认值:**2 x 1024 x 1024

###resume_broken
* **描述:**是否启动断点续传,基于LocalStorage浏览器需要支持
* **可选项:**true | false
* **默认值:**false

###accept_mime
* **描述:**文件选择器类别过滤
* **可选项:**系统能识别的mime
* **默认值:**null

###extend_limited
* **描述:**文件选择器类别过滤，参数需要使用数组形式
* **可选项:**需要过滤的后缀名
* **默认值:**null

###size_limited
* **描述:**文件大小限制
* **可选项:**任意数值
* **默认值:**null

###btn_add(必填)
* **描述:**选择文件按钮ID,控件会在该按钮的click事件上绑定选择文件操作
* **可选项:**字符串
* **默认值:**null

###btn_upload(必填)
* **描述:**选择文件按钮ID,控件会在该按钮的click事件上绑定上传文件操作
* **可选项:**字符串
* **默认值:**null

###section_file_list
* **描述:**当上传模式为multiple时显示文件列表区域
* **可选项:**字符串
* **默认值:**null

###upload_url(必填)
* **描述:**服务器端结束数据地址
* **可选项:**字符串
* **默认值:**null

upload_type
* **描述:**文件上传方式
* **可选项:**"websocket" | "post"
* **默认值:**"websocket"