



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


function storageEventHandler(e)
{
    var data = JSON.parse(e.newValue);

    if(this.debug) console.log( data.name )
    comet_server_signal().emit( data.name, data.param )
}


if(!comet_server_signal.prototype.init)
{
    comet_server_signal.prototype.init = true
    if( window.addEventListener )
    {
        window.addEventListener('storage', storageEventHandler, false);
    }
    else
    {
        document.attachEvent('onstorage', storageEventHandler );
    }
}




function CometServer(options)
{

        console.log(options)
    var CometServerApi = function(opt)
    {
        this.options = opt
        this.arg= "";

        this.url = '//client'+this.options.dev_id+'.app.comet-server.ru/?type=Long-Polling&sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id;

        this.subscription_array = new Array();
        this.user_id = 0;
        this.custom_id = Math.random()+""+Math.random()
        console.log([this.custom_id , opt])

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
        this.subscription = function(name)
        {
            if(name !== undefined && name.length > 2)
            {
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
                    this.restart()
                }
                else
                {
                    console.log('send_emit:comet_msg_slave_add_subscription_and_restart:'+name)
                    comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',name)
                }
            }

        }

        this.start = function(callback)
        {
           this.in_abort = false;
           this.conect(callback)
        }

        this.stop = function()
        {
            if(this.is_master)
            {
                this.in_abort = true;
                this.xhrObj.abort();
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

                this.restart_time_id = setTimeout(function()
                {
                    thisObj.in_abort = true;
                    thisObj.xhrObj.abort();
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
                console.log([p1,arg])
                thisObj.restart()
            })

            comet_server_signal().connect(false,'comet_msg_slave_signal_stop', function(p,arg)    // подключение на сигнал остоновки от других вкладок
            {
                console.log([p1,arg])
                thisObj.stop()
            })

            comet_server_signal().connect(false,'comet_msg_slave_add_subscription_and_restart', function(p1,arg)// подключение на сигнал переподписки от других вкладок
            {
                console.log([p1,arg])
                thisObj.subscription(arg[1][1])
                thisObj.restart()
            })
        }

        this.conect_to_server = function()
        {
            var thisObj = this
            if(!this.is_master) this.setAsMaster()

            console.log("Соединение с сервером");

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

                if( thisObj.request.status === 200 )
                {
                    var re = thisObj.request.responseText;

                                    console.log("Входящие сообщение:"+re);
                                    /**
                                     * Структура входящих сообщений
                                     *
                                     * Сообщение представляет JSON
                                     * {
                                     *  event:0,
                                     *  error:0, Ошибки если ноль то их нет
                                     *  msg:"", Текст сообщения json закодированый в base64
                                     * }
                                     *
                                     *  event - 0 если сообщение было передано конкретному пользователю по его id в системе
                                     *  event > 0 если сообщение было передано конкретному пользователю как подписчику на кокое либо событие сайта
                                     *  event - 2 было добавлено объявление
                                     */

                                    var lineArray = re.replace(/^\s+|\s+$/, '').split('\n')
                                    for(var i in lineArray)
                                    {
                                        var rj = JSON.parese(lineArray[i])
                                        rj = rj[0]
                                        console.log(rj);

                                        if(thisObj.in_abort === true && rj === undefined)
                                        {
                                            return false;
                                        }
                                        else if(rj === undefined)
                                        {
                                          console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
                                          setTimeout(function(){thisObj.conect_to_server()}, thisObj.time_to_reconect_on_error )
                                          return false;
                                        }

                                        /**
                                         * Если событие rj.event = 0 то это лично направленое сообщение  @todo Проверить???
                                         */
                                        if(rj.event === 0 && rj.msg !== undefined)
                                        {
                                           rj.msg = base64_decode(rj.msg)
                                           rj.msg = eval("["+rj.msg+"]");
                                           rj.msg = rj.msg[0]

                                           comet_server_signal().send_emit("server_msg", rj.msg)
                                           if(rj.msg.name !== undefined )
                                           {
                                               comet_server_signal().send_emit("server_comet_msg_"+rj.msg.name, rj.msg)
                                           }
                                        }

                                        comet_server_signal().send_emit('server_event', rj)

                                    }

                                    thisObj.conect_to_server();
                }
                else
                {
                    console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
                    setTimeout(function(){ thisObj.conect_to_server() }, thisObj.time_to_reconect_on_error )
                }
            };

            this.request.open("POST", this.url, true);
            this.request.send(this.subscription_array.join("\n")); // Именно здесь отправляются данные
        }


        this.is_master = false
        this.conect = function(callback)
        {
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
                        thisObj.conect_to_server()
                    }, thisObj.start_timer);
                }
             })
        }

    }

    if(options === undefined)
    {
        options = {}
    }

    this.options = options;

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

    if(!this.options.dev_id)
    {
        console.error("CometServerApi:Не указан dev_id")
    }

    if(!this.server)
    {
        this.server = new CometServerApi(this.options);
    }

    return this.server;
}
