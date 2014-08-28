


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
            if(e.key && e.key == 'comet_server_signal_storage_emit')
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
            }
        }, false);
    }
    else
    {
        document.attachEvent('onstorage', function(e)
        {
            if(e.key && e.key == 'comet_server_signal_storage_emit')
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
            }
        } );
    }
}


cometApi = function(opt)
{
    /**
     * @private
     */
    this.version = "1.81";

    /**
     * @private
     */
    this.options = opt;

    /**
     * @private
     */
    this.arg= "";

    /**
     * @private
     */
    this.is_master = undefined;

    /**
     * @private
     */
    this.in_conect_to_server = false;

    /**
     * @private
     */
    this.in_try_conect = false;

    /**
     * Массив имён каналов на которые мы подписаны
     * @private
     */
    this.subscription_array = new Array();

    /**
     * Случайный идентификатор вкладки.
     * Используется для определения кому предназначены исторические данные из канала.
     * @private
     */
    this.custom_id = (Math.random()*10)+""+Math.random();
    this.custom_id = this.custom_id.replace(/[^0-9A-z]/,"").replace(/^(.{10}).*$/,"$1");


    /**
     * Время на переподключение в милисекундах
     * @private
     */
    this.time_to_reconect_on_error = 100;

    /**
     * @private
     */
    this.in_abort = false;

    /**
     * @private
     */
    this.restart_time_id = false;

    /**
     * Время даваемое на определение того какая из вкладок является мастервкладкой
     * @private
     */
    this.start_timer = 1200;

    /**
     * Выражение отделяющие по знаку точки на павую и левую части.
     * @private
     */
    this.reg_exp = new RegExp(/^([^.]+)\.([^.]+)$/);

    /**
     * @private
     */
    this.protocol = document.location.protocol.replace(/[^s]/img, "");

    /**
     * @private
     */
    this.web_socket_error = 0;

    /**
     * Учитывает удачно переданные сообщения по вебскокету
     * Если они были то в случаии неполадок с ссетью переход на long poling осуществлён не будет.
     * @private
     */
    this.web_socket_success = false;

    /**
     * @private
     */
    this.web_socket_error_timeOut = 30000;

    /**
     * @private
     */
    this.xhr_error = 0;
    /**
     * @private
     */
    this.xhr_error_timeOut_id = 30000;

    /**
     * @private
     */
    this.authorized_status;

    /**
     * @private
     */
    this.socket;

    /**
     * @private
     */
    this.use_WebSocket;

    /**
     * @private
     */
    this.request;

    /**
     * @private
     */
    this.status;

    /**
     * @private
     */
    this.send_msg_queue = [];

    /**
     * @private
     */
    this.send_msg_subscription = false;

    /**
     * @private
     */
    this.url = "";

    /**
     * Уровень логирования
     * @private
     */
    this.LogLevel = 0;

    if(window['localStorage']['comet_LogLevel'])
    {
        this.LogLevel = window['localStorage']['comet_LogLevel']
    }

    this.getLogLevel = function()
    {
        return this.LogLevel;
    }

    this.setLogLevel = function(level)
    {
        this.LogLevel = level;
        window['localStorage']['comet_LogLevel'] = level;
    }


    /**
     *  http://www.webtoolkit.info/
     **/
    this.Base64 = {
        _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode : function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;

                input = input.replace(/\r\n/g,"\n");
                var utftext = "";

                for (var n = 0; n < input.length; n++)
                {
                        var c = input.charCodeAt(n);
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

                while (i < utftext.length) {

                        chr1 = utftext.charCodeAt(i++);
                        chr2 = utftext.charCodeAt(i++);
                        chr3 = utftext.charCodeAt(i++);

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

                    var string = "";
                    var i = 0;
                    var c = c1 = c2 = 0;

                    while ( i < output.length ) {

                            c = output.charCodeAt(i);

                            if (c < 128) {
                                    string += String.fromCharCode(c);
                                    i++;
                            }
                            else if((c > 191) && (c < 224)) {
                                    c2 = output.charCodeAt(i+1);
                                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                                    i += 2;
                            }
                            else {
                                    c2 = output.charCodeAt(i+1);
                                    c3 = output.charCodeAt(i+2);
                                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                                    i += 3;
                            }

                    }

                    return string;
            }
    }


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
     * Обратите внимание что дляна имени канала должна быть больше 2 символов
     * @param {string} name Имя канала
     * @param {function} callback Функция callback
     */
    this.subscription = function(name, callback)
    {
        if(name === undefined )
        {
            return false;
        }

        var thisObj = this;
        var nameArray = name.split("\n");
        if(nameArray.length > 1)
        {
            for(var i in nameArray)
            {
                this.subscription(nameArray[i], function(param){
                    console.error(param)
                    if(param.server_info.history === true && param.server_info.marker !== thisObj.custom_id)
                    {
                       // Данное сообщение из истории но преднозначено не этой вкладке.
                       return 0;
                    }
                    callback(param);
                });
            }
        }

        if(callback === undefined)
        {
            callback = function(){};
        }

        if(typeof name === "function" )
        {
            // Подписка на все входищие сообщения из всех каналов на которые подписан этот клиент
            comet_server_signal().connect("comet_server_msg", name);
            return true;
        }

        if( name === "msg" || /^msg\./.test(name) )
        {
            // Подписка на сообщения от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
            comet_server_signal().connect(name,  function(param){
                    if(param.server_info.history === true && param.server_info.marker !== thisObj.custom_id)
                    {
                       // Данное сообщение из истории но преднозначено не этой вкладке.
                       return 0;
                    }
                    callback(param);
                });
            return true;
        }

        if(/^answer_to_web_/.test(name))
        {
            // Подписка на отчёт о доставке
            comet_server_signal().connect(name,  function(param){
                    if(param.server_info.history === true && param.server_info.marker !== thisObj.custom_id)
                    {
                       // Данное сообщение из истории но преднозначено не этой вкладке.
                       return 0;
                    }
                    callback(param);
                });
            return true;
        }
        else if(/^#/.test(name))
        {
            // Подписка на отчёт о доставке
            name = name.replace(/^#/, "answer_to_");
            comet_server_signal().connect(name,  function(param){
                    if(param.server_info.history === true && param.server_info.marker !== thisObj.custom_id)
                    {
                       // Данное сообщение из истории но преднозначено не этой вкладке.
                       return 0;
                    }
                    callback(param);
                });
            return true;
        }

        if( name === ""  )
        {   // Подписка на все сообщения разом
            name = "comet_server_msg";
        }

        if(name.length < 2 )
        {
            // Имя канала слишком короткое
            return false;
        }

        comet_server_signal().connect(name,  function(param){
                    if(param.server_info.history === true && param.server_info.marker !== thisObj.custom_id)
                    {
                       // Данное сообщение из истории но преднозначено не этой вкладке.
                       return 0;
                    }
                    callback(param);
                });

        if( name === "comet_server_msg" )
        {
            // Подписка на все сообщения разом
            return true;
        }

        if(this.reg_exp.test(name))
        {
            var res = this.reg_exp.exec(name);
            name = res[1];
        }

        for(var i in this.subscription_array)
        {
            if(this.subscription_array[i] === name )
            {
                return true;
            }
        }

        this.subscription_array[this.subscription_array.length] = name;


        if(this.is_master === undefined)
        {
            // Статус ещё не определён
            this.add_msg_to_queue("subscription\n"+this.subscription_array.join("\n"))
        }
        else if(this.is_master)
        {
            // Мы мастер вкладка
            if(this.LogLevel) console.log('add subscription:'+name)

            if(this.UseWebSocket())
            {
                this.send_msg("subscription\n"+this.subscription_array.join("\n"))
            }
            else
            {
                this.restart()
            }
        }
        else
        {
            // Мы slave вкладка
            comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',this.subscription_array.join("\n"))
        }
        return true;
    }

    /**
     * Подписывается на подписки запрошеные ранее.
     * @private
     */
    this.send_curent_subscription = function()
    {
        this.send_msg("subscription\n"+this.subscription_array.join("\n"))
    }

    this.UseWebSocket = function(use)
    {
        if(use === true)
        {
            this.use_WebSocket = use;
            if(this.options) this.url = 'ws'+this.protocol+'://app.comet-server.ru/ws/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
        }
        else if(use === false)
        {
            this.use_WebSocket = use;
            if(this.options) this.url = 'http'+this.protocol+'://app.comet-server.ru/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
        }
        return this.use_WebSocket;
    }

    this.UseWebSocket(window.WebSocket !== undefined);

    /**
     * Запуск соединения
     * @param {Object} opt Объект с параметрами
     * @param {function} callBack Колбек на факт установки соединения
     * @returns {Boolean}
     */
    this.start = function(opt, callBack)
    {
        if(opt !== undefined)
        {
            this.options = opt
        }

        if(this.LogLevel) console.log([this.custom_id , opt])

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

        this.UseWebSocket(window.WebSocket !== undefined);

        if(this.options.dev_id > 0)
        {
            this.in_abort = false;
            this.conect(callBack);
            return true;
        }
        else
        {
            console.error("Не установлен dev_id")
            return false;
        }
    }

    this.stop = function()
    {
        if(this.is_master)
        {
            this.in_abort = true;

            if(this.UseWebSocket())
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
        var thisObj = this;
        if(this.is_master)
        {
            if(this.restart_time_id !== false)
            {
                clearTimeout( this.restart_time_id );
            }

            if(!thisObj.in_abort)
            {
                thisObj.in_abort = true;
                if(thisObj.UseWebSocket())
                {
                    thisObj.socket.close();
                }
                else
                {
                    thisObj.request.abort();
                }
            }

            // Таймер задержки рестарта чтоб не выполнять рестарт чаще раза в секунду.
            this.restart_time_id = setTimeout(function()
            {
                thisObj.in_abort = false;
                thisObj.conect_to_server(callback, callback_arg);
            },1000)
        }
        else
        {
            comet_server_signal().send_emit('comet_msg_slave_signal_restart');
        }
    }

    /**
     * Устанавливает эту вкладку как мастер вкладку.
     * @private
     */
    this.setAsMaster = function()
    {
        var thisObj = this;
        this.is_master = true;
        if(this.LogLevel) console.log("setAsMaster")

        comet_server_signal().send_emit('comet_msg_master_signal')        //  для уведомления всех остальных вкладок о своём превосходстве
        comet_server_signal().send_emit('comet_msg_new_master')           //  для уведомления всех что надо переподписатся @todo реализовать переподписку событий
        setInterval(function()                                            // Поставим таймер для уведомления всех остальных вкладок о своём превосходстве
        {
           comet_server_signal().send_emit('comet_msg_master_signal')
        }, this.start_timer/6);

        comet_server_signal().connect(false,'comet_msg_slave_signal_restart', function(p,arg) // подключение на сигнал рестарта от других вкладок
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.restart()
        })

        comet_server_signal().connect(false,'comet_msg_slave_signal_stop', function(p,arg)    // подключение на сигнал остоновки от других вкладок
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.stop()
        })

        comet_server_signal().connect(false,'comet_msg_slave_signal_start', function(p,arg)    // подключение на сигнал запуска от других вкладок
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.start()
        })

        comet_server_signal().connect(false,'comet_msg_slave_add_subscription_and_restart', function(p,arg)// подключение на сигнал переподписки от других вкладок
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.subscription(p)
        })

        comet_server_signal().connect(false,'comet_msg_slave_send_msg', function(p,arg)// подключение на сигнал отправки сообщений от других вкладок
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.send_msg(p)
        })

    }

    /**
     * @private
     */
    this.setAuthorized = function(value)
    {
        if(this.LogLevel) console.log("setAuthorized:", value);
        this.authorized_status = value;
        comet_server_signal().send_emit("__comet_authorized", this.status)
    }

    /**
     * @todo Доделать определение статуса у соседних вкладок и подписку на сигнал об авторизации
     * @returns bolean
     */
    this.isAuthorized = function()
    {
        return this.authorized_status;
    }

    /**
     * Обрабатывает распарсеное входящее сообщение
     *
     * Формат сообщения:{msg:"", pipe:"", eror:""}
     * @private
     */
    this.msg_cultivate = function( msg )
    {
        if(this.LogLevel) console.log("msg", msg);
        if( msg.data === undefined )
        {
            return -1;
        }

        if(msg.authorized !== undefined)
        {
            this.setAuthorized(msg.authorized === "true");
            return 0;
        }

        var web_id = 0;
        if(/^A::/.test(msg.data))
        {
            // Проверка не пришлоли вместе с данными информации о отправителе.
            var r = msg.data.split(";")
            web_id = r[0].replace("A::", "");
            msg.data = r[1];
        }

        msg.data = this.Base64.decode(msg.data)
        try{
            if(this.LogLevel) console.log(["msg", msg.data, "web_id:"+web_id]);
            var pmsg = JSON.parse(msg.data)

            if(pmsg !== undefined)
            {
                msg.data = pmsg
            }
        }
        catch (failed){  }

        var result_msg = {"data": msg.data.data, "server_info":{"user_id":web_id, pipe:msg.pipe, event:msg.data.event_name, history:msg.history === true, marker:msg.marker }}
        if(this.LogLevel) console.log(["msg", msg, result_msg]);

        if(msg.pipe !== undefined)
        {
            // Если свойство pipe определено то это сообщение из канала.
            comet_server_signal().send_emit(msg.pipe, result_msg)

            if(msg.data.event_name !== undefined && ( typeof msg.data.event_name === "string" || typeof msg.data.event_name === "number" ) )
            {
                comet_server_signal().send_emit(msg.pipe+"."+msg.data.event_name, result_msg)
            }
        }
        else if(msg.data.event_name !== undefined && ( typeof msg.data.event_name === "string" || typeof msg.data.event_name === "number" ) )
        {
            // Сообщение доставленое по id с указанием event_name
            comet_server_signal().send_emit("msg."+msg.data.event_name, result_msg)
            comet_server_signal().send_emit("msg", result_msg)
        }
        else
        {
            // Сообщение доставленое по id без указания event_name
            comet_server_signal().send_emit("msg", result_msg)
        }

        comet_server_signal().send_emit("comet_server_msg", result_msg);
        return 1;
    }


    /**
     * Отправляет все сообщения из очереди на комет сервер.
     * @private
     */
    this.send_msg_from_queue = function()
    {
        var thisObj = this;
        if(this.is_master === undefined)
        {
            return false;
        }
        else if(this.is_master === false)
        {
            // Отправка запроса на отправку сообщения мастервкладке
            if(this.send_msg_subscription !== false)
            {
                comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',this.send_msg_subscription);
                this.send_msg_subscription = false;
            }

            if(this.send_msg_queue.length > 0)
            {
                for(var i in this.send_msg_queue)
                {
                    comet_server_signal().send_emit('comet_msg_slave_send_msg',this.send_msg_queue[i]);
                }
                this.send_msg_queue = []
            }
            return true;
        }
        else if(this.is_master)
        {
            if(!this.UseWebSocket())
            {
                return false;
            }

            if(this.socket &&  this.socket.readyState === 1)
            {
                if(this.send_msg_subscription !== false)
                {
                    if(this.LogLevel ) console.error("WebSocket-send-subscription:"+this.send_msg_subscription);
                    this.socket.send(this.send_msg_subscription);
                    this.send_msg_subscription = false;
                }

                if(this.send_msg_queue.length > 0)
                {
                    for(var i in this.send_msg_queue)
                    {
                        if(this.LogLevel ) console.log("WebSocket-send-msg:"+this.send_msg_queue[i]);

                        // Потом убрать setTimeout
                        setTimeout( function(ri){thisObj.socket.send(ri); }, 10, this.send_msg_queue[i])
                    }
                    this.send_msg_queue = []
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Добавляет сообщения в очередь.
     * @private
     */
    this.add_msg_to_queue = function(msg)
    {
        var MsgType = false;
        MsgType = msg.split("\n")
        MsgType = MsgType[0]

        if(MsgType == "subscription")
        {
            // Проверка если сообщение о подписке на канал то его отправлячть вне очереди
            // При этом нет необходимости отправлять предыдущие сообщение подписку.
            this.send_msg_subscription = msg;
        }
        else
        {
            this.send_msg_queue.push(msg)
        }
    }

    /**
     * отправка сообщения по веб сокету.
     * @private
     */
    this.send_msg = function(msg)
    {
        if(this.is_master === undefined)
        {
            this.add_msg_to_queue(msg);
            return false;
        }
        else if(this.is_master === false)
        {
            comet_server_signal().send_emit('comet_msg_slave_send_msg',msg);
        }
        else if(this.is_master)
        {
            if(!this.UseWebSocket())
            {
                console.warn("WebSocket-send-msg: not use");
                return false;
            }

            if(this.socket &&  this.socket.readyState === 1)
            {
                this.send_msg_from_queue();

                if(this.LogLevel ) console.log("WebSocket-send-msg:"+msg);
                this.socket.send(msg);
                return true;
            }
            else
            {
                this.add_msg_to_queue(msg);
                return false;
            }
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

            if(/[.]/.test(pipe_name))
            {
                event_name = pipe_name.replace(/^[^.]*\.(.*)$/, "$1")
                pipe_name = pipe_name.replace(/^(.*?)\.(.*)/, "$1")
            }
        }

        if(msg === undefined)
        {
            return false;
        }

        if(this.LogLevel) console.log(["web_pipe_send", pipe_name, msg]);
        return this.send_msg("web_pipe\n"+pipe_name+"\n"+this.Base64.encode(JSON.stringify({'data':msg, event_name:event_name})));
    }

    /**
     * Отправляет запрос на получение истории по каналу pipe_name
     * @param {string} pipe_name
     * @returns {Boolean}
     */
    this.get_pipe_log = function(pipe_name)
    {
        if(!this.UseWebSocket())
        {
            return false;
        }

        this.send_msg("pipe_log\n"+pipe_name+"\n"+this.custom_id+"\n");
        return true;
    }


    /**
     * Обеспечивает работу с ссоединением с сервером
     * @private
     */
    this.conect_to_server = function()
    {
        var thisObj = this;

        if(this.in_conect_to_server)
        {
            if(this.LogLevel) console.log("Соединение с сервером уже установлено.");
            return;
        }

        if(this.LogLevel) console.log("Соединение с сервером");
        this.in_conect_to_server = true;
        if(!this.is_master) this.setAsMaster();


        if(this.UseWebSocket())
        {
            this.socket = new WebSocket(this.url);

            this.socket.onopen = function() {
                if(thisObj.LogLevel) console.log("WS Соединение установлено.");

                if(thisObj.send_msg_subscription === false) thisObj.send_curent_subscription(); // Подписываемся на то что были подписаны до разрыва соединения

                // Отправка сообщений из очереди.
                thisObj.send_msg_from_queue();
            };

            this.socket.onclose = function(event)
            {
                if (event.wasClean)
                {
                  if(thisObj.LogLevel) console.log('WS Соединение закрыто чисто');
                }
                else
                {
                  if(thisObj.LogLevel) console.log('WS Обрыв соединения'); // например, "убит" процесс сервера
                  thisObj.socket.close();
                  thisObj.in_conect_to_server = false;
                  thisObj.web_socket_error++; // Увеличение колва ошибок вебсокетов

                  if(thisObj.web_socket_error_timeOut_id !== undefined )
                  {
                      clearTimeout(thisObj.web_socket_error_timeOut_id)
                  }

                  // Если ошибки происходят редко то обнулим сщётчик
                  thisObj.web_socket_error_timeOut_id = setTimeout(function()
                  {
                      thisObj.web_socket_error_timeOut_id = undefined;
                      thisObj.web_socket_error = 0;
                  }, thisObj.web_socket_error_timeOut )

                  if( thisObj.web_socket_error > 10 && thisObj.web_socket_success !== true)
                  {
                      // Если за время thisObj.web_socket_error_timeOut произошло более 10 ошибок вебсокетов то перейдём на long poling
                      // Такое возможно если человек использует прокси который не поддерживает вебсокеты
                      // Переход произойдёт примерно через 3 секунды работы
                      thisObj.UseWebSocket(false);
                      thisObj.time_to_reconect_on_error = 1000;
                      if(thisObj.LogLevel) console.log("Произошло более 10 ошибок вебсокетов то перейдём на long poling"); // Не делать этого если уже были переданы данные по вебсокету
                  }
                  else if(thisObj.web_socket_error > 9)
                  {
                      thisObj.time_to_reconect_on_error = 2000;
                  }

                  setTimeout(function(){ thisObj.conect_to_server(); }, thisObj.time_to_reconect_on_error );

                }
                if(thisObj.LogLevel) console.log('WS Код: ' + event.code + ' причина: ' + event.reason);
            };

            this.socket.onmessage = function(event)
            {
                thisObj.web_socket_success = true;
                if(thisObj.LogLevel > 1) console.log("WS Входящие сообщение:"+event.data);
                var lineArray = event.data.replace(/^\s+|\s+$/, '').split("\n");
                for(var i in lineArray)
                {
                    var rj = {};
                    try{
                        rj = JSON.parse(lineArray[i]);
                    }
                    catch (failed)
                    {
                        if(thisObj.LogLevel) console.error(failed);
                        continue;
                    }

                    thisObj.msg_cultivate(rj);
                }
            };

            this.socket.onerror = function(error) {
                if(thisObj.LogLevel) console.log("Ошибка " + error.message);
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
                if( thisObj.request.status === 200 && thisObj.in_abort !== true)
                {
                    var re = thisObj.request.responseText;

                    if(thisObj.LogLevel) console.log("Входящие сообщение:"+re);
                    var lineArray = re.replace(/^\s+|\s+$/, '').split('\n')
                    for(var i in lineArray)
                    {
                        try{
                            if(thisObj.LogLevel) console.log(lineArray[i]);
                            var rj = JSON.parse(lineArray[i])
                        }
                        catch (failed)
                        {
                            thisObj.in_conect_to_server = false;
                            if(thisObj.LogLevel) console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
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
                        thisObj.xhr_error += 1
                        if( thisObj.xhr_error > 30 )
                        {
                            thisObj.time_to_reconect_on_error = 90000;
                        }
                        else if( thisObj.xhr_error > 10 )
                        {
                            thisObj.time_to_reconect_on_error = 30000;
                        }
                        else if( thisObj.xhr_error > 3 )
                        {
                            thisObj.time_to_reconect_on_error = 10000;
                        }

                        if(thisObj.LogLevel || 1) console.log("Ошибка в xhr, переподключение через "+(thisObj.time_to_reconect_on_error) +" секунды.");
                        setTimeout(function(){ thisObj.conect_to_server() }, thisObj.time_to_reconect_on_error )

                        setTimeout(function(){ thisObj.xhr_error = 0 }, thisObj.xhr_error_timeOut_id )
                    }
                }
            };

            this.request.open("POST", this.url, true);
            this.request.send(this.subscription_array.join("\n")); // Именно здесь отправляются данные
        }

    }

    /**
     * Пытается установить соединение с сервером или наладить обмен сообщениями и мониторинг работоспособности мастервкладки.
     * @private
     */
    this.conect = function(callback)
    {
         var thisObj = this;
         if(this.is_master)
         {
             return this.conect_to_server();
         }

         if(this.in_try_conect)
         {
             if(this.LogLevel) console.log("Соединение с сервером уже установлено на другой вкладке");
             comet_server_signal().send_emit('comet_msg_slave_signal_start');
             return false;
         }

         this.in_try_conect = true;

         if(callback === undefined)
         {
             callback = function(){};
         }

         if(this.LogLevel) console.log("Попыдка соединения с сервером");


         var time_id = false;
         var last_time_id = false;

         comet_server_signal().connect("slot_comet_msg_set_as_slave",'comet_msg_set_as_slave', function()
         {
             // Подписка для send_msg: Если мы станем slave вкладкой то все сообщения ожидающие в очереди отправим мастер вкладке.
             //comet_server_signal().disconnect("slot_comet_msg_set_as_slave", 'comet_msg_set_as_slave');

             console.log('comet_msg_set_as_slave: set is slave');
             thisObj.send_msg_from_queue();
         });

         // Подключаемся на уведомления от других вкладок о том что сервер работает, если за this.start_timer милисекунд уведомление произойдёт то отменим поставленый ранее таймер
         comet_server_signal().connect("comet_msg_conect",'comet_msg_master_signal', function()
         {
            if(time_id !== false) //  отменим поставленый ранее таймер если это ещё не сделано
            {
                clearTimeout( time_id );

                time_id = false;
                if(thisObj.LogLevel) console.log("Соединение с сервером отменено");

                comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal');
                comet_server_signal().connect("comet_msg_conect_to_master_signal",'comet_msg_master_signal', function()
                {
                    if(last_time_id !== false)
                    {
                        clearTimeout( last_time_id );
                    }

                    // Создадим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой
                    last_time_id = setTimeout(function()
                    {
                       comet_server_signal().disconnect("comet_msg_conect_to_master_signal", 'comet_msg_master_signal');

                       thisObj.in_try_conect = false;
                       thisObj.conect_to_server();
                       callback();
                    }, thisObj.start_timer );
                })
            }

            if(thisObj.LogLevel) console.log('set is slave');
            thisObj.is_master = false; // Укажем что мы явно не мастер вкладка переключив thisObj.is_master из undefined в false
            comet_server_signal().emit('comet_msg_set_as_slave', "slave");
         })

         // Создадим таймер, если этот таймер не будет отменён за this.start_timer милисекунд то считаем себя мастер вкладкой
         time_id = setTimeout(function()
         {
            comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal');

            thisObj.in_try_conect = false;
            thisObj.conect_to_server();
            callback();
         }, this.start_timer )
    }

}


var __CometServer = undefined;

/**
 * @return cometApi
 */
function CometServer()
{
    if(!__CometServer)
    {
        __CometServer = new cometApi();
    }

    return __CometServer;
}
