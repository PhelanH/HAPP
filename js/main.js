var DEBUG = false;
var version = 1;
var $num = 0;
var $count = 0;
var $nodesneedtoupdate = true;
var menurendered = false;
var phonegap = true;
var db = false;
Date.prototype.toDateInputValue = (function() {
	var local = new Date(this);
	local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
	return local.toJSON().slice(0, 10);
});
function distance(lat1, lon1, lat2, lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2 - lat1) * Math.PI / 180;
	var dLon = (lon2 - lon1) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
			+ Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
			* Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return Math.round(d * 10000) / 10000;
}
/*
 * if (navigator.geolocation) {
 * navigator.geolocation.getCurrentPosition(getGeoDistance,
 * function(){console.log("Error")}); } else { error('not supported'); }
 */
function getGeoDistance(position) {
	db
			.transaction(function(tx) {
				var sql = 'SELECT * FROM NODES WHERE lat IS NOT NULL and lon IS NOT NULL order by parent,id';
				tx.executeSql(sql, [], function(tx, results) {
					if (results.rows.length !== 0) {
						db.transaction(function(tx) {
							for (var i = 0; i < results.rows.length; i++) {
								var $geoid = results.rows.item(i).id;
								var $lat = results.rows.item(i).lat;
								var $lon = results.rows.item(i).lon;
								var $distanz = distance($lat, $lon,
										position.coords.latitude,
										position.coords.longitude);
								var sqlgeo = 'UPDATE NODES SET dist='
										+ $distanz + ' WHERE id=' + $geoid;
								tx.executeSql(sqlgeo, [], errorCB, successCB);
							}
						}, function() {
						}, function() {
						});
					}
				}, function(t, e) {
				});
			});
}
function getGeoLocations() {
	db
			.transaction(function(tx) {
				var sql = 'SELECT * FROM NODES WHERE lat IS NULL and lon IS NULL and parent!=0 and type!=0 order by parent,id';
				tx
						.executeSql(
								sql,
								[],
								function(tx, results) {
									if (results.rows.length !== 0) {
										for (var i = 0; i < results.rows.length; i++) {
											if ((results.rows.item(i).city != undefined)
													&& (results.rows.item(i).zip != undefined)
													&& (results.rows.item(i).street != undefined)) {
												$
														.ajax({
															type : "GET",
															invokedata : results.rows
																	.item(i).id,
															cache : false,
															url : "http://open.mapquestapi.com/nominatim/v1/search/de/"
																	+ results.rows
																			.item(i).city
																	+ "/"
																	+ results.rows
																			.item(i).zip
																	+ "/"
																	+ results.rows
																			.item(i).street
																	+ "?format=json&addressdetails=1&countrycodes=de&limit=1",
															success : function(
																	data, i) {
																var geoid = this.invokedata;
																if (data[0] !== undefined) {
																	if ((data[0].lat !== undefined)
																			&& (data[0].lon !== undefined)) {
																		db
																				.transaction(
																						function(
																								tx) {
																							var sql = 'UPDATE NODES SET lat='
																									+ data[0].lat
																									+ ', lon='
																									+ data[0].lon
																									+ ' WHERE id='
																									+ geoid;
																							tx
																									.executeSql(
																											sql,
																											[],
																											function() {
																											},
																											function(
																													t,
																													e) {
																											});
																						},
																						errorCB,
																						successCB);
																	}
																}
															}
														});
											}
										}
									}
								}, function(t, e) {
								});
			});
}
function checkLanguage() {
	if (window.localStorage.getItem("lang") == undefined) {
		if (navigator.globalization != undefined) {
			navigator.globalization
					.getLocaleName(
							function(locale) {
								if ((locale.value == "de_DE")
										|| (locale.value == "de_AT")
										|| (locale.value == "de_CH")
										|| (locale.value == "de-DE")
										|| (locale.value == "de-AT")
										|| (locale.value == "de-CH")) {
									window.localStorage.setItem("lang", "de");
									window.localStorage.setItem("L_map",
											"Karte anzeigen");
									window.localStorage.setItem("L_tel",
											"Jetzt anrufen");
									window.localStorage.setItem("L_mail",
											"Email senden");
									window.localStorage.setItem("L_www",
											"Zur Webseite");
									window.localStorage.setItem("L_search",
											"Online Suchen");
									window.localStorage.setItem(
											"L_searchagain", "Erneut suchen");
									window.localStorage.setItem("L_book",
											"Buchen");
									window.localStorage.setItem("L_stars",
											"Sterne");
									window.localStorage.setItem("L_rooms",
											"Freie Betten");
									window.localStorage.setItem("L_setting",
											"Einstellungen");
									window.localStorage.setItem("wetter", '');
									window.localStorage.setItem(
											"searchthisapp", '');
									window.localStorage.setItem("yes", 'Ja');
									window.localStorage.setItem("no", 'Nein');
									window.localStorage.setItem("exit",
											'Beenden');
									window.localStorage.setItem("exittext",
											'Wollen Sie die App beenden?');
									window.localStorage
											.setItem("geoerror",
													'Leider konnte die Karte nicht aufgerufen werden.');
								} else {
									window.localStorage.setItem("lang", "en");
									window.localStorage.setItem("L_map", "Map");
									window.localStorage.setItem("L_tel",
											"Make Call");
									window.localStorage.setItem("L_mail",
											"Send Email");
									window.localStorage.setItem("L_www",
											"To Website");
									window.localStorage.setItem("L_search",
											"Search");
									window.localStorage.setItem(
											"L_searchagain", "Search again");
									window.localStorage.setItem("L_book",
											"book");
									window.localStorage.setItem("L_stars",
											"Stars");
									window.localStorage.setItem("L_rooms",
											"Free Beds");
									window.localStorage.setItem("L_setting",
											"Settings");
									window.localStorage.setItem("wetter", '');
									window.localStorage.setItem(
											"searchthisapp", '');
									window.localStorage.setItem("yes", 'Yes');
									window.localStorage.setItem("no", 'No');
									window.localStorage.setItem("exit", 'Exit');
									window.localStorage.setItem("exittext",
											'Do you want to exit this App?');
									window.localStorage
											.setItem("geoerror",
													"We are sorry, but the map couldn't be open.");
								}
							},
							function() {
								window.localStorage.setItem("lang", "de");
								window.localStorage.setItem("L_map",
										"Karte anzeigen");
								window.localStorage.setItem("L_tel",
										"Jetzt anrufen");
								window.localStorage.setItem("L_mail",
										"Email senden");
								window.localStorage.setItem("L_www",
										"Zur Webseite");
								window.localStorage.setItem("L_search",
										"Online Suchen");
								window.localStorage.setItem("L_searchagain",
										"Erneut suchen");
								window.localStorage.setItem("L_book", "Buchen");
								window.localStorage
										.setItem("L_stars", "Sterne");
								window.localStorage.setItem("L_rooms",
										"Freie Betten");
								window.localStorage.setItem("L_setting",
										"Einstellungen");
								window.localStorage.setItem("wetter", '');
								window.localStorage
										.setItem("searchthisapp", '');
								window.localStorage.setItem("yes", 'Ja');
								window.localStorage.setItem("no", 'Nein');
								window.localStorage.setItem("exit", 'Beenden');
								window.localStorage.setItem("exittext",
										'Wollen Sie die App beenden?');
								window.localStorage
										.setItem("geoerror",
												'Leider konnte die Karte nicht aufgerufen werden.');
							});
		} else {
			window.localStorage.setItem("lang", "de");
			window.localStorage.setItem("L_map", "Karte anzeigen");
			window.localStorage.setItem("L_tel", "Jetzt anrufen");
			window.localStorage.setItem("L_mail", "Email senden");
			window.localStorage.setItem("L_www", "Zur Webseite");
			window.localStorage.setItem("L_search", "Online Suchen");
			window.localStorage.setItem("L_searchagain", "Erneut suchen");
			window.localStorage.setItem("L_book", "Buchen");
			window.localStorage.setItem("L_stars", "Sterne");
			window.localStorage.setItem("L_rooms", "Freie Betten");
			window.localStorage.setItem("L_setting", "Einstellungen");
			window.localStorage.setItem("wetter", '');
			window.localStorage.setItem("searchthisapp", '');
			window.localStorage.setItem("yes", 'Ja');
			window.localStorage.setItem("no", 'Nein');
			window.localStorage.setItem("exit", 'Beenden');
			window.localStorage.setItem("exittext",
					'Wollen Sie die App beenden?');
			window.localStorage.setItem("geoerror",
					'Leider konnte die Karte nicht aufgerufen werden.');
		}
	}
}
function populateDB(tx) {
	// tx.executeSql('DELETE FROM NODES');
		if (DEBUG == true) {
		tx.executeSql('DELETE FROM Pages');
	}
	//tx.executeSql('DELETE FROM Pages');
	tx
			.executeSql('CREATE TABLE IF NOT EXISTS NODES (id, status, title, type,parent,mtime,module,desc,body,street,zip,city,tlf,email,web,icon,stype,thumbnail,url,filestitle,filesurl,lat,lon,dist, PRIMARY KEY (id))');
	tx
			.executeSql('CREATE TABLE IF NOT EXISTS Pages (id, text, PRIMARY KEY (id))');

}
function repopulateDB(tx) {
	// tx.executeSql('DROP TABLE IF EXISTS NODES');
	tx.executeSql('DELETE FROM NODES');
	tx.executeSql('DELETE FROM Pages');
	// tx.executeSql('CREATE TABLE IF NOT EXISTS NODES (id, status, title,
	// type,parent,mtime,module,desc,body,street,zip,city,tlf,email,web,icon,stype,thumbnail,url,filestitle,filesurl,lat,lon,dist,
	// PRIMARY KEY (id))');
}
function clearcacheDB(tx) {
	// tx.executeSql('DROP TABLE IF EXISTS NODES');
	tx.executeSql('DELETE FROM Pages');
	window.localStorage.setItem("searchthisapp", '');
	// tx.executeSql('CREATE TABLE IF NOT EXISTS NODES (id, status, title,
	// type,parent,mtime,module,desc,body,street,zip,city,tlf,email,web,icon,stype,thumbnail,url,filestitle,filesurl,lat,lon,dist,
	// PRIMARY KEY (id))');
}
function errorCB(err) {
}
function successCB() {
}
function getNodeData(res) {
	db.transaction(function(tx) {
		var sql = 'SELECT * FROM NODES WHERE status>0 order by parent';
		tx.executeSql(sql, [],
				function(tx, results) {
					if (results.rows.length === 0) {
						buildMenu();
					} else {
						var $nodesnum = [];
						var $nodesumtemp = '';
						var $t = 0;
						for (var i = 0; i < results.rows.length; i++) {
							$nodesumtemp = $nodesumtemp
									+ results.rows.item(i).id + ',';
							if (i > 99) {
								if (i % 100 === 0) {
									$nodesnum[$t] = $nodesumtemp;
									$t++;
									$nodesumtemp = '';
								}
							}
							if ((results.rows.length - 1) == i) {
								$nodesnum[$t] = $nodesumtemp;
							}
						}
						$.each($nodesnum, function(i, value) {
							if (value !== 0) {
								getNode(value.slice(0, -1), res);
							}
						});
					}
				}, function(t, e) {
				});
	}, successCB, errorCB);
}
function cleanupData() {
	db.transaction(function(tx) {
		var sql = 'SELECT * FROM NODES WHERE status=2';
		tx.executeSql(sql, [], function(tx, results) {
			if (results.rows.length !== 0) {
				db.transaction(function(tx) {
					for (var i = 0; i < results.rows.length; i++) {
						tx.executeSql('DELETE FROM Pages where id=?',
								[ results.rows.item(i).id ], function() {
								}, function(t, e) {
								});
						tx.executeSql('DELETE FROM Pages where id=?',
								[ results.rows.item(i).parent ], function() {
								}, function(t, e) {
								});
						tx.executeSql('DELETE FROM NODES where id=?',
								[ results.rows.item(i).id ], function() {
								}, function(t, e) {
								});
						window.localStorage.removeItem("nodeid"
								+ results.rows.item(i).id);
					}
				}, errorCB, successCB);
			}
		}, function(t, e) {
		});
		var sql = 'SELECT * FROM NODES WHERE status=1';
		tx.executeSql(sql, [], function(tx, results) {
			if (results.rows.length !== 0) {
				db.transaction(function(tx) {
					for (var i = 0; i < results.rows.length; i++) {
						getNode(results.rows.item(i).id, "1280x1280");
					}
				}, errorCB, successCB);
			}
		}, function(t, e) {
		});
	});
}
function getNode(num, res) {
	var $zip;
	var $street;
	var $city;
	var sql;
	var $werte = [];
	$
			.ajax({
				type : "GET",
				url : "http://app-hannover.de/services/hannover/node_details/"
						+ res + "/" + num,
				dataType : "json",
				cache : false,
				success : function(data) {
					if (data.length == 0) {
						cleanupData();
					} else {
						db
								.transaction(
										function(tx) {
											$
													.each(

															data,
															function(i, dataset) {
																$zip = '';
																$street = '';
																$city = '';
																sql = '';
																$werte = [];
																var value = dataset;
																tx
																		.executeSql(
																				'DELETE FROM Pages where id=?',
																				[ value.id ],
																				function() {
																				},
																				function(
																						t,
																						e) {
																				});
																tx
																		.executeSql(
																				'DELETE FROM Pages where id=?',
																				[ value.parent ],
																				function() {
																				},
																				function(
																						t,
																						e) {
																				});
																if (window.localStorage
																		.getItem("nodeid"
																				+ value.id) < value.mtime) {
																	window.localStorage
																			.setItem(
																					"nodeid"
																							+ value.id,
																					value.mtime);
																	tx
																			.executeSql(
																					'DELETE FROM Pages where id=?',
																					[ value.id ],
																					function() {
																					},
																					function(
																							t,
																							e) {
																					});
																	switch (value.type) {

																	case 0:
																		sql = 'UPDATE NODES SET status=0, desc=?, icon=?, stype=? WHERE id=?';
																		tx
																				.executeSql(
																						sql,
																						[
																								value.desc,
																								value.data.pics.icon,
																								value.data.stype,
																								value.id ],
																						function() {
																							$(
																									'#loadingstatus')
																									.html(
																											'Update Node ID:'
																													+ value.id);
																						},
																						function(
																								t,
																								e) {
																						});
																		break;
																	case 1:
																		sql = 'UPDATE NODES SET status=0, desc=?, body=?,module=?,street=?,zip=?,city=?,icon=?,tlf=?,web=?,email=?,stype=?,filestitle=?,filesurl=? WHERE id=?';
																		if (value.data.files === undefined) {
																			value.data.files = '';
																			value.data.files.title = '';
																			value.data.files.url = '';
																		}
																		if (value.data.contact === undefined) {
																			value.data.contact = '';
																			value.data.contact.tlf = '';
																			value.data.contact.web = '';
																			value.data.contact.email = '';
																		}
																		if (value.data.contact.address === undefined) {
																			value.data.contact.address = '';
																			$street = '';
																			$zip = '';
																			$city = '';
																		} else {
																			if (value.data.contact.address.street === undefined) {
																				$street = '';
																			} else {
																				$street = value.data.contact.address.street;
																			}
																			if (value.data.contact.address.zip === undefined) {
																				$zip = '';
																			} else {
																				$zip = value.data.contact.address.zip;
																			}
																			if (value.data.contact.address.city === undefined) {
																				$city = '';
																			} else {
																				$city = value.data.contact.address.city;
																			}
																		}
																		$werte = [
																				value.desc,
																				value.data.body,
																				value.data.module,
																				$street,
																				$zip,
																				$city,
																				value.data.pics.icon,
																				value.data.contact.tlf,
																				value.data.contact.web,
																				value.data.contact.email,
																				value.data.stype,
																				value.data.files.title,
																				value.data.files.url,
																				value.id ];
																		for (var z = 0; z < $werte.length; z++) {
																			if ($werte[z] === undefined) {
																				$werte[z] = '';
																			}
																		}
																		tx
																				.executeSql(
																						sql,
																						$werte,
																						function() {
																							$(
																									'#loadingstatus')
																									.html(
																											'Update Node ID:'
																													+ value.id);
																						},
																						function(
																								t,
																								e) {
																						});
																		break;
																	case 2:
																		sql = 'UPDATE NODES SET status=0, desc=?, thumbnail=?,url=? WHERE id=?';
																		tx
																				.executeSql(
																						sql,
																						[
																								value.desc,
																								value.data.thumbnail,
																								value.data.url,
																								value.id ],
																						function() {
																							$(
																									'#loadingstatus')
																									.html(
																											'Update Node ID:'
																													+ value.id);
																						},
																						function(
																								t,
																								e) {
																						});
																		break;
																	}
																	if (value.parent === 0) {
																		buildMenu();
																	}

																} else {
																	sql = 'UPDATE NODES SET status=0 WHERE id=?';
																	tx
																			.executeSql(
																					sql,
																					[ value.id ],
																					function() {
																					},
																					function(
																							t,
																							e) {
																					});
																}
															});
										}, errorCB, buildMenu);
					}
				},
				error : function() {
				},
				complete : function() {
				}
			});
}
function getNodes() {
	$('#loadingstatus').html('Start Update');
	$
			.ajax({
				type : "GET",
				timeout : 1000,
				url : "http://app-hannover.de/services/hannover/sync_hash/"
						+ window.localStorage.getItem("lang"),
				dataType : "json",
				cache : false,
				success : function(data) {
					$('#loadingstatus').html('Getting Hash');
					window.localStorage.setItem("firststart", 'false');
					if (window.localStorage.getItem("timestamp") < data.timestamp) {
						db.transaction(function(tx) {
							tx.executeSql('DELETE FROM Pages where id=?',
									[ "search" ], function() {
									}, function(t, e) {
									});
							tx.executeSql('UPDATE NODES SET status=2', [],
									function() {
									}, function(t, e) {
									});
						}, errorCB, successCB);
						$('#loadingstatus').html('Start Nodes');
						$
								.ajax({
									type : "GET",
									url : "http://app-hannover.de/services/hannover/nodes/"
											+ window.localStorage
													.getItem("lang"),
									dataType : "json",
									cache : false,
									success : function(data) {
										var $daten = data.data;
										window.localStorage.setItem("anzahl",
												data.count);
										if (window.localStorage
												.getItem("timestamp") < data.timestamp) {
											window.localStorage
													.setItem("timestamp",
															data.timestamp);
											db
													.transaction(
															function(tx) {
																$
																		.each(
																				$daten,
																				function(
																						i,
																						value) {
																					tx
																							.executeSql(
																									'INSERT INTO NODES (id,status, title, type, parent, mtime) VALUES (?,1,?,?,?,?)',
																									[
																											value.id,
																											value.title,
																											value.type,
																											value.parent,
																											value.mtime ],
																									function() {
																										$(
																												'#loadingstatus')
																												.html(
																														'Insert Node ID:'
																																+ value.id);
																									},
																									function(
																											tx,
																											error) {
																										tx
																												.executeSql(
																														'UPDATE NODES SET status=1, title=?, type=?,parent=?,mtime=? WHERE id=?',
																														[
																																value.title,
																																value.type,
																																value.parent,
																																value.mtime,
																																value.id ],
																														function() {
																														},
																														function(
																																t,
																																e) {
																														});
																									});

																				});
															}, errorCB,
															successCB);
											getNodeData("1280x1280");

										} else {
											buildMenu();
											getNodeData("1280x1280");
											$nodesneedtoupdate = false;
											// getGeoLocations();
										}
									},
									complete : function() {

									}
								});
					} else {
						$nodesneedtoupdate = false;
						//$("#navbutton").show();
						buildMenu();
						getNodeData("1280x1280");
					}
				},
				error : function() {
					if (window.localStorage.getItem("firststart") == 'true') {
						if (DEBUG != true) {
					navigator.notification.alert(
						'We are Sorry, but we couldn\'t establish a connection to our server...',
						alertDismissed,
						'Oops Something went wrong!',
						'Done'
					);
					}
					else
					{
					alert('No Internet Connection present, please try again later!');
					}
					} else {
						$nodesneedtoupdate = false;
						//$("#navbutton").show();
						buildMenu();
						getNodeData("1280x1280");
					}
				}
			});
}
function buildMenu() {
	var count = 0;
	db
			.transaction(function(tx) {
				var menu = '';
				var sql = 'SELECT * FROM NODES WHERE parent=0';
				tx
						.executeSql(
								sql,
								[],
								function(tx, results) {
									if (results.rows.length !== 0) {
										for (var i = 0; i < results.rows.length; i++) {
											menu += '<li class="menuitem" id="'
													+ results.rows.item(i).id
													+ '" data-stype='
													+ results.rows.item(i).stype
													+ '><a><div class="row" style="margin:0px">';
											if (results.rows.item(i).icon !== null) {
												menu += '<div class="col-xs-2" style="width:110px;padding-left: 0px;"><img src="'
														+ results.rows.item(i).icon
														+ '" style="height: 100px; display: inline-block;margin-right:10px;"/></div>';
												count++;
											} else {
												if (results.rows.item(i).thumbnail !== null) {
													menu += '<img src="'
															+ results.rows
																	.item(i).thumbnail
															+ '"  alt="'
															+ results.rows
																	.item(i).title
															+ '"/>';
													count++;
												} else {
													if ((results.rows.item(i).id == 23)
															|| (results.rows
																	.item(i).id == 29)) {
														menu += '<img class="media-object img-responsive" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gNzUK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAMgAyAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9YZMjC4A+lQNHk9cV4p4Y8eXWn6ykcs2bMhTIDk7uBk4z1rqdT+KENreSeTapJbqBtJbDk46Yqo4iNrvQw5H0PRIbPzWyXwo61C1t3DcVk+GPGNh4jsVNu2y5Vd0sB6pzjNZXivxinhyaONtnzAnLAnPtVyrRjHmewuXodKYv9qmskSLmSTaM45OK8zl+LsCOoFuCCM5AP8AjWbr3j2x1+G3Qzi3ijO51AJZj/hUSxUErq/3CUGevFbUHHngf8CFFeBf2xo2f+Pq6/77b/Gisfrj/lZXs0YD2kryC5S6tk3gZDPgr+FM1IhJIljuRNH6qSdp4yOa9+tvh1oU0O6NfMjbuGyOOKyta+DlleRk2M3kyddrDjNCpvc0PMvAmq3llrrG2kKbl5XPBAI4PtXR/FW5S9EEqAZUgEnqPlzx+YrKPgvX/CWoM8lqZdylI2jUsCTznP4VsWlrPqtwh1KyL23l4Idc4PlYOR1HzLwfelUdopeYKLbPKGbngn60meOG6etXYrA3DpsQkuSAmcE/nTpbAQXs1pIkjTRO0bKjA/MOPTnkGlzIGjMx/nNFPYBXI8puDjnrRVBY+j/hPbvpvgUTXE5YzzPP8x+6vA9f9nP41s6h4402LTWltZ1mkYbUXBGCe5z+f0rjYtcvNILxXEu+FVRZGRR8w5yF7dScfhXJ6ks9+0lxY2IBm5wjHaq9jz6+prieMbVoHTSpwldzenluet6h4otUQRFUuYNgVlP97bnIJ5rkNRTVdSIl0tzbxMC2HbOwA4yD36Vylw0scS2DtvMoxlXZuf7x9x61V8R+JGvLG2s2LxvGAqhW2kkcZwTz+P8ASs+edZ67FSpOnypr4tv6R0i+EzDZqfssk91hmkmVlA6dUUAkH2yefSmy+HI4DJKdNvTLhfMeO5Ku+e33Rnrz6VU8LNrmr2PkaZaW19PDJ+8lkdImUHoNrck9farGseHvF94UtNRktS8QLKDt3KD0AI7fQ1pJKPvTdkQ97Ey6PKqhf+EdDYGMtPExP1JPNFUR4a8RYH+i6afcxpRXP+6/n/MXyL9rFHPqYhlRZIi8gKOMqcISOKJY0i0mIRoqARcBRjGHYCiiub/l38yeo3S1V7a8kcBnWNcMRkjl+/4CuI8QKrwbmUFmdmJI6navNFFdWH3ibr44+n6HovwYdjLqwLHAWLAz0613fikAatZkcEoQfcZoorox3+7fcY/bMzvRRRXzRqf/2Q==" style="height: 100px;  display: inline-block;"/>';
													} else {
														menu += '<img class="media-object img-responsive" src="img/blank.png" style="height: 100px;  display: inline-block;"/>';
													}
												}
											}
											menu += '<div class="col-xs-8" style="padding-right: 0px;"><h4 class="happ-blue" style="margin: 10px 0px 0px 0px;">'
													+ results.rows.item(i).title
													+ '</h4><p style="margin: 0px 0px 0px 0px;color:#404040!important;">'
													+ results.rows.item(i).desc
													+ '</p></div>';
											+'</div></a></li>';
										}
										menu += '<li class="menuitem" id="99999"><a><div class="row" style="margin:0px">'
										+'<div class="col-xs-2" style="width:110px;padding-left: 0px;">'
										+'<div style="width:100px;text-align:center;margin-right:10px;"><i class="fa fa-cogs" style="font-size: 50px; color:#404040;display: inline-block;"></i></div>'
										+'</div><div class="col-xs-8" style="padding-right: 0px;line-height:50px"><h4 class="happ-blue h-inline" style="margin: 0px 0px 0px 0px;">'
												+ window.localStorage
														.getItem("L_setting")
												+ '</h4></div></div></a></li>';

										if ((count >= results.rows.length)
												&& menurendered == false) {
											getWeather();
											renderPageStart(false);
											$('body').removeClass('start');
											$("#navmenunav").html(menu);
											// getGeoLocations();
											$("#navbar").show();
											$("#loaderdata").hide();
											var randhead=Math.floor((Math.random() * 7) + 1);
											$('#menu-list-head').css('background-image','url(\'img/head/'+randhead+'.jpg\')');											
											$("#menu-list-head").show();
											if (phonegap == true) {
												window.plugins.insomnia
														.allowSleepAgain();
											}
											$("ul.navmenu-nav li.menuitem")
													.click(
															function(event) {
																event
																		.preventDefault();
																renderPageforid(
																		$(this)
																				.attr(
																						'id'),
																		$(this)
																				.attr(
																						'data-stype'));
																return false;
															});
											menurendered = true;
										}
									}
								}, function(t, e) {
								});
			});

}
function renderPageforid(id, stype, parentid) {
	parentid = typeof parentid !== 'undefined' ? parentid : 0;
	var renderpage = true;
	$("#navbar").css("top", "0px").css("margin-top", "0px");
	$('#wetter').hide();
	$('#pagetitle').html('');	
	$("#navbutton").show();
	$("#searchbtn").hide();
	$("#backbtn").show();
	if (id == 99999) {
		renderPageTypeEinstellung(999999, stype);
	} else {
		db.transaction(function(tx) {
			var sql = 'SELECT * FROM NODES WHERE id=' + id;
			tx.executeSql(sql, [], function(tx, results) {
				if (results.rows.length !== 0) {
					if ((id == 23) || (id == 29)) {
						renderGallery(results.rows.item(0));
					} else {
						if ((id == 416) || (id == 418)) {
							renderPageTypeHotel(results.rows.item(0), id);
						} else {
						if(id == 49)
						{
							renderPageTypeVeranstaltung(results.rows.item(0),id)
						}
						else
						{
							switch (results.rows.item(0).type) {
							case 0:
								renderPageTypeZero(results.rows.item(0), stype,
										parentid);
								break;
							case 1:
								if ((id == 14) || (id == 420)) {
									renderPageTypeHotel(results.rows.item(0),
											stype);
								} else {
							if(id == 49)
						{
							renderPageTypeVeranstaltung(results.rows.item(0),id)
						}
						else
						{
									renderPageTypeOne(results.rows.item(0),
											stype, parentid);
								}
								}
								break;
							case 2:
								renderPageTypeTwo(results.rows.item(0), stype);
								break;
							case 99999:
								renderPageTypeEinstellung(results.rows.item(0),
										stype);
								break;
							default:
								break;
							}
						}
						}
					}

				}
			}, function(t, e) {
			});
		});
	}
	$("#main-content").show();
	// $("#main-content").animate({
	// right : 0
	// }, 200, function() {
	//
	// });
}
function renderPageTypeZero(item, stype, parentid, order) {
	if (order === undefined) {
		if ($('body').attr('data-order') !== undefined)
			order = $('body').attr('data-order');
		else
			order = "id";
	} else {
		$('body').attr('data-order', order);
	}
	var page='';
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', item.parent);
	$('#pagetitle').html('<h4>'+item.title+'</h4>');
	page += '<div class="item-body lazyloadlist" id="item-body" style="padding-right:0px;display:block;overflow:auto;margin-top:0px;-webkit-overflow-scrolling: touch;">';
	page += '<ul class="nav nav-pills nav-stacked" id="submenu" style="opacity:0">';
	page += '</ul>';
	page += '</div>';
	/*
	 * page += '<div class="row" style="margin-top:20px"><div
	 * class="col-xs-7">'; page += '</div><div class="col-xs-5">'; page += '<div
	 * class="btn-group pull-right" style="height:35px" >'; page += '<button
	 * type="button" class="btn btn-default conbtn" id="btndist"><i
	 * class="glyphicon glyphicon-screenshot"></i></button>'; page += '<button
	 * type="button" class="btn btn-default conbtn" id="btnaz"><i
	 * class="glyphicon glyphicon-sort-by-alphabet"></i></button>'; page += '<button
	 * type="button" class="btn btn-default conbtn" id="btnid"><i
	 * class="glyphicon glyphicon-sort-by-order"></i></button>'; page += '</div>';
	 * page += '</div></div>';
	 */
	$("#main-content").html(page);
	/*
	 * $("#btndist").click(function(event) { event.preventDefault();
	 * renderPageTypeZero(item, stype, parentid,'dist'); });
	 * $("#btnaz").click(function(event) { event.preventDefault();
	 * renderPageTypeZero(item, stype, parentid,'title'); });
	 * $("#btnid").click(function(event) { event.preventDefault();
	 * renderPageTypeZero(item, stype, parentid,'id'); });
	 */
	$("#item-body").css('height', window.innerHeight - 45);
	db
			.transaction(
					function(tx) {
						tx
								.executeSql(
										'SELECT * FROM Pages WHERE id=?',
										[ item.id ],
										function(tx, results) {
											if (results.rows.length !== 0) {
												$("#submenu")
														.append(
																results.rows
																		.item(0).text);
												$("#submenu").css("opacity",
														"1").css("transition",
														"opacity 0.1s");
												$("ul#submenu li")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	renderPageforid(
																			$(
																					this)
																					.attr(
																							'id'),
																			$(
																					this)
																					.attr(
																							'data-stype'),
																			$(
																					this)
																					.attr(
																							'data-parent'));
																});
												$("#submenu img").unveil(150);
												setTimeout(function() {
													$("#submenu img").trigger(
															"unveil");
												}, 1500);

											} else {

												page = '';
												db
														.transaction(function(
																tx) {
															var sql = '';
															if (order == "dist") {
																sql = 'SELECT * FROM NODES WHERE status=0 and parent='
																		+ item.id
																		+ ' and dist IS NOT NULL order by '
																		+ order
																		+ '';
															} else {
																sql = 'SELECT * FROM NODES WHERE parent='
																		+ item.id
																		+ ' order by '
																		+ order
																		+ '';
																sql = 'SELECT * FROM NODES WHERE status=0 and parent='
																		+ item.id;
															}
															tx
																	.executeSql(
																			sql,
																			[],
																			function(
																					tx,
																					results) {
																				if (results.rows.length === 0) {
																					if (order == 'dist') {
																						renderPageTypeZero(
																								item,
																								stype,
																								parentid,
																								'id');
																					}
																				} else {
																					page = '';
																					for (var i = 0; i < results.rows.length; i++) {

																						page += '<li id="'
																								+ results.rows
																										.item(i).id
																								+ '" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;" data-stype="'
																								+ stype
																								+ '" data-parent="'
																								+ results.rows
																										.item(i).parent
																								+ '">';
																						page += '<a style="line-height: 50px;margin-top:0px;"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
																						if (results.rows
																								.item(i).icon !== null) {
																							page += '<img id="'
																									+ item.id
																									+ i
																									+ '" class="media-object img-responsive" src="img/blank.png" data-src="'
																									+ results.rows
																											.item(i).icon
																									+ '" style="height: 50px; display: inline-block;margin-right:20px;" alt="'
																									+ results.rows
																											.item(i).title
																									+ '"/>';
																						} else {
																							if (results.rows
																									.item(i).thumbnail !== null) {
																								page += '<img id="'
																										+ item.id
																										+ i
																										+ '" class="media-object img-responsive" src="img/blank.png" style="height: 50px; display: inline-block;margin-right:20px;" alt="'
																										+ results.rows
																												.item(i).title
																										+ '"/>';
																							} else {
																								page += '<img id="'
																										+ item.id
																										+ i
																										+ '" class="media-object img-responsive" src="img/blank.png" style="height: 50px; display: inline-block;margin-right:20px;" alt="'
																										+ results.rows
																												.item(i).title
																										+ '"/>';
																							}
																						}
																						page += '<h4 class="happ-blue h-inline">'
																								+ results.rows
																										.item(i).title
																								+ '</h4>';
																						page += '</a></li>';

																					}
																					$(
																							"#submenu")
																							.append(
																									page);
																					$(
																							"#submenu")
																							.css(
																									"opacity",
																									"1")
																							.css(
																									"transition",
																									"opacity 0.1s");
																					db
																							.transaction(
																									function(
																											tx) {
																										tx
																												.executeSql(
																														'INSERT INTO Pages (id,text) VALUES (?,?)',
																														[
																																item.id,
																																page ],
																														function() {

																														},
																														function(
																																tx,
																																error) {
																															tx
																																	.executeSql(
																																			'UPDATE Pages SET text=? WHERE id=?',
																																			[
																																					page,
																																					item.id ],
																																			function() {

																																			},
																																			function(
																																					t,
																																					e) {
																																			});
																														});

																									},
																									errorCB,
																									successCB);
																					$(
																							"ul#submenu li")
																							.click(
																									function(
																											event) {
																										event
																												.preventDefault();
																										renderPageforid(
																												$(
																														this)
																														.attr(
																																'id'),
																												$(
																														this)
																														.attr(
																																'data-stype'),
																												$(
																														this)
																														.attr(
																																'data-parent'));
																									});
																					$(
																							"#submenu img")
																							.unveil(
																									200);
																					setTimeout(
																							function() {
																								$(
																										"#submenu img")
																										.trigger(
																												"unveil");
																							},
																							1500);
																				}
																			},
																			function(
																					t,
																					e) {
																			});
														});
												//
											}
										}, function(tx, error) {

										});

					}, errorCB, successCB);
}
function renderGallery(item, stype, parentid) {
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', item.parent);
	db
			.transaction(
					function(tx) {
						tx
								.executeSql(
										'SELECT * FROM Pages WHERE id=?',
										[ item.id ],
										function(tx, results) {
											if (results.rows.length !== 0) {
												$("#main-content").css(
														"opacity", "1").css(
														"transition",
														"opacity 0.5s");
												$("#main-content")
														.html(
																results.rows
																		.item(0).text);
												$("div#submenug img")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	renderPageforid(
																			$(
																					this)
																					.attr(
																							'id'),
																			$(
																					this)
																					.attr(
																							'data-stype'),
																			$(
																					this)
																					.attr(
																							'data-parent'));
																});
											} else {
												var page = '';
												page += '<div class="media mainmedia"><a class="pull-left">';
												if (item.icon !== null) {
													page += '<img class="media-object img-responsive" style="height:100px" src="'
															+ item.icon
															+ '"  alt="'
															+ item.title
															+ '"/>';
												} else {
													if (item.thumbnail !== null) {
														page += '<img class="media-object img-responsive" style="height:100px" src="'
																+ item.thumbnail
																+ '"  alt="'
																+ item.title
																+ '"/>';
													} else {
														page += '<img class="media-object img-responsive stype-0" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//gA7Q1JFQVRPUjogZ2QtanBlZyB2MS4wICh1c2luZyBJSkcgSlBFRyB2NjIpLCBxdWFsaXR5ID0gNzUK/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAMgAyAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9YZMjC4A+lQNHk9cV4p4Y8eXWn6ykcs2bMhTIDk7uBk4z1rqdT+KENreSeTapJbqBtJbDk46Yqo4iNrvQw5H0PRIbPzWyXwo61C1t3DcVk+GPGNh4jsVNu2y5Vd0sB6pzjNZXivxinhyaONtnzAnLAnPtVyrRjHmewuXodKYv9qmskSLmSTaM45OK8zl+LsCOoFuCCM5AP8AjWbr3j2x1+G3Qzi3ijO51AJZj/hUSxUErq/3CUGevFbUHHngf8CFFeBf2xo2f+Pq6/77b/Gisfrj/lZXs0YD2kryC5S6tk3gZDPgr+FM1IhJIljuRNH6qSdp4yOa9+tvh1oU0O6NfMjbuGyOOKyta+DlleRk2M3kyddrDjNCpvc0PMvAmq3llrrG2kKbl5XPBAI4PtXR/FW5S9EEqAZUgEnqPlzx+YrKPgvX/CWoM8lqZdylI2jUsCTznP4VsWlrPqtwh1KyL23l4Idc4PlYOR1HzLwfelUdopeYKLbPKGbngn60meOG6etXYrA3DpsQkuSAmcE/nTpbAQXs1pIkjTRO0bKjA/MOPTnkGlzIGjMx/nNFPYBXI8puDjnrRVBY+j/hPbvpvgUTXE5YzzPP8x+6vA9f9nP41s6h4402LTWltZ1mkYbUXBGCe5z+f0rjYtcvNILxXEu+FVRZGRR8w5yF7dScfhXJ6ks9+0lxY2IBm5wjHaq9jz6+prieMbVoHTSpwldzenluet6h4otUQRFUuYNgVlP97bnIJ5rkNRTVdSIl0tzbxMC2HbOwA4yD36Vylw0scS2DtvMoxlXZuf7x9x61V8R+JGvLG2s2LxvGAqhW2kkcZwTz+P8ASs+edZ67FSpOnypr4tv6R0i+EzDZqfssk91hmkmVlA6dUUAkH2yefSmy+HI4DJKdNvTLhfMeO5Ku+e33Rnrz6VU8LNrmr2PkaZaW19PDJ+8lkdImUHoNrck9farGseHvF94UtNRktS8QLKDt3KD0AI7fQ1pJKPvTdkQ97Ey6PKqhf+EdDYGMtPExP1JPNFUR4a8RYH+i6afcxpRXP+6/n/MXyL9rFHPqYhlRZIi8gKOMqcISOKJY0i0mIRoqARcBRjGHYCiiub/l38yeo3S1V7a8kcBnWNcMRkjl+/4CuI8QKrwbmUFmdmJI6navNFFdWH3ibr44+n6HovwYdjLqwLHAWLAz0613fikAatZkcEoQfcZoorox3+7fcY/bMzvRRRXzRqf/2Q==" style=" display: inline-block;"/>';
													}
												}
												page += '</a><div class="media-body"><h4 class="media-heading">'
														+ item.title + '</h4>';
												if (item.desc !== null) {
													page += item.desc;
												}
												page += '</div></div>';
												if (item.body !== null) {
													page += '<div>' + item.body
															+ '</div>';
												}
												db
														.transaction(function(
																tx) {
															var sql = 'SELECT * FROM NODES WHERE parent='
																	+ item.id;
															tx
																	.executeSql(
																			sql,
																			[],
																			function(
																					tx,
																					results) {
																				if (results.rows.length !== 0) {
																					page += '<div class="item-body item-body-one" id="item-body"  id="item-body"  style="padding-right:10px;display:block;overflow:auto;margin-top:5px;">';
																					page += '<div id="submenug">';
																					for (var i = 0; i < results.rows.length; i++) {
																						page += '<a><img id="'
																								+ results.rows
																										.item(i).id
																								+ '" data-stype="'
																								+ results.rows
																										.item(i).stype
																								+ '" class="galimg" data-parent='
																								+ results.rows
																										.item(i).parent
																								+ '';

																						if (results.rows
																								.item(i).thumbnail !== null) {
																							page += ' src="'
																									+ results.rows
																											.item(i).thumbnail
																									+ '" alt="'
																									+ results.rows
																											.item(i).title
																									+ '"/>';
																						} else {
																							if (results.rows
																									.item(i).icon !== null) {
																								page += ' src="'
																										+ results.rows
																												.item(i).icon
																										+ '"  alt="'
																										+ results.rows
																												.item(i).title
																										+ '"/>';
																							} else {
																								page += ' src="img/blank.png" style="width: 100%; display: inline-block;" alt="'
																										+ results.rows
																												.item(i).title
																										+ '"/>';
																							}
																						}
																						page += '</a>';
																					}
																					page += '</div>';
																					page += '</div>';
																					$(
																							"#main-content")
																							.css(
																									"opacity",
																									"1")
																							.css(
																									"transition",
																									"opacity 0.5s");
																					$(
																							"#main-content")
																							.html(
																									page);
																					$(
																							"#item-body")
																							.css(
																									'height',
																									window.innerHeight - 160);
																					db
																							.transaction(
																									function(
																											tx) {
																										tx
																												.executeSql(
																														'INSERT INTO Pages (id,text) VALUES (?,?)',
																														[
																																item.id,
																																$(
																																		"#main-content")
																																		.html() ],
																														function() {

																														},
																														function(
																																tx,
																																error) {
																															tx
																																	.executeSql(
																																			'UPDATE Pages SET text=? WHERE id=?',
																																			[
																																					$(
																																							"#main-content")
																																							.html(),
																																					item.id ],
																																			function() {

																																			},
																																			function(
																																					t,
																																					e) {
																																			});
																														});

																									},
																									errorCB,
																									successCB);
																					// $("#submenug").justifiedGallery();

																					$(
																							"div#submenug img")
																							.click(
																									function(
																											event) {
																										event
																												.preventDefault();
																										renderPageforid(
																												$(
																														this)
																														.attr(
																																'id'),
																												$(
																														this)
																														.attr(
																																'data-stype'),
																												$(
																														this)
																														.attr(
																																'data-parent'));
																									});
																				}
																			},
																			function(
																					t,
																					e) {
																			});
														});
												//
											}
										}, function(tx, error) {

										});

					}, errorCB, successCB);
}
function renderPageTypeOne(item, stype, parentid) {
	// $("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', item.parent);
	db
			.transaction(
					function(tx) {
						tx
								.executeSql(
										'SELECT * FROM Pages WHERE id=?',
										[ item.id ],
										function(tx, results) {
											if (results.rows.length !== 0) {
												$("#main-content")
														.css("opacity", "1")
														.css("transition",
																"opacity 0.5s")
														.html(
																results.rows
																		.item(0).text);
												$("#mapbtn")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	renderMap(
																			item,
																			stype);
																});
												$("#btnwww")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	var ref = window
																			.open(
																					encodeURI($(
																							this)
																							.attr(
																									'href')),
																					'_blank',
																					'location=yes',
																					'closebuttoncaption=X');
																	ref.show();
																});

												$("ul#submenu li")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	renderPageforid(
																			$(
																					this)
																					.attr(
																							'id'),
																			$(
																					this)
																					.attr(
																							'data-stype'),
																			$(
																					this)
																					.attr(
																							'data-parent'));
																});
												if (parentid == "search") {
													setTimeout(
															function() {
																$("#navbar")
																		.css(
																				"margin-top",
																				"0px")
																		.css(
																				"top",
																				"0px");
																$("#item-body")
																		.css(
																				'height',
																				(window.innerHeight - 160)
																						+ 'px');
															}, 1500);
													setTimeout(
															function() {
																$("#navbar")
																		.css(
																				"margin-top",
																				"0px")
																		.css(
																				"top",
																				"0px");
																$("#item-body")
																		.css(
																				'height',
																				(window.innerHeight - 160)
																						+ 'px');
															}, 3000);
												}
											} else {
												var page = '';
												page += '<div class="media mainmedia" style="border-bottom: 1px solid #404040;padding-bottom:5px;"><a class="pull-left">';
												if (item.icon !== null) {
													page += '<img class="media-object img-responsive" style="height:100px" src="'
															+ item.icon
															+ '"  alt="'
															+ item.title
															+ '"/>';
												}
												if (item.thumbnail !== null) {
													page += '<img class="media-object img-responsive" style="height:100px" src="'
															+ item.thumbnail
															+ '"  alt="'
															+ item.title
															+ '"/>';
												}
												page += '</a><div class="media-body"><h4 class="media-heading">'
														+ item.title + '</h4>';
												if (item.desc !== null) {
													page += item.desc;
												}
												page += '</div></div>';
												if (item.body !== null) {
													page += '<div class="item-body item-body-one" id="item-body"  style="display:block;overflow:auto;margin-top:0px;"><div id="textheight" style="border-bottom: 1px solid #404040;padding-top:5px;">'
															+ item.body
															+ '</div>';
												}
												page += '<div id="adressfeld" style="margin-top:5px;background:#eee;padding:4px;"><strong>Adresse:</strong><br/>';
												var addcomplete = 0;
												if (item.street !== null
														&& item.street.trim() !== ''
														&& item.street.trim().length !== 0) {
													page += item.street
															+ '<br/>';
													addcomplete++;
												}
												if (item.zip !== null
														&& item.zip.trim() !== ''
														&& item.zip.trim().length !== 0) {
													page += item.zip + ' ';
													addcomplete++;
												}
												if (item.city !== null
														&& item.city.trim() !== ''
														&& item.city.trim().length !== 0) {
													page += item.city + ' ';
													addcomplete++;
												}
												page += '</div><div style="margin-top:5px" id="actionbuttons">';
												// page += '<div
												// class="btn-group pull-right"
												// style="width:100%;height:35px"
												// >';
												var countconbtn = 0;
												if (item.tlf !== null
														&& item.tlf !== '') {
													page += '<a href="tel:'
															+ item.tlf
															+ '" class="btn btn-primary btn-block conbtn" id="btntel"><i class="fa fa-phone"></i> '
															+ window.localStorage
																	.getItem("L_tel")
															+ '</a>';
													countconbtn++;
												}
												if (item.email !== null
														&& item.email !== '') {
													page += '<a href="mailto:'
															+ item.email
															+ '" class="btn btn-primary btn-block conbtn" id="btnmail"><i class="fa fa-envelope"></i> '
															+ window.localStorage
																	.getItem("L_mail")
															+ '</a>';
													countconbtn++;
												}
												if (item.web !== null
														&& item.web !== '') {
													page += '<a href="'
															+ item.web
															+ '" target="_blank" class="btn btn-primary btn-block conbtn" id="btnwww"><i class="fa fa-globe"></i> '
															+ window.localStorage
																	.getItem("L_www")
															+ '</a>';
													countconbtn++;
												}
												// page += '</div>';
												if (navigator.connection !== undefined) {
													var networkState = navigator.connection.type;
													if ((addcomplete === 3)
															&& (networkState != 'Connection.NONE')) {
														page += '<a href="#" class="btn btn-primary btn-block mapbtn" id="mapbtn"><i class="fa fa-map-marker"></i> '
																+ window.localStorage
																		.getItem("L_map")
																+ '</a>';
													}
												} else {
													if (addcomplete === 3) {
														page += '<a href="#" class="btn btn-primary btn-block mapbtn" id="mapbtn"><i class="fa fa-map-marker"></i> '
																+ window.localStorage
																		.getItem("L_map")
																+ '</a>';
													}
												}
												page += '</div></div>';
												$("#main-content").html(page);

												if ((addcomplete == '')
														|| (addcomplete == 0)
														|| (addcomplete == undefined)) {
													$('#adressfeld').hide();
												}
												$("#item-body")
														.css(
																'height',
																(window.innerHeight - 160)
																		+ 'px');
												$("#textheight")
														.css(
																'min-height',
																($("#item-body").height() - $('#actionbuttons').height() - $('#adressfeld').height() - 20)
																		+ 'px');
												$("#mapbtn")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	renderMap(
																			item,
																			stype);
																});
												$("#btnwww")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	var ref = window
																			.open(
																					encodeURI($(
																							this)
																							.attr(
																									'href')),
																					'_blank',
																					'location=yes',
																					'closebuttoncaption=X');
																	ref.show();
																});
												/*
												 * page = '';
												 * 
												 * db .transaction(function( tx) {
												 * var sql = 'SELECT * FROM
												 * NODES WHERE parent=' +
												 * item.id; tx .executeSql( sql,
												 * [], function( tx, results) {
												 * if (results.rows.length !==
												 * 0) { $( 'body') .attr(
												 * 'data-parent', results.rows
												 * .item(i).parent); page += '<ul class="nav nav-pills nav-stacked" id="submenu">';
												 * for (var i = 0; i <
												 * results.rows.length; i++) {
												 * page += '<li id="' +
												 * results.rows .item(i).id + '"
												 * style="text-overflow:
												 * ellipsis;overflow:
												 * hidden;word-break:
												 * break-word;white-space:
												 * nowrap;" data-parent=' +
												 * results.rows .item(i).parent + '"
												 * data-stype=' + stype + '><a>';
												 * if (results.rows
												 * .item(i).icon !== null) {
												 * page += '<img src="' +
												 * results.rows .item(i).icon + '"
												 * style="height: 50px; display:
												 * inline-block;margin-right:10px;"/>'; }
												 * else { if (results.rows
												 * .item(i).thumbnail !== null) {
												 * page += '<img src="' +
												 * results.rows
												 * .item(i).thumbnail + '"
												 * style="height: 50px; display:
												 * inline-block;margin-right:10px;"/>'; }
												 * else { page += '<img
												 * src="img/blank.png"
												 * style="height: 50px; display:
												 * inline-block;margin-right:10px;"/>'; } }
												 * page += results.rows
												 * .item(i).title + '</a></li>'; }
												 * page += '</ul>'; $(
												 * "#main-content") .css(
												 * "opacity", "1") .css(
												 * "transition", "opacity
												 * 0.5s").append( page); $(
												 * "ul#submenu li") .click(
												 * function( event) { event
												 * .preventDefault();
												 * renderPageforid( $( this)
												 * .attr( 'id'), $( this) .attr(
												 * 'data-stype'), $( this)
												 * .attr( 'data-parent')); });
												 * if(parentid=="search") {
												 * setTimeout(function() {
												 * $("#item-body").css('height',(window.innerHeight -
												 * 280)+ 'px'); }, 1500); } }
												 * else { $( "#main-content")
												 * .css( "opacity", "1") .css(
												 * "transition", "opacity
												 * 0.5s");
												 * if(parentid=="search") {
												 * setTimeout(function() {
												 * $("#item-body").css('height',(window.innerHeight -
												 * 280)+ 'px'); }, 1500); } } },
												 * function( t, e) { }); });
												 */
												$("#main-content").css(
														"opacity", "1").css(
														"transition",
														"opacity 0.5s");
												if (parentid == "search") {
													setTimeout(
															function() {
																$("#navbar")
																		.css(
																				"margin-top",
																				"0px")
																		.css(
																				"top",
																				"0px");
																$("#item-body")
																		.css(
																				'height',
																				(window.innerHeight - 160)
																						+ 'px');
																db
																		.transaction(
																				function(
																						tx) {
																					tx
																							.executeSql(
																									'INSERT INTO Pages (id,text) VALUES (?,?)',
																									[
																											item.id,
																											$(
																													"#main-content")
																													.html() ],
																									function() {

																									},
																									function(
																											tx,
																											error) {
																										tx
																												.executeSql(
																														'UPDATE Pages SET text=? WHERE id=?',
																														[
																																$(
																																		"#main-content")
																																		.html(),
																																item.id ],
																														function() {

																														},
																														function(
																																t,
																																e) {
																														});
																									});

																				},
																				errorCB,
																				successCB);
															}, 1500);
												} else {
													db
															.transaction(
																	function(tx) {
																		tx
																				.executeSql(
																						'INSERT INTO Pages (id,text) VALUES (?,?)',
																						[
																								item.id,
																								$(
																										"#main-content")
																										.html() ],
																						function() {

																						},
																						function(
																								tx,
																								error) {
																							tx
																									.executeSql(
																											'UPDATE Pages SET text=? WHERE id=?',
																											[
																													$(
																															"#main-content")
																															.html(),
																													item.id ],
																											function() {

																											},
																											function(
																													t,
																													e) {
																											});
																						});

																	}, errorCB,
																	successCB);
												}

											}
										}, function(tx, error) {

										});

					}, errorCB, successCB);
}
function renderMap(item, stype) {
	var $url = '';
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', item.id);
	var page = '';
	page += '<div class="media mainmedia" style="border-bottom: 1px solid #404040;padding-bottom:5px;"><a class="pull-left">';
	if (item.icon !== null) {
		page += '<img class="media-object img-responsive" style="height:100px" src="'
				+ item.icon + '"  alt="' + item.title + '"/>';
	}
	if (item.thumbnail !== null) {
		page += '<img class="media-object img-responsive" style="height:100px" src="'
				+ item.thumbnail + '"  alt="' + item.title + '"/>';
	}
	page += '</a><div class="media-body"><h4 class="media-heading">'
			+ item.title + '</h4>';
	if (item.desc !== null) {
		page += item.desc;
	}
	page += '</div></div>';
	page += '<div class="item-body item-body-one" id="item-body" style="width:100%;display:block;margin-top:5px;"><div id="map" style="padding-top:5px;"><div class="preloader" style="margin: 0 auto;padding-top: 25%;position: relative;"><center><i class="fa fa-circle-o-notch fa-3 fa-spin fa-red"></i><center></div></div>';

	page += '<div style="margin-top:5px">';
	page += '<div id="adressfeld" style="margin-top:5px;background:#eee;padding:4px;"><strong>Adresse:</strong><br/>';
	var addcomplete = 0;
	if (item.street.trim() !== null && item.street.trim() !== ''
			&& item.street.trim().length !== 0) {
		page += item.street + '<br/>';
		addcomplete++;
	}
	if (item.zip.trim() !== null && item.zip.trim() !== ''
			&& item.zip.trim().length !== 0) {
		page += item.zip + ' ';
		addcomplete++;
	}
	if (item.city.trim() !== null && item.city.trim() !== ''
			&& item.city.trim().length !== 0) {
		page += item.city + ' ';
		addcomplete++;
	}
	// page += '</div><div>';
	page += '</div><div style="margin-top:5px">';
	var countconbtn = 0;
	if (item.tlf !== null && item.tlf !== '') {
		page += '<a href="tel:'
				+ item.tlf
				+ '" class="btn btn-primary btn-block conbtn" id="btntel"><i class="fa fa-phone"></i> '
				+ window.localStorage.getItem("L_tel") + '</a>';
		countconbtn++;
	}
	if (item.email !== null && item.email !== '') {
		page += '<a href="mailto:'
				+ item.email
				+ '" class="btn btn-primary btn-block conbtn" id="btnmail"><i class="fa fa-envelope"></i> '
				+ window.localStorage.getItem("L_mail") + '</a>';
		countconbtn++;
	}
	if (item.web !== null && item.web !== '') {
		page += '<a href="'
				+ item.web
				+ '" target="_blank" class="btn btn-primary btn-block conbtn" id="btnwww"><i class="fa fa-globe"></i> '
				+ window.localStorage.getItem("L_www") + '</a>';
		countconbtn++;
	}
	// page += '</div>';

	if (addcomplete === 3) {
		// page += '<div class="btn-group pull-right mapbtnblock"
		// style="width:100%;padding-right: 0px;">';
		page += '<a href="" id="mapbtn" class="btn btn-primary btn-block mapbtn" target="_blank"><i class="fa fa-road"></i> Navigation</a>';
		// page += '</div>';
	}
	page += '</div>';
	$url = "http://open.mapquestapi.com/nominatim/v1/search/de/" + item.city
			+ "/" + item.zip + "/" + item.street
			+ "?format=json&addressdetails=1&countrycodes=de&limit=1";

	$("#main-content").html(page);
	if ((addcomplete == '') || (addcomplete == 0) || (addcomplete == undefined)) {
		$('#adressfeld').hide();
	}
	$("#item-body").css('height', (window.innerHeight - 160) + 'px');
	$("#map").css('height', (window.innerHeight - 360) + 'px');
	if ((item.lat != undefined) && (item.lon != undefined)) {
		var map = L.map('map');
		var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		layer = new L.tileLayer(
				osmUrl,
				{
					maxZoom : 18,
					attribution : '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> '
				}).addTo(map);
		L.marker([ item.lat, item.lon ]).addTo(map).bindPopup(item.title);
		map.setView(new L.LatLng(item.lat, item.lon), 16).addLayer(layer);
		if (phonegap == true) {
			var deviceplatform = device.platform;
			switch (deviceplatform) {
			case "Android":
				$("#mapbtn").attr(
						'href',
						'geo:' + item.lat + ',' + item.lon + '?q=' + item.lat
								+ ',' + item.lon + '(' + item.title + ')');
				break;
			case "iOS":
				$("#mapbtn").attr(
						'href',
						'http://maps.apple.com/?q=' + item.street + ','
								+ item.zip + ' ' + item.city);
				$("#mapbtn").click(
						function(event) {
							event.preventDefault();
							var ref = window.open(encodeURI($(this)
									.attr('href')), '_blank', 'location=yes',
									'closebuttoncaption=X');
							ref.show();
						});
				break;
			case "Win32NT":
				$("#mapbtn").attr(
						'href',
						'bingmaps://?where=' + item.street + ',' + item.zip
								+ ' ' + item.city);
				break;
			default:
				$("#mapbtn").hide();
				break;
			}
		} else {
			$("#mapbtn").attr(
					'href',
					'http://maps.google.com/?q=' + item.street + ',' + item.zip
							+ ' ' + item.city);
		}
	} else {
		$
				.ajax({
					type : "GET",
					url : $url,
					cache : false,
					success : function(data) {
						if (data[0] !== undefined) {
							if ((data[0].lat !== undefined)
									&& (data[0].lon !== undefined)) {

								var map = L.map('map');
								var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
								layer = new L.tileLayer(
										osmUrl,
										{
											maxZoom : 18,
											attribution : '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> '
										}).addTo(map);
								L.marker([ data[0].lat, data[0].lon ]).addTo(
										map).bindPopup(item.title);
								map.setView(
										new L.LatLng(data[0].lat, data[0].lon),
										16).addLayer(layer);
								if (phonegap == true) {
									var deviceplatform = device.platform;
									switch (deviceplatform) {
									case "Android":
										$("#mapbtn").attr(
												'href',
												'geo:' + data[0].lat + ','
														+ data[0].lon + '?q='
														+ data[0].lat + ','
														+ data[0].lon + '('
														+ item.title + ')');
										break;
									case "iOS":
										$("#mapbtn").attr(
												'href',
												'http://maps.apple.com/?q='
														+ item.street + ','
														+ item.zip + ' '
														+ item.city);
										$("#mapbtn")
												.click(
														function(event) {
															event
																	.preventDefault();
															var ref = window
																	.open(
																			encodeURI($(
																					this)
																					.attr(
																							'href')),
																			'_blank',
																			'location=yes',
																			'closebuttoncaption=X');
															ref.show();
														});
										break;
									case "Win32NT":
										$("#mapbtn").attr(
												'href',
												'bingmaps://?where='
														+ item.street + ','
														+ item.zip + ' '
														+ item.city);
										break;
									default:
										$("#mapbtn").hide();
										break;
									}
								} else {
									$("#mapbtn").attr(
											'href',
											'http://maps.google.com/?q='
													+ item.street + ','
													+ item.zip + ' '
													+ item.city);
								}
								db.transaction(function(tx) {
									var sql = 'UPDATE NODES SET lat='
											+ data[0].lat + ', lon='
											+ data[0].lon + ' WHERE id='
											+ item.id;
									tx.executeSql(sql, [], function() {
									}, function(t, e) {
									});
								}, errorCB, successCB);
							} else {
								$("#mapbtn").hide();
								$("#map")
										.html(
												window.localStorage
														.getItem("geoerror"));
							}
						} else {
							$("#mapbtn").hide();
							$("#map").html(
									window.localStorage.getItem("geoerror"));
						}
					},
					error : function() {
						$("#mapbtn").hide();
						$("#map").html(window.localStorage.getItem("geoerror"));
					}
				});
	}
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#btnwww").click(
			function(event) {
				event.preventDefault();
				var ref = window.open(encodeURI($(this).attr('href')),
						'_blank', 'location=yes', 'closebuttoncaption=X');
				ref.show();
			});

}
function renderPageTypeTwo(item, stype) {
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', item.parent);
	var page = '';
	if (item.url !== null) {
		page += '<div class="row"><div class="col-xs 12 col-sm-12 col-md-12"><div class="thumbnail"><img id="largeimg" src="'
				+ item.url
				+ '" alt="'
				+ item.title
				+ '"><div class="caption"><p>'
				+ item.title
				+ '</p></div></div></div></div>';
		page += '<div class="media mainmedia"><a class="pull-left">';
	}
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);
}
function renderPageTypeEinstellung(item, stype) {
	var menu = '';
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('#pagetitle').html('<h4>'+window.localStorage.getItem("L_setting")+'</h4>');
	$('body').attr('data-parent', 0);
	var page = '';
	page += '<ul class="nav nav-pills nav-stacked" id="lang">';
	page += '<li id="de" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a>';
	page += '<img src="img/DE.png"  id="imgde" alt="Deutsch" style="height: 100px; display: inline-block;margin-right:10px;"/>';
	page += 'Bitte wählen Sie Ihre Sprache aus.</a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a>';
	page += '<img src="img/GB.png"  id="imgen" alt="English" style="height: 100px; display: inline-block;margin-right:10px;"/>';
	page += 'Please choose your language</a></li>';
	page += '</ul>';
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);
	if (window.localStorage.getItem("lang") == "de") {
		$("#de").attr("class", "disabled");
		$("#imgde")
				.attr(
						"style",
						"-webkit-filter: grayscale(100%);height: 100px; display: inline-block;margin-right:10px;");
	} else {
		$("#en").attr("class", "disabled");
		$("#imgen")
				.attr(
						"style",
						"-webkit-filter: grayscale(100%);height: 100px; display: inline-block;margin-right:10px;");
	}
	$("#de")
			.click(
					function(event) {
					if (window.localStorage.getItem("lang") != "de") {
						event.preventDefault();
						$('#lang').hide();
						$('body').addClass('start');
						$("#logo").show();
						$("#navbar").hide();
								$("#navbutton").hide();
		$('#wetter').show();
		$("#backbtn").hide();
		$('#pagetitle').html('');
		$("#searchbtn").show();
						$("#menu-list-head").hide();
						$("#main-content").hide();
						$("#loaderdata").show();
						if (phonegap == true) {
							window.plugins.insomnia.keepAwake();
						}
						menurendered = false
						if (window.localStorage.getItem("lang") != "de") {
							window.localStorage.clear();
							window.localStorage.setItem("lang", "de");
							window.localStorage.setItem("L_map",
									"Karte anzeigen");
							window.localStorage.setItem("L_tel",
									"Jetzt anrufen");
							window.localStorage.setItem("L_mail",
									"Email senden");
							window.localStorage.setItem("L_www",
									"Zur Webseite");
							window.localStorage.setItem("L_search",
									"Online Suchen");
							window.localStorage.setItem("L_searchagain",
									"Erneut suchen");
							window.localStorage.setItem("L_book", "Buchen");
							window.localStorage.setItem("L_stars", "Sterne");
							window.localStorage.setItem("L_rooms",
									"Freie Betten");
							window.localStorage.setItem("L_setting",
									"Einstellungen");
							window.localStorage.setItem("searchthisapp", '');
							window.localStorage.setItem("wetter", "");
							window.localStorage.setItem("yes", 'Ja');
							window.localStorage.setItem("no", 'Nein');
							window.localStorage.setItem("exit", 'Beenden');
							window.localStorage.setItem("exittext",
									'Wollen Sie die App beenden?');
							window.localStorage
									.setItem("geoerror",
											'Leider konnte die Karte nicht aufgerufen werden.');
							db.transaction(repopulateDB, errorCB, getNodes);
							db.transaction(clearcacheDB, errorCB, successCB);
							$("#navmenunav").html(menu);
						}
						}
					});
	$("#en").click(
			function(event) {
			if (window.localStorage.getItem("lang") != "en") {
				event.preventDefault();
				$('#lang').hide();
				$('body').addClass('start');
				$("#logo").show();
				$("#navbar").hide();
						$("#navbutton").hide();
		$('#wetter').show();
		$("#backbtn").hide();
		$('#pagetitle').html('');
		$("#searchbtn").show();
				$("#menu-list-head").hide();
				$("#main-content").hide();
				$("#loaderdata").show();
				if (phonegap == true) {
					window.plugins.insomnia.keepAwake();
				}
				menurendered = false
				if (window.localStorage.getItem("lang") != "en") {
					window.localStorage.clear();
					window.localStorage.setItem("lang", "en");
					window.localStorage.setItem("L_map", "Map");
					window.localStorage.setItem("L_tel", "Make Call");
					window.localStorage.setItem("L_mail", "Sent Email");
					window.localStorage.setItem("L_www", "To Webssite");
					window.localStorage.setItem("L_search", "Search");
					window.localStorage
							.setItem("L_searchagain", "Search again");
					window.localStorage.setItem("L_book", "book");
					window.localStorage.setItem("L_stars", "Stars");
					window.localStorage.setItem("L_rooms", "Free Beds");
					window.localStorage.setItem("wetter", "");
					window.localStorage.setItem("L_setting", "Settings");
					window.localStorage.setItem("searchthisapp", '');
					window.localStorage.setItem("yes", 'Yes');
					window.localStorage.setItem("no", 'No');
					window.localStorage.setItem("exit", 'Exit');
					window.localStorage.setItem("exittext",
							'Do you want to exit this App?');
					window.localStorage.setItem("geoerror",
							"We are sorry, but the map couldn't be open.");
					db.transaction(repopulateDB, errorCB, getNodes);
					db.transaction(clearcacheDB, errorCB, successCB);
					$("#navmenunav").html(menu);
				}
				}
			});
}
function renderPageTypeVeranstaltung(item, stype) {
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', 0);
	$('#pagetitle').html('<h4>'+item.title+'</h4>');
	if (navigator.connection !== undefined) {
	var networkState = navigator.connection.type;
	if (networkState != 'Connection.NONE') {
	var page = '';
	page += '<ul class="nav nav-pills nav-stacked" id="submenu">';
	page += '<li id="de" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Ausstellungen"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Atelier_alias_300x225px.jpg"  id="imgde" alt="Ausstellungen" class="media-object img-responsive" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Ausstellungen</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Bildung"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Leibniz-Universitaet-Hannover_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Bildung" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Bildung</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/B%C3%BChnen"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Maria-Stuart_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Bühnen" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Bühnen</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/B%C3%BCrger-Service"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Berufsberatung_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Bürger-Service" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Bürger-Service</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Feste-Festivals"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Stelzenlaeufer_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Feste & Festivals" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Feste & Festivals</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/G%C3%A4rten-Gr%C3%BCnes"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Lesepicknick_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Gärten & Grünes" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Gärten & Grünes</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Kinder-Jugendliche"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Kind-am-Kletterberg_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Kinder & Jugendliche" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Kinder & Jugendliche</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Konzerte"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Night-Of-The-Proms_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Konzerte" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Konzerte</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Lesungen-Vortr%C3%A4ge"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Literaturhaus-Hannover-1024x768_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Lesungen & Vorträge" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Lesungen & Vorträge</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/M%C3%A4rkte"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Wochenmarkt_alias_300x225px.jpg"  class="media-object img-responsive"  id="imgen" alt="Märkte" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Märkte</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Messen-Kongresse"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Messegelaende_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Messen & Kongresse" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Messen & Kongresse</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Politik"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Ratssaal-vom-Eingang_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Politik" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Politik</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Sonstiges"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Electric-Run_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Sonstiges" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Sonstiges</h4></a></li>';
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Sport"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Andreasen-und-Bittencourt_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Sport" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Sport</h4></a></li>';	
	page += '<li id="en" style="text-overflow: ellipsis;overflow: hidden;word-break: break-word;white-space: nowrap;"><a style="line-height: 50px;margin-top:0px;" data-url="http://www.hannover.de/Veranstaltungskalender/Wissenschaft-Wirtschaft"><i style="display: inline-block;float:right;color:#DDDDDD;line-height:75px;margin-right: 5px;font-size: 2em;" id="backbtn" class="badge-chevron fa fa-angle-right"></i>';
	page += '<img src="img/Info-Boerse-Jobcenter-Region_alias_300x225px.jpg"  class="media-object img-responsive" id="imgen" alt="Wissenschaft & Wirtschaft" style="height: 50px; display: inline-block;margin-right:20px;"/>';
	page += '<h4 class="happ-blue h-inline">Wissenschaft & Wirtschaft</h4></a></li>';
	page += '</ul>';
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);	
	$("ul#submenu li a").click(
					function(event) {
									var ref = window.open(encodeURI($(this).attr('data-url')),
						'_blank', 'location=yes', 'closebuttoncaption=X');
				ref.show();	
					});
	}
	else
	{
	var page = '';
	page += 'Leider besteht zur Zeit keine Internetverbindung. Bitte probieren Sie es später noch einmal.';
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);		
	}
	}
	else
	{
	var page = '';
	page += 'Leider besteht zur Zeit keine Internetverbindung. Bitte probieren Sie es später noch einmal.';
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);	
	}
}
function renderPageTypeHotel(item, stype) {
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', 0);
	$('#pagetitle').html('<h4>'+item.title+'</h4>');
	var page = '';
	page += '<div class="hotel-list-head" id="hotel-list-head" style="height:130px;background-image: url(\'img/hotel.jpg\');background-size: cover;position:relative;background-position: center;">';		
	page += '</div>';
	page += '<div id="item-body"  class="item-body-one item-body">';
	page += '<div id="searchform" class="item-body" style="margin-top:5px;">';
	page += '<form class="form-inline" role="form">';
	page += '<h4>Direkt Online buchen:</h4>';
	page += '<div class="row">';
	page += '<div class="form-group col-xs-6" style="padding-left: 0px;">';
	page += '<label class="" for="datevon">Anreise:</label>';
	page += '<input type="date" class="form-control" name="datevon" id="datevon" placeholder="von">';
	page += '</div>';
	page += '<div class="form-group col-xs-6"  style="padding-right: 0px;">';
	page += '<label class="" for="datebis">Abreise:</label>';
	page += '<input type="date" class="form-control" name="datebis" id="datebis" placeholder="bis">';
	page += '</div>';
	page += '</div>';
	page += '<div class="form-group">';
	page += '<select class="form-control" id="sterne" name="sterne" placeholder="Sterne">';
	page += '<option value="">Anzahl Sterne</option>';
	page += '<option value="1">1 Stern</option>';
	page += '<option value="2">2 Sterne</option>';
	page += '<option value="3">3 Sterne</option>';
	page += '<option value="4">4 Sterne</option>';
	page += '<option value="5">5 Sterne</option>';
	page += '</select></div>';
	page += '<button type="button" class="btn btn-primary btn-block" id="hotelsearch" style="width: 100%;margin: 0 auto;"><i class="fa fa-search"></i> '
			+ window.localStorage.getItem("L_search") + '</button>';
	page += '</form></div>';
	page += '<div class="preloader" style="display: none;margin: 0 auto;margin-top: 40%;position: relative;"><center><i class="fa fa-circle-o-notch fa-3 fa-spin fa-red"></i><center></div>';
	page += '<div id="searchresult" class="item-body" style="display:none;padding-right:10px;display:block;overflow:auto;margin-top:5px;margin-left: -10px;margin-right: -10px;"><ul class="nav nav-pills nav-stacked" id="hotels"></ul></div>';
	page += '<div id="zimmer" class="item-body" style="display:block;overflow:auto;margin-top:5px;border-top:1px solid #404040;"></div>';
	page += '</div>';

	page += '<div class="item-body-one"><button type="button" class="btn btn-primary btn-block " id="searchagain" style="display:none;margin: 5px auto 5px;width: 100%;"><i class="fa fa-search"></i> '
			+ window.localStorage.getItem("L_searchagain")
			+ '</button></div></div>';

	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);
	if (stype == 418) {
		subid = 419;
	} else {
		subid = 417;
	}
	var sql = 'SELECT * FROM NODES WHERE id=' + subid;
	db
			.transaction(function(tx) {
				tx
						.executeSql(
								sql,
								[],
								function(tx, results) {
									item = results.rows.item(0);
									var page = '';
									if (item.body !== null) {
										page += '<div class="item-body" id="item-body"  style="display:block;overflow:auto;margin-top:0px;"><div style="border-bottom: 1px solid #404040;">'
												+ '<h4>'
												+ item.title
												+ '</h4>'
												+ item.body + '</div>';
									}
									page += '<div id="adressfeld" style="margin-top:5px;background:#eee;padding:4px;"><strong>Adresse:</strong><br/>';
									var addcomplete = 0;
									if (item.street !== null
											&& item.street.trim() !== ''
											&& item.street.trim().length !== 0) {
										page += item.street + '<br/>';
										addcomplete++;
									}
									if (item.zip !== null
											&& item.zip.trim() !== ''
											&& item.zip.trim().length !== 0) {
										page += item.zip + ' ';
										addcomplete++;
									}
									if (item.city !== null
											&& item.city.trim() !== ''
											&& item.city.trim().length !== 0) {
										page += item.city + ' ';
										addcomplete++;
									}
									page += '</div><div style="margin-top:5px">';
									var countconbtn = 0;
									if (item.tlf !== null && item.tlf !== '') {
										page += '<a href="tel:'
												+ item.tlf
												+ '" class="btn btn-primary btn-block conbtn" id="btntel"><i class="fa fa-phone"></i> '
												+ window.localStorage
														.getItem("L_tel")
												+ '</a>';
										countconbtn++;
									}
									if (item.email !== null
											&& item.email !== '') {
										page += '<a href="mailto:'
												+ item.email
												+ '" class="btn btn-primary btn-block conbtn" id="btnmail"><i class="fa fa-envelope"></i> '
												+ window.localStorage
														.getItem("L_mail")
												+ '</a>';
										countconbtn++;
									}
									if (item.web !== null && item.web !== '') {
										page += '<a href="'
												+ item.web
												+ '" target="_blank" class="btn btn-primary btn-block conbtn" id="btnwww"><i class="fa fa-globe"></i> '
												+ window.localStorage
														.getItem("L_www")
												+ '</a>';
										countconbtn++;
									}
									if (navigator.connection !== undefined) {
										var networkState = navigator.connection.type;
										if ((addcomplete === 3)
												&& (networkState != 'Connection.NONE')) {
											page += '<a href="#" class="btn btn-primary btn-block mapbtn" id="mapbtn"><i class="fa fa-map-marker"></i> '
													+ window.localStorage
															.getItem("L_map")
													+ '</a>';
										}
									} else {
										if (addcomplete === 3) {
											page += '<a href="#" class="btn btn-primary btn-block mapbtn" id="mapbtn"><i class="fa fa-map-marker"></i> '
													+ window.localStorage
															.getItem("L_map")
													+ '</a>';
										}
									}
									page += '</div></div>';
									$("#zimmer").html(page);
																					$("#btnwww")
														.click(
																function(event) {
																	event
																			.preventDefault();
																	var ref = window
																			.open(
																					encodeURI($(
																							this)
																							.attr(
																									'href')),
																					'_blank',
																					'location=yes',
																					'closebuttoncaption=X');
																	ref.show();
																});
									if ((addcomplete == '')
											|| (addcomplete == 0)
											|| (addcomplete == undefined)) {
										$('#adressfeld').hide();
									}

								}, function(t, e) {
								})
			});
	$("#item-body").css('height', (window.innerHeight - 180) + 'px');
	$('#datevon').val(new Date().toDateInputValue());
	$('#datebis').val(
			new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
					.toDateInputValue());
	$('#hotelsearch')
			.click(
					function(event) {
						event.preventDefault();
						$('#searchform').hide();
						$('#zimmer').hide();
						$('.preloader').show();
						$("#searchform").height('0px');
						$
								.ajax({
									type : "GET",
									cache : false,
									data : 'von=' + $('#datevon').val()
											+ '&bis=' + $('#datebis').val()
											+ '&sterne=' + $('#sterne').val()
											+ '&page=0&size=200',
									url : "http://app-hannover.de/services/hannover/hotel_search/",
									dataType : 'json',
									async : true,
									success : function(data) {
										window.localStorage.setItem("datevon",
												$('#datevon').val());
										window.localStorage.setItem("datebis",
												$('#datebis').val());
										window.localStorage.setItem("sterne",
												$('#sterne').val());
										var $daten = data.data;
										var $hotel = [];
										$('.preloader').hide();
										$('#searchresult').show();
										$("#item-body").css(
												'height',
												(window.innerHeight - 230)
														+ 'px');
										$('#searchagain').show();

										$("#searchresult").css('height',
												window.innerHeight - 235);
										$('#searchagain').click(
												function(event) {
													event.preventDefault();
													$('#searchagain').hide();
													$('#searchresult').hide();
													$('#searchform').show();
												});
										$
												.each(
														$daten,
														function(i, value) {
															$('#hotels')
																	.append(
																			'<li id="h_'
																					+ value.id
																					+ '"><a style="text-overflow: ellipsis;word-wrap: break-word;white-space: nowrap;overflow: hidden;color:#404040;line-height:50px;margin-top:0px;"><img style="height:50px;margin-right:10px;display: inline-block;" src="'
																					+ value.photo
																					+ '"/>'
																					+ value.name
																					+ '</a></li>');
															$('#h_' + value.id)
																	.click(
																			function(
																					event) {
																				$hotel[value.id] = value;
																				renderPageTypeHotelDetail(
																						$hotel[value.id],
																						stype);
																			});
														});
									}

								});
					});

}
function renderPageTypeHotelDetail(item, stype) {
	$("#main-content").css("opacity", "0").css("transition", "opacity 0s");
	$('#main-content').removeClass('start');
	$('body').attr('data-parent', 14);
	var page = '';
	page += '<div class="media mainmedia" style="border-bottom: 1px solid #404040;padding-bottom:5px;"><a class="pull-left">';
	if (item.photo !== null) {
		page += '<img class="media-object img-responsive" style="height:100px" src="'
				+ item.photo.replace("square60", "square150")
				+ '"  alt="'
				+ item.name + '"/>';
	}
	page += '</a><div class="media-body"><h4 class="media-heading">'
			+ item.name + '</h4>';
	page += '</div></div>';
	if (item.beschreibung_de !== null) {
		page += '<div class="item-body item-body-one" id="item-body"  style="padding-right:10px;display:block;overflow:auto;margin-top:5px;"><div style="padding-top:5px;">'
				+ item.beschreibung_de + '</div>';
	}
	page += '<div id="adressfeld" style="margin-top:5px;background:#eee;padding:4px;"><strong>Adresse:</strong><br/>';
	var addcomplete = 0;
	if (item.strasse !== null && item.strasse.trim() !== ''
			&& item.strasse.trim().length !== 0) {
		page += item.strasse + '<br/>';
		addcomplete++;
	}
	if (item.plz !== null && item.plz.trim() !== ''
			&& item.plz.trim().length !== 0) {
		page += item.plz + ' ';
		addcomplete++;
	}
	if (item.ort !== null && item.ort.trim() !== ''
			&& item.ort.trim().length !== 0) {
		page += item.ort + ' ';
		addcomplete++;
	}
	page += '</div><div style="margin-top:5px">';
	// page += '<div class="btn-group pull-right" style="width:100%" >';
	var countconbtn = 0;
	page+='<div>';
	if (item.sterne !== null && item.sterne !== '') {
		page += '<button type="button" class="btn btn-default btn-block conbtn" style="width:49%;display: inline-block;padding-left:0px;text-align:center;">';
		for (i = 0; i < item.sterne; i++) {
			page += '<i class="fa fa-star" style="color:#f0ad4e;"></i>';
		}
		for (t = 0; t < (5 - item.sterne); t++) {
			page += '<i class="fa fa-star-o" style="color:#f0ad4e;"></i>';
		}

		page += '</button>';
		countconbtn++;
	}
	
	if (item.available_rooms !== null && item.available_rooms !== '') {
		page += '<button type="button" class="btn btn-default btn-block conbtn" style="width:49%;float:right;display: inline-block;margin-top:0px;padding-left:0px;text-align:center;"><i class="fa fa-users"></i> '
				+ item.available_rooms + '</button>';
		countconbtn++;
	}
	page+='</div>';
	page += '<a href="'
			+ item.url
			+ '" target="_blank" class="btn btn-primary btn-block mapbtn" id="btnwww" style="margin-top:5px;"><i class="fa fa-globe"></i> '
			+ window.localStorage.getItem("L_book") + '</a>';
	page += '</div></div>';
	$("#main-content").css("opacity", "1").css("transition", "opacity 0.5s");
	$("#main-content").html(page);
	if (addcomplete < 1) {
		$('#adressfeld').hide();
	}

	$("#item-body").css('height', (window.innerHeight - 160) + 'px');
	$("#btnwww").click(
			function(event) {
				event.preventDefault();
				var ref = window.open(encodeURI($(this).attr('href')),
						'_blank', 'location=yes', 'closebuttoncaption=X');
				ref.show();
			});
}
function renderPageStart(now) {
	$("#main-content").html('');
	$('body').attr('data-parent', 'start');
	$("#main-content").hide();
	$("#backbtn").hide();
	$("#searchbtn").show();
	$("#main-content").hide();
	$("#main-content").removeClass("start");
	$("#logo").hide();
	$("body").removeClass("start");
	$("#main-content").css("background-color", "white");
}
function getWeather() {
	var html = '';
	$
			.simpleWeather({
				location : 'Hannover',
				woeid : '657169',
				unit : 'c',
				success : function(weather) {
					html += '<p style="color:darkgrey;font-size:2em;margin:0px;"><i class="wi wi-'+weather.code+'"></i> '
							+ weather.temp
							+ '&deg;'
							+ weather.units.temp
							+ '</p>';
					$("#wetter").html(html);
					window.localStorage.setItem("wetter", html);
				},
				error : function(error) {
				}
			});
}
function onBackKeyDown() {
	if ($('body').attr('data-parent') == 0) {
							var randhead=Math.floor((Math.random() * 7) + 1);
							$('body').attr('data-parent', 'start');
					$('#menu-list-head').css('background-image','url(\'img/head/'+randhead+'.jpg\')');
					$("#navbutton").hide();
					$('#wetter').show();				
					$("#backbtn").hide();
					$('#pagetitle').html('');
					$("#searchbtn").show();
					$("#main-content").html('');
					$("#main-content").hide();
					$('#main-menu-list').scrollTop(0);
	} else {
		if ($('body').attr('data-parent') > 0) {
			renderPageforid($('body').attr('data-parent'), $('body').attr(
					'data-stype'), 0);
		} else {

			navigator.notification.confirm(window.localStorage
					.getItem("exittext"), exitApp, window.localStorage
					.getItem("exit"), [ window.localStorage.getItem("yes"),
					window.localStorage.getItem("no") ]);
		}
	}
}
function exitApp(index) {
	if (index == 1) {
		navigator.app.exitApp();
	} else {
		return false;
	}
}
function start() {
	checkLanguage();
	$('body').addClass('start');
	db = window.openDatabase("hannoverapp", "1.0", "Test DB", 1000000);
	$("#loaderdata").show();
	if (phonegap == true) {
		window.plugins.insomnia.keepAwake();
		setTimeout(function() {
			navigator.splashscreen.hide();
		}, 0);
	}
	if (window.localStorage.getItem("firststart") == undefined) {
		window.localStorage.setItem("firststart", 'true');
	}
	db.transaction(populateDB, errorCB, getNodes);
	$('#main-content').css('height', (window.innerHeight - 45) + 'px');
	$('#main-menu-list').css('height', (window.innerHeight - 177) + 'px');
	$("#navbutton").click(function(event) {
		event.preventDefault();
		var randhead=Math.floor((Math.random() * 7) + 1);
		$('body').attr('data-parent', 'start');
		$('#menu-list-head').css('background-image','url(\'img/head/'+randhead+'.jpg\')');
		$("#navbutton").hide();
		$('#wetter').show();
		$("#backbtn").hide();
		$('#pagetitle').html('');
		$("#searchbtn").show();
		$("#main-content").html('');
		$("#main-content").hide();
		$('#main-menu-list').scrollTop(0);
	});
	$("#backbtn").click(
			function(event) {
				event.preventDefault();
				if ($('body').attr('data-parent') == 0) {
					$('body').attr('data-parent', 'start');
					var randhead=Math.floor((Math.random() * 7) + 1);
					$('#menu-list-head').css('background-image','url(\'img/head/'+randhead+'.jpg\')');
					$("#navbutton").hide();
					$('#wetter').show();				
					$("#backbtn").hide();
					$('#pagetitle').html('');
					$("#searchbtn").show();
					$("#main-content").html('');
					$("#main-content").hide();
					$('#main-menu-list').scrollTop(0);
				} else {
					if ($('body').attr('data-parent') > 0) {
						renderPageforid($('body').attr('data-parent'),
								$('body').attr('data-stype'), 0);
					}
				}
			});
	$("#searchbtn")
			.click(
					function(event) {
						event.preventDefault();
						$('body').attr('data-parent',0);
						var randhead=Math.floor((Math.random() * 7) + 1);
						$("#main-content")
								.html(
										'<div class="menu-list-head" id="menu-list-head" style="height:130px;background-image: url(\'img/head/'+randhead+'.jpg\');background-size: cover;background-position: center;">'
												+ '<img style="height:65px;margin-left:10px;margin-top:10px" src="img/hannover_logo.png"></div><div id="searchthisapp" style="width:100%;">'
												+ '<div class="form-horizontal searchform" id="searchform" role="form"><div class="form-group has-feedback" style="margin: 0px 0px 0px 0px;"><div class="col-sm-12" style="padding:0px"><input type="text" placeholder="Suchen..." class="form-control" id="search" style="line-height: 50px;height: 50px;">'
												+ '<span style="line-height: 50px;" class="fa fa-search form-control-feedback"></span></div></div></div></div><div><ul class="nav nav-pills nav-stacked" id="searchlist" style="display:none;overflow: hidden;overflow-y: auto;"></ul></div>');

						$("#main-content").show();
						$("#searchbtn").hide();
						$("#backbtn").show();
						$('#wetter').hide();
						$("#navbutton").show();
						$('#search').fastLiveFilter('#searchlist', {
							timeout : 5
						});
					});
}
function onDeviceReady() {
	document.addEventListener("backbutton", onBackKeyDown, false);
	phonegap = true;
	start();
}
function alertDismissed() {
    navigator.app.exitApp();
}


$(document).ready(function() {
	$(document).on('click', "ul#searchlist li", function(event) {
		event.preventDefault();
		renderPageforid($(this).attr('id'), 0, 'search');
		return true;
	});
	document.addEventListener("deviceready", onDeviceReady, false);
	if (DEBUG == true) {
		start();
	}
});
