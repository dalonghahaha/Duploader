# Duploader事件接口

***

###on_error
* **描述:**发生错误
* **参数:**
	- **info:**错误信息

###on_file_selected
* **描述:**选择文件完成
* **参数:**
	- **file_info:**文件信息
* **备注:**此事件可以设置返回值，如果返回flase则文件不会添加到上传队列中。

###on_file_add
* **描述:**文件添加到上传队列
* **参数:**
	- **uoloader:**Duploader控件实例
	- **file_info:**文件信息
* **备注:**
	- 此事件多用于在页面中自定义显示文件信息和设置文件替换和删除事件，如果不实现该事件则会默认调用系统中的file_add_show方法，在section_file_list区域显示文件信息。
	- 此事件在不同的上传模式中的作用不相同。

###on_file_change
* **描述:**上传队列中的文件发生变化
* **参数:**
	- **uoloader:**Duploader控件实例
	- **file_info:**文件信息
	- **file_index:**文件在上传队列中的索引
* **备注:**
	- 此事件多用于在多文件上传时在界面中自定义显示文件信息的变化。
	- 此事件只会在多文件上传模式中才能生效

###on_file_remove
* **描述:**上传队列中的文件移除
* **参数:**
	- **uoloader:**Duploader控件实例
	- **file_info:**文件信息
	- **file_index:**文件在上传队列中的索引
* **备注:**
	- 此事件多用于在多文件上传时在界面中自定义显示文件信息的变化。
	- 此事件只会在多文件上传模式中才能生效

###on_file_uploading
* **描述:**文件开始上传
* **参数:**
	- **uoloader:**Duploader控件实例
	- **file_info:**即将上传的文件信息

###on_file_slice_finish
* **描述:**文件分片上传完成
* **参数:**
	- **uoloader:**Duploader控件实例
	- **slice_upload_result:**分片上传结果

###on_file_upload_finish
* **描述:**文件上传完成
* **参数:**
	- **upload_count:**上传完毕文件计数
	- **upload_result:**上传结果

###on_file_list_upload_finish
* **描述:**队列上传完成
* **参数:**
	- **upload_count:**上传完毕文件计数
	- **upload_result:**上传结果
* **备注:**
	- 此事件在不同的上传模式中的返回值不同，如果是单个文件上传则为upload_result，如果是多文件上传则为upload_result数组。
	- 如果是单文件上传模式建议使用on_file_upload_finish接口

