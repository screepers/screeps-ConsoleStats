//TODO some how I want this to work with https://github.com/Puciek/screeps-elk
var useUtilsLogger = false;
try {
    require('utils.logger.js');
    useUtilsLogger = true;
} catch (err) {
    useUtilsLogger = false;
    //console.log("utils.logger.js: Not found.", 3);
}


var statsConsole = {
    
    /**
     * Return ascii chart of `data` formatted ["Name", number].
     *
     * @param {Array} data - Your cpu stats of what you wish to display, example: [["Creep Manager", Memory.profilingData["CreepManager"]],["Towers", Memory.profilingData["Towers"]]]
     * @param {boolean} logCpu - Do record keeping for you?
     * @param {Object} opts
     * @param {Object} opts.max - max CPU data to keep
     * @param {Object} opts.display - max CPU data to keep
     * @return {boolean}
     * @api public
     */
    run: function (data, logCpu = true, opts = {}) {
        
        if (Memory.stats === undefined) {
            Memory.stats = {};
        }
        Memory.stats.cpu = data;
        /*
         let myStats = [
         ["Creep Managers", Memory.profilingData["bCreepManagers"]],
         ["Towers", Memory.profilingData["cTowers"]],
         ["Links", Memory.profilingData["dLinks"]],
         ["Setup Roles", Memory.profilingData["eSetupRoles"]],
         ["Creeps", Memory.profilingData["fCreeps"]],
         ["SumProfiling", Memory.profilingData["gSumProfiling"]],
         ["Init", Memory.profilingData["aStart"]],
         ["Stats", Memory.profilingData["stats"]],
         ["Total", Memory.profilingData["total"]]
         ];
         */
        let max = opts.max || 100;
        let display = opts.display || 10;
        Memory.stats["gcl.progress"] = Game.gcl.progress;                           // Your progress to the next GCL
        Memory.stats["gcl.progressTotal"] = Game.gcl.progressTotal;                 // Your total needed to the next GCL
        Memory.stats["gcl.level"] = Game.gcl.level;                                 // Your GCL level
        Memory.stats["cpu.bucket"] = Game.cpu.bucket;                               // That big CPU bucket in the sky
        Memory.stats["cpu.limit"] = Game.cpu.limit;                                 // Duh! Your current CPU limit
        Memory.stats["cpu.current"] = Game.cpu.getUsed();                           // What we currently used
        
        if (logCpu) {
            
            
            if (!Memory.stats.__cpu && Memory.stats.__cpu === undefined) {
                Memory.stats["__cpu"] = new Array(0);
            }
            Memory.stats.__cpu.unshift(Game.cpu.getUsed());
            if (Memory.stats["__cpu"].length > max - 6) {
                Memory.stats["__cpu"].pop();
            }
            
            if (Memory.stats.logs === undefined) {
                Memory.stats.logs = [["Logging Initialized!", 3]];
            }
            
            if (Memory.stats.logs && Memory.stats.logs.length >= display) {
                for (let i = 0; i <= (Memory.stats.logs.length - display); i++) {
                    Memory.stats.logs.shift(); // remove the first thing on the list as it is the oldest
                }
            }
        }
        return true;
    },
    //TODO: allow passing data to it.
    /**
     *
     * @returns {*} - String with </br>'s with cpu usage data
     */
    displayHistogram: function (width = 100, height = 20) {
        var asciiChart = require("ascii-chart");
        let output = asciiChart.chart(Memory.stats.__cpu.slice(0, Math.floor(width / 3)).reverse(), {
            width: width,
            height: height
        });
        let style = {
            lineHeight: '1'
        };
        let styleStr = _.reduce(style, (l, v, k) => `${l}${_.kebabCase(k)}: ${v};`, '');
        output = `<span style="${styleStr}">${output}</span>`;
        return output;
    },
    /**
     * Return ascii tables of cpu and room stats.
     *
     * @param {Object} opts - object that contains the following settings example: {totalWidth: 100,useProgressBar: true,cpuTitle: "CPU"}
     * @param {number} opts.totalWidth - total chart width [100]
     * @param {number} opts.cpuHistory - how far back we will use to average [10]
     * @param {string} opts.cpuTitle - title of CPU chart ["CPU"]
     * @param {string} opts.statsTitle - title of CPU chart ["CPU"]
     * @param {string} opts.leftTopCorner - title of CPU chart ["+"]
     * @param {string} opts.rightTopCorner - title of CPU chart ["+"]
     * @param {string} opts.leftBottomCorner - title of CPU chart ["+"]
     * @param {string} opts.rightBottomCorner - title of CPU chart ["+"]
     * @param {string} opts.useProgressBar - ["yes"]
     * @param {string} opts.percentInProgressBar - ["yes"]
     * @param {string} opts.progressBar - ["#"]
     * @param {string} opts.spacing - [" "]
     * @param {string} opts.vBar - ["|"]
     * @param {string} opts.hBar - ["-"]
     * @param {string} opts.percent - ["%"]
     * @param {string} opts.links - ["yes"] - Add link to rooms, default is true
     *
     * @return {String}
     * @api public
     */
    displayStats: function (opts = {}) {
        /*
         // Example of option that can be passed
         
         */
        
        // Options
        let totalWidth = opts.totalWidth || 100;
        let cpuAvgCount = opts.cpuHistory || 10;
        let title = opts.cpuTitle || "CPU";
        let statsTitle = opts.statsTitle || "Stats";
        let leftTopCorner = opts.leftTopCorner || "+";
        let rightTopCorner = opts.rightTopCorner || "+";
        let leftBottomCorner = opts.leftBottomCorner || "+";
        let rightBottomCorner = opts.rightBottomCorner || "+";
        let hBar = opts.hBar || "-";
        let vbar = opts.vBar || "|";
        let percent = opts.percent || "%";
        let useProgressBar = opts.useProgressBar || "yes";
        let percentInProgressBar = opts.percentInProgressBar || "yes";
        let progressBar = opts.progressBar || "#";
        let spacing = opts.spacing || " ";
        let addLinks = opts.links || "yes";
        
        
        let boxWidth = totalWidth - hBar.length * 4 - vbar.length * 4; // Width of the inside of the box
        let rooms = Game.rooms;
        let cpuLimit = Game.cpu.limit;
        let cpuBucket = Game.cpu.bucket;
        let cpuTotal = Game.cpu.getUsed();
        
        let addSpace = 0;
        if (!(boxWidth % 2 === 0)) {
            addSpace = 1;
        }
        
        let cpuAverage = 0;
        for (let i = cpuAvgCount; i > 0; i--) {
            cpuAverage = cpuAverage + Memory.stats.__cpu[i];
        }
        cpuAverage = cpuAverage / cpuAvgCount;
        var spacesToEnd = function (count, len) {
            return _.repeat(" ", (len - count.length));
        };
        let lineName = [
            "Usage",
            "Usage Avg",
            "Bucket"
        ];
        let lineStat = [
            (((cpuTotal / cpuLimit) * 100).toFixed(2) + percent),
            (((cpuAverage / cpuLimit) * 100).toFixed(2) + percent),
            (cpuBucket).toFixed(0).toString()
        ];
        
        for (let i = 0; i < Memory.stats.cpu.length; i++) {
            let name = [Memory.stats.cpu[i][0]];
            let stat = [Memory.stats.cpu[i][1].toFixed(0)];
            lineName.push(name);
            lineStat.push(stat);
        }
        
        let cpuStats = leftTopCorner + _.repeat(hBar, (((boxWidth / 4) - ((spacing.length + title.length + spacing.length) / 2)))) + spacing + title + spacing + _.repeat(hBar, (((boxWidth / 4) - ((spacing.length + title.length + spacing.length) / 2)))) + rightTopCorner + "\n";
        for (let i = 0; i < lineName.length && i < lineStat.length; i++) {
            cpuStats = cpuStats + vbar + spacing + lineName[i] + _.repeat(spacing, (((boxWidth) / 4) - ((spacing + spacing + lineName[i]).length))) + spacing + ":" + spacing + lineStat[i] + _.repeat(spacing, (((boxWidth) / 4) - ((spacing + spacing + lineStat[i]).length))) + spacing + vbar + "\n";
        }
        cpuStats = cpuStats + leftBottomCorner + _.repeat(hBar, (boxWidth / 2) + 1 + addSpace) + rightBottomCorner;
        
        
        // ================== Build up Room stats ===============================
        
        title = statsTitle;            // Name of Stats block
        let gclProgress = Game.gcl.progress;
        if (gclProgress < 10) {
            gclProgress = 2
        }
        let secondLineName = ["GCL" + (Game.gcl.level + 1) + " - " + ((gclProgress / Game.gcl.progressTotal) * 100).toFixed(0) + "%"];
        let secondLineStat = [((gclProgress / Game.gcl.progressTotal) * 100).toFixed(2) + percent];
        if (useProgressBar === "yes") {
            secondLineStat = [_.repeat(progressBar, ((gclProgress / Game.gcl.progressTotal) * (boxWidth / 4 - 2)))];
        }
        
        
        for (let roomKey in rooms) {
            if (!rooms.hasOwnProperty(roomKey)) {
                continue;
            }
            let room = Game.rooms[roomKey];
            let isMyRoom = (room.controller ? room.controller.my : 0);
            if (isMyRoom) {
                secondLineName = secondLineName.concat(["Room"]);
                secondLineName = secondLineName.concat(["Energy Capacity"]);
                if (room.controller.level < 8) {
                    secondLineName = secondLineName.concat(["Controller Progress"]);
                }
                
                
                secondLineStat = secondLineStat.concat([room.name]);
                if (useProgressBar === "yes") {
                    let progress = ((room.energyAvailable / room.energyCapacityAvailable) * 100).toFixed(0) + percent;
                    if (percentInProgressBar === "yes"){
                        let progressBarLength = (room.energyAvailable / room.energyCapacityAvailable) * (boxWidth / 4 - 2);
                        if (progressBarLength + 2 > progress.length){
                            secondLineStat = secondLineStat.concat([progressBar + spacing + progress + spacing + _.repeat(progressBar, progressBarLength - (progress.length + 3))]);
                        }else{
                            secondLineStat = secondLineStat.concat([_.repeat(progressBar, progressBarLength)]);
                        }
                    }else{
                        secondLineStat = secondLineStat.concat([_.repeat(progressBar, ((room.energyAvailable / room.energyCapacityAvailable) * (boxWidth / 4 - 2)))]);
                    }
                } else {
                    secondLineStat = secondLineStat.concat([((room.energyAvailable / room.energyCapacityAvailable) * 100).toFixed(2) + percent]);
                }
                if (room.controller.level < 8) {
                    let progress = ((room.controller.progress / room.controller.progressTotal) * 100).toFixed(0) + percent;
                    if (useProgressBar === "yes") {
                        if (percentInProgressBar === "yes"){
                            let progressBarLength = (room.controller.progress / room.controller.progressTotal) * (boxWidth / 4 - 2);
                            if (progressBarLength + 2 > progress.length){
                                secondLineStat = secondLineStat.concat([progressBar + spacing + progress + spacing + _.repeat(progressBar, progressBarLength - (progress.length + 3))]);
                            }else{
                                secondLineStat = secondLineStat.concat([_.repeat(progressBar, progressBarLength)]);
                            }
                        }else{
                            secondLineStat = secondLineStat.concat([_.repeat(progressBar, ((room.controller.progress / room.controller.progressTotal) * (boxWidth / 4 - 2)))]);
                        }
                    } else {
                        secondLineStat = secondLineStat.concat([progress]);
                    }
                }
                
                if (room.storage) {
                    secondLineName = secondLineName.concat(["Stored Energy"]);
                    secondLineStat = secondLineStat.concat([room.storage.store[RESOURCE_ENERGY]].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                } else {
                    secondLineName = secondLineName.concat(["Stored Energy"]);
                    secondLineStat = secondLineStat.concat(["0"]);
                }
            } else {
                // not my room
            }
        }
        
        let Stats = leftTopCorner + _.repeat(hBar, (((boxWidth / 4) + 3 - (spacing + title + spacing).length))) + spacing + title + spacing + _.repeat(hBar, ((boxWidth / 4) + 3 - (title).length) + addSpace) + rightTopCorner + "\n";
        for (let i = 0; i < secondLineName.length && i < secondLineStat.length; i++) {
            if (addLinks == "yes" && secondLineName[i] == "Room") {
                Stats = Stats + vbar + spacing + secondLineName[i] + spacesToEnd((spacing + addSpace + secondLineName[i]).toString(), (boxWidth / 4)) + ":" + spacing + `<a href="#!/room/${ secondLineStat[i] }">${ secondLineStat[i] }</a>` + spacesToEnd((spacing + secondLineStat[i]).toString(), (boxWidth / 4)) + spacing + vbar + "\n";
            } else {
                Stats = Stats + vbar + spacing + secondLineName[i] + spacesToEnd((spacing + addSpace + secondLineName[i]).toString(), (boxWidth / 4)) + ":" + spacing + secondLineStat[i] + spacesToEnd((spacing + secondLineStat[i]).toString(), (boxWidth / 4)) + spacing + vbar + "\n";
            }
        }
        Stats = Stats + leftBottomCorner + _.repeat(hBar, (boxWidth / 2) + 1 + addSpace) + rightBottomCorner;
        
        
        // ============= Now we combine both ==============
        
        // Trying to make the tables appear on the same row?
        let outputCpu = cpuStats.split("\n");
        let outputStats = Stats.split("\n");
        let output = "";
        
        if (outputCpu.length == outputStats.length) {
            for (let i = 0; i < outputCpu.length && i < outputStats.length; i++) {
                output = output + outputCpu[i] + " " + outputStats[i] + "\n";
            }
        } else if (outputCpu.length > outputStats.length) {
            for (let i = 0; i < outputCpu.length; i++) {
                if (outputStats.length <= i) {
                    output = output + outputCpu[i] + " " + _.repeat(" ", (boxWidth / 2) + 3 + addSpace) + "\n";
                } else {
                    output = output + outputCpu[i] + " " + outputStats[i] + "\n";
                }
            }
        } else if (outputCpu.length < outputStats.length) {
            for (let i = 0; i < outputStats.length; i++) {
                if (outputCpu.length <= i) {
                    output = output + _.repeat(" ", (boxWidth / 2) + 3 + addSpace) + " " + outputStats[i] + "\n";
                } else {
                    output = output + outputCpu[i] + " " + outputStats[i] + "\n";
                }
            }
        }
        let style = {
            lineHeight: '1'
        };
        let styleStr = _.reduce(style, (l, v, k) => `${l}${_.kebabCase(k)}: ${v};`, '');
        output = `<span style="${styleStr}">${output}</span>`;
        return output;
    },
    geohash: function () { // Get creep location and save as geohash
        var geohash = require("geohash");
        var geohashArray = undefined;
        for (let creep in Game.creeps) {
            if (!Game.creeps.hasOwnProperty(creep)) {
                continue;
            }
            if (creep !== undefined) {
                let thisRoom = Game.creeps[creep].pos.roomName;
                let strBuild = "";
                for (let i = 0, len = thisRoom.length; i < len; i++) {
                    let j = "";
                    if (thisRoom.charAt(i) == "E") {
                        j = "+";
                    } else if (thisRoom.charAt(i) == "W") {
                        j = "-";
                    } else if (thisRoom.charAt(i) == "N") {
                        j = "." + Game.creeps[creep].pos.x + ",+";
                    } else if (thisRoom.charAt(i) == "S") {
                        j = "." + Game.creeps[creep].pos.x + ",-";
                    } else {
                        j = thisRoom.charAt(i);
                    }
                    strBuild = strBuild + j;
                }
                let y = "." + Game.creeps[creep].pos.y;
                
                strBuild = strBuild + y;
                var geoHash = _.words(strBuild, /[^,]+/g);
                var ghash = geohash(geoHash[0], geoHash[1]);
                //console.log(strBuild); // shows +41.32,-6.7
                
                // You can use this bit if you want to output +41.32,-6.7 like coordinates
                //lat = geoHash[0];
                //lng = geoHash[1];
                geohashArray.concat(ghash);
            }
        }
        return geohashArray;
    },
    log: function (message, severity = 3) {
        
        Memory.stats.logs.push([Game.time + ": " + message, severity]);
    },
    /**
     * Return string with a bounding box around the array with severity info.
     *
     * @param {Object} logs.[][] - Optional log input from your own array, example: logs.push(["Creep Done!",3]);
     * @param {Object} opts - object that contains the following settings example: {totalWidth: 100,useProgressBar: true,cpuTitle: "CPU"}
     * @param {number} opts.width - total chart width [100]
     * @param {number} opts.title - []
     * @param {number} opts.leftTopCorner - []
     * @param {number} opts.rightTopCorner - []
     * @param {number} opts.leftBottomCorner - []
     * @param {number} opts.rightBottomCorner - []
     * @param {number} opts.hBar - []
     * @param {number} opts.vBar - []
     * @param {number} opts.spacing - []
     *
     * @return {String}
     * @api public
     */
    displayLogs: function (logs = Memory.stats.logs, opts = {}) {
        
        let totalWidth = opts.width || 100;
        let title = opts.title || " Logs ";
        let leftTopCorner = opts.leftTopCorner || "+";
        let rightTopCorner = opts.rightTopCorner || "+";
        let leftBottomCorner = opts.leftBottomCorner || "+";
        let rightBottomCorner = opts.rightBottomCorner || "+";
        let hBar = opts.hBar || "-";
        let vbar = opts.vBar || "|";
        let spacing = opts.spacing || " ";
        
        let boxHeight = logs.length - 1;
        let boxWidth = totalWidth - 3; // Inside of the box
        let borderWidth = 5;
        
        let addSpace = 0;
        if (!(boxWidth % 2 === 0)) {
            addSpace = 1;
        }
        var colors = {
            '5': '#ff0066',
            '4': '#e65c00',
            '3': '#809fff',
            '2': '#999999',
            '1': '#737373',
            '0': '#666666',
            'highlight': '#ffff00',
        };
        
        
        var outputLog = leftTopCorner + hBar.repeat(((boxWidth - title.length) / 2)) + title + hBar.repeat(((boxWidth - title.length) / 2) + addSpace) + rightTopCorner + "\n";
        for (let i = 0; i < boxHeight; i++) { // Y coordinate |
            let severity = Memory.stats.logs[i][0, 1];
            let message = Memory.stats.logs[i][0, 0];
            //let htmlFontStartHighlight = "<font color='" + colors['highlight'] + "' type='highlight'>";
            //let htmlFontStart = "<font color='" + colors[severity] + "' severity='" + severity + "'>";
            let htmlFontStart = "<log severity=\"" + severity + "\"><span style='color: " + colors[severity] + "' severity='" + severity + "'><log severity=\"" + severity + "\">";
            let htmlStart = "<log severity=\"" + severity + "\"><span style='color: " + colors[severity] + "' severity='" + severity + "'><log severity=\"" + severity + "\">";
            //let htmlEnd = "</font>";
            let htmlEnd = "</span></log>";
            
            /*            let htmlFontStart = "<log severity=" + severity + ">";
             let htmlStart = "<log severity=" + severity + ">";
             //let htmlEnd = "</font>";
             let htmlEnd = "</log>";*/
            
            
            if (severity > 5) {
                seveirty = 5;
            } else if (severity < 0) {
                severity = 0;
            } else if (!Number.isInteger(severity)) {
                severity = 3;
            } /*else if (severity == "highlight") {
             htmlStart = htmlFontStartHighlight;
             }*/ else {
                htmlStart = htmlFontStart;
            }
            
            if (message.length > boxWidth) { // message is longer than boxWidth
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message.substring(0, boxWidth - borderWidth) +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message.substring(boxWidth - borderWidth) +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
            } else if (message.length > boxWidth * 2) { // message is longer than boxWidth * 2
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message.substring(0, boxWidth - borderWidth) +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message.substring(boxWidth - borderWidth, boxWidth * 2 - borderWidth) +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message.substring(boxWidth * 2 - borderWidth) +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
            } else { // If your message is longer that boxWidth you need to cut down on the length of your log messages.
                outputLog = outputLog +
                    vbar +
                    htmlStart +
                    message +
                    htmlEnd +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    "\n";
            }
        }
        let tick = hBar + " Tick: " + Game.time + " ";
        outputLog = outputLog + leftBottomCorner + tick + hBar.repeat(boxWidth - tick.length) + rightBottomCorner + "\n";
        let style = {
            lineHeight: '1'
        };
        let styleStr = _.reduce(style, (l, v, k) => `${l}${_.kebabCase(k)}: ${v};`, '');
        outputLog = `<span style="${styleStr}">${outputLog}</span>`;
        return outputLog;
    },
    /**
     * Workaround for the Screeps Interactive Console
     * https://github.com/screepers/screeps_console/issues/5
     *
     * @param {Object} logs.[][] - Optional log input from your own array, example: logs.push(["Creep Done!",3]);
     * @param {Object} opts - object that contains the following settings example: {totalWidth: 100,useProgressBar: true,cpuTitle: "CPU"}
     * @param {number} opts.width - total chart width [100]
     * @param {number} opts.title - []
     * @param {number} opts.leftTopCorner - []
     * @param {number} opts.rightTopCorner - []
     * @param {number} opts.leftBottomCorner - []
     * @param {number} opts.rightBottomCorner - []
     * @param {number} opts.hBar - []
     * @param {number} opts.vBar - []
     * @param {number} opts.spacing - []
     *
     * @return {boolean}
     * @api public
     */
    displayConsoleLogs: function (logs = Memory.stats.logs, opts = {}) {
        
        let totalWidth = opts.width || 100;
        let title = opts.title || " Logs ";
        let leftTopCorner = opts.leftTopCorner || "?";
        let rightTopCorner = opts.rightTopCorner || "?";
        let leftBottomCorner = opts.leftBottomCorner || "?";
        let rightBottomCorner = opts.rightBottomCorner || "?";
        let hBar = opts.hBar || "?";
        let vbar = opts.vBar || "?";
        let spacing = opts.spacing || " ";
        
        let boxHeight = logs.length - 1;
        let boxWidth = totalWidth - 3; // Inside of the box
        let borderWidth = 5;
        
        let addSpace = 0;
        if (!(boxWidth % 2 === 0)) {
            addSpace = 1;
        }
        var colors = {
            '5': '#ff0066',
            '4': '#e65c00',
            '3': '#809fff',
            '2': '#999999',
            '1': '#737373',
            '0': '#666666',
            'highlight': '#ffff00',
        };
        
        
        console.log(leftTopCorner + hBar.repeat(((boxWidth - title.length) / 2)) + title + hBar.repeat(((boxWidth - title.length) / 2) + addSpace) + rightTopCorner);
        for (let i = 0; i < boxHeight; i++) { // Y coordinate |
            let severity = Memory.stats.logs[i][0, 1];
            let message = Memory.stats.logs[i][0, 0];
            //let htmlFontStartHighlight = "<font color='" + colors['highlight'] + "' type='highlight'>";
            //let htmlFontStart = "<font color='" + colors[severity] + "' severity='" + severity + "'>";
            let htmlFontStart = "<log severity=\"" + severity + "\"><span style='color: " + colors[severity] + "' severity='" + severity + "'><log severity=\"" + severity + "\">";
            let htmlStart = "<log severity=\"" + severity + "\"><span style='color: " + colors[severity] + "' severity='" + severity + "'><log severity=\"" + severity + "\">";
            //let htmlEnd = "</font>";
            let htmlEnd = "</log>";
            
            /*            let htmlFontStart = "<log severity=" + severity + ">";
             let htmlStart = "<log severity=" + severity + ">";
             //let htmlEnd = "</font>";
             let htmlEnd = "</log>";*/
            
            
            if (severity > 5) {
                seveirty = 5;
            } else if (severity < 0) {
                severity = 0;
            } else if (!Number.isInteger(severity)) {
                severity = 3;
            } /*else if (severity == "highlight") {
             htmlStart = htmlFontStartHighlight;
             }*/ else {
                htmlStart = htmlFontStart;
            }
            
            if (message.length > boxWidth) { // message is longer than boxWidth
                console.log(htmlStart +
                    vbar +
                    message.substring(0, boxWidth - borderWidth) +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
                console.log(outputLog = outputLog +
                    htmlStart +
                    vbar +
                    message.substring(boxWidth - borderWidth) +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
            } else if (message.length > boxWidth * 2) { // message is longer than boxWidth * 2
                console.log(htmlStart +
                    vbar +
                    message.substring(0, boxWidth - borderWidth) +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
                console.log(htmlStart +
                    vbar +
                    message.substring(boxWidth - borderWidth, boxWidth * 2 - borderWidth) +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
                console.log(htmlStart +
                    vbar +
                    message.substring(boxWidth * 2 - borderWidth) +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
            } else { // If your message is longer that boxWidth you need to cut down on the length of your log messages.
                console.log(htmlStart +
                    vbar +
                    message +
                    spacing.repeat(boxWidth - message.length) +
                    vbar +
                    htmlEnd);
            }
        }
        let tick = hBar + " Tick: " + Game.time + " ";
        console.log(leftBottomCorner + tick + hBar.repeat(boxWidth - tick.length) + rightBottomCorner);
        
        return true;
    }
};

module.exports = statsConsole;
