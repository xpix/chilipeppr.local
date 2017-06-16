
window.replaceToLocal = function(url){
   console.log("OVERLOAD args:", url);
   if( url ){
      var replaced = url;
      console.log("origin:", url);
      if(url.match(/appspot/ig)){

         if(url.match(/jquery\.ui/)){
            // http://i2dcui.appspot.com/js/jquery-ui-1.10.4/ui/jquery.ui.core.js
            replaced = "jslib/jquery-ui_min/jquery-ui.min.js";
            console.log("OVERLOAD rquirejs load routine: ", replaced);
            return replaced;
         }

         // http://i2dcui.appspot.com/js/clipper/clipper_unminified.js
         replaced = url.replace(/^.+\//, "jslib/cplibs/");
      }

      if(url.match(/githubusercontent/)){
         // https://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html
         replaced = url.replace(/^.+widget\-/, "widgets/widget-");
         replaced = replaced.replace(/\/master/, "");
      }

      if(url.match(/jshell/)){
         // http://fiddle.jshell.net/chilipeppr/90698kax/show/light/
         var regex = /\/([a-zA-Z0-9]+)\/show/igm;
         var res = regex.exec(url);
         replaced = 'widgets/jsfiddle/' + res[1] + '.html';
      }

      if(url.match(/jquery\.com/)){
         // code.jquery.com/jquery-2.1.0.min.js
         replaced = "jslib/jquery.js";
      }

      if(url.match(/cloudflare\.com.+?three\.js/)){
         replaced = "jslib/threejs/build/three.min.js";
      }

      if(url.match(/cloudflare\.com.+?waypoints/)){
         replaced = "jslib/waypoints/waypoints.min.js";
      }

      if(url.match(/datagetallkeys/)){
         arguments[0].url = 'data/datagetallkeys.json';
      }

      console.log("OVERLOAD rquirejs load routine: ", replaced);

      return replaced;
   }
   return url;
};
