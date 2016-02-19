


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
    if(this.init === undefined) this.init = false;
    return comet_server_signal;
}

comet_server_signal.slotArray = new Array();
comet_server_signal.debug = false;

comet_server_signal.sigId = 0;

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
comet_server_signal.connect = function(slot_name, signal_name, slot_function)
{
    if(slot_function === undefined)
    {
        slot_function = signal_name;
        signal_name = slot_name;
        slot_name = "sig" + (comet_server_signal.sigId++)
    }

    if (comet_server_signal.slotArray[signal_name] === undefined)
    {
        comet_server_signal.slotArray[signal_name] = {}
    }
    comet_server_signal.slotArray[signal_name][slot_name] = slot_function;
    if(comet_server_signal.debug) console.log("На прослушивание сигнала " + signal_name + " добавлен слот " + slot_name + "", comet_server_signal.slotArray)
    return slot_name;
}


/**
 * Отписывает слот slot_name от сигнала signal_name
 */
comet_server_signal.disconnect = function(slot_name, signal_name)
{
    if (comet_server_signal.slotArray[signal_name] !== undefined)
    {
        if (comet_server_signal.slotArray[signal_name][slot_name] !== undefined)
        {
            comet_server_signal.slotArray[signal_name][slot_name] = undefined;
            return true
        }
    }
    return false
}

/**
 * Вызывает слоты подписаные на сигнал signal_name и каждому из них передаёт аруметы signal_name - имя вызвавшего сигнала, и param - объект с параметрами для слота)
 * В добавок ретранслирует сигнал в дочернии iframe если они есть и в родительское окно если оно есть
 * @param signal_name Имя сигнала
 * @param param Параметры переданые слоту при вызове в втором аргументе
 */
comet_server_signal.emit = function(signal_name, param, SignalNotFromThisTab)
{
    if (comet_server_signal.slotArray[signal_name] === undefined)
    {
        if(comet_server_signal.debug) console.log("На сигнал " + signal_name + " нет подписчиков")
    }
    else
    {
        if(comet_server_signal.debug) console.log("Сигнал " + signal_name + " подписаны слоты")
        for (var slot in comet_server_signal.slotArray[signal_name])
        {
            if(comet_server_signal.slotArray[signal_name][slot] !== undefined)
            comet_server_signal.slotArray[signal_name][slot](param,signal_name, SignalNotFromThisTab === true)
        }

    }
}

/*
 *  генерация события будут оповещены и соседние вкладки
 *  @eName string - имя события
 *  использование .emit('любое название события', [ Параметры события ])
 */
comet_server_signal.emitAll = function (signal_name, param)
{
    comet_server_signal.emit(signal_name, param)

    if(window['localStorage'] !==undefined  )
    {
        var curent_custom_id = Math.random()+"_"+Math.random()+"_"+Math.random()+"_"+Math.random()+"_"+Math.random()
        window['localStorage']['comet_server_signal_storage_emit']= JSON.stringify({name:signal_name, custom_id:curent_custom_id, param:param});
    }
}


/**
 * Для совместимости с прошлой версией.
 *
 * Библиотека TabSignal.js (https://github.com/Levhav/TabSignal.js) полностью реализована
 * объектом comet_server_signal так как является составной частью JavaScript CometServerApi
 */
tabSignal = comet_server_signal;
comet_server_signal.send_emit = comet_server_signal.emitAll; // Для совместимости с прошлой версией.


