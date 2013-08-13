



   function send_msg_to_user(user_id,msg,callback)
   {
      PostData('http://virtual.local.world-page.ru/ajax/client/wall/social/msg.php?function=http_send_msg_to_user&user_id='+user_id, 'msg='+msg+'','',
      function(re)
      {
          console.log("send_msg_to_user:"+re);
          re = eval("["+re+"]")
          re = re[0]

          if(callback!=undefined)
          {
              callback();
          }
      })
   }

   function cometSendEvent(msg,callback)
   {
      PostData('http://virtual.local.cms-machaon.ru/?v1=gohome&v2=automoderator&v3=ajax&v4=automoderator&v5=http_msg_add&msg='+msg, '','',
      function(re)
      {
          console.log("cometSendEvent:"+re);
          if(callback=="self")
          {
              cometSendEvent(msg,callback);
          }
          else if(callback!=undefined)
          {
              callback();
          }
      })
   }


   function get_last_online_time(user_id,callback)
   {
      PostData('?v1=gohome&v2=automoderator&v3=ajax&v4=automoderator&v5=http_GET_LAST_ONLINE_TIME&user_id='+user_id, '','',
      function(re)
      {
          console.log("last_online_time("+user_id+"):"+re);
          if(callback=="self")
          {
              get_last_online_time(user_id,callback);
          }
          else if(callback!=undefined)
          {
              callback();
          }
      })
   }


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


   var jsComet = function()
   {
       this.arg= "";
       this.user_id = 0;

       /**
        * Время на переподключение в секундах
        */
       this.last_error_time_reconect = 3;
       this.in_abort = false;
       this.first_start = true;

       this.url = "msg.virtual.local.world-page.ru";
       this.port = '44442'
       this.protocol = "http";
       this.dev_id = "5";

       /**
        * Добавляет подписки на события
        * Вызывает функции вида f(msg,callback_arg)
        * @param event_id Идентификатор события сервера на которое ведётся подпись
        * @param event_arg  Аргкменты для события на сервере на которые ведётся подпись
        * @param event_name Имя события на которое необъодимо подписатся (если false то подпись на все события)
        * @param callback функция обратного вызова
        * @param callback_arg доп параметры callback
        *
        * <code> Пример подписки на событие
             msgServer().add_subscription(2,0,false,function()
             {
                 errorMessage("Добавлено новое объявление")
                 $('#play_sound').html("<audio src='/images/am_sound/alert.mp3' autoplay></audio>");
             })

             Пример подписки на событие
             msgServer().add_subscription(2,0)
             signal().connect(false,'server_event_2', function()
             {
                 errorMessage("Добавлено новое объявление")
                 $('#play_sound').html("<audio src='/images/am_sound/alert.mp3' autoplay></audio>");
             })
        * </code>
        *
        * События которые могут быть сгенерированы
        *
        * server_event - Генерируется при каждом входящем сообщении
        *
        * server_event_0 - Генерируется при получении сообщения направленого конкретно этому пользователю, тоесть при вызове на стороне сервера send_by_user_id
        * server_event_1 - Ни кгода не генирируется так как этот идентификатор закреплён за прототипом объекта событие
        * server_event_2 - Генерируется при добавлении нового объявления на сервер (при подписке следет в качестве аргумента указать идентификатор интересующего раздела или 0 если интересуют все разделы сразу)
        *
        * server_msg - Генерируется при получении сообщения направленого конкретно этому пользователю, тоесть при вызове на стороне сервера send_by_user_id
        * server_msg_chat - Генерируется при получении сообщения направленого конкретно этому пользователю для модуля chat
        * server_msg_* - Генерируется при получении сообщения направленого конкретно этому пользователю для модуля определёного в поле "name" структкры переданой вторым аргкментом в функции send_by_user_id
        */
       this.add_subscription = function(event_id,event_arg/*,event_name,callback,callback_arg*/)
       {
           if(event_id !== undefined && event_arg !== undefined)
           {
               this.arg +=event_id+"="+event_arg+"\n"
               if(this.is_master)
               {
                   console.log('add_subscription:arg')
                   this.restart()
                   /*if(this.subscription_function[event_id] == undefined)
                   {
                       this.subscription_function[event_id]= new Array()
                   }*/

                   //this.subscription_function[event_id][this.subscription_function[event_id].length]={/*"callback":callback,"callback_arg":callback_arg,*/ event_name:event_name}
               }
               else
               {
                   //console.error('send_emit:msg_slave_add_subscription_and_restart:arg'+event_id+","+event_arg+","+this.custom_id)
                   signal().send_emit('msg_slave_add_subscription_and_restart',event_id,event_arg,this.custom_id)
               }
           }

       }

       /**
        * Добавляет подписки на личные события
        * Вызывает функции вида f(msg,callback_arg)
        * @param event_name Имя события на которое необъодимо подписатся (если false то подпись на все события)
        * @param callback функция обратного вызова
        * @param callback_arg доп параметры callback
        */
       /*this.subscription = function(event_name,callback,callback_arg)
       {
           if(this.subscription_function[0] == undefined)
           {
               this.subscription_function[0]= new Array()
           }
           this.subscription_function[0][this.subscription_function[0].length]={"callback":callback,"callback_arg":callback_arg,'event_name':event_name}
       }*/

       //this.subscription_function = new Array();

        /**
         * @todo Переделать
         * @param array user_id
         * @param function callback
         */
       this.get_last_online_time = function(user_id,callback)
       {
          PostData('?v1=gohome&v2=automoderator&v3=ajax&v4=automoderator&v5=http_GET_LAST_ONLINE_TIME&user_id='+user_id, '','',
          function(re)
          {
              console.log("last_online_time("+user_id+"):"+re);
              if(callback=="self")
              {
                  this.get_last_online_time(user_id,callback);
              }
              else if(callback!=undefined)
              {
                  callback(re);
              }
          })
       }

       this.start = function(callback,callback_arg)
       {
          this.in_abort = false;
          this.conect(callback, callback_arg)
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
               signal().send_emit('msg_slave_signal_stop',this.custom_id)
           }
       }

       this.restart_time_id = false

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
               signal().send_emit('msg_slave_signal_restart',this.custom_id)
           }
       }


       this.setAsMaster = function()
       {
           var thisObj = this
           this.is_master = true

           signal().send_emit('msg_master_signal') //  для уведомления всех остальных вкладок о своём превосходстве
           signal().send_emit('msg_new_master') //  для уведомления всех что надо переподписатся @todo реализовать переподписку событий
           setInterval(function()// Поставим таймер для уведомления всех остальных вкладок о своём превосходстве
           {
              //console.log("send_emit:msg_master_signal")
              signal().send_emit('msg_master_signal')
           }, 1000);

           signal().connect(false,'msg_slave_signal_restart', function(p,arg)// подключение на сигнал рестарта от других вкладок
           {
               if(arg[1][1]!=this.custom_id)
               {
                   thisObj.restart()
               }
           })

           signal().connect(false,'msg_slave_signal_stop', function(p,arg)// подключение на сигнал остоновки от других вкладок
           {
               if(arg[1][1]!=this.custom_id)
               {
                   thisObj.stop()
               }
           })

           signal().connect(false,'msg_slave_add_subscription_and_restart', function(p1,arg)// подключение на сигнал переподписки от других вкладок
           {
               console.log('msg_slave_add_subscription_and_restart:arg'+arg[1][1]+"="+arg[1][2]+"\narg[1][3]="+arg[1][3])
               if(arg[1][3]!=this.custom_id)
               {
                   thisObj.add_subscription(arg[1][1],arg[1][2])
                   thisObj.restart()
               }

           })
       }

       this.conect_to_server = function(callback,callback_arg)
       {
           var thisObj = this
           if(!this.is_master) this.setAsMaster()

           console.log("Соединение с сервером");
           //console.error("0=0\n"+thisObj.arg);
           this.xhrObj = $.ajax({
                                type: "POST",
                                url: thisObj.protocol+'://'+thisObj.url+':'+thisObj.port+'/?type=Long-Polling&sesion='+getCookie('PHPSESSID')+'&myid=8240&devid='+thisObj.dev_id,//+getCookie('user_id'),
                                data:"0=0\n"+thisObj.arg+"\n---",
                                dataType:'text',
                                processData:false,
                                cache:false,
                                success: function(re, textStatus, xhr)
                                {
                                    //пришедший контент data

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
                                          re = lineArray[i]
                                          var rj = eval("["+re+"]");
                                          rj = rj[0]
                                          console.log(rj);

                                          if(thisObj.in_abort == true && rj == undefined)
                                          {
                                              return false;
                                          }
                                          else if(rj == undefined)
                                          {
                                            console.log("Ошибка в xhr, переподключение через "+(thisObj.last_error_time_reconect) +" секунды.");
                                            setTimeout(function(){thisObj.conect_to_server(callback,callback_arg)}, 1000 * thisObj.last_error_time_reconect )
                                            return false;
                                          }

                                          /**
                                           * Если событие rj.event = 0 то это лично направленое сообщение
                                           */
                                          if(rj.event == 0 && rj.msg != undefined)
                                          {
                                             rj.msg = base64_decode(rj.msg)
                                             rj.msg = eval("["+rj.msg+"]");
                                             rj.msg = rj.msg[0]

                                             signal().send_emit("server_msg", rj.msg)
                                             if(rj.msg.name != undefined )
                                             {
                                                 signal().send_emit("server_msg_"+rj.msg.name, rj.msg)
                                             }
                                          }

                                          signal().send_emit('server_event', rj)


                                          /*if(thisObj.subscription_function[rj.event] != undefined)
                                          {
                                              for(var i=0; i<thisObj.subscription_function[rj.event].length; i++)
                                              {
                                                  if(thisObj.subscription_function[rj.event][i].event_name === undefined || thisObj.subscription_function[rj.event][i].event_name === false )
                                                  {
                                                      thisObj.subscription_function[rj.event][i].callback(rj.msg,thisObj.subscription_function[rj.event][i].callback_arg)
                                                  }
                                                  else if(rj.msg.name !== undefined && rj.msg.name == thisObj.subscription_function[rj.event][i].event_name )
                                                  {
                                                      thisObj.subscription_function[rj.event][i].callback(rj.msg,thisObj.subscription_function[rj.event][i].callback_arg)
                                                  }
                                              }
                                          } */
                                      }


                                      //setTimeout(function(){thisObj.conect(callback,callback_arg)}, 1000 )
                                      thisObj.conect_to_server(callback,callback_arg);
                                      if(callback!=undefined) callback(callback_arg)
                                },
                                error:function (xhr, ajaxOptions, thrownError)
                                {
                                    console.log("Ошибка в xhr, переподключение через "+(thisObj.last_error_time_reconect) +" секунды.");
                                    setTimeout(function(){thisObj.conect_to_server(callback,callback_arg)}, 1000 * thisObj.last_error_time_reconect )
                                    thisObj.last_error_time_reconect++
                                }
                            });
       }

       this.custom_id = genCustomID()

       this.is_master = false
       this.conect = function(callback,callback_arg)
       {
            var thisObj = this;
            console.log("Попыдка соединения с сервером");

            // Создадим таймер, если этот таймер не будет отменён за 3 сек то считаем себя мастер вкладкой
            var time_id = setTimeout(function()
            {
               signal().disconnect('msg_master_signal', "server_"+thisObj.custom_id)
               thisObj.conect_to_server(callback,callback_arg)
            }, 3000 )
                      // return 1; // ----------------------------------------------------------------------------------
            var last_timeout_id = false
            console.log('time_id:'+time_id)

            // Подключаемся на уведомления от других вкладок о том что сервер работает, если за 3 сек уведомление произойдёт то отменим поставленый ранее таймер
            signal().connect(false,'msg_master_signal', function()
            {  return;  // ----------------------------------------------------------------------------------
               if(time_id !== false) //  отменим поставленый ранее таймер если это ещё не сделано
               {
                   clearTimeout( time_id )
                   time_id = false
                   console.log("Соединение с сервером отменено");
               }
               else
               {
                   if(last_timeout_id !== false) //  отменим другой поставленый ранее таймер если это не первый вызов
                   {
                       clearTimeout( last_timeout_id )
                       last_timeout_id = false
                       //console.log("Соединение с сервером поддерживается на другой вкладке");
                   }

                   last_timeout_id = setTimeout(function()// Поставим таймер, если этот таймер не будет отменён за 3 сек то считаем себя мастер вкладкой так как предыдущая мастер вкладка была закрыта
                   {
                       //console.log("send_emit:msg_master_close")
                       signal().disconnect('msg_master_signal', "server_"+thisObj.custom_id)
                       thisObj.conect_to_server(callback,callback_arg)
                   }, 3000);
               }
            },"server_"+thisObj.custom_id)
       }

   }

   var _msgServer = false;

   /**
    * @return jsComet
    */
   function msgServer()
   {
       if(!_msgServer)
       {
          _msgServer = new jsComet();
       }
       return _msgServer;
   }


   $(document).ready(function()
   {
       msgServer().start()
   });


function genCustomID()
{
    var custom_id = ""
    for(var i=0; i<16; i++)
    {
        custom_id += "_"+Math.random()
    }

    return custom_id.replace(/0\./img,"")
}



 msgServer().add_subscription(2,0,function()
 {

     errorMessage("Добавлено новое объявление")
     $('#play_sound').html("<audio src='http://<?php echo $_SERVER['SERVER_NAME'];  ?>/images/am_sound/alert.mp3' autoplay></audio>");
 })


signal().connect(false,'server_msg', function(ow,arg,addArg)
{
    console.log([ow,arg,addArg])
})
