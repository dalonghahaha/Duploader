 /**
 * DuploaderBootstrap - Smart File Uploader
 * v1.0.0
 *
 * Date: 2015-10-15
 */
var DuploaderBootstrap = {
	id:null,
	section_file_list:null,
	modal:null,
	uploadr:null,
	success_callback:null,
	bind:function(id,success_callback){

		this.build_modal(id);

		$("#"+id).click(function(){
			this.modal.modal({
			  keyboard: false
			})
		}.bind(this));

		this.id = id;

		this.success_callback = success_callback;

		var multiple = $("#"+id).attr("upload-type") == "multiple";

		this.uploadr = Duploadr.init({
						    debug: false,
						    btn_add: "file_select_" + id,
        					btn_upload: "file_upload_" + id,
						    multiple: multiple,
						    on_file_add:this.on_file_add,
						    on_file_uploading:this.on_file_uploading,
						    on_file_slice_finish:this.on_file_slice_finish,
						    on_file_list_upload_finish:this.on_file_list_upload_finish,
						    upload_url: "http://duploader.me/Server/upload.php",
						    upload_type: "post"
						});

		return this;
	},
	build_modal:function(id){
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
	},
	on_file_add:function(uploadr,file_info){
		var span_file_info = $("<label>").attr("id", "file_info_" + file_info.id).text(file_info.name);
        var btn_change = $("<button>").addClass("btn btn-success btn-sm").text("修改").attr("file_id", file_info.id).attr("id", "file_change_" + file_info.id).css("margin-left", "10px");
        var btn_delete = $("<button>").addClass("btn btn-danger btn-sm").text("删除").attr("file_id", file_info.id).attr("id", "file_delete_" + file_info.id).css("margin-left", "10px");
        var progress = $("<div>").addClass("progress").css("margin-top", "10px").attr("id","file_progress_" + file_info.id).hide();
        var progress_bar = $("<div>").addClass("progress-bar").css("width","0").attr("role","progressbar").attr("id","file_progressbar_" + file_info.id).attr("aria-valuemin","0").attr("aria-valuemax","100");
        if(uploadr.config.multiple){
        	var section_file_operation = $("<p>")
        									.attr("id", "file_section_" + file_info.id)
        									.append(span_file_info)
        									.append(btn_change)
        									.append(btn_delete)
        									.append(progress.append(progress_bar));
       		this.section_file_list.append(section_file_operation);
        	$("#file_change_" + file_info.id).on("click", uploadr.file_change.bind(uploadr));
        	$("#file_delete_" + file_info.id).on("click", uploadr.file_remove.bind(uploadr));
        }
        else{
        	var span = $("span[id*='file_info_']").get(0);
        	if(span){
        		var span_index = $("span[id*='file_info_']").eq(0).attr("id");
        		file_info.id = span_index.substr(span_index.lastIndexOf('_') + 1);
        		uploadr.file_changed(file_info);
        	} else{
        		var section_file_operation = $("<p>")
        									.attr("id", "file_section_" + file_info.id)
        									.append(span_file_info)
        									.append(progress.append(progress_bar));
       			this.section_file_list.append(section_file_operation);
        	}
        }
	}.bind(this),
	on_file_uploading: function(file_info){

		$("#file_progress_" + file_info.id).show();
	},
	on_file_slice_finish:function(uploadr,data){
		var file_info = uploadr.runtime.file_list[data.file_index];
		var num = parseFloat(data.index + 1); 
		var total = parseFloat(data.total); 
		if (isNaN(num) || isNaN(total)) { 
			return "-"; 
		}
		var Percent = total <= 0 ? "0%" : (Math.round(num / total * 10000) / 100.00 + "%"); 
		$("#file_progressbar_" + file_info.id).css("width",Percent);
	},
	on_file_list_upload_finish:function(){
		this.modal.modal('hide');
		if(DuploaderBootstrap.uploadr.config.multiple){
			DuploaderBootstrap.success_callback(DuploaderBootstrap.uploadr.runtime.file_list);
		}else{
			DuploaderBootstrap.success_callback(DuploaderBootstrap.uploadr.runtime.file_list[0]);
		}
	}
}