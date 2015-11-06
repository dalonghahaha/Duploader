# Duploader使用说明示例

***

```html

<!-- 基本结构 -->
<body>
	<p>
		<input type="button" id="file_select" value="添加文件">
	</p>
	<p>
		<input type="button" id="file_upload" value="开始上传">
	</p>
	<section id="file_list">
	</section>
</body>

<!-- 框架代码 -->
<script src="[path]/jquery.min.js"></script>
<script src="[path]/Duploader.core.js"></script>
<script src="[path]/Duploader.bootstrap.js"></script>

<!-- 初始化 -->
<script type="text/javascript">
var uploader = new Duploader({
	btn_add:'file_select',
	btn_upload:'file_upload',
	section_file_list:'file_list',
	upload_url: "../demo_server/PHP/upload.php",
	upload_type: "post",
});
</script>
```