if(!comet_server_signal.prototype.init)
{
    comet_server_signal.prototype.init = true
    if( window.addEventListener )
    {
        window.addEventListener('storage', function(e)
        {
            if(e.key && e.key == 'comet_server_signal_storage_emit')
            {// !testThis
                try{
                    var data = JSON.parse(e.newValue);
                    if(data !== undefined && data.name !== undefined  )
                    {
                        if(comet_server_signal.debug > 1) console.log( data )
                        comet_server_signal().emit( data.name, data.param, true )
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
            {// !testThis
                try{
                    var data = JSON.parse(e.newValue);
                    if(data !== undefined && data.name !== undefined  )
                    {
                        if(comet_server_signal.debug > 1) console.log( data )
                        comet_server_signal().emit( data.name, data.param, true )
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
    this.version = "2.80";

    /**
     * @private
     */
    this.options = {};
     
    /**
     * @private
     */
    this.options.nodeName = "app.comet-server.ru";

    if(!opt)
    {
        for(var key in opt)
        {
            this.options[key] = opt[key];
        }
    }
    
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
     * Определяет надо ли использовать https или http
     * @private
     */
    this.protocol = 's'; //document.location.protocol.replace(/[^s]/img, "");

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

    this.getCustomString = function()
    {
        var custom = (Math.random()*10)+""+Math.random();
        return custom.replace(/[^0-9A-z]/,"").replace(/^(.{10}).*$/,"$1");
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

    this.stripslashes = function(str)
    {
        //       discuss at: http://phpjs.org/functions/stripslashes/
        //      original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
        //      improved by: Ates Goral (http://magnetiq.com)
        //      improved by: marrtins
        //      improved by: rezna
        //         fixed by: Mick@el
        //      bugfixed by: Onno Marsman
        //      bugfixed by: Brett Zamir (http://brett-zamir.me)
        //         input by: Rick Waldron
        //         input by: Brant Messenger (http://www.brantmessenger.com/)
        // reimplemented by: Brett Zamir (http://brett-zamir.me)
        //        example 1: stripslashes('Kevin\'s code');
        //        returns 1: "Kevin's code"
        //        example 2: stripslashes('Kevin\\\'s code');
        //        returns 2: "Kevin\'s code"

        return (str + '')
          .replace(/\\(.?)/g, function(s, n1) {
            switch (n1) {
              case '\\':
                return '\\';
              case '0':
                return '\u0000';
              case '':
                return '';
              default:
                return n1;
            }
          });
    }
    /**
     * Выполняет привязку callBack функции к событию.
     * И при происшествии события на которое мы подписывались в функции subscription
     * определяет надо ли дёргать callBack функцию так как если событие адресовано
     * другой вкладке то дёргать не надо.
     *
     * @private
     * @param string name Имя канала
     * @param function callBack
     * @param string specialMarker Если передать не undefined то после прихода
     * события произойдёт отписка и кол бек будет навешан только на конкретно наш ответ.
     * @return string Имя сигнала, может понадобится для того чтобы отписатся от сообщений.
     */
    this.subscription_callBack = function(name, callBack, specialMarker)
    {
        var thisObj = this;
        var sigId = name+"&&";
        if(specialMarker === undefined)
        {
            // Подписка на сообщения от сервера для нашей вкладки
            sigId += comet_server_signal().connect(name, function(param)
            {
                if(param.server_info.marker !== thisObj.custom_id && param.server_info.marker !== undefined)
                {
                   // Данное сообщение преднозначено не этой вкладке.
                   return 0;
                }
                callBack(param);
            });
        }
        else
        {
            // Подписка на сообщения от сервера доставленые специально и единоразово для переданного callBack
            sigId += comet_server_signal().connect(specialMarker, name,  function(param)
            {
                if(param.server_info.marker !== specialMarker)
                {
                   // Данное сообщение преднозначено не этой вкладке.
                   return 0;
                }

                comet_server_signal().disconnect(specialMarker, name);
                callBack(param);
            });
        }
        return sigId;
    }

    /**
     * Отписывает функцию от получения сообщений
     * @public
     * @param string sigId Идентификатор подписки, возвращается функцией subscription в момент подписки
     * @returns undefined
     */
    this.unsubscription = function(sigId)
    {
        var sigName = sigId.replace(/^(.*)&&.*$/, "$1");
        var slotName = sigId.replace(/^.*&&(.*)$/, "$1");
        return comet_server_signal().disconnect(slotName, sigName);
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
     * @return string Имя сигнала, может понадобится для того чтобы отписатся от сообщений. Или false если что то пошло не так.
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
            // Подписка на массив каналов без передачи колбека имеет смысл в том случаии когда это происходит по инициативе из другой вкладки.
            for(var i in nameArray)
            {
                this.subscription(nameArray[i], callback);
            }
            return;
        }

        if(callback === undefined)
        {
            // Подписка на канал без передачи колбека имеет смысл в том случаии когда это происходит по инициативе из другой вкладки.
            callback = function(){};
        }

        if(typeof name === "function" )
        {
            // Подписка на все входищие сообщения из всех каналов на которые подписан этот клиент
            return "comet_server_msg&&" + comet_server_signal().connect("comet_server_msg", name);
        }

        if( name === "msg" || /^msg\./.test(name) )
        {
            // Подписка на сообщения от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
            return thisObj.subscription_callBack(name, callback);
        }

        if(/^answer_to_web_/.test(name))
        {
            // Подписка на отчёт о доставке
            return thisObj.subscription_callBack(name, callback);
        }
        else if(/^#/.test(name))
        {
            // Подписка на отчёт о доставке
            name = name.replace("#", "_answer_to_");
            return thisObj.subscription_callBack(name, callback);
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

        var sigId = thisObj.subscription_callBack(name, callback);

        if( name === "comet_server_msg" )
        {
            // Подписка на все сообщения разом
            return sigId;
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
                return sigId;
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
                // Отправляем запрос на подписку на канал с небольшой задержкой
                // чтоб если было два и более вызова функции subscription подряд они все вместе сгенерировали только 1 запрос к комет серверу
                if(this.lastSubscriptionTimeoutId)
                {
                    clearTimeout(this.lastSubscriptionTimeoutId);
                }
                
                this.lastSubscriptionTimeoutId = setTimeout(function()
                {
                    thisObj.lastSubscriptionTimeoutId = false;
                    
                    thisObj.send_msg("subscription\n"+thisObj.subscription_array.join("\n"))
                }, 50);
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
        return sigId;
    }

    this.isMaster = function()
    {
        return this.is_master;
    }

    /**
     * Подписывается на подписки запрошеные ранее.
     * @private
     */
    this.send_curent_subscription = function()
    {
        if(this.subscription_array.length === 0)
        {
            return;
        }
        
        this.send_msg("subscription\n"+this.subscription_array.join("\n"))
    }

    /**
     * @private
     */
    this.getUrl = function(use)
    {
        if(this.UseWebSocket() === true)
        {
            return 'ws'+this.protocol+'://'+this.options.nodeName+'/ws/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
        }

        return 'http'+this.protocol+'://'+this.options.nodeName+'/sesion='+this.options.user_key+'&myid='+this.options.user_id+'&devid='+this.options.dev_id+"&v="+this.version+"&api=js";
    }

    this.UseWebSocket = function(use)
    {
        if(use === true)
        {
            this.use_WebSocket = use;
        }
        else if(use === false)
        {
            this.use_WebSocket = use;
        }

        if(this.use_WebSocket === undefined)
        {
            this.use_WebSocket = (window.WebSocket !== undefined)
        }

        return this.use_WebSocket;
    }

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
            for(var key in opt)
            {
                this.options[key] = opt[key];
            }
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
            console.error("Star.Comet: Не установлен dev_id")
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
    this.restart = function(opt)
    {
        if(opt !== undefined)
        {
            for(var key in opt)
            {
                this.options[key] = opt[key];
            }
        }

        if(this.is_master)
        {
            if(this.restart_time_id !== false)
            {
                clearTimeout( this.restart_time_id );
            }

            if(!this.in_abort)
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

            var thisObj = this;
            // Таймер задержки рестарта чтоб не выполнять рестарт чаще раза в секунду.
            this.restart_time_id = setTimeout(function()
            {
                thisObj.in_abort = false;
                thisObj.conect_to_server();
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

        // подключение на сигнал рестарта от других вкладок
        comet_server_signal().connect('comet_msg_slave_signal_restart', function(p,arg) 
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.restart()
        })

        // подключение на сигнал остоновки от других вкладок
        comet_server_signal().connect('comet_msg_slave_signal_stop', function(p,arg)    
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.stop()
        })

        // подключение на сигнал запуска от других вкладок
        comet_server_signal().connect('comet_msg_slave_signal_start', function(p,arg)    
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.start()
        })

        // подключение на сигнал переподписки от других вкладок
        comet_server_signal().connect('comet_msg_slave_add_subscription_and_restart', function(p,arg)
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.subscription(p)
        })
        
        // подключение на сигнал отправки сообщений от других вкладок
        comet_server_signal().connect('comet_msg_slave_send_msg', function(p,arg)
        {
            if(thisObj.LogLevel) console.log([p,arg])
            thisObj.send_msg(p)
        })
        
        // Если мы были slave а стали mster то отписываемся от сигнала об изменении статуса авторизации.
        comet_server_signal().disconnect('__comet_set_authorized_slot', "__comet_authorized")
        
        // подключение на сигнал запроса статуса авторизации на комет сервере  от других вкладок
        comet_server_signal().connect('__comet_get_authorized_status', function(p,arg)
        {
            comet_server_signal().send_emit("__comet_authorized", thisObj.isAuthorized())
        })
    }

    /**
     * @private
     */
    this.setAuthorized = function(value)
    {
        if(this.LogLevel) console.log("setAuthorized:", value);

        if(this.authorized_status !== value && value === true)
        {
            // Испускает сигнал успешной авторизации на комет сервере
            comet_server_signal().emit("__comet_onAuthSuccess")
        }
        else if(this.authorized_status !== value && value === false)
        {
            // Испускает сигнал не успешной авторизации на комет сервере
            comet_server_signal().emit("__comet_onAuthFalill")
        }

        this.authorized_status = value;
        
        if(this.isMaster())
        {
            comet_server_signal().send_emit("__comet_authorized", this.authorized_status)
        }
    }

    /**
     * Добавляет колбек на событие успешной авторизации на комет сервере
     * callback будет вызван при каждой смене статуса авторизации.
     * Так что если авторизация в процесе работы вдруг будет потеряна,
     * а потом через какое то время снова востановлена колбеки будут вызваны повторно
     * @param function callback
     * @public
     */
    this.onAuthSuccess = function(callback)
    {
        comet_server_signal().connect("__comet_onAuthSuccess", callback)
    }

    /**
     * Добавляет колбек на событие не успешной авторизации на комет сервере
     * callback будет вызван при каждой смене статуса авторизации.
     * Так что если авторизация в процесе работы вдруг будет потеряна,
     * а потом через какое то время снова востановлена колбеки будут вызваны повторно
     * @param function callback
     * @public
     */
    this.onAuthFalill = function(callback)
    {
        comet_server_signal().connect("__comet_onAuthFalill", callback)
    }

    /**
     * Возвращает статус авторизации на комет сервере.
     * @returns bolean true авторизован, false не авторизован и undefined если статус ещё не известен.
     * @public
     */
    this.isAuthorized = function()
    {
        return this.authorized_status;
    }

    /**
     * Если true то произошла критическая ошибка после которой нет смысла подключатся к серверу
     * @private
     */
    this.hasCriticalError = false;

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

        if(msg.error > 400)
        {
            // Критическая ошибка, подключение невозможно. http://comet-server.ru/wiki/doku.php/comet:javascript_api:error
            console.error("CometServerError:"+msg.error, "\n", msg.data, "\n", "Критическая ошибка, подключение невозможно. Подробности в документации http://comet-server.ru/wiki/doku.php/comet:javascript_api:error" )
            this.hasCriticalError = true;
        }


        if(msg.authorized !== undefined)
        {
            this.setAuthorized(msg.authorized === "true");
            return 0;
        }

        var web_id = 0;
        if(/^A::/.test(msg.data))
        {
            // Проверка не пришла ли вместе с данными информация о отправителе.
            var r = msg.data.split(";")
            web_id = r[0].replace("A::", "")/1;
            msg.data = r[1];
        }

        if(msg.event_name === undefined)
        {
            msg.data = this.Base64.decode(msg.data)
        } 
        
        try{
            if(this.LogLevel) console.log(["msg", msg.data, "web_id:"+web_id]);

            pmsg = JSON.parse(msg.data)
            //var pmsg = JSON.parse(msg.data)
            
            //typeof pmsg

            if(pmsg !== undefined)
            {
                msg.data = pmsg
            }
        }
        catch (failed)
        {
            msg.data = this.stripslashes(msg.data)
            try
            {
                if(this.LogLevel) console.log(["msg", msg.data, "web_id:"+web_id]);
                pmsg = JSON.parse(msg.data)
                //var pmsg = JSON.parse(msg.data)

                if(pmsg !== undefined)
                {
                    msg.data = pmsg
                }
            }
            catch (failed)
            {

            }
        }

        var UserData = msg.data;
        var event_name = msg.event_name;

        if(msg.event_name === undefined)
        {
            UserData = msg.data.data
            event_name = msg.data.event_name
        }
        
        if(msg.user_id)
        {
            web_id = msg.user_id
        }

        var result_msg = {
            "data": UserData,
            "server_info":{
                "user_id":web_id,
                pipe:msg.pipe,
                event:event_name,
                history:msg.history === true,
                marker:msg.marker
            }
        }

        if(this.LogLevel) console.log(["msg", msg, result_msg]);

        if(msg.SendToUser === undefined)
        {
            // Если свойство pipe определено то это сообщение из канала.
            comet_server_signal().send_emit(msg.pipe, result_msg)

            if(event_name !== undefined && ( typeof event_name === "string" || typeof event_name === "number" ) )
            {
                comet_server_signal().send_emit(msg.pipe+"."+event_name, result_msg)
            }
        }
        else if(event_name !== undefined && ( typeof event_name === "string" || typeof event_name === "number" ) )
        {
            // Сообщение доставленое по id с указанием event_name
            comet_server_signal().send_emit("msg."+event_name, result_msg)
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

        if(MsgType === "subscription")
        {
            // Проверка если сообщение о подписке на канал то его отправлять вне очереди
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
     * @version 2
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
        return this.send_msg("web_pipe2\n"+pipe_name+"\n"+event_name+"\n*\n"+JSON.stringify(msg));
    }

    this.sendStatistics = function(plugin_name, plugin_version, plugin_data)
    {  
        if(this.LogLevel) console.log(["sendStatistics", plugin_name, plugin_version, plugin_data]); 
        return this.send_msg("statistics\n"+JSON.stringify(
                {
                    url:window.location.href,
                    dev_id:this.options.dev_id,
                    version: this.version,
                    plugin: {
                        name:plugin_name,
                        version:plugin_version,
                        data:plugin_data
                    }
                }));
    }
    
    
    /**
     * Отправляет запрос на получение истории по каналу pipe_name
     * @param {string} pipe_name
     * @param {function} callBack колбек для ответа от сервера
     * @returns {Boolean}
     */
    this.get_pipe_log = function(pipe_name, callBack)
    {
        if(!this.UseWebSocket())
        {
            return false;
        }

        var marker = this.custom_id;
        if(callBack !== undefined)
        {
            marker = this.getCustomString();
            this.subscription(pipe_name)
            this.subscription_callBack(pipe_name, callBack, marker);
        }

        this.send_msg("pipe_log\n"+pipe_name+"\n"+marker+"\n");
        return true;
    }

    /**
     * Отправляет запрос на получение количества подписчиков в канале pipe_name
     * @param {string} pipe_name
     * @param {function} callBack колбек для ответа от сервера
     * @returns {Boolean}
     */
    this.count_users_in_pipe = function(pipe_name, callBack)
    {
        if(!this.UseWebSocket())
        {
            return false;
        }
        var marker = this.getCustomString();
        this.subscription_callBack("_answer_pipe_count", callBack, marker);
        this.send_msg("pipe_count\n"+pipe_name+"\n"+marker+"\n");
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

        if(this.hasCriticalError)
        {
            // Если true то произошла критическая ошибка после которой нет смысла подключатся к серверу
            return false;
        }

        if(this.UseWebSocket())
        {
            this.socket = new WebSocket(this.getUrl());

            this.socket.onopen = function() {
                if(thisObj.LogLevel) console.log("WS Соединение установлено.");

                if(thisObj.send_msg_subscription === false) thisObj.send_curent_subscription(); // Подписываемся на то что были подписаны до разрыва соединения

                // Отправка сообщений из очереди.
                thisObj.send_msg_from_queue();

                if(thisObj.options.nostat !== true)
                {
                    setTimeout(function()
                    {
                        if(thisObj.isSendStatisticsData)
                        {
                            return;
                        }
                        
                        thisObj.isSendStatisticsData = true;
                        // Отправка данных по использованию сервиса
                        thisObj.socket.send("statistics\n"+JSON.stringify({url:window.location.href, dev_id:thisObj.options.dev_id, version: thisObj.version}));
                    }, 5000)
                }
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
                      console.error("Произошло более 10 ошибок вебсокетов то перейдём на long poling"); // Не делать этого если уже были переданы данные по вебсокету
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

            this.request.open("POST", this.getUrl(), true);
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

            // подключение на сигнал статуса авторизации от других вкладок
            comet_server_signal().connect('__comet_set_authorized_slot', '__comet_authorized', function(param,arg)
            {
                if(thisObj.LogLevel) console.log([param,arg])
                if(param == "undefined")
                {
                    setTimeout(function()
                    {
                        // Отправляем сигнал запрашивающий статус авторизации у мастер вкладки так как пришёл сигнал с неопределённым статусом
                        comet_server_signal().send_emit('__comet_get_authorized_status');
                    }, 200)
                }
                thisObj.setAuthorized(param)
            })

            // Отправляем сигнал запрашивающий статус авторизации у мастер вкладки
            comet_server_signal().send_emit('__comet_get_authorized_status');
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


