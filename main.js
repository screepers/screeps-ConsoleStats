
// Add this bit to the end of your main.js
statsConsole.run(); // Run Stats collection
if ((Game.time % 10) === 0) {
    //console.log(statsConsole.displayHistogram());
    console.log(statsConsole.displayStats());
    
    //Memory.stats["geohash"] = statsConsole.geohash();
    totalTime = (Game.cpu.getUsed() - totalTime);
    console.log("Time to Draw: " + totalTime);
}
