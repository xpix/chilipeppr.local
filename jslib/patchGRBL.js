function patchGRBL(that){
   // set initController from widget-tinyg to grbl
   set_initController(that);
   
   // translate from tinyg to grbl status line
   set_recvline(that);
   set_onRecvLine(that);
}

function set_onRecvLine(that){
   that.widgetConsole.isFilterActive = true;
   that.widgetConsole.filterRegExp = /^\</;
};

function set_recvline(that){
   that.tinygObject.onRecvCmd = function (recvline) {
      // get a per line command from the serial port server via pubsub
      //console.log("onRecvCmd. recvline:", recvline);

      // we want to process the qr reports for buffer planner
      // sample: 
      // ? or $G

      if (!(recvline.dataline)) {
          console.log("got recvline but it's not a dataline, so returning.");
          return;
      }
      var msg = recvline.dataline;
      var stats={};
      var found;
      
      // [GC:G0 G54 G17 G21 G90 G94 M5 M9 T0 F0 S0]
      // https://github.com/gnea/grbl/wiki/Grbl-v1.1-Commands#g---view-gcode-parser-state
      if(found = /^\[GC\:G(\d+) G(\d+) G(\d+) G(\d+) G(\d+) G(\d+) M(\d+) M(\d+)/.exec(msg)){

         // Motion mode
         // ["Traverse", "Straight", "CW Arc", "CCW Arc"];
         stats.momo = parseInt(found[1]);
         
         // ["G53", "G54", "G55", "G56", "G57", "G58", "G59"]
         stats.coor = found[2] - 53;

         // ["XY", "XZ", "YZ"]
         stats.plan = Math.abs(found[3] - 17);

         // mm or inch
         stats.unit = (found[4] == 20 ? 0 : 1);

         // G90 and G91
         stats.dist = (found[5] == 90 ? 0 : 1);


         this.processStats(stats);
      }

      // https://github.com/gnea/grbl/wiki/Grbl-v1.1-Interface#real-time-status-reports
      // <Idle|WPos:10.000,0.000,0.000|Bf:15,128|FS:0,0|WCO:0.000,0.000,0.000>
      var regex = /<(\S+)>/;
      var stat = regex.exec(msg);
      if(stat){

         var report = stat[1].split("|");
         var machineState = report[0];
         
         
         // Machine positions
         var pos= report[1].split(/[\:|,]/);
         var axes = {};               
         if(pos[0] == 'MPos')
            axes = {
               posx: parseFloat(pos[1]), 
               posy: parseFloat(pos[2]), 
               posz: parseFloat(pos[3])
            };
            this.publishAxisStatus(axes);

         if(pos[0] == 'WPos')
            axes = {
               mpox: parseFloat(pos[1]), 
               mpoy: parseFloat(pos[2]), 
               mpoz: parseFloat(pos[3])
            };
            this.publishAxisStatus(axes);

         // Calculate Machineposition
         if(found = /WCO\:(\S+)\,(\S+),(\d+)/.exec(stat[0]))
            this.publishAxisStatus({
               mpox: axes.posx - parseFloat(found[1]), 
               mpoy: axes.posy - parseFloat(found[2]), 
               mpoz: axes.posz - parseFloat(found[3])
            });

         // Feed FS:500,8000
         if(found = /FS\:(\d+)\,(\d+)/.exec(stat[0])){
            stats.feed = parseInt(found[1]);
            stats.speed= parseInt(found[2]);
         }

         // Feed F:500
         if(found = /F\:(\d+)/.exec(stat[0]))
            stats.feed = parseInt(found[1]);

         // Linenumber L:529
         if(found = /L\:(\d+)/.exec(stat[0]))
            stats.line = parseInt(found[1]);

         // Feed Bf:15,128
         if(found = /Bf\:(\d+)\,(\d+)/.exec(stat[0])){
            stats.avblocks    = parseInt(found[1]);
            stats.avbytes     = parseInt(found[2]);
         }

         // input pin state Pn:XYZPDHRS
         if(found = /Pn\:(\S+)/.exec(stat[0]))
            stats.pinstate = found[1];

         // Override values in %
         // Ov:100,100,100
         if(found = /Ov\:(\d+)\,(\d+),(\d+)/.exec(stat[0])){
            stats.override          = {};
            stats.override.feed     = parseInt(found[1]);
            stats.override.rapid    = parseInt(found[2]);
            stats.override.spindle  = parseInt(found[3]);
         }

         // Accessor state
         // A:C
         if(found = /A\:(\S+)/.exec(stat[0])){
            stats.accessor          = {};
            if(found[1] == 'S')
               stats.accessor.spindle = 'CW';
            if(found[1] == 'C')
               stats.accessor.spindle = 'CCW';
            if(found[1] == 'F')
               stats.accessor.flood = true;
            if(found[1] == 'M')
               stats.accessor.mist = true;
         }

         this.processStats(stats);
      }             
   };
}

function set_initController(that) {
   that.tinygObject.initController = function(reinit) {
            if (this.initsInFlight) return; //We are called by both init and onconnect. Only run once.  

            // This is new approach of array of commands with allowance 
            // for a pause on specific GRBL commands
            var initCmds = [
                { cmd: '?', pauseAfter: 150 },
            ];

            var that = this;
                
            this.initsInFlight = true;
            setTimeout(function () {
                for (var cmdCtr = 0; cmdCtr < initCmds.length; cmdCtr++) {
                    var initCmd = initCmds[cmdCtr];
                    var rawCmd = "";
                    var rawPause = 0;
                    if (typeof initCmd === 'object' && 'cmd' in initCmd) {
                        rawCmd = initCmd.cmd;
                    } else {
                        rawCmd = initCmd;
                    }
                    rawCmd += "\n";
                    if (typeof initCmd === 'object' && 'pauseAfter' in initCmd) {
                        rawPause = initCmd.pauseAfter;
                    }
                    chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", {
                        D: rawCmd,
                        Id: "grblInit-cmd" + that.initIdCtr++,
                        Pause: rawPause
                    });
                }
            }, 2000);
            
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestFro", "");
            }, 3000);

            setTimeout(function () {
                that.initsInFlight = false;
            }, 3200);
        }; 
}