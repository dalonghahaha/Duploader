 /**
 * DuploaderBootstrap - Smart File Uploader
 * v1.0.0
 *
 * Date: 2015-10-15
 */

function DuploaderBootstrap(config){
	//初始化弹出层
	this.build_modal(config.id);
	//绑定成功回调
	this.success_callback = config.success_callback;
	//绑定上传按钮事件
	$("#"+config.id).click(function(){
			this.modal.modal({
			  keyboard: false
			})
		}.bind(this));
	//初始化Duploader
	this.uploader = new Duploader({
		driver:this,
	    debug:false,
	    chunk:true,
	    btn_add: "file_select_" + config.id,
		btn_upload: "file_upload_" + config.id,
	    multiple: $("#"+config.id).attr("upload-type") == "multiple",
	    on_file_add:this.on_file_add.bind(this),
	    on_file_uploading:this.on_file_uploading.bind(this),
	    on_file_slice_finish:this.on_file_slice_finish.bind(this),
	    on_file_list_upload_finish:this.on_file_list_upload_finish.bind(this),
	    upload_url: config.upload_url,
	    upload_type: config.upload_type
	});
}

DuploaderBootstrap.prototype.build_modal = function(id){
	var modal = $("<div>").addClass("modal fade").attr("id", "modal_" + id).attr('tabindex','-1').attr('role','dialog');
	var modal_dialog = $("<div>").addClass("modal-dialog").attr('role','document');
	var modal_content = $("<div>").addClass("modal-content");
	var modal_header = $("<div>").addClass("modal-header");
	var button_close = $("<button>").addClass("close").attr('type','button').attr('data-dismiss','modal').attr('aria-label','Close').html('<span aria-hidden="true">&times;</span>');
	var modal_title = $("<h4>").addClass("modal-title").text('已选择文件');
	var modal_body = $("<div>").addClass("modal-body").attr("id","file_list_" + id);
	var modal_footer = $("<div>").addClass("modal-footer");
	var button_add = $("<button>").addClass("btn btn-primary").attr('type','button').attr('id','file_select_' + id).text('选择');
	var button_upload = $("<button>").addClass("btn btn-primary").attr('type','button').attr('id','file_upload_' + id).text('上传');
	modal_header.append(button_close).append(modal_title);
	modal_footer.append(button_add).append(button_upload);
	modal_content.append(modal_header).append(modal_body).append(modal_footer);
	modal.append(modal_dialog.append(modal_content));
	$("#"+id).after(modal);
	this.modal = $('#modal_' + id);
	this.section_file_list = $('#file_list_' + id);
}

DuploaderBootstrap.prototype.on_file_add = function(uploader,file_info){
	var span_file_info = $("<button>").addClass("btn btn-sm").attr("id", "file_info_" + file_info.id).text(file_info.name);
    var btn_change = $("<button>").addClass("btn btn-success btn-sm").text("修改").attr("file_id", file_info.id).attr("id", "file_change_" + file_info.id).css("margin-left", "10px");
    var btn_delete = $("<button>").addClass("btn btn-danger btn-sm").text("删除").attr("file_id", file_info.id).attr("id", "file_delete_" + file_info.id).css("margin-left", "10px");
    var progress = $("<div>").addClass("progress").css("margin-top", "10px").attr("id","file_progress_" + file_info.id).hide();
    var progress_bar = $("<div>").addClass("progress-bar").css("width","0").attr("role","progressbar").attr("id","file_progressbar_" + file_info.id).attr("aria-valuemin","0").attr("aria-valuemax","100");
    if(uploader.config.multiple){
    	var section_file_operation = $("<div>")
    									.attr("id", "file_section_" + file_info.id)
    									.append(span_file_info)
    									.append(btn_change)
    									.append(btn_delete)
    									.append(progress.append(progress_bar));
   		this.section_file_list.append(section_file_operation);
    	$("#file_change_" + file_info.id).on("click", uploader.file_change.bind(uploader));
    	$("#file_delete_" + file_info.id).on("click", uploader.file_remove.bind(uploader));
    }
    else{
    	var span = $("span[id*='file_info_']").get(0);
    	if(span){
    		var span_index = $("span[id*='file_info_']").eq(0).attr("id");
    		file_info.id = span_index.substr(span_index.lastIndexOf('_') + 1);
    	} else{
    		var section_file_operation = $("<p>")
    									.attr("id", "file_section_" + file_info.id)
    									.append(span_file_info)
    									.append(progress.append(progress_bar));
   			this.section_file_list.append(section_file_operation);
   			//断点续传显示
    		if(file_info.begin_index && file_info.begin_index > 0){
    			console.log(111);
    			var total = Math.ceil(file_info.size / uploader.config.chunk_size); 
    			var Percent = total <= 0 ? "0%" : (Math.round(file_info.begin_index / total * 10000) / 100.00 + "%"); 
				$("#file_progressbar_" + file_info.id).css("width",Percent);
				$("#file_progress_" + file_info.id).show();
    		};
    	}
    }
}

DuploaderBootstrap.prototype.on_file_uploading = function(uploader,file_info){
	$("#file_progress_" + file_info.id).show();
}

DuploaderBootstrap.prototype.on_file_slice_finish = function(uploader,data){
	var file_info = uploader.runtime.file_list[data.file_index];
	var num = parseFloat(data.index + 1); 
	var total = parseFloat(data.total); 
	if (isNaN(num) || isNaN(total)) { 
		return "-"; 
	}
	var Percent = total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%"); 
	$("#file_progressbar_" + file_info.id).css("width",Percent);
}

DuploaderBootstrap.prototype.on_file_list_upload_finish = function(result){
	this.success_callback(result);
	this.modal.modal('hide');
}
