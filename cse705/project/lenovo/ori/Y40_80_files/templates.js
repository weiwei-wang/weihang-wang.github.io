// Generated by CoffeeScript 1.7.1

/*
 * LENOVO.TEMPLATES module
 * -----------------------
 * Dependencies: Handlebars, jQuery, LENOVO.MAIN, LENOVO.UTILS, LENOVO.ENV
 *
 * This extends Handlebars.js with the ability to load templates
 * from an external source, with light caching and precompilation.
 *
 * To render a template, pass a closure that will receive the
 * template as a function parameter, eg,
 *   LENOVO.TEMPLATES.render("templateName", function(t) {
 *       $("#somediv").html( t() );
 *   });
 *
 * Also allows storage of several handlebars templates in a
 * single file seperated with:
 *   <!--#?template_id-->
 *
 *
 *   <!--#?end-->
 * Note: "template_id" can contain letters, numbers, and underscore only, and must
 * start with a letter (as a best practice).
 *
 * Adapted from jQuery Autobars (https://github.com/cultofmetatron/jquery-autobars)
 * and discussion at Handlebars (https://github.com/wycats/handlebars.js/issues/82)
 * and Tal Bereznitskey's blog (http://berzniz.com/post/24743062344/handling-handlebars-js-like-a-pro)
 *
 */
