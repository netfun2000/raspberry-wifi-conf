var async               = require("async"),
    wifi_manager        = require("../app/wifi_manager")(),
    dependency_manager  = require("../app/dependency_manager")(),
    config              = require("../config.json");

/*****************************************************************************\
    1. Check for dependencies
    2. Check to see if we are connected to a wifi AP
    3. If connected to a wifi, do nothing -> exit
    4. Convert RPI to act as a AP (with a configurable SSID)
    5. Host a lightweight HTTP server which allows for the user to connect and
       configure the RPIs wifi connection. The interfaces exposed are RESTy so
       other applications can similarly implement their own UIs around the
       data returned.
    6. Once the RPI is successfully configured, reset it to act as a wifi
       device (not AP anymore), and setup its wifi network based on what the
       user picked.
    7. At this stage, the RPI is named, and has a valid wifi connection which
       its bound to, reboot the pi and re-run this script on startup.
\*****************************************************************************/
async.series([

    // 1. Check if we have the required dependencies installed
    function test_deps(next_step) {
        dependency_manager.check_deps({
            "binaries": ["dhcpd", "hostapd", "iw"],
            "files":    ["/etc/init.d/isc-dhcp-server"]
        }, function(error) {
            if (error) console.log(" * Dependency error, did you run `sudo npm run-script provision`?");
            next_step(error);
        });
    },

    // 3. Turn RPI into an access point
    function enable_rpi_ap(next_step) {
        wifi_manager.enable_ap_mode(config.access_point.ssid, function(error) {
            if(error) {
                console.log("... AP Enable ERROR: " + error);
            } else {
                console.log("... AP Enable Success!");
            }
            next_step(error);
        });
    },
], function(error) {
    if (error) {
        console.log("ERROR: " + error);
    }
});