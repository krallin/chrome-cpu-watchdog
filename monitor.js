var DEBUG = 1,
    THRESHOLD = 1,    // More isn't acceptable for extended periods
    TOLERANCE = 10,     // Number of updates we allow a process to be running above threshold (TODO: Dumb, use time.)
    WATCHED_PROCESSES_KEY = "cpu-watchdog.watchedProcesses";


function handleProcesses (processes) {

    if (DEBUG) {
        console.log("Received process status update");
        console.log(processes);
    }

    var oldWatchedProcesses,  // Mapping of process IDs to number of times it exceeded the treshold
        newWatchedProcesses = {},
        proc;

    chrome.storage.local.get(WATCHED_PROCESSES_KEY, function (items) {

        if (DEBUG) {
            console.log("items");
            console.log(items);
        }

        oldWatchedProcesses = items[WATCHED_PROCESSES_KEY] || {};

        if (DEBUG) {
            console.log("oldWatchedProcesses:");
            console.log(oldWatchedProcesses);
        }

        for (var key in processes) {
            if (!processes.hasOwnProperty(key)) {
                continue;
            }
            proc = processes[key];
            if (proc.cpu > THRESHOLD) {
                newWatchedProcesses[proc.id] = (oldWatchedProcesses[proc.id] || 0) + 1;

            }
            if (DEBUG) {
                console.log("PID %s: %s", proc.id, proc.cpu);
            }
        }

        if (DEBUG) {
            console.log("newWatchedProcesses");
            console.log(newWatchedProcesses);
        }

        var items = {};
        items[WATCHED_PROCESSES_KEY] = newWatchedProcesses;

        chrome.storage.local.set(items, function () {
            if (DEBUG) {
                console.log("Status was committed");
            }
        });
    });

    // var opt = {
    //     type: "basic",
    //     title: "Hello!",
    //     message: "Stuff",
    //     iconUrl: "icon.png"
    // }

    // chrome.notifications.create("cpu-watchdog", opt, function (notificationId) {});
}


// Register our function as a listener for process updates
chrome.processes.onUpdated.addListener(handleProcesses);
