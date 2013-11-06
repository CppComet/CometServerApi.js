



function getCookie(name)
{
     var cookie = " " + document.cookie;
     var search = " " + name + "=";
     var setStr = null;
     var offset = 0;
     var end = 0;
     if (cookie.length > 0) {
             offset = cookie.indexOf(search);
             if (offset != -1) {
                     offset += search.length;
                     end = cookie.indexOf(";", offset)
                     if (end == -1) {
                             end = cookie.length;
                     }
                     setStr = unescape(cookie.substring(offset, end));
             }
     }
     return(setStr);
}

 
/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/  
var Base64 = {
 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
 
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = Base64._utf8_encode(input);
 
		while (i < input.length) {
 
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
 
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
 
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
 
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
 
		}
 
		return output;
	},
 
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
 
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
		while (i < input.length) {
 
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
 
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
 
			output = output + String.fromCharCode(chr1);
 
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
 
		}
 
		output = Base64._utf8_decode(output);
 
		return output;
 
	},
 
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
 
		for (var n = 0; n < string.length; n++) {
 
			var c = string.charCodeAt(n);
 
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
 
		return utftext;
	},
 
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
 
		while ( i < utftext.length ) {
 
			c = utftext.charCodeAt(i);
 
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
 
		}
 
		return string;
	}
 
}

function comet_server_signal()
{
    if(!this.custom_id)
    {
        this.custom_id = Math.random()+"_"+Math.random()+"_"+Math.random()+"_"+Math.random()
        this.slotArray = new Array()
        this.debug = false
    }

    if(this.init === undefined) this.init = false

    /**
     * Подписывает слот на сигнал
     *
     * Если передать два параметра то они обработаются как  connect( signal_name, slot_function )
     * Если передать три параметра то они обработаются как  connect( slot_name, signal_name, slot_function )
     *
     * @param slot_name Имя слота
     * @param signal_name Имя сигнала
     * @param slot_function Функция вызваемая при вызове слота, должна иметь следующию сигнатуру function(param, signal_name){}
     *
     * <code>
     * Пример использования
     * new new signal().emit("catalogControl.OpenObject",{})
     *
     * </code>
     */
    this.connect = function(slot_name, signal_name, slot_function)
    {
        if(slot_function === undefined)
        {
            slot_function = signal_name;
            signal_name = slot_name;
            slot_name = Math.random()+""+Math.random()
        }

        if (this.slotArray[signal_name] === undefined)
        {
            this.slotArray[signal_name] = new Array()
        }
        this.slotArray[signal_name][slot_name] = slot_function;
        if(this.debug) console.log("На прослушивание сигнала " + signal_name + " добавлен слот " + slot_name + "")
        return slot_name;
    }


    /**
     * Отписывает слот slot_name от сигнала signal_name
     */
    this.disconnect = function(slot_name, signal_name)
    {
        if (this.slotArray[signal_name] === undefined)
        {
            this.slotArray[signal_name] = new Array()
        }

        if (this.slotArray[signal_name][slot_name] !== undefined)
        {
            delete this.slotArray[signal_name][slot_name]
        }
    }

    /**
     * Вызывает слоты подписаные на сигнал signal_name и каждому из них передаёт аруметы signal_name - имя вызвавшего сигнала, и param - объект с параметрами для слота)
     * В добавок ретранслирует сигнал в дочернии iframe если они есть и в родительское окно если оно есть
     * @param signal_name Имя сигнала
     * @param param Параметры переданые слоту при вызове в втором аргументе
     */
    this.emit = function(signal_name, param)
    {
        if (this.slotArray[signal_name] === undefined)
        {
            if(this.debug) console.log("На сигнал " + signal_name + " нет подписчиков")
        }
        else
        {
            if(this.debug) console.log("Сигнал " + signal_name + " подписаны слоты")
            for (var slot in this.slotArray[signal_name])
            {
                this.slotArray[signal_name][slot](param,signal_name)
            }

        }
    }

    /*
     *  генерация события будут оповещены и соседние вкладки
     *  @eName string - имя события
     *  использование .emit('любое название события', [ Параметры события ])
     */
    this.send_emit = function (signal_name, param)
    {
        this.emit(signal_name, param)

        if(window['localStorage'] !==undefined  )
        {
            var curent_custom_id = Math.random()+"_"+Math.random()+"_"+Math.random()+"_"+Math.random()+"_"+Math.random()

            last_custom_id = curent_custom_id.replace(/0\./img,"")
            window['localStorage']['comet_server_signal_storage_emit']= JSON.stringify({name:signal_name, custom_id:curent_custom_id, param:param});
        }
    }


 return this;
}



