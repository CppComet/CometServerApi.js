



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


function utf8(utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while (i < utftext.length) {

        c = utftext.charCodeAt(i);

        if (c < 128) {
            string += String.fromCharCode(c);
            i++;
        }
        else if ((c > 191) && (c < 224)) {
            c2 = utftext.charCodeAt(i + 1);
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i += 2;
        }
        else {
            c2 = utftext.charCodeAt(i + 1);
            c3 = utftext.charCodeAt(i + 2);
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 3;
        }

    }
    return string;
}

function base64_encode( data ) 
{	// Encodes data with MIME base64
	// 
	// +   original by: Tyler Akins (http://rumkin.com)
	// +   improved by: Bayron Guevara

	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i=0, enc='';

	do { // pack three octets into four hexets
		o1 = data.charCodeAt(i++);
		o2 = data.charCodeAt(i++);
		o3 = data.charCodeAt(i++);

		bits = o1<<16 | o2<<8 | o3;

		h1 = bits>>18 & 0x3f;
		h2 = bits>>12 & 0x3f;
		h3 = bits>>6 & 0x3f;
		h4 = bits & 0x3f;

		// use hexets to index into b64, and append result to encoded string
		enc += b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
	} while (i < data.length);

	switch( data.length % 3 ){
		case 1:
			enc = enc.slice(0, -2) + '==';
		break;
		case 2:
			enc = enc.slice(0, -1) + '=';
		break;
	}

	return enc;
}

function base64_decode( data ) {
        // Decodes data encoded with MIME base64
	//
	// +   original by: Tyler Akins (http://rumkin.com)

	var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	var o1, o2, o3, h1, h2, h3, h4, bits, i=0, enc='';

	do {  // unpack four hexets into three octets using index points in b64
		h1 = b64.indexOf(data.charAt(i++));
		h2 = b64.indexOf(data.charAt(i++));
		h3 = b64.indexOf(data.charAt(i++));
		h4 = b64.indexOf(data.charAt(i++));

		bits = h1<<18 | h2<<12 | h3<<6 | h4;

		o1 = bits>>16 & 0xff;
		o2 = bits>>8 & 0xff;
		o3 = bits & 0xff;

		if (h3 == 64)	  enc += String.fromCharCode(o1);
		else if (h4 == 64) enc += String.fromCharCode(o1, o2);
		else			   enc += String.fromCharCode(o1, o2, o3);
	} while (i < data.length);

	return utf8(enc);
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


        this.start_timer = 3000;

        /**
         * Добавляет подписки
         */
        this.subscription = function(name, callback)
        {
            var thisObj = this;
            if(name !== undefined && name.length > 2)
            {
                if(callback !== undefined) comet_server_signal().connect("pipe_"+name, callback);

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
            }
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
                this.url = 'ws://ws-client'+this.options.dev_id+'.app.comet-server.ru/ws/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id;
            }
            else
            {
                this.url = '//client'+this.options.dev_id+'.app.comet-server.ru/?type=Long-Polling&sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id;
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

            comet_server_signal().send_emit('comet_msg_master_signal')        //  для уведомления всех остальных вкладок о своём превосходстве
            comet_server_signal().send_emit('comet_msg_new_master')           //  для уведомления всех что надо переподписатся @todo реализовать переподписку событий
            setInterval(function()                                      // Поставим таймер для уведомления всех остальных вкладок о своём превосходстве
            {
               comet_server_signal().send_emit('comet_msg_master_signal')
            }, this.start_timer/3);

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
        }


        /**
         * Обрабатывает распарсеное входящее сообщение
         */
        this.msg_cultivate = function( rj )
        {
            if( rj.msg !== undefined )
            {
                rj.msg = base64_decode(rj.msg)
                try{
                    console.log(["msg", rj.msg]);
                    var pmsg = JSON.parse(rj.msg)

                    if(pmsg !== undefined)
                    {
                        rj.msg = pmsg
                    }
                }
                catch (failed){  }

                if(rj.pipe !== undefined)
                {
                    comet_server_signal().send_emit("pipe_"+rj.pipe, rj.msg)

                    if(rj.msg.event_name !== undefined && ( typeof rj.msg.event_name === "string" || typeof rj.msg.event_name === "number" ) )
                    {
                        comet_server_signal().send_emit("pipe_"+rj.pipe+"_event_"+rj.msg.event_name, rj.msg)
                    }

                    comet_server_signal().send_emit("event_"+rj.msg.event_name, rj.msg)
                }
                else if(rj.msg.event_name !== undefined && ( typeof rj.msg.event_name === "string" || typeof rj.msg.event_name === "number" ) )
                {
                    comet_server_signal().send_emit("msg_"+rj.msg.event_name, rj.msg)
                    comet_server_signal().send_emit("event_"+rj.msg.event_name, rj.msg)
                }


                comet_server_signal().send_emit("server_msg", rj.msg)
            }
        }

        this.send_msg = function(msg)
        {
            if(!window.WebSocket)
            {
                return false;
            }
            
            if(this.socket &&  this.socket.readyState === 1)
            {
                //console.log("WebSocket-send-msg:"+msg)
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
         * @param string msg Сообщение
         * @returns boolean
         */
        this.web_pipe_send = function(pipe_name, msg)
        {
             return this.send_msg("web_pipe\n"+pipe_name+"\n"+base64_encode(msg));
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

             // Создадим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой
             var time_id = setTimeout(function()
             {
                comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal')

                thisObj.in_try_conect = false;
                thisObj.conect_to_server()
                callback()
             }, thisObj.start_timer )

             var last_timeout_id = false

             // Подключаемся на уведомления от других вкладок о том что сервер работает, если за this.start_timer милисекунд уведомление произойдёт то отменим поставленый ранее таймер
             comet_server_signal().connect("comet_msg_conect",'comet_msg_master_signal', function()
             {
                if(time_id !== false) //  отменим поставленый ранее таймер если это ещё не сделано
                {
                    clearTimeout( time_id )
                    time_id = false;
                    console.log("Соединение с сервером отменено");
                }
                else
                {
                    if(last_timeout_id !== false) //  отменим другой поставленый ранее таймер если это не первый вызов
                    {
                        clearTimeout( last_timeout_id )
                        last_timeout_id = false;
                        //console.log("Соединение с сервером поддерживается на другой вкладке");
                    }

                    last_timeout_id = setTimeout(function()// Поставим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой так как предыдущая мастер вкладка была закрыта
                    {
                        comet_server_signal().disconnect('comet_msg_master_signal')
                        thisObj.in_try_conect = false;
                        thisObj.conect_to_server()
                    }, thisObj.start_timer);
                }
             })
        }

    }

    if(!__CometServer)
    {
        __CometServer = new CometServerApi();
    }

    return __CometServer;
}

