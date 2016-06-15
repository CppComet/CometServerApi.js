


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
 * @param SignalNotFromThisTab Если false то значит это сигнал пришёл из другой вкладки
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
        var obj = comet_server_signal.slotArray[signal_name];
        for (var slot in obj)
        {
            if( obj.hasOwnProperty(slot) &&  obj[slot] !== undefined)
            {
                obj[slot](param,signal_name, SignalNotFromThisTab === true)
            }
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


var cometServer = function(opt)
{
    if(!opt)
    {
        if(cometServer.prototype.options === undefined)
        {
            cometServer.prototype.options = {};
        }

        for(var key in opt)
        {
            cometServer.prototype.options[key] = opt[key];
        }
    }
    return this;
}

/**
 * @private
 */
cometServer.prototype.version = "3.09";

/**
 * @private
 */
cometServer.prototype.options = {};

/**
 * @private
 */
cometServer.prototype.options.nodeName = "app.comet-server.ru";
cometServer.prototype.options.nodeArray = ["app.comet-server.ru"]// ["n1-app.comet.su", "n2-app.comet.su"]; //

/**
 * @private
 */
cometServer.prototype.is_master = undefined;

/**
 * @private
 */
cometServer.prototype.in_conect_to_server = false;

/**
 * @private
 */
cometServer.prototype.in_try_conect = false;

/**
 * Массив имён каналов на которые мы подписаны
 * @private
 */
cometServer.prototype.subscription_array = new Array();

/**
 * Случайный идентификатор вкладки.
 * Используется для определения кому предназначены исторические данные из канала.
 * @private
 */
cometServer.prototype.custom_id = (Math.random()*10)+""+Math.random();
cometServer.prototype.custom_id = cometServer.prototype.custom_id.replace(/[^0-9A-z]/,"").replace(/^(.{10}).*$/,"$1");


/**
 * Время на переподключение в милисекундах после второй подряд ошибки подключения
 * @private
 */
cometServer.prototype.time_to_reconect_on_error = 1000;

/**
 * Время на переподключение в милисекундах после первой ошибки подключения
 * @private
 */
cometServer.prototype.time_to_reconect_on_close = 100;

/**
 * @private
 */
cometServer.prototype.in_abort = false;

/**
 * @private
 */
cometServer.prototype.restart_time_id = false;

/**
 * Время даваемое на определение того какая из вкладок является мастервкладкой
 * @private
 */
cometServer.prototype.start_timer = 1200;

/**
 * Выражение отделяющие по знаку точки на павую и левую части.
 * @private
 */
cometServer.prototype.reg_exp = new RegExp(/^([^.]+)\.([^.]+)$/);

/**
 * Определяет надо ли использовать https или http
 * @private
 */
cometServer.prototype.protocol = document.location.protocol.replace(/[^s]/img, "");

/**
 * @private
 */
cometServer.prototype.web_socket_error = 0;

/**
 * Учитывает удачно переданные сообщения по вебскокету
 * Если они были то в случаии неполадок с ссетью переход на long poling осуществлён не будет.
 * @private
 */
cometServer.prototype.web_socket_success = false;

/**
 * @private
 */
cometServer.prototype.web_socket_error_timeOut = 30000;

/**
 * @private
 */
cometServer.prototype.xhr_error = 0;
/**
 * @private
 */
cometServer.prototype.xhr_error_timeOut_id = 30000;

/**
 * @private
 */
cometServer.prototype.authorized_status;

/**
 * @private
 */
cometServer.prototype.socket;
cometServer.prototype.socketArray = [];

/**
 * @private
 */
cometServer.prototype.use_WebSocket;

/**
 * @private
 */
cometServer.prototype.request;

/**
 * @private
 */
cometServer.prototype.status;

/**
 * @private
 */
cometServer.prototype.send_msg_queue = [];

/**
 * содержит пакет данных о подписках готовый к отправке по вебсокету
 * @private
 * @type {string}
 */
cometServer.prototype.send_msg_subscription = false;

/**
 * Уровень логирования
 * @private
 */
cometServer.prototype.LogLevel = 0;

if(window['localStorage']['comet_LogLevel'])
{
    cometServer.prototype.LogLevel = window['localStorage']['comet_LogLevel']
}

cometServer.prototype.getLogLevel = function()
{
    return cometServer.prototype.LogLevel;
}

cometServer.prototype.setLogLevel = function(level)
{
    cometServer.prototype.LogLevel = level;
    window['localStorage']['comet_LogLevel'] = level;
}

cometServer.prototype.getCustomString = function()
{
    var custom = (Math.random()*10)+""+Math.random();
    return custom.replace(/[^0-9A-z]/,"").replace(/^(.{10}).*$/,"$1");
}

/**
 *  http://www.webtoolkit.info/
 **/
cometServer.prototype.Base64 = {
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

cometServer.prototype.stripslashes = function(str)
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
cometServer.prototype.subscription_callBack = function(name, callBack, specialMarker)
{
    var thisObj = cometServer.prototype;
    var sigId = name+"&&";
    if(specialMarker === undefined)
    {
        // Подписка на сообщения от сервера для нашей вкладки
        sigId += comet_server_signal().connect(name, function(param)
        {
            console.log("marker", param.server_info.marker, thisObj.custom_id)
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
 * Массив идентификаторов подписок, нужен для того чтоб было можно отписаться от всех подписок сразу.
 * @type Array
 */
cometServer.prototype.subscription_slot_array = [];

/**
 * Отписывает функцию от получения сообщений
 * @public
 * @param {string|undefined} sigId Идентификатор подписки, возвращается функцией subscription в момент подписки или если sigId === undefined то отпишет от всех подписок сразу.
 *
 */
cometServer.prototype.unsubscription = function(sigId)
{
    if(sigId === undefined)
    {
        for(var i = 0; i < cometServer.prototype.subscription_slot_array.length; i++)
        {
            var val = cometServer.prototype.subscription_slot_array[i];

            var sigName = val.replace(/^(.*)&&.*$/, "$1");
            var slotName = val.replace(/^.*&&(.*)$/, "$1");
            comet_server_signal().disconnect(slotName, sigName);
        }

        cometServer.prototype.subscription_slot_array = []
        return true;
    }
    else if(!sigId)
    {
        return false;
    }

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
cometServer.prototype.subscription = function(name, callback)
{
    if(name === undefined )
    {
        return false;
    }

    var thisObj = cometServer.prototype;
    var nameArray = name.split("\n");
    if(nameArray.length > 1)
    {
        // Подписка на массив каналов без передачи колбека имеет смысл в том случаии когда это происходит по инициативе из другой вкладки.
        for(var i = 0; i < nameArray.length; i++)
        {
            cometServer.prototype.subscription(nameArray[i], callback);
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
        var sigId = "comet_server_msg&&" + comet_server_signal().connect("comet_server_msg", name);
        cometServer.prototype.subscription_slot_array.push(sigId);
        return sigId;
    }

    if( name === "msg" || /^msg\./.test(name) )
    {
        // Подписка на сообщения от сервера доставленые в соответсвии с данными авторизации (тоесть по id пользователя)
        var sigId = thisObj.subscription_callBack(name, callback);
        cometServer.prototype.subscription_slot_array.push(sigId);
        return sigId;
    }

    if(/^answer_to_web_/.test(name))
    {
        // Подписка на отчёт о доставке
        var sigId = thisObj.subscription_callBack(name, callback);
        cometServer.prototype.subscription_slot_array.push(sigId);
        return sigId;
    }
    else if(/^#/.test(name))
    {
        // Подписка на отчёт о доставке
        name = name.replace("#", "_answer_to_");
        var sigId = thisObj.subscription_callBack(name, callback);
        cometServer.prototype.subscription_slot_array.push(sigId);
        return sigId;
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
    cometServer.prototype.subscription_slot_array.push(sigId);

    if( name === "comet_server_msg" )
    {
        // Подписка на все сообщения разом
        return sigId;
    }

    if(cometServer.prototype.reg_exp.test(name))
    {
        var res = cometServer.prototype.reg_exp.exec(name);
        name = res[1];
    }

    for(var i = 0; i < cometServer.prototype.subscription_array.length; i++)
    {
        if(cometServer.prototype.subscription_array[i] === name )
        {
            return sigId;
        }
    }

    cometServer.prototype.subscription_array[cometServer.prototype.subscription_array.length] = name;


    if(cometServer.prototype.isMaster() === undefined)
    {
        // Статус ещё не определён
        cometServer.prototype.add_msg_to_queue("subscription\n"+cometServer.prototype.subscription_array.join("\n"))
    }
    else if(cometServer.prototype.isMaster())
    {
        // Мы мастер вкладка
        if(cometServer.prototype.LogLevel) console.log('add subscription:'+name)

        if(cometServer.prototype.UseWebSocket())
        {
            // Отправляем запрос на подписку на канал с небольшой задержкой
            // чтоб если было два и более вызова функции subscription подряд они все вместе сгенерировали только 1 запрос к комет серверу
            if(cometServer.prototype.lastSubscriptionTimeoutId)
            {
                clearTimeout(cometServer.prototype.lastSubscriptionTimeoutId);
            }

            cometServer.prototype.lastSubscriptionTimeoutId = setTimeout(function()
            {
                thisObj.lastSubscriptionTimeoutId = false;

                thisObj.send_msg("subscription\n"+thisObj.subscription_array.join("\n"))
            }, 50);
        }
        else
        {
            cometServer.prototype.restart()
        }
    }
    else
    {
        // Мы slave вкладка
        comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',cometServer.prototype.subscription_array.join("\n"))
    }
    return sigId;
}

cometServer.prototype.isMaster = function()
{
    return cometServer.prototype.is_master;
}

/**
 * Подписывается на подписки запрошеные ранее.
 * @private
 */
cometServer.prototype.send_curent_subscription = function()
{
    if(cometServer.prototype.subscription_array.length === 0)
    {
        return;
    }

    cometServer.prototype.send_msg("subscription\n"+cometServer.prototype.subscription_array.join("\n"))
}

/**
 * @private
 */
cometServer.prototype.getUrl = function(nodename)
{
    if(nodename === undefined)
    {
       nodename = cometServer.prototype.options.nodeName
    }

    if(cometServer.prototype.UseWebSocket() === true)
    {
        return 'ws'+cometServer.prototype.protocol+'://'+nodename+'/ws/sesion='+cometServer.prototype.options.user_key+'&myid='+cometServer.prototype.options.user_id+'&devid='+cometServer.prototype.options.dev_id+"&v="+cometServer.prototype.version+"&api=js";
    }

    return 'http'+cometServer.prototype.protocol+'://'+nodename+'/sesion='+cometServer.prototype.options.user_key+'&myid='+cometServer.prototype.options.user_id+'&devid='+cometServer.prototype.options.dev_id+"&v="+cometServer.prototype.version+"&api=js";
}

cometServer.prototype.UseWebSocket = function(use)
{
    if(use === true)
    {
        cometServer.prototype.use_WebSocket = use;
    }
    else if(use === false)
    {
        cometServer.prototype.use_WebSocket = use;
    }
    else if(cometServer.prototype.use_WebSocket === undefined)
    {
        cometServer.prototype.use_WebSocket = (window.WebSocket !== undefined)
    }

    return cometServer.prototype.use_WebSocket;
}

/**
 * Указывает надо ли использовать wss или обойтись ws
 * @param {Boolean} use
 * @returns {Boolean}
 */
cometServer.prototype.UseWss = function(use)
{
    if(use)
    {
        cometServer.prototype.protocol = "s"
    }
    else if(use === undefined)
    {
        cometServer.prototype.protocol = document.location.protocol.replace(/[^s]/img, "");
    }
    else
    {
        cometServer.prototype.protocol = ""
    }

    return cometServer.prototype.protocol === "s"
}

/**
 * @returns {Boolean} Используется ли сейчас wss
 */
cometServer.prototype.isUseWss = function()
{
    return cometServer.prototype.protocol === "s"
}
/**
 * Запуск соединения
 * @param {Object} opt Объект с параметрами
 * @param {function} callBack Колбек на факт установки соединения
 * @returns {Boolean}
 */
cometServer.prototype.start = function(opt, callBack)
{
    if(opt !== undefined)
    {
        for(var key in opt)
        {
            cometServer.prototype.options[key] = opt[key];
        }
    }

    if(cometServer.prototype.LogLevel) console.log([cometServer.prototype.custom_id , opt])

    if(cometServer.prototype.options === undefined)
    {
        cometServer.prototype.options = {}
    }

    if(!cometServer.prototype.options.CookieKyeName)
    {
        cometServer.prototype.options.CookieKyeName = 'CometUserKey'
    }

    if(!cometServer.prototype.options.CookieIdName)
    {
        cometServer.prototype.options.CookieIdName = 'CometUserid'
    }

    if(!cometServer.prototype.options.user_key)
    {
        cometServer.prototype.options.user_key = getCookie(cometServer.prototype.options.CookieKyeName)
    }

    if(!cometServer.prototype.options.user_id)
    {
        cometServer.prototype.options.user_id = getCookie(cometServer.prototype.options.CometUserid)
    }

    cometServer.prototype.UseWebSocket(window.WebSocket !== undefined);

    if(cometServer.prototype.options.dev_id > 0)
    {
        cometServer.prototype.in_abort = false;
        cometServer.prototype.conect(callBack);
        return true;
    }
    else
    {
        console.error("Star.Comet: Не установлен dev_id")
        return false;
    }
}

cometServer.prototype.stop = function()
{
    if(cometServer.prototype.isMaster())
    {
        cometServer.prototype.in_abort = true;

        if(cometServer.prototype.UseWebSocket())
        {
            //cometServer.prototype.socket.close();
            for(var i = 0; i < cometServer.prototype.socketArray.length; i++)
            {
                if(cometServer.prototype.socketArray[i])
                {
                    cometServer.prototype.socketArray[i].close();
                }
            }
        }
        else
        {
            cometServer.prototype.request.abort();
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
cometServer.prototype.restart = function(opt)
{
    if(opt !== undefined)
    {
        for(var key in opt)
        {
            cometServer.prototype.options[key] = opt[key];
        }
    }

    if(cometServer.prototype.isMaster())
    {
        if(cometServer.prototype.restart_time_id !== false)
        {
            clearTimeout( cometServer.prototype.restart_time_id );
        }

        cometServer.prototype.in_abort = true;
        if(cometServer.prototype.UseWebSocket())
        {
            //cometServer.prototype.socket.close();
            for(var i = 0; i < cometServer.prototype.socketArray.length; i++)
            {
                if(cometServer.prototype.socketArray[i])
                {
                    cometServer.prototype.socketArray[i].close();
                }
            }
        }
        else
        {
            cometServer.prototype.request.abort();
        }

        // Таймер задержки рестарта чтоб не выполнять рестарт чаще раза в секунду.
        cometServer.prototype.restart_time_id = setTimeout(function()
        {
            cometServer.prototype.in_abort = false;
            cometServer.prototype.conect_to_server();
        },1000)
    }
    else
    {
        comet_server_signal().send_emit('comet_msg_slave_signal_restart', opt);
    }
}

cometServer.prototype.setAsSlave = function(callback)
{
    if(callback === undefined)
    {
        callback = function(){};
    }

    var thisObj = cometServer.prototype;
    var time_id = false;
    var last_time_id = false;

    // Подписка колбека который будет выполнен когда мы получим статус slave вкладки
    comet_server_signal().connect("slot_comet_msg_set_as_slave",'comet_msg_set_as_slave', function()
    {
        if(cometServer.prototype.LogLevel)
        {
            console.log('comet_msg_set_as_slave: set is slave');
        }

        // Отписываем этот колбек
        comet_server_signal().disconnect("slot_comet_msg_set_as_slave", 'comet_msg_set_as_slave');

        // Подписка для send_msg: Если мы станем slave вкладкой то все сообщения ожидающие в очереди отправим мастер вкладке.
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

    // Подключаемся на уведомления от других вкладок о том что сервер работает, если за cometServer.prototype.start_timer милисекунд уведомление произойдёт то отменим поставленый ранее таймер
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

               // Создадим таймер, если этот таймер не будет отменён за cometServer.prototype.start_timer милисекунд то считаем себя мастер вкладкой
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

    // Создадим таймер, если этот таймер не будет отменён за cometServer.prototype.start_timer милисекунд то считаем себя мастер вкладкой
    time_id = setTimeout(function()
    {
       comet_server_signal().disconnect("comet_msg_conect", 'comet_msg_master_signal');

       thisObj.in_try_conect = false;
       thisObj.conect_to_server();
       callback();
    }, cometServer.prototype.start_timer )
}

/**
 * Устанавливает эту вкладку как мастер вкладку.
 * @private
 */
cometServer.prototype.setAsMaster = function()
{
    var thisObj = cometServer.prototype;
    cometServer.prototype.is_master = true;
    if(cometServer.prototype.LogLevel) console.log("setAsMaster")

    //  для уведомления всех остальных вкладок о своём превосходстве
    comet_server_signal().send_emit('comet_msg_master_signal', {custom_id:cometServer.prototype.custom_id})
    comet_server_signal().send_emit('comet_msg_new_master')           // для уведомления всех что надо переподписатся @todo реализовать переподписку событий
    masterSignalIntervalId = setInterval(function()                   // Поставим таймер для уведомления всех остальных вкладок о своём превосходстве
    {
        // Передаём идентификатор своей вкладки на тот случай если вдруг по ошибки ещё одна из вкладок возомнит себя мастером
        // То та вкладка у кторой идентификатор меньше уступит право быть мастер вкладкой той вкладке у которой идентификатор больше
        comet_server_signal().send_emit('comet_msg_master_signal', {custom_id:cometServer.prototype.custom_id})
    }, cometServer.prototype.start_timer/6);

    // Подписываемся на уведомления о том что кто то возомнил себя бастер вкладкой для того чтоб вовремя уладить конфликт двоевластия
    // и не допустить установки более одного соединения с комет сервером, а если это уже произошло то хотябы отключить одно из них.
    comet_server_signal().connect("comet_msg_master_detect", 'comet_msg_master_signal', function(event, signal_name, SignalNotFromThisTab)
    {
        if(SignalNotFromThisTab && cometServer.prototype.LogLevel)
        {
            console.error("Произошла колизия, образовалось две мастервкладки")
        }

        if(SignalNotFromThisTab && event.custom_id > cometServer.prototype.custom_id)
        {
            if(cometServer.prototype.LogLevel) console.log("Уступаем власть, переходим в режим slave вкладки")

            // Идентификатор своей вкладки меньше чем был прислан в сигнале надо уступить право быть мастер вкладкой

            // Перестаём отправлять уведомления о том что мы мастер
            clearInterval(masterSignalIntervalId);

            // Отписываем этот колбек
            comet_server_signal().disconnect('comet_msg_master_detect', "comet_msg_master_signal")


            // Отписываемся от всего за чем должена слидить мастервкладка

            // подключение на сигнал рестарта от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "comet_msg_slave_signal_restart")

            // подключение на сигнал остоновки от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "comet_msg_slave_signal_stop")

            // подключение на сигнал запуска от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "comet_msg_slave_signal_start")

            // подключение на сигнал переподписки от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "comet_msg_slave_add_subscription_and_restart")

            // подключение на сигнал отправки сообщений от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "comet_msg_slave_send_msg")

            // подключение на сигнал запроса статуса авторизации на комет сервере  от других вкладок
            comet_server_signal().disconnect('comet_master_tab', "__comet_get_authorized_status")


            cometServer.prototype.setAsSlave()
        }
    });

    // подключение на сигнал рестарта от других вкладок
    comet_server_signal().connect('comet_master_tab', 'comet_msg_slave_signal_restart', function(p,arg)
    {
        if(thisObj.LogLevel) console.log([p,arg])
        thisObj.restart(p)
    })

    // подключение на сигнал остоновки от других вкладок
    comet_server_signal().connect('comet_master_tab', 'comet_msg_slave_signal_stop', function(p,arg)
    {
        if(thisObj.LogLevel) console.log([p,arg])
        thisObj.stop()
    })

    // подключение на сигнал запуска от других вкладок
    comet_server_signal().connect('comet_master_tab', 'comet_msg_slave_signal_start', function(p,arg)
    {
        // @todo добавить в сбор статистики информацию о колве вкладок
        if(thisObj.LogLevel) console.log([p,arg])
        thisObj.start()
    })

    // подключение на сигнал переподписки от других вкладок
    comet_server_signal().connect('comet_master_tab', 'comet_msg_slave_add_subscription_and_restart', function(p,arg)
    {
        if(thisObj.LogLevel) console.log([p,arg])
        thisObj.subscription(p)
    })

    // подключение на сигнал отправки сообщений от других вкладок
    comet_server_signal().connect('comet_master_tab', 'comet_msg_slave_send_msg', function(p,arg)
    {
        if(thisObj.LogLevel) console.log([p,arg])
        thisObj.send_msg(p)
    })

    // Если мы были slave а стали mster то отписываемся от сигнала об изменении статуса авторизации.
    comet_server_signal().disconnect('__comet_set_authorized_slot', "__comet_authorized")

    // подключение на сигнал запроса статуса авторизации на комет сервере  от других вкладок
    comet_server_signal().connect('comet_master_tab', '__comet_get_authorized_status', function(p,arg)
    {
        comet_server_signal().send_emit("__comet_authorized", thisObj.isAuthorized())
    })
}

/**
 * @private
 */
cometServer.prototype.setAuthorized = function(value)
{
    if(cometServer.prototype.LogLevel) console.log("setAuthorized:", value);

    if(cometServer.prototype.authorized_status !== value && value === true)
    {
        // Испускает сигнал успешной авторизации на комет сервере
        comet_server_signal().emit("__comet_onAuthSuccess")
    }
    else if(cometServer.prototype.authorized_status !== value && value === false)
    {
        // Испускает сигнал не успешной авторизации на комет сервере
        comet_server_signal().emit("__comet_onAuthFalill")
    }

    cometServer.prototype.authorized_status = value;

    if(cometServer.prototype.isMaster())
    {
        comet_server_signal().send_emit("__comet_authorized", cometServer.prototype.authorized_status)
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
cometServer.prototype.onAuthSuccess = function(callback)
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
cometServer.prototype.onAuthFalill = function(callback)
{
    comet_server_signal().connect("__comet_onAuthFalill", callback)
}

/**
 * Возвращает статус авторизации на комет сервере.
 * @returns bolean true авторизован, false не авторизован и undefined если статус ещё не известен.
 * @public
 */
cometServer.prototype.isAuthorized = function()
{
    return cometServer.prototype.authorized_status;
}

/**
 * Если true то произошла критическая ошибка после которой нет смысла подключатся к серверу
 * @private
 */
cometServer.prototype.hasCriticalError = false;

/**
 * Обрабатывает распарсеное входящее сообщение
 *
 * Формат сообщения:{msg:"", pipe:"", eror:""}
 * @private
 */
cometServer.prototype.msg_cultivate = function( msg )
{
    if(cometServer.prototype.LogLevel) console.log("msg", msg);
    if( msg.data === undefined )
    {
        return -1;
    }

    if(msg.error > 400)
    {
        // Критическая ошибка, подключение невозможно. http://comet-server.ru/wiki/doku.php/comet:javascript_api:error
        console.error("CometServerError:"+msg.error, "\n", msg.data, "\n", "Критическая ошибка, подключение невозможно. Подробности в документации http://comet-server.ru/wiki/doku.php/comet:javascript_api:error" )
        cometServer.prototype.hasCriticalError = true;
    }


    if(msg.authorized !== undefined)
    {
        cometServer.prototype.setAuthorized(msg.authorized === "true");
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
        msg.data = cometServer.prototype.Base64.decode(msg.data)
    }

    try{
        if(cometServer.prototype.LogLevel) console.log(["msg", msg.data, "web_id:"+web_id]);

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
        msg.data = cometServer.prototype.stripslashes(msg.data)
        try
        {
            if(cometServer.prototype.LogLevel) console.log(["msg", msg.data, "web_id:"+web_id]);
            var pmsg = JSON.parse(msg.data)
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

    if(cometServer.prototype.LogLevel) console.log(["msg", msg, result_msg]);

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
 * Вернёт true только если все соединения установлены и активны
 * @returns {Boolean}
 */
cometServer.prototype.socketArrayTest = function()
{
    for(var i = 0; i < cometServer.prototype.socketArray.length; i++)
    {
        var socket = cometServer.prototype.socketArray[i];
        if(socket &&  socket.readyState === 1)
        {
            continue;
        }
        else
        {
            return false;
        }
    }

    return true;
}


cometServer.prototype.messageHistory = []
cometServer.prototype.isSendErrorReport = false

/**
 * Отправляет отчёты об ошибках на сервер
 * Используется для отладки и автоматизированого тестирования сервера на реальных данных, а не синтетических тестовых наборах
 */
cometServer.prototype.errorReportSend = function()
{
    if(cometServer.prototype.messageHistory.length <=2)
    {
        return;
    }

    if(cometServer.prototype.isUseWss())
    {
        return;
    }

    var time = new Date();
    if(window.localStorage["errorReportSendTime"] && parseInt(window.localStorage["errorReportSendTime"]) < time.getTime() - 3600*1000*1)
    {
        // Не отправлять отчёты чаще чем раз в час
        return;
    }

    if(cometServer.prototype.isSendErrorReport)
    {
        return;
    }

    cometServer.prototype.isSendErrorReport = true;

    window.localStorage["errorReportSendTime"] = time.getTime()

    setTimeout(function()
    {
        var reportData = {
            messageHistory: cometServer.prototype.messageHistory,
            options: cometServer.prototype.options
        }

        var ajaxRequest = undefined;
        try {
            ajaxRequest = new XMLHttpRequest();
        } catch (trymicrosoft) {
            try {
                ajaxRequest = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (othermicrosoft) {
                try {
                    ajaxRequest = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (failed) {
                    ajaxRequest = false;
                }
            }
        }

        if(!ajaxRequest)
        {
            return;
        }


        ajaxRequest.open("POST", "http://comet-server.com/index.php?cultivate=technicalReports.errorReport", true);
        ajaxRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        ajaxRequest.send("reportData="+JSON.stringify(reportData)+"&version"+encodeURIComponent(cometServer.prototype.version)+"&dev_id="+cometServer.prototype.options.dev_id); // Именно здесь отправляются данные
    }, Math.floor(Math.random()*1000*30))// Разброс в минуту чтоб не отправлять запросы от многих клиентов единовременно

    return true;
}


/**
 * Отправляет данные по вебсокету (по первому из списка, и если он не доступен то по второму.)
 * @param {string} data
 * @returns {boolean}
 */
cometServer.prototype.socketArraySend = function(data)
{
    for(var i = 0; i < cometServer.prototype.socketArray.length; i++)
    {
        var socket = cometServer.prototype.socketArray[i];
        if(socket &&  socket.readyState === 1)
        {
            try
            {
                if(cometServer.prototype.messageHistory.length < 1000)
                {
                    var now = new Date();
                    cometServer.prototype.messageHistory.push({data:data, time:now.getTime()})
                }

                socket.send(data);
            }
            catch (ex)
            {
                if(cometServer.prototype.LogLevel )
                {
                    console.log("Не удалось отправить данные ", data, ex)
                    continue;
                }
            }
            return true;
        }
    }

    return false;
}

/**
 * Отправляет все сообщения из очереди на комет сервер.
 * @private
 */
cometServer.prototype.send_msg_from_queue = function()
{
    if(cometServer.prototype.isMaster() === undefined)
    {
        return false;
    }
    else if(cometServer.prototype.isMaster() === false)
    {
        // Отправка запроса на отправку сообщения мастервкладке
        if(cometServer.prototype.send_msg_subscription !== false)
        {
            comet_server_signal().send_emit('comet_msg_slave_add_subscription_and_restart',cometServer.prototype.send_msg_subscription);
            cometServer.prototype.send_msg_subscription = false;
        }

        if(cometServer.prototype.send_msg_queue.length > 0)
        {
            for(var i = 0; i < cometServer.prototype.send_msg_queue.length; i++)
            {
                comet_server_signal().send_emit('comet_msg_slave_send_msg',cometServer.prototype.send_msg_queue[i]);
            }
            cometServer.prototype.send_msg_queue = []
        }
        return true;
    }
    else if(cometServer.prototype.isMaster())
    {
        if(!cometServer.prototype.UseWebSocket())
        {
            return false;
        }

        if(cometServer.prototype.socketArrayTest())
        {
            if(cometServer.prototype.send_msg_subscription !== false)
            {
                if(cometServer.prototype.LogLevel ) console.error("WebSocket-send-subscription:"+cometServer.prototype.send_msg_subscription);
                cometServer.prototype.socketArraySend(cometServer.prototype.send_msg_subscription);
                cometServer.prototype.send_msg_subscription = false;
            }

            if(cometServer.prototype.send_msg_queue.length > 0)
            {
                var j = 10;
                // Отправляет сообщения из очереди не сразу а с 20мс интервалом.
                for(var i = 0; i < cometServer.prototype.send_msg_queue.length; i++)
                {
                    j+= 20;

                    // Потом убрать setTimeout
                    setTimeout( function(ri)
                    {
                        if(cometServer.prototype.LogLevel ) console.log("WebSocket-send-msg:", ri);
                        cometServer.prototype.socketArraySend(ri);
                    }, j, cometServer.prototype.send_msg_queue[i])
                }
                cometServer.prototype.send_msg_queue = []
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
cometServer.prototype.add_msg_to_queue = function(msg)
{
    var MsgType = false;
    MsgType = msg.split("\n")
    MsgType = MsgType[0]

    if(MsgType === "subscription")
    {
        // Проверка если сообщение о подписке на канал то его отправлять вне очереди
        // При этом нет необходимости отправлять предыдущие сообщение подписку.
        cometServer.prototype.send_msg_subscription = msg;
    }
    else
    {
        cometServer.prototype.send_msg_queue.push(msg)
    }
}

/**
 * отправка сообщения по веб сокету.
 * @private
 * @param {string} msg Текст сообщения в виде одной строки
 */
cometServer.prototype.send_msg = function(msg)
{
    if(cometServer.prototype.isMaster() === undefined)
    {
        cometServer.prototype.add_msg_to_queue(msg);
        return false;
    }
    else if(cometServer.prototype.isMaster() === false)
    {
        comet_server_signal().send_emit('comet_msg_slave_send_msg',msg);
    }
    else if(cometServer.prototype.isMaster())
    {
        if(!cometServer.prototype.UseWebSocket())
        {
            console.warn("WebSocket-send-msg: not use");
            return false;
        }

        if(cometServer.prototype.socketArrayTest())
        {
            cometServer.prototype.send_msg_from_queue();

            if(cometServer.prototype.LogLevel ) console.log("WebSocket-send-msg:"+msg);
            cometServer.prototype.socketArraySend(msg);
            return true;
        }
        else
        {
            cometServer.prototype.add_msg_to_queue(msg);
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
cometServer.prototype.web_pipe_send = function(pipe_name, event_name, msg)
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

    if(cometServer.prototype.LogLevel) console.log(["web_pipe_send", pipe_name, msg]);
    return cometServer.prototype.send_msg("web_pipe2\n"+pipe_name+"\n"+event_name+"\n*\n"+JSON.stringify(msg));
}

/**
 * Отправляет статистику о использование плагинов
 * @param {string} plugin_name Имя плагина
 * @param {string} plugin_version Версия плагина
 * @param {string} plugin_data Данные плагина
 * @returns {Boolean}
 */
cometServer.prototype.sendStatistics = function(plugin_name, plugin_version, plugin_data)
{
    if(cometServer.prototype.LogLevel) console.log(["sendStatistics", plugin_name, plugin_version, plugin_data]);
    return cometServer.prototype.send_msg("statistics\n"+JSON.stringify(
            {
                url:window.location.href,
                dev_id:cometServer.prototype.options.dev_id,
                version: cometServer.prototype.version,
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
cometServer.prototype.get_pipe_log = function(pipe_name, callBack)
{
    if(!cometServer.prototype.UseWebSocket())
    {
        return false;
    }

    if(callBack !== undefined)
    {
        var marker = cometServer.prototype.getCustomString();
        cometServer.prototype.subscription(pipe_name)
        cometServer.prototype.subscription_callBack(pipe_name, callBack, marker);
    }

    cometServer.prototype.send_msg("pipe_log\n"+pipe_name+"\n"+cometServer.prototype.custom_id+"\n");
    return true;
}

/**
 * Отправляет запрос на получение количества подписчиков в канале pipe_name
 * @param {string} pipe_name
 * @param {function} callBack колбек для ответа от сервера
 * @returns {Boolean}
 */
cometServer.prototype.count_users_in_pipe = function(pipe_name, callBack)
{
    if(!cometServer.prototype.UseWebSocket())
    {
        return false;
    }
    var marker = cometServer.prototype.getCustomString();
    cometServer.prototype.subscription_callBack("_answer_pipe_count", callBack, marker);
    cometServer.prototype.send_msg("pipe_count\n"+pipe_name+"\n"+marker+"\n");
    return true;
}

/**
 * Обеспечивает работу с ссоединением с сервером
 * @private
 */
cometServer.prototype.conect_to_server = function()
{
    var thisObj = cometServer.prototype;

    if(cometServer.prototype.in_conect_to_server)
    {
        if(cometServer.prototype.LogLevel) console.log("Соединение с сервером уже установлено.");
        return;
    }

    if(cometServer.prototype.LogLevel) console.log("Соединение с сервером");
    cometServer.prototype.in_conect_to_server = true;
    if(!cometServer.prototype.isMaster()) cometServer.prototype.setAsMaster();

    if(cometServer.prototype.hasCriticalError)
    {
        // Если true то произошла критическая ошибка после которой нет смысла подключатся к серверу
        return false;
    }

    if(cometServer.prototype.UseWebSocket())
    {

        function initSocket(socket)
        {
            socket.onopen = function()
            {
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
                        cometServer.prototype.send_msg("statistics\n"+JSON.stringify({url:window.location.href, dev_id:thisObj.options.dev_id, version: thisObj.version}));
                    }, 5000)
                }
            };

            socket.onclose = function(event)
            {
                cometServer.prototype.in_conect_to_server = false;
                if (event.wasClean || cometServer.prototype.in_abort === true)
                {
                    if(thisObj.LogLevel) console.log('WS Соединение закрыто чисто');
                }
                else
                {
                    if(thisObj.LogLevel) console.log('WS Обрыв соединения'); // например, "убит" процесс сервера
                    socket.close();
                    thisObj.web_socket_error++; // Увеличение колва ошибок вебсокетов

                    /*if(thisObj.web_socket_error_timeOut_id !== undefined )
                    {
                        clearTimeout(thisObj.web_socket_error_timeOut_id)
                    }

                    // Если ошибки происходят редко то обнулим сщётчик
                    thisObj.web_socket_error_timeOut_id = setTimeout(function()
                    {
                        thisObj.web_socket_error_timeOut_id = undefined;
                        thisObj.web_socket_error = 0;
                    }, thisObj.time_to_reconect_on_error*2 )*/



                    if( thisObj.web_socket_error > 2 && thisObj.web_socket_success !== true && !thisObj.isUseWss())
                    {
                        // Если за время thisObj.web_socket_error_timeOut произошло более 2 ошибок вебсокетов то принудительно включим wss
                        thisObj.UseWss(true)
                        console.warn("Произошло более 2 ошибок вебсокетов включаем шифрование"); // Не делать этого если уже были переданы данные по вебсокету
                    }
                    /*else if( thisObj.web_socket_error > 3 && thisObj.web_socket_success !== true && thisObj.isUseWss())
                    {
                        // Если за время thisObj.web_socket_error_timeOut произошло более 3 ошибок вебсокетов то перейдём на long poling
                        // Такое возможно если человек использует прокси который не поддерживает вебсокеты
                        // Переход произойдёт примерно через 3 секунды работы
                        thisObj.UseWebSocket(false);
                        thisObj.UseWss();
                        console.error("Произошло более 3 ошибок вебсокетов то перейдём на long poling"); // Не делать этого если уже были переданы данные по вебсокету
                    }*/
                    else if(thisObj.web_socket_error > 5)
                    {
                        // Если 3 ошибки подряд то увеличим время до следующего переподключения
                        thisObj.time_to_reconect_on_error *= 3;
                    }
                    else if(thisObj.web_socket_error > 3)
                    {
                        // Если 5 ошибок подряд то ещё больше увеличим время до следующего переподключения
                        thisObj.time_to_reconect_on_error += 2000;
                    }

                    if(thisObj.web_socket_error === 0)
                    {
                        // Если это первый обрыв соединения подряд то переподключаемся быстрее
                        setTimeout(function()
                        {
                            thisObj.conect_to_server();
                        }, cometServer.prototype.time_to_reconect_on_close );
                    }
                    else
                    {
                        // Если это не первый обрыв соединения подряд но данные уже отправлялись то отправляем отчёт об ошибке
                        if(thisObj.web_socket_success == true)
                        {
                            cometServer.prototype.errorReportSend();
                        }

                        // Если это не первый обрыв соединения подряд то переподключаемся не сразу
                        setTimeout(function()
                        {
                            thisObj.conect_to_server();
                        }, thisObj.time_to_reconect_on_error );
                    }
                }
                if(thisObj.LogLevel) console.log('WS Код: ' + event.code + ' причина: ' + event.reason);
            };

            socket.onmessage = function(event)
            {
                thisObj.web_socket_success = true;
                thisObj.web_socket_error = 0;               // Если успешно подключились сбрасываем сщётчик ошибок
                thisObj.time_to_reconect_on_error = 1000;   // Если успешно подключились сбрасываем сщётчик ошибок

                if(thisObj.LogLevel > 1) console.log("WS Входящие сообщение:"+event.data);
                var lineArray = event.data.replace(/^\s+|\s+$/, '').split("\n");
                for(var i = 0; i < lineArray.length; i++)
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

            socket.onerror = function(error)
            {
                thisObj.in_conect_to_server = false;
                if(thisObj.LogLevel) console.log("Ошибка " + error.message);

            };
        }

        cometServer.prototype.socketArray = []
        for(var i = 0; i < cometServer.prototype.options.nodeArray.length; i++)
        {
            var node = cometServer.prototype.options.nodeArray[i]
            var socket = new WebSocket(cometServer.prototype.getUrl(node));

            cometServer.prototype.socketArray.push(socket)
            initSocket(socket);
        }
    }
    else
    {
        try {
            cometServer.prototype.request = new XMLHttpRequest();
        } catch (trymicrosoft) {
            try {
                cometServer.prototype.request = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (othermicrosoft) {
                try {
                    cometServer.prototype.request = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (failed) {
                    cometServer.prototype.request = false;
                }
            }
        }

        cometServer.prototype.request.onreadystatechange = function()
        {
            if( thisObj.request.status === 200 && cometServer.prototype.in_abort !== true)
            {
                var re = thisObj.request.responseText;

                if(thisObj.LogLevel) console.log("Входящие сообщение:"+re);
                var lineArray = re.replace(/^\s+|\s+$/, '').split('\n')
                for(var i = 0; i < lineArray; i++)
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

        cometServer.prototype.request.open("POST", cometServer.prototype.getUrl(), true);
        cometServer.prototype.request.send(cometServer.prototype.subscription_array.join("\n")); // Именно здесь отправляются данные
    }

}

/**
 * Пытается установить соединение с сервером или наладить обмен сообщениями и мониторинг работоспособности мастервкладки.
 * @private
 */
cometServer.prototype.conect = function(callback)
{
    if(cometServer.prototype.isMaster())
    {
        return cometServer.prototype.conect_to_server();
    }

    if(cometServer.prototype.in_try_conect)
    {
        if(cometServer.prototype.LogLevel) console.log("Соединение с сервером уже установлено на другой вкладке");
        comet_server_signal().send_emit('comet_msg_slave_signal_start');
        return false;
    }

    cometServer.prototype.in_try_conect = true;
    if(cometServer.prototype.LogLevel) console.log("Попыдка соединения с сервером");

    cometServer.prototype.setAsSlave(callback)
}

/**
 * Api работы с комет серевером comet-server.ru
 * @type cometServer
 */
var cometApi = new cometServer();


/**
 * @return cometServer
 */
function CometServer()
{
    return cometApi;
}