(function(app, $, H) {
  var self, _M, __hasPartials, __isUrl, _baseurl, _debug, _defaults, _directory, _initialized, _parsePartials, _partialToken, _storeTemplate, _urls, _verbose, _version, _wcibase;
  _M = "TEMPLATES";
  _version = "2014-03-18";
  _baseurl = window.long_url || "";
  _debug = window.debugAllowed || false;
  _verbose = false;
  _initialized = false;
  _urls = null;
  _defaults = {
    filepaths: [],
    templates: {}
  };
  _partialToken = {
    begin: /<\!--\#\?([a-zA-Z]|\d|_)+-->/,
    end: /<\!--\#\?end-->/,
    END_TOKEN_SIZE: 12
  };
  _wcibase = "";
  _directory = "";

  /* handlebars helpers */

  /*
   * Convert all "/" and "." characters to "_"
   *
   * Use: {{noslashdot word}}
   */
  H.registerHelper("noslashdot", function(object) {
    if (object != null) {
      return new Handlebars.SafeString(object.replace(/(\/|\.)/g, "_"));
    } else {
      return "";
    }
  });

   /* Split and return Price from json data */
  H.registerHelper("getPrice", function(str) {
	if (str != null) {
		var price = new Handlebars.SafeString(str);
		price = "" + price + "";
		var priceIndex = price.indexOf('<t');
		if(priceIndex != -1){
			price = price.substring(0,priceIndex);
		}
		return price;
    } else {
      return "";
    }
  });
  
  /* Split and return Profit from json data */
  H.registerHelper("getProfit", function(str) {
	if (str != null) {
		var profit = new Handlebars.SafeString(str);
		profit = "" + profit + "";
		var profitIndex = profit.indexOf('<t');
		if(profitIndex != -1){
			profit = profit.substring(profitIndex,profit.length);
		}
		return profit;
    } else {
      return "";
    }
  });
  
  /*
   * Convert all "&nbsp" to empty string
   *
   * Use: {{nonbsp sentenence}}
   */
  H.registerHelper("nonbsp", function(object) {
    if (object != null) {
      return new Handlebars.SafeString(object.replace(/(&nbsp;)/g, ""));
    } else {
      return "";
    }
  });

  /*
   * Lowercase a string
   *
   * Use: {{toLowerCase word}}
   */
  Handlebars.registerHelper("toLowerCase", function(str) {
    if (str && typeof str === "string") {
      return str.toLowerCase();
    } else {
      return "";
    }
  });

  /*
   * Uppercase a string
   *
   * Use: {{toUpperCase word}}
   */
  Handlebars.registerHelper("toUpperCase", function(str) {
    if (str && typeof str === "string") {
      return str.toUpperCase();
    } else {
      return "";
    }
  });

  /*
   * Decode HTML markup in a string
   *
   * Use: {{htmlDecode word}}
   */
  Handlebars.registerHelper("htmlDecode", function(str) {
    var e, out;
    e = document.createElement("div");
    e.innerHTML = str;
    out = e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    return new Handlebars.SafeString(out);
  });

  /*
   * Get the text of an HTML node (equivalent to $(element).text() method)
   */
  Handlebars.registerHelper("getText", function(str) {
    var e, getText, out;
    getText = function(elem) {
      var ret;
      ret = "";
      if (elem == null) {
        return ret;
      }
      if (elem.nodeType === 3 || elem.nodeType === 4) {
        ret += elem.nodeValue;
      } else if (elem.nodeType !== 8 && elem.childNodes.length > 0) {
        ret += getText(elem.childNodes[0]);
      }
      return ret;
    };
    e = document.createElement("div");
    e.innerHTML = str;
    out = getText(e.firstChild);
    return new Handlebars.SafeString(out);
  });

  /* other helpers */
  __isUrl = function(str) {
    var rgx;
    rgx = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/g;
    return rgx.test(str);
  };
  __hasPartials = function(data) {
    return _partialToken.begin.test(data);
  };

  /* private methods */
  _parsePartials = function(data) {
    var begin, end, endIndex, name, source, token;
    begin = _partialToken.begin;
    end = _partialToken.end;
    data = data.split("\n").join("").split(/\s{2,}/).join("");
    while (data.match(begin)) {
      token = data.match(begin)[0];
      name = token.match(/([a-zA-Z]|\d|_)+/)[0];
      data = data.slice(token.length);
      endIndex = data.search(end);
      source = data.slice(0, endIndex);
      data = data.slice(endIndex + _partialToken.END_TOKEN_SIZE);
      _storeTemplate(name, source);
    }
  };
  _storeTemplate = function(name, raw) {
    if (H.templates == null) {
      H.templates = {};
    }
    if (H.partials == null) {
      H.partials = {};
    }
    if (H.templates[name] == null) {
      H.templates[name] = H.compile(raw);
      H.registerPartial(name, H.templates[name]);
    }
    if (_verbose === true) {
      console.info("LENOVO.TEMPLATES: _storeTemplate -> " + name);
    }
  };
  self = app[_M] = {};
  self.shouldRun = function() {
    return typeof H !== "undefined" && typeof H === "object";
  };
  self.init = function(options) {
    var filepaths, settings;
    if (_initialized !== true) {
      if (_debug === true) {
        console.info("LENOVO.TEMPLATES: init");
      }
      settings = $.extend(true, _defaults, options);
      filepaths = $.makeArray(settings.filepaths);
      if (app.UTILS != null) {
        _debug = app.UTILS.isDebug();
        _verbose = app.UTILS.isVerbose();
      }
      if (app.ENV != null) {
        _urls = app.ENV.urls(_baseurl);
      }
      _wcibase = _urls != null ? "" + _urls.wci.workflow.load + "?page=" : "";
      _directory = _urls != null ? "" + _urls.wci.workflow.load + "?page=" + _urls.handlebars : "";
      if (filepaths.length > 0) {
        self.precompile(filepaths);
      }
      _initialized = true;
    }
  };
  self.precompile = function(externalFiles, promise) {
    var deferred;
    if (_verbose === true) {
      console.info("LENOVO.TEMPLATES: precompile");
    }
    self.init();
    if (!$.isArray(externalFiles)) {
      externalFiles = $.makeArray(externalFiles);
    }
    deferred = [];
    $.each(externalFiles, function(index, template) {
      var name, options, path;
      if (__isUrl(template)) {
        path = _wcibase + template;
        name = template.split(".").shift().split("/").pop();
      } else {
        name = template;
        path = "" + _directory + template + ".html";
      }
      options = {
        async: true,
        dataType: "text",
        success: function(data) {
          if (__hasPartials(data) === true) {
            _parsePartials(data);
          } else {
            _storeTemplate(name, data);
          }
        },
        type: "GET"
      };
      if ((promise != null) && promise === true) {
        deferred.push($.ajax(path, options));
      } else {
        $.ajax(path, options);
      }
    });
    if (deferred.length > 0) {
      return $.when.apply(void 0, deferred).promise();
    }
  };
  self.getTemplate = function(template) {
    var name, options, path;
    if (template != null) {
      if (_verbose === true) {
        console.info("LENOVO.TEMPLATES: getTemplate -> " + template);
      }
      self.init();
      if (__isUrl(template)) {
        path = _wcibase + template;
        name = template.split(".").shift().split("/").pop();
      } else {
        name = template;
        path = "" + _directory + template + ".html";
      }
      if ((H.templates == null) || (H.templates[name] == null)) {
        options = {
          async: false,
          dataType: "text",
          success: function(data) {
            if (__hasPartials(data) === true) {
              _parsePartials(data);
            } else {
              _storeTemplate(name, data);
            }
          },
          type: "GET"
        };
        $.ajax(path, options);
      }
      return H.templates[name];
    }
  };
})(window.LENOVO = window.LENOVO || {}, jQuery, Handlebars);