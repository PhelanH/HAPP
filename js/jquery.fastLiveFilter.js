jQuery.fn.fastLiveFilter = function(list, options) {
	options = options || {};
	list = jQuery(list);
	var input = this;
	var lastFilter = '';
	var timeout = options.timeout || 0;
	var callback = options.callback || function() {};
	var keyTimeout;
	var lis = list.children();
	var len = lis.length;
	var oldDisplay = len > 0 ? lis[0].style.display : "block";
	callback(len);
	input.focus(function() {
	if( input.val() === lastFilter )
	{
		var filter = input.val().toLowerCase();
		if(filter.length>2)
		{
			db
			.transaction(function(tx) {
				var sql = 'SELECT * FROM NODES WHERE DESC!="" and (DESC like "%'+filter+'%" or Title like "%'+filter+'%" or body like "%'+filter+'") and parent not in (0,49,382,383,408,409,412,415) and type=1';
				tx
						.executeSql(
								sql,
								[],
								function(tx, results) {
								$('#searchlist').html('');
								var page='';
									if (results.rows.length !== 0) {
									$('#searchlist').show();
									$("ul#searchlist").height(window.innerHeight -210);									
										page += '';
										for (var i = 0; i < results.rows.length; i++) {
											page += '<li id="'
																								+ results.rows
																										.item(i).id
																								+ '" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;" data-parent="'
																								+ results.rows
																										.item(i).parent
																								+ '"'
													+ '><a href="#" style="line-height: 50px;margin-top:0px;">';
											if (results.rows.item(i).icon !== null) {
												page += '<img class="media-object img-responsive" src="'
														+ results.rows.item(i).icon
														+ '" style="height: 50px; display: inline-block;margin-right:20px;"/>';
											} else {
												page += '<img src="img/blank.png" style="height: 50px; display: inline-block;margin-right:10px;"/>';
											}
											page += '<h4 class="happ-blue h-inline" style="font-weight:normal";>'+results.rows.item(i).title+'</h4>'
													+ ' - '
													+ results.rows.item(i).desc
													+ '</a></li>';
										}
										$('#searchlist').html(page);
										$("ul#searchlist li").width(window.innerWidth);
										
									}
									else
									{
									$('#searchlist').hide();
									$('#searchlist').html('');
									}
								}, function(t, e) {
								});
			});
		}
		else
		{
		$('#searchlist').hide();
		$('#searchlist').html('');
		}
		}
		//return false;
	}).keydown(function() {
		clearTimeout(keyTimeout);
		keyTimeout = setTimeout(function() {
			if( input.val() === lastFilter ) 
			{
			$("ul#searchlist li").focus();
			return;
			}
			else
			{
			lastFilter = input.val();
			input.focus();
			}

		}, timeout);
	});
	return this;
}