if(!comet_server_signal.prototype.init)
{
    comet_server_signal.prototype.init = true
    if( window.addEventListener )
    {
        window.addEventListener('storage', function(e)
        {
            try{
                var data = JSON.parse(e.newValue);
                if(data !== undefined && data.name !== undefined  )
                {
                    if(this.debug > 1) console.log( data )
                    comet_server_signal().emit( data.name, data.param )
                }
            }
            catch (failed)
            {
            }
        }, false);
    }
    else
    {
        document.attachEvent('onstorage', function(e)
        {
            try{
                var data = JSON.parse(e.newValue);
                if(data !== undefined && data.name !== undefined  )
                {
                    if(this.debug > 1) console.log( data )
                    comet_server_signal().emit( data.name, data.param )
                }
            }
            catch (failed)
            {
            }
        } );
    }
}



var __CometServer = undefined;
function CometServer(options)
{
    console.log(options)
    var CometServerApi = function(opt)
    {
	this.version = "1.5";

	this.major_version = 1;
	this.minor_version = 33;

        this.options = opt
        this.arg= "";
        this.is_master = false;
        this.in_conect_to_server = false;
        this.in_try_conect = false;

        this.subscription_array = new Array();
        this.custom_id = Math.random()+""+Math.random()

        /**
         * Время на переподключение в милисекундах
         */
        this.time_to_reconect_on_error = 1000;
        this.in_abort = false;
        this.restart_time_id = false


        this.start_timer = 1200;
        this.reg_exp = new RegExp(/^([^.]+)\.([^.]+)$/)

        /**
         * Добавляет подписки на каналы, события в каналах и отчёты о доставке сообщений в каналы.
         * 
         * Подписка на канал "Имя_канала"
         * CometServer().subscription("Имя_канала", function(e){ console.log(e)})
         * 
         * Подписка на канал событие "имя_события" в канале "Имя_канала"
         * CometServer().subscription("Имя_канала.имя_события", function(e){ console.log(e)})
         * 
         * Подписка на отчёт о доставке в канал "Имя_канала"
         * CometServer().subscription("#Имя_канала", function(e){ console.log(e)})
         * 
         * Подписка на отчёт о доставке в канал "Имя_канала"
         * CometServer().subscription("answer_to_Имя_канала", function(e){ console.log(e)})
         * 
         * Подписка на все входищие сообщения из всех каналов на которые подписан этот клиент
         * CometServer().subscription("", function(e){ console.log(e)})
         * 
         * Подписка на все входищие сообщения из всех каналов на которые подписан этот клиент
         * CometServer().subscription(function(e){ console.log(e)})
         * 
         * Подписка на сообщения от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
         * CometServer().subscription("msg", function(e){ console.log(e)})
         * 
         * Подписка на сообщения с имененм события "имя_события" от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
         * CometServer().subscription("msg.имя_события", function(e){ console.log(e)})
         * 
         * Обратите внимание что дляна имени канала должнеа быть больше 2 символов
         * @param {string} name Имя канала
         * @param {function} callback Функция callback
         */
        this.subscription = function(name, callback)
        {
            var thisObj = this;
            
            if(name === undefined )
            {
                return -1;
            }
            
            if(callback === undefined)
            {
                callback = function(){};
            }
            
            if(typeof name === "function" )
            {
                comet_server_signal().connect("comet_server_msg", name);
                return 1;
            }
             
            if( name === "msg" || /^msg\./.test(name) )
            {
                // Подписка на сообщения от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
                comet_server_signal().connect(name, callback);
                return 1;
            }
            
            if(/^answer_to_web_/.test(name)) 
            {
                // Подписка на отчёт о доставке
                comet_server_signal().connect(name, callback);
                return 1;
            }
            else if(/^#/.test(name)) 
            {
                // Подписка на отчёт о доставке
                name = name.replace(/^#/, "answer_to_");
                comet_server_signal().connect(name, callback);
                return 1;
            }
              
            if( name === ""  )
            {   // Подписка на все сообщения разом
                name = "comet_server_msg";
            }
            
            if(name.length < 2 )
            {
                // Имя канала слишком короткое
                return -1;
            }
            
            comet_server_signal().connect(name, callback);
            
            if( name === "comet_server_msg" )
            {   // Подписка на все сообщения разом
                return 1;
            }
                        
            if(this.reg_exp.test(name))
            {
                var res = this.reg_exp.exec(name);
                
                console.log(res)
                name = res[1];
            }

            for(var i in this.subscription_array)
            {
                if(this.subscription_array[i] === name )
                {
                    return 1;
                }
            }

            this.subscription_array[this.subscription_array.length] = name
            if(this.is_master)
            {
                console.log('add subscription:'+name)

                if(window.WebSocket)
                {
                    if(thisObj.send_msg("subscription\n"+thisObj.subscription_array.join("\n")) === false)
                    {
                        comet_server_signal().connect("subscription_msg_slot", "comet_msg_socket_open", function()
                        {
                            thisObj.send_msg("subscription\n"+thisObj.subscription_array.join("\n"));
                            comet_server_signal().disconnect("subscription_msg_slot", "comet_msg_socket_open");
                        })
                    }
                }
                else
                {
                    this.restart()
                }

            }
            else
            {
                console.log('send_emit:comet_msg_slave_add_subscription_and_restart:'+name)
                comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',name)
            }
            return 1;
        }

        this.start = function(opt)
        {
            if(opt !== undefined)
            {
                this.options = opt
            }

            console.log([this.custom_id , opt])

            if(this.options === undefined)
            {
                this.options = {}
            }

            if(!this.options.CookieKyeName)
            {
                this.options.CookieKyeName = 'CometUserKey'
            }

            if(!this.options.CookieIdName)
            {
                this.options.CookieIdName = 'CometUserid'
            }

            if(!this.options.user_key)
            {
                this.options.user_key = getCookie(this.options.CookieKyeName)
            }

            if(!this.options.user_id)
            {
                this.options.user_id = getCookie(this.options.CometUserid)
            }

            if(window.WebSocket)
            {
                this.url = 'ws://ws-client'+this.options.dev_id+'.app.comet-server.ru/ws/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
            }
            else
            {
                this.url = '//client'+this.options.dev_id+'.app.comet-server.ru/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
            }

            if(this.options.user_key && this.options.user_key.length > 10)
            {
                if(this.options.dev_id > 0)
                {
                    this.in_abort = false;
                    this.conect()
		    return true;
                }
                else
                {
                    console.warn("Не установлен dev_id")
                    return false;
                }
            }
            else
            {
                console.warn("Не установлен user_key")
                return false;
            }
        }

        this.stop = function()
        {
            if(this.is_master)
            {
                this.in_abort = true;

                if(window.WebSocket)
                {
                    this.socket.close();
                }
                else
                {
                    this.request.abort();
                }
            }
            else
            {
                comet_server_signal().send_emit('comet_msg_slave_signal_stop')
            }
        }


        /**
         * Выполняет переподключение, если вызвать несколько раз переподключение будет одно
         * Переподключение начинается спустя секунду после вызова
         * @param function callback
         * @param array callback_arg
         */
        this.restart = function(callback,callback_arg)
        {
            var thisObj = this
            if(this.is_master)
            {
                if(this.restart_time_id !== false)
                {
                    clearTimeout( this.restart_time_id )
                }

                if(!thisObj.in_abort)
                {
                    thisObj.in_abort = true;
                    if(window.WebSocket)
                    {
                        thisObj.socket.close();
                    }
                    else
                    {
                        thisObj.request.abort();
                    }
                }

                this.restart_time_id = setTimeout(function()
                {
                    thisObj.in_abort = false;
                    thisObj.conect_to_server(callback, callback_arg)
                    console.error('msg master restart')
                },1000)
            }
            else
            {
                console.error('comet_msg_slave_signal_restart')
                comet_server_signal().send_emit('comet_msg_slave_signal_restart')
            }
        }


        this.setAsMaster = function()
        {
            var thisObj = this;
            this.is_master = true;
            console.log("setAsMaster")

            comet_server_signal().send_emit('comet_msg_master_signal')        //  для уведомления всех остальных вкладок о своём превосходстве
            comet_server_signal().send_emit('comet_msg_new_master')           //  для уведомления всех что надо переподписатся @todo реализовать переподписку событий
            setInterval(function()                                      // Поставим таймер для уведомления всех остальных вкладок о своём превосходстве
            {
               comet_server_signal().send_emit('comet_msg_master_signal')
            }, this.start_timer/6);

            comet_server_signal().connect(false,'comet_msg_slave_signal_restart', function(p,arg) // подключение на сигнал рестарта от других вкладок
            {
                console.log([p,arg])
                thisObj.restart()
            })

            comet_server_signal().connect(false,'comet_msg_slave_signal_stop', function(p,arg)    // подключение на сигнал остоновки от других вкладок
            {
                console.log([p,arg])
                thisObj.stop()
            })

            comet_server_signal().connect(false,'comet_msg_slave_signal_start', function(p,arg)    // подключение на сигнал запуска от других вкладок
            {
                console.log([p,arg])
                thisObj.start()
            })

            comet_server_signal().connect(false,'comet_msg_slave_add_subscription_and_restart', function(p,arg)// подключение на сигнал переподписки от других вкладок
            {
                console.log([p,arg])
                thisObj.subscription(p)
            })

            comet_server_signal().connect(false,'comet_msg_slave_send_msg', function(p,arg)// подключение на сигнал переподписки от других вкладок
            {
                console.log([p,arg])
                thisObj.send_msg(p)
            })

        }


        /**
         * Обрабатывает распарсеное входящее сообщение
         */
        this.msg_cultivate = function( rj )
        {
            console.log("rj", rj);
            if( rj.msg === undefined )
            {
                return -1;
            }
            
            var web_id = 0;
            if(/^A::/.test(rj.msg))
            {
                // Проверка не пришлоли вместе с данными информации о отправителе.
                var r = rj.msg.split(";")
                web_id = r[0].replace("A::", "");
                rj.msg = r[1];
            }
            
            rj.msg = Base64.decode(rj.msg)
            try{
                console.log(["msg", rj.msg, "web_id:"+web_id]);
                var pmsg = JSON.parse(rj.msg)

                if(pmsg !== undefined)
                {
                    rj.msg = pmsg
                }
            }
            catch (failed){  }
            
            var msg = {"data": rj.msg.data, "server_info":{"user_id":web_id, pipe:rj.pipe, event:rj.msg.event_name }}
            console.log(["msg", msg, rj]);
 
            if(rj.pipe !== undefined) 
            {// Сообщение из канала.

                comet_server_signal().send_emit(rj.pipe, msg)

                if(rj.msg.event_name !== undefined && ( typeof rj.msg.event_name === "string" || typeof rj.msg.event_name === "number" ) )
                {
                    comet_server_signal().send_emit(rj.pipe+"."+rj.msg.event_name, msg)
                }
            }
            else if(rj.msg.event_name !== undefined && ( typeof rj.msg.event_name === "string" || typeof rj.msg.event_name === "number" ) )
            {
                // Сообщение доставленое по id с указанием event_name
                comet_server_signal().send_emit("msg."+rj.msg.event_name, msg)
                comet_server_signal().send_emit("msg", msg)
            }
            else
            {
                // Сообщение доставленое по id без указания event_name
                comet_server_signal().send_emit("msg", msg)
            }

            comet_server_signal().send_emit("comet_server_msg", msg);
            return 1;
        }

        this.send_msg = function(msg)
        {
            if(!window.WebSocket)
            {
                return false;
            }

            if(this.socket &&  this.socket.readyState === 1)
            {
                console.log("WebSocket-send-msg:"+msg)
                this.socket.send(msg);
                return true;
            }
            else
            {
                return false;
            }
        }

        /**
         * Вернёт true в случаи отправки
         * Отчёт о доставке прийдёт в канал _answer
         * @param string pipe_name имя канала, должно начинатся с web_
         * @param string event_name имя события в канале
         * @param string msg Сообщение
         * @returns boolean
         */
        this.web_pipe_send = function(pipe_name, event_name, msg)
        {
            if(msg === undefined)
            {
                msg = event_name;
                event_name = "undefined";
            }
            
            if(msg === undefined)
            {
                return false;
            }
                 
            console.log(["web_pipe_send", pipe_name, msg]);
            if(this.is_master)
            {
                return this.send_msg("web_pipe\n"+pipe_name+"\n"+Base64.encode(JSON.stringify({'data':msg, event_name:event_name})));
            }
            else
            {
                comet_server_signal().send_emit('comet_msg_slave_send_msg',"web_pipe\n"+pipe_name+"\n"+Base64.encode(msg))
            }

        }

        this.conect_to_server = function()
        {
            var thisObj = this

	    if(this.in_conect_to_server)
            {
                console.log("Соединение с сервером уже установлено.");
                return;
            }

	    this.in_conect_to_server = true;


            if(!this.is_master) this.setAsMaster()

            console.log("Соединение с сервером");


            if(window.WebSocket)
            {
                this.socket = new WebSocket(this.url);
                comet_server_signal().connect("conect_to_server_msg_slot", "comet_msg_socket_open", function()
                {
                    // Требуется для того чтобы подписатся на те события на которые были попытки подписатся ещё до установления этой вкладки мастером
                    thisObj.send_msg("subscription\n"+thisObj.subscription_array.join("\n"));
                    comet_server_signal().disconnect("conect_to_server_msg_slot", "comet_msg_socket_open");
                })/**/



                this.socket.onopen = function() {
                    console.log("WS Соединение установлено.");
                    comet_server_signal().send_emit('comet_msg_socket_open')
                };

                this.socket.onclose = function(event)
                {
                    if (event.wasClean)
                    {
                      console.log('WS Соединение закрыто чисто');
                    }
                    else
                    {
                      console.log('WS Обрыв соединения'); // например, "убит" процесс сервера
                      thisObj.socket.close();
                      thisObj.in_conect_to_server = false;
                      setTimeout(function(){ thisObj.conect_to_server() }, thisObj.time_to_reconect_on_error*10 )

                    }
                    console.log('WS Код: ' + event.code + ' причина: ' + event.reason);
                };

                this.socket.onmessage = function(event)
                {
                    console.log("WS Входящие сообщение:"+event.data);
                    var lineArray = event.data.replace(/^\s+|\s+$/, '').split('\n')
                    for(var i in lineArray)
                    {
                        try{
                            console.log(lineArray[i]);
                            var rj = JSON.parse(lineArray[i])
                        }
                        catch (failed)
                        {
                            return false;
                        }

                        thisObj.msg_cultivate(rj)

                    }
                };

                this.socket.onerror = function(error) {
                    console.log("Ошибка " + error.message);
                };
            }
            else
            {
                try {
                    this.request = new XMLHttpRequest();
                } catch (trymicrosoft) {
                    try {
                        this.request = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (othermicrosoft) {
                        try {
                            this.request = new ActiveXObject("Microsoft.XMLHTTP");
                        } catch (failed) {
                            this.request = false;
                        }
                    }
                }

                this.request.onreadystatechange = function()
                {
                    if (thisObj.request.readyState !== 4 )
                    {
                        return;
                    }

                    if( thisObj.request.status === 200 && thisObj.in_abort !== true)
                    {
                        var re = thisObj.request.responseText;

                        console.log("Входящие сообщение:"+re);
                        var lineArray = re.replace(/^\s+|\s+$/, '').split('\n')
                        for(var i in lineArray)
                        {

                            try{
                                console.log(lineArray[i]);
                                var rj = JSON.parse(lineArray[i])
                            }
                            catch (failed)
                            {
                                thisObj.in_conect_to_server = false;
                                console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
                                setTimeout(function(){thisObj.conect_to_server()}, thisObj.time_to_reconect_on_error )
                                return false;
                            }


                            thisObj.msg_cultivate(rj)
                        }

                        thisObj.in_conect_to_server = false;
                        thisObj.conect_to_server();
                    }
                    else
                    {
                        thisObj.in_conect_to_server = false;
                        if(thisObj.in_abort !== true)
                        {
                            console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
                            setTimeout(function(){ thisObj.conect_to_server() }, thisObj.time_to_reconect_on_error )
                        }
                    }
                };

                this.request.open("POST", this.url, true);
                this.request.send(this.subscription_array.join("\n")); // Именно здесь отправляются данные
            }

        }

        this.conect = function(callback)
        {
             if(this.is_master)
             {
                 return this.conect_to_server();
             }

             if(this.in_try_conect)
             {
                 console.log("Соединение с сервером уже установлено на другой вкладке");
                 comet_server_signal().send_emit('comet_msg_slave_signal_start')
                 return false;
             }

             this.in_try_conect = true;

             if(callback === undefined)
             {
                 callback = function(){}
             }

             var thisObj = this;
             console.log("Попыдка соединения с сервером");


             var time_id = false
             var last_time_id = false

             // Подключаемся на уведомления от других вкладок о том что сервер работает, если за this.start_timer милисекунд уведомление произойдёт то отменим поставленый ранее таймер
             comet_server_signal().connect("comet_msg_conect",'comet_msg_master_signal', function()
             {
                if(time_id !== false) //  отменим поставленый ранее таймер если это ещё не сделано
                {
                    clearTimeout( time_id )
                    time_id = false;
                    console.log("Соединение с сервером отменено");

                    comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal')
                    comet_server_signal().connect("comet_msg_conect_to_master_signal",'comet_msg_master_signal', function()
                    {
                        if(last_time_id !== false)
                        {
                            clearTimeout( last_time_id )
                        }
                        
                        // Создадим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой
                        last_time_id = setTimeout(function()
                        {
                           comet_server_signal().disconnect("comet_msg_conect_to_master_signal", 'comet_msg_master_signal')

                           thisObj.in_try_conect = false;
                           thisObj.conect_to_server()
                           callback()
                        }, thisObj.start_timer )
                    })
 
                }
             })

             // Создадим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой
             time_id = setTimeout(function()
             {
                comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal')

                thisObj.in_try_conect = false;
                thisObj.conect_to_server()
                callback()
             }, thisObj.start_timer )

        }

    }

    if(!__CometServer)
    {
        __CometServer = new CometServerApi();
    }

    return __CometServer;
}


