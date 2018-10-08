var VisitorService=VisitorService||{};VisitorService.Rules=VisitorService.Rules||{};
VisitorService.Rules.Adapter=function(){this._headElement=document.getElementsByTagName("head")[0];this._headElement||(this._headElement=document.createElement("head"),document.insertBefore(this._headElement,document.getElementsByTagName("body")));this._sessionId=this._visitorId="";this._domain=this._searchScriptNodes("vsapi",1);this._dataFields={};this._eventDataQueue=[];this._eventSending=!1;this._widgets=[];this._spacWidgets=[];this._domContentLoaded=this._vsOptsLoaded=!1;this._widgetLoadQueue=
[];this._rnScript;this._rnScriptIgnored=!1;this._widgets.indexOf=this._widgets.indexOf||function(a){var c=this.length>>>0;for(i=0;i<c;i++)if(this[i]===a)return i;return-1};this.WTYPE={SPAC:2,SKB:3,SPOL:5,SCCL:7,PAC:"ProactiveChat",CCL:"ConditionalChatLink",VSPAC:1,VSSPAC:2,VSCCL:3,VSSCCL:4};this.ATYPE={LOAD:"PAGE_LOAD",OFFER:"OFFER",ACCEPT:"ACCEPT",CONVERT:"CONVERT",SUPPRESS:"SUPPRESS",REJECT:"REJECT"};this.WIDGET_STATE={LOADING:"LOADING",LOADED:"LOADED",OFFERED:"OFFERED"};this.initialize()};
VisitorService.Rules.Adapter.prototype={push:function(a){switch(a[0]){case "vsResponse":this._vsSuccess=a[1].success;!0===this._vsSuccess&&(this._vsLastSuccessfulEvent={name:a[1].name,value:"null"==a[1].value?void 0:a[1].value});break;case "vsOpts":if(this._vip!=a[1].vip||this._site!=a[1].site||this._poolID!=a[1].poolId||this._vsEnabled!=a[1].vsEnabled)this._vip=a[1].vip,this._site=a[1].site,this._poolID=a[1].poolId,this._vsEnabled=a[1].vsEnabled,this._cacheDomain=a[1].cacheDomain,this._vsOptsLoaded=
!0,this._loadWidgetsIfReady(),this._eventSending=!1,this._sendNextEventItem();break;case "rulesReady":this._processPageLoad(a[1].visitorId,a[1].sessionId);break;case "cpWidget":if(!RightNow.Event)break;var c={rule:a[1].rule,data:a[1]},a=a[1];this._processExtraWidgetData(a);delete c.data.rule;delete c.data.ts;switch(c.data.name){case this.WTYPE.PAC:c.data.offerOnlyOnce=!0;c.data.ignoreCookie=!0;c.data.ignoreTriggers=!0;0>this._widgets.indexOf(this.WTYPE.PAC)&&(this._widgets.push(this.WTYPE.PAC),RightNow.Event.subscribe("evt_ProactiveReady",
function(){RightNow.Event.fire("evt_customProactiveInitialization",c)}));RightNow.Event.fire("evt_isProactiveReady");break;case this.WTYPE.CCL:0>this._widgets.indexOf(this.WTYPE.CCL)&&(this._widgets.push(this.WTYPE.CCL),RightNow.Event.subscribe("evt_CCLReady",function(){RightNow.Event.fire("evt_customInitialization",c)}),RightNow.Event.fire("evt_isCCLReady"))}break;case "synWidget":a=this._clone(a[1]);a.rule&&(a.ruleId=a.rule.id,delete a.rule);delete a.ts;if(a.suppress){this._logExternal(this.ATYPE.SUPPRESS,
a);break}switch(a.type){case this.WTYPE.SPAC:a.instance_id="spac_"+a.widget_id;a.lazy_mode=!0;a.vstype=this.WTYPE.VSSPAC;var b=this._findSpacWidget(a.instance_id);b?b.state===this.WIDGET_STATE.LOADED&&(a=new RightNow.Client.EventObject(a.module,a.instance_id),a.data={dataFields:this._dataFields},RightNow.Client.Event.evt_updateCustomFieldsRequest.fire(a),a.data={checkAvailability:!0},RightNow.Client.Event.evt_chatOfferRequest.fire(a)):(b={instanceId:a.instance_id,state:this.WIDGET_STATE.LOADING},
this._spacWidgets.push(b),this._widgetLoadQueue.push(a),this._loadWidgetsIfReady());break;case this.WTYPE.SKB:a.instance_id="skb_"+a.widget_id;this._loadWidgetOrIgnore(a);break;case this.WTYPE.SPOL:a.instance_id="spol_"+a.widget_id;this._loadWidgetOrIgnore(a);break;case this.WTYPE.SCCL:a.instance_id="sccl_"+a.widget_id,a.vstype=this.WTYPE.VSSCCL,this._loadWidgetOrIgnore(a)}break;case "transactionCompleted":this._sendEventData(this.ATYPE.CONVERT,a[1].customVars.total);break;case "customData":this._dataFields[a[1].name]=
a[1].value}},initialize:function(){if(window._vsq&&window._vsq.shift)for(;window._vsq.length;)this.push(window._vsq.shift());window._vsq=this},_searchScriptNodes:function(a,c){for(var b="",d=RegExp("//([a-z0-9-.]+)/.*"+a+"(-test)?.js"),f=document.getElementsByTagName("script"),e=0;e<f.length;e++){var h=f[e].src.match(d);if(h){b=h[c];break}}return b},_processPageLoad:function(a,c){this._visitorId=a;this._sessionId=c;this._sendEventData(this.ATYPE.LOAD)},_checkSendSuccess:function(){this._eventSending=
!1;void 0===this._vsSuccess||!1===this._vsSuccess?this._updateOpts():!0===this._vsSuccess&&(this._eventDataQueue.shift(),this._sendNextEventItem())},_updateOpts:function(){var a=this._searchScriptNodes("vsopts",0);if(""!==a){var c=document.createElement("iframe");c.style.display="none";c.src=a+"?update=true";document.body.appendChild(c)}},_sendEventData:function(a,c){this._eventDataQueue.push({name:a,value:c});!this._eventSending&&void 0!==this._vip&&(this._eventSending=!0,this._sendNextEventItem(a,
c))},_sendNextEventItem:function(){var a=this._eventDataQueue[0];void 0!==a&&this._sendEventDataItem(a.name,a.value)},_sendEventDataItem:function(a,c){if(this._vsEnabled){var b=document.createElement("script");b.setAttribute("type","text/javascript");var d=this;void 0!=b.addEventListener?(b.addEventListener("load",function(){d._checkSendSuccess()},!1),b.addEventListener("error",function(){d._updateOpts()},!1)):void 0!=b.attachEvent&&b.attachEvent("onreadystatechange",function(){"loaded"==b.readyState&&
d._checkSendSuccess()});var f=!1,e="//"+this._vip+"/vs/site/"+this._site+"/visitor/"+this._visitorId+"/session/"+this._sessionId+"/type/"+a;if(a===this.ATYPE.OFFER||a===this.ATYPE.ACCEPT)e+="/val1/"+c.widget_id+"/val2/"+c.widget_name+"/val3/"+c.vstype;else if(a===this.ATYPE.CONVERT)e+="/val1/"+c;else if(a===this.ATYPE.LOAD)var f=encodeURIComponent(window.location.href),h=encodeURIComponent(document.title),e=e+("?url="+f+"&title="+h),f=!0;""!=this._poolID&&(e+=(f?"&":"?")+"pool="+this._poolID);b.src=
e;this._headElement.appendChild(b)}},_findSpacWidget:function(a){for(var c=0;c<this._spacWidgets.length;c++)if(this._spacWidgets[c].instanceId===a)return this._spacWidgets[c]},_loadWidgetOrIgnore:function(a){0>this._widgets.indexOf(a.instance_id)&&(this._widgets.push(a.instance_id),this._widgetLoadQueue.push(a),this._loadWidgetsIfReady())},_loadWidgetsIfReady:function(){if(this._vsOptsLoaded||""===this._searchScriptNodes("vsopts",0))if(!this._rnScriptIgnored&&void 0===this._rnScript&&("undefined"===
typeof RightNow||"undefined"===typeof RightNow.Client)&&("loaded"===document.readyState||"complete"===document.readyState||this._domContentLoaded))this._loadRNScript();else if(this._rnScriptLoaded)for(;0<this._widgetLoadQueue.length;)this._loadWidget(this._widgetLoadQueue.pop())},_loadRNScript:function(){if("undefined"!==typeof RightNow&&"undefined"!==typeof RightNow.Event)this._onRNScriptIgnored();else{var a=this._cacheDomain||this._domain;this._rnScript=document.createElement("script");this._rnScript.setAttribute("type",
"text/javascript");this._rnScript.setAttribute("src","//"+a+"/euf/rightnow/RightNow.Client.js");var c=this;"undefined"!==typeof this._rnScript.addEventListener?this._rnScript.addEventListener("load",function(){c._onAfterRNScriptLoaded()},!1):"undefined"!==typeof this._rnScript.attachEvent&&this._rnScript.attachEvent("onreadystatechange",function(){("complete"===c._rnScript.readyState||"loaded"===c._rnScript.readyState)&&c._onAfterRNScriptLoaded()});this._headElement&&this._headElement.appendChild(this._rnScript)}},
_onAfterRNScriptLoaded:function(){this._rnScriptLoaded=!0;this._loadWidgetsIfReady();_throttler.subscribeToDataEvents()},_onRNScriptIgnored:function(){this._rnScriptIgnored=!0;this._loadWidgetsIfReady();_throttler.subscribeToDataEvents()},_loadWidget:function(a){var c=this._widgetLoaded,b=this._cacheDomain||this._domain,d={widgetData:a,instance:this},f=this._dataFields,e={},h={};a.custom_fields&&(e=RightNow.lang.JSON.parse(a.custom_fields));for(var g in f)0===g.indexOf("contacts.")||0===g.indexOf("incidents.")?
h[g]=f[g]:e[g]=f[g];for(g in f)if(0===g.indexOf("incidents.prod")&&a.p&&(a.p=f[g]),0===g.indexOf("incidents.cat")&&a.c)a.c=f[g];a.custom_fields=RightNow.lang.JSON.stringify(e);a.common_fields=RightNow.lang.JSON.stringify(h);RightNow.Client.Event.evt_widgetLoaded.subscribe(c,d);RightNow.Client.Controller.addComponent(a,"//"+b+"/ci/ws/get")},_processExtraWidgetData:function(a){a.visitor_id=this._visitorId;a.ee_session_id=this._sessionId;a.ee_id=ATGSvcs.cfg("uoid");a.estara_id=window.eStara_fsguid},
_widgetLoaded:function(a,c,b){if(b.instance._matchEventForWidget(c,b.widgetData)){var a=b.instance._chatOffered,c=b.instance._chatAccepted,d=b.instance._chatRejected;if(b.widgetData.type===b.instance.WTYPE.SPAC){var f=b.instance._findSpacWidget(b.widgetData.instance_id);f&&(f.state=b.instance.WIDGET_STATE.LOADED);RightNow.Client.Event.evt_chatOffered.subscribe(a,b);RightNow.Client.Event.evt_chatAccepted.subscribe(c,b);RightNow.Client.Event.evt_chatRejected.subscribe(d,b)}else b.widgetData.type===
b.instance.WTYPE.SCCL&&(RightNow.Client.Event.evt_conditionalChatLinkOffered.subscribe(a,b),RightNow.Client.Event.evt_conditionalChatLinkClicked.subscribe(c,b));b.instance._processExtraWidgetData(window[b.widgetData.instance_id].attrs)}},_chatOffered:function(a,c,b){if(b.instance._matchEventForWidget(c,b.widgetData)){if(b.widgetData.type===b.instance.WTYPE.SPAC&&(a=b.instance._findSpacWidget(b.widgetData.instance_id)))a.state=b.instance.WIDGET_STATE.OFFERED;b.instance._sendEventData(b.instance.ATYPE.OFFER,
b.widgetData);b.instance._logExternal(b.instance.ATYPE.OFFER,b.widgetData)}},_chatAccepted:function(a,c,b){b.instance._matchEventForWidget(c,b.widgetData)&&(b.instance._sendEventData(b.instance.ATYPE.ACCEPT,b.widgetData),b.instance._logExternal(b.instance.ATYPE.ACCEPT,b.widgetData))},_chatRejected:function(a,c,b){b.instance._matchEventForWidget(c,b.widgetData)&&b.instance._logExternal(b.instance.ATYPE.REJECT,b.widgetData)},_matchEventForWidget:function(a,c){return a[0].name===c.module&&a[0].id===
c.instance_id},_logExternal:function(a,c){if(window.ATGSvcs){var b;c.type===this.WTYPE.SPAC?b="RNSPChat":c.type===this.WTYPE.SCCL&&(b="RNSCChat");var d;a===this.ATYPE.SUPPRESS?d="suppressed":a===this.ATYPE.OFFER?d="offered":a===this.ATYPE.ACCEPT?d="accepted":a===this.ATYPE.REJECT&&(d="closed");b&&d&&window.ATGSvcs.ee.logInvite({id:c.widget_id,type:b,timestamp:+new Date,state:d,ruleid:c.ruleId})}},_clone:function(a){var c={},b;for(b in a)a.hasOwnProperty(b)&&(c[b]=a[b]);return c}};
VisitorService.Rules.Throttler=function(){this._widgets={}};
VisitorService.Rules.Throttler.prototype={subscribeToDataEvents:function(){"undefined"!==typeof RightNow.Event&&(RightNow.Event.subscribe("evt_chatQueueRequest",this.onBeforeDataRequest,this),RightNow.Event.subscribe("evt_chatQueueResponse",this.onQueueReceived,this));"undefined"!==typeof RightNow.Client&&"undefined"!==typeof RightNow.Client.Event&&(RightNow.Client.Event.evt_beforeDataRequest.subscribe(this.onBeforeDataRequest,this),RightNow.Client.Event.evt_chatAvailabilityResponse||(RightNow.Client.Event.evt_chatAvailabilityResponse=
new RightNow.util.CustomEvent("evt_chatAvailabilityResponse")),RightNow.Client.Event.evt_chatAvailabilityResponse.subscribe(this.onChatAvailabilityResponse,_throttler),RightNow.Client.Event.evt_conditionalChatLinkAvailabilityResponse||(RightNow.Client.Event.evt_conditionalChatLinkAvailabilityResponse=new RightNow.util.CustomEvent("evt_conditionalChatLinkAvailabilityResponse")),RightNow.Client.Event.evt_conditionalChatLinkAvailabilityResponse.subscribe(this.onConditionalChatLinkAvailabilityResponse,
_throttler))},onBeforeDataRequest:function(a,c){var b=!0,d=Math.round((new Date).getTime()/1E3),f=c[0].w_id||c[0].id,e=_throttler._widgets[f];if(void 0!==e&&"object"===typeof e){var h=e.firstPollTime,g=e.lastPollTime,j=parseInt(e.lastReportedWaitTime,10);if(void 0!==h&&"number"===typeof h&&void 0!==g&&"number"===typeof g&&void 0!==j&&"number"===typeof j){if(3600>g-h){if(60<j&&(b=d>=g+j/2,!1===b)){var k=c[0].name,k=k.charAt(0).toLowerCase()+k.substring(1);RightNow.Client.ActionCapture.record(k,"throttle",
"Throttling : widget = "+f+"  First Poll Time = "+(new Date(1E3*h)).toString()+"  Last Poll Time = "+(new Date(1E3*g)).toString()+"  Expected Wait Seconds = "+j)}}else b=!1;!0===b&&(e.lastPollTime=d)}}else _throttler._widgets[f]={firstPollTime:d,lastPollTime:d,lastReportedWaitTime:0};return b},onQueueReceived:function(a,c){this._widgets[c[0].data.w_id].lastReportedWaitTime=c[0].response.stats.expectedWaitSeconds},onChatAvailabilityResponse:function(a,c,b){var a=c[0].w_id||c[0].id,d=b._widgets[a];
void 0!==d&&"object"===typeof d&&(b._widgets[a].lastReportedWaitTime=parseInt(c[0].data.expectedWaitSeconds,10))},onConditionalChatLinkAvailabilityResponse:function(a,c,b){a=c[0].data;if(a.stats){var c=c[0].w_id||c[0].id,d=b._widgets[c];void 0!==d&&"object"===typeof d&&(b._widgets[c].lastReportedWaitTime=parseInt(a.stats.expectedWaitSeconds,10))}}};var _adptr=new VisitorService.Rules.Adapter,_throttler=new VisitorService.Rules.Throttler;
document.addEventListener("DOMContentLoaded",function(){_adptr._domContentLoaded=!0;_adptr._loadWidgetsIfReady()});"complete"!==document.readyState&&"loaded"!==document.readyState?document.onreadystatechange=function(){("complete"===document.readyState||"loaded"===document.readyState)&&_adptr._loadWidgetsIfReady()}:_adptr._loadWidgetsIfReady();
