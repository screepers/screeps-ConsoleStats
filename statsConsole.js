var statsConsole = {
    
    run: function () {
        
        Memory.stats["gcl.progress"] = Game.gcl.progress;                           // Your progress to the next GCL
        Memory.stats["gcl.progressTotal"] = Game.gcl.progressTotal;                 // Your total needed to the next GCL
        Memory.stats["gcl.level"] = Game.gcl.level;                                 // Your GCL level
        Memory.stats["cpu.CreepManagers"] = Memory.profilingData["bCreepManagers"]; // The creep manager
        Memory.stats["cpu.Towers"] = Memory.profilingData["cTowers"];               // The towers
        Memory.stats["cpu.Links"] = Memory.profilingData["dLinks"];                 // The links
        Memory.stats["cpu.SetupRoles"] = Memory.profilingData["eSetupRoles"];       // The setup of your creep roles
        Memory.stats["cpu.Creeps"] = Memory.profilingData["fCreeps"];               // The creep functions
        Memory.stats["cpu.SumProfiling"] = Memory.profilingData["gSumProfiling"];   // The sum of your profiling
        Memory.stats["cpu.Start"] = Memory.profilingData["aStart"];                 // The start of your stats
        Memory.stats["cpu.bucket"] = Game.cpu.bucket;                               // That big CPU bucket in the sky
        Memory.stats["cpu.limit"] = Game.cpu.limit;                                 // Duh! Your current CPU limit
        Memory.stats["cpu.stats"] = Memory.profilingData["stats"];                  // Your stats that is gathered out side Screeps
        Memory.stats["cpu.getUsed"] = Memory.profilingData["total"];                // Total for external stats
        Memory.stats["cpu.current"] = Game.cpu.getUsed();                           // What we currently used
        
        
        // Todo: Get this mess into one array
        for (let i = 100; i > 0; i--) {                                             // Save up the last 100 CPU used stats
            if (i <= 1) {
                Memory.stats["cpu." + i] = Memory.stats["cpu.current"];
            } else {
                Memory.stats["cpu." + i] = Memory.stats["cpu." + (i - 1)];
            }
        }
        
    },
    
    displayHistogram: function () {
        
        let cpuLimit = Game.cpu.limit;
        //let cpuTotal = Game.cpu.getUsed(); // Not needed
        // ================== CPU histogram ===================
        
        // Settings for CPU histogram
        let boxHeight = 40;
        let boxWidth = 40;
        let point = ".";
        let title = " CPU (last " + boxWidth + " ticks) ";
        let corners = "+";
        let hBar = "-";
        let vbar = "|";
        let spacing = " ";
        let upperBound = cpuLimit;
        let lowerBound = 0;
        let dynamic = true;                                 // Set to false if you want this to not scale vertically
        // End of Settings
        

        for (let i = 2; i < 100; i++) {
            let lastNumber = Memory.stats["cpu." + (i - 1)];
            let firstNumber = Memory.stats["cpu." + i];
            if (firstNumber > lastNumber) {
                upperBound = firstNumber;
            } else if (firstNumber < lastNumber && dynamic) {
                lowerBound = firstNumber;
            }
        }
        
        // Todo: Maybe get this log into cpuChart
        console.log("Max: " + upperBound.toFixed(2) + ", Min: " + lowerBound.toFixed(2));
        var cpuChart = cpuChart + corners + hBar.repeat(((boxWidth - title.length) / 2)) + title + hBar.repeat(((boxWidth - title.length) / 2)) + corners + "\n";
        for (let i = boxHeight; i > 1; i--) { // Y coordinate |
            let row = "";
            let putPoint = false;
            let columnCount = 0;
            let rowCpu;
            for (let j = boxWidth; j > 1; j--) { // X coordinate ---
                let k = Memory.stats["cpu." + j];
                if (k / upperBound * boxHeight <= i && k / upperBound * boxHeight > i - 1) {
                    row = row + point;
                    putPoint = true;
                    rowCpu = k;
                } else {
                    row = row + spacing;
                }
            }
            if (putPoint) {
                columnCount++;
                cpuChart = cpuChart + vbar + row + vbar + "..." + (rowCpu).toFixed(2) + "\n";
            }
        }
        
        cpuChart = cpuChart + corners + hBar.repeat(boxWidth - 1) + corners + "\n";
        return cpuChart;
        
    },
    displayStats: function () {
        
        // Settings for Stats
        let cpuAvgCount = 10;
        let cpuAverage = 0;
        let boxWidth = 50;
        let title = " CPU ";
        let corners = "+";
        let hBar = "-";
        let vbar = "|";
        
        let spacing = " ";
        let rooms = Game.rooms;
        let spawns = Game.spawns;
        let cpuLimit = Game.cpu.limit;
        let cpuBucket = Game.cpu.bucket;
        let cpuCreepManager = Memory.stats["cpu.CreepManagers"];
        let cpuSetupRoles = Memory.stats["cpu.SetupRoles"];
        let cpuCreepActions = Memory.stats["cpu.Creeps"];
        let cpuInit = Memory.stats["cpu.Start"];
        let cpuLinks = Memory.stats["cpu.Links"];
        let cpuTowers = Memory.stats["cpu.Towers"];
        let cpuTotal = Game.cpu.getUsed();
        for (let i = cpuAvgCount; i > 0; i--) {
            cpuAverage = cpuAverage + Memory.stats["cpu." + i];
        }
        cpuAverage = cpuAverage / cpuAvgCount;
        var spacesToEnd = function (count, len) {
            return _.repeat(" ", (len - count.length));
        };
        let lineName = [
            "Usage",
            "Usage (10 ticks/10)",
            "Bucket",
            "Init",
            "Setup Roles",
            "Creep Manager",
            "Creep Actions",
            "Links",
            "Towers",
            " "
        ];
        let lineStat = [
            (((cpuTotal / cpuLimit) * 100).toFixed(2) + "%"),
            (((cpuAverage / cpuLimit) * 100).toFixed(2) + "%"),
            (cpuBucket).toFixed(0).toString(),
            (cpuInit).toFixed(0).toString(),
            (cpuSetupRoles).toFixed(0).toString(),
            (cpuCreepManager).toFixed(0).toString(),
            (cpuCreepActions).toFixed(0).toString(),
            (cpuLinks).toFixed(0).toString(),
            (cpuTowers).toFixed(0).toString(),
            " "
        ];
        // End of settings
        
        
        let cpuStats = corners + _.repeat(hBar, ((boxWidth - title.length) / 2)) + title + _.repeat(hBar, ((boxWidth - title.length) / 2)) + corners + "\n";
        for (let i = 0; i < lineName.length && i < lineStat.length; i++) {
            cpuStats = cpuStats + vbar + spacing + lineName[i] + spacesToEnd((spacing + lineName[i]).toString(), (boxWidth / 2)) + ":" + spacing + lineStat[i] + spacesToEnd((spacing + lineStat[i]).toString(), (boxWidth / 2)) + vbar + "\n";
        }
        cpuStats = cpuStats + corners + _.repeat(hBar, boxWidth + 1) + corners;
        
        
        
        // ================== Build up Room stats ===============================
        
        title = "Stats";            // Name of Stats block
        
        let secondLineName = ["GCL"];
        let secondLineStat = [((Game.gcl.progress / Game.gcl.progressTotal) * 100).toFixed(2) + "%"];
        let dIndex = 0;
        for (let spawnKey in spawns) {
            let spawn = Game.spawns[spawnKey];
            dIndex = dIndex + spawn.memory["defenderIndex"];
        }
        secondLineName = secondLineName.concat(["Defender Index"]);
        secondLineStat = secondLineStat.concat([dIndex]);
        for (let roomKey in rooms) {
            let room = Game.rooms[roomKey];
            let isMyRoom = (room.controller ? room.controller.my : 0);
            if (isMyRoom) {
                secondLineName = secondLineName.concat(["Room"]);
                secondLineName = secondLineName.concat(["Energy Capacity"]);
                secondLineName = secondLineName.concat(["Controller Progress"]);
                
                secondLineStat = secondLineStat.concat([room.name]);
                secondLineStat = secondLineStat.concat([((room.energyAvailable / room.energyCapacityAvailable) * 100).toFixed(2) + "%"]);
                secondLineStat = secondLineStat.concat([((room.controller.progress / room.controller.progressTotal) * 100).toFixed(2) + "%"]);
                
                if (room.storage) {
                    secondLineName = secondLineName.concat(["Stored Energy"]);
                    secondLineStat = secondLineStat.concat([room.storage.store[RESOURCE_ENERGY]]);
                } else {
                    secondLineName = secondLineName.concat(["Stored Energy"]);
                    secondLineStat = secondLineStat.concat(["0"]);
                }
            } else {
                // not my room
            }
        }
        
        let Stats = corners + _.repeat(hBar, ((boxWidth - (spacing + title).length) / 2)) + spacing + title + spacing + _.repeat(hBar, ((boxWidth - (spacing + title).length) / 2)) + corners + "\n";
        for (let i = 0; i < secondLineName.length && i < secondLineStat.length; i++) {
            Stats = Stats + vbar + spacing + secondLineName[i] + spacesToEnd((spacing + secondLineName[i]).toString(), (boxWidth / 2)) + ":" + spacing + secondLineStat[i] + spacesToEnd((spacing + secondLineStat[i]).toString(), (boxWidth / 2)) + vbar + "\n";
        }
        Stats = Stats + corners + _.repeat(hBar, boxWidth + 1) + corners;
        
        
        // ============= Now we combine both ==============
        
        // Trying to make the tables appear on the same row?
        let outputCpu = cpuStats.split("\n");
        let outputStats = Stats.split("\n");
        let output = "";

        if (outputCpu.length == outputStats.length) {
            for (let i = 0; i < outputCpu.length && i < outputStats.length; i++) {
                output = output + outputCpu[i] + " " + outputStats[i] + "\n";
            }
        }
        
        return output;
    },
    geohash: function () { // Get creep location and save as geohash
        var geohash = require("geohash");
        var geohashArray = undefined;
        for (let creep in Game.creeps) {
            if (creep != undefined) {
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
    }
};

module.exports = statsConsole;
