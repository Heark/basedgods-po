/* Meteor Falls v0.10 Scripts.
    By: [VP]Blade, TheUnknownOne, Ethan
    Credit to: Max, Lutra
*/

Config = {
    // Configuration for the script.
    servername: "Based Gods",

    maintainers: ['Heark'],

    // Repo to load plugins from.
    repourl: "http://meteor-falls.github.io/Scripts/",
    // Repo to load data (announcement/description + tiers) from.
    dataurl: "http://meteor-falls.github.io/Server-Shit/",
    emotesurl: 'https://raw.githubusercontent.com/Heark/basedgods-po/master/emotes.json',

    // Plugin directory.
    plugindir: "plugins/",
    datadir: "data/",

    // Do not touch unless you are adding a new plugin.
    // Plugins to load on script load.
    plugins: ['bot', 'reg', 'ranks', 'utils', 'rtd', 'yeolde', 'channeldata', 'emotes', 'lists', 'init', 'feedmon', 'tours', 'commands', 'highlanders', 'events'],
    data: ['emoji'],

    // Whether or not to load plugins from repourl. If set to false, they will load locally.
    load_from_web: false,
    // If HTML should be stripped from channel messages outputted onto the server window.
    stripHtmlFromChannelMessages: true,
    // If emotes are enabled.
    emotesEnabled: true,
    // If custom channels are enabled
    channelsEnabled: true,
    // Character limit in messages.
    characterLimit: 600
};

(function() {
    var dir = Config.plugindir,
        datadir = Config.datadir;
    sys.makeDir(dir);
    sys.makeDir(datadir);

    require = function require(name, webcall, noCache) {
        if ((name in require.cache) && !webcall && !noCache) {
            return require.cache[name];
        }

        var __fileContent,
            __fname = dir + name + ".js",
            module, __resp;

        if (webcall) {
            __resp = sys.synchronousWebCall(Config.repourl + "plugins/" + name + ".js");
            if (!__resp || __resp.substr(0, 9) === "<!DOCTYPE") {
                throw new Error("Failed to load plugin " + name + " from " + Config.repourl + "plugins/" + name + ".js");
            }
            sys.writeToFile(__fname, __resp);
        }

        if (!sys.fileExists(__fname)) {
            throw {name: "NoFileError", toString: function () { return "Couldn't find file " + (__fname) + "."; }};
        }

        __fileContent = sys.getFileContent(__fname);

        module = {
            exports: {},
            reload: function () { return false; },
            name: name
        };

        if (name in require.cache) {
            if (require.meta[name].onUnload) {
                require.meta[name].onUnload();
            }
        }

        try {
            sys.eval("(function (module, exports) { " + __fileContent + " }(module, module.exports));", __fname);
        } catch (e) {
            sys.sendAll("Error loading module " + name + ": " + e + " on line " + e.lineNumber);
            print(e.backtracetext);
            throw e;
        }

        print("Loaded module " + name);

        require.cache[name] = module.exports;
        require.meta[name] = module;
        return module.exports;
    };

    require.reload = function require_reload(name) {
        require(name, false, false);
        return require.meta[name].reload();
    };

    if (!require.cache || (typeof FULLRELOAD === 'boolean' && FULLRELOAD === true)) {
        require.cache = {};
        require.meta  = {};
    }

    FULLRELOAD = false;

    require.callPlugins = function require_callPlugins(event) {
        var args = Array.prototype.slice.call(arguments, 1),
            plugins = this.meta,
            exports, plugin;

        for (plugin in plugins) {
            exports = plugins[plugin].exports;
            if (event in exports) {
                try {
                    exports[event].apply(exports, args);
                } catch (e) {
                    print("Plugin error (" + plugins[plugin].name + ") on line " + e.lineNumber + ": " + e);
                    print(e.backtracetext);
                }
            }
        }
    };

    var plugin, data, resp, i;

    for (i = 0; i < Config.plugins.length; i += 1) {
        plugin = Config.plugins[i];
        require(plugin, Config.load_from_web);
    }

    for (i = 0; i < Config.data.length; i += 1) {
        data = Config.data[i] + ".json";

        if (!sys.fileExists(datadir + data)) {
            resp = sys.synchronousWebCall(Config.repourl + "data/" + data);
            sys.writeToFile(datadir + data, resp);
        }
    }
}());

function poUser(id) {
    var ip = sys.ip(id);

    this.id = id;
    this.ip = ip;
    this.floodCount = 0;
    this.teamChanges = 0;
    this.caps = 0;
    this.muted = false;
    this.semuted = false;

    this.originalName = sys.name(id);
    this.loginTime = sys.time();

    // This is an array so we can track multiple emotes in their last message.
    this.lastEmote = [];
    this.lastMessage = {message: "", time: 0};
}

function poChannel(chanId) {
    this.id   = chanId;
    this.name = sys.channel(chanId);

    this.creator = '';
    this.topic   = '';
    this.setBy   = '';

    this.members = {};
    this.auth    = {};
    this.mutes   = {};
    this.bans    = {};

    this.bots     = true;
    this.isPublic = true;
}

try {
    ChannelManager = require('channeldata').manager;
} catch (ex) {
    ChannelManager = {};
    sys.sendAll("Couldn't load ChannelManager: " + ex);
}

SESSION.identifyScriptAs("Meteor Falls Script v0.10.1");
SESSION.registerUserFactory(poUser);
SESSION.registerChannelFactory(poChannel);
SESSION.refill();

var poScript;
poScript = ({
    serverStartUp: function serverStartUp() {
        startUpTime = sys.time();
        script.init();
    },
    serverShutDown: function serverShutDown() {
        Reg.saveData();
        require.callPlugins("serverShutDown");
    },
    init: function init() {
        require.reload('utils');

        require.reload('reg');
        require.reload('ranks');
        require.reload('bot');

        require.reload('yeolde');
        require.reload('rtd');

        require.reload('feedmon');
        require.reload('tours');

        require.reload('init');

        require.reload('emotes');
        require.reload('lists');

        sys.resetProfiling();
    },
    step: function () {
        if (typeof RECOVERY !== "undefined") {
            sys.callLater("RECOVERY();", 2);
        }

        if (typeof cache === 'undefined' || typeof DataHash === 'undefined') {
            return;
        }

        if (typeof stepCounter === "undefined") {
            stepCounter = 0;
        }

        stepCounter++;
		  if(stepCounter % 1 === 0){
         var date = new Date;
          var seconds = date.getSeconds();
		    var minutes = date.getMinutes();
			 var hour = date.getHours();
            var server_time = hour+":"+minutes+":"+seconds
          sys.setAnnouncement('<b><table width=\'100%\' border-color: #1871d4;\'><body style=\'background-color: qlineargradient(y1:0,x1:0,x2:1,y2:0 stop:0 orange,stop:.1 white,stop:.5 orange, stop:.9 white,stop:1 orange)\'><tr><td><br> <br><img src=\'pokemon:num=91&shiny=false\'></td><td><img src=\'pokemon:num=383-1&shiny=false\' align=left><img src=\'pokemon:num=717&shiny=false\' align=right><center><font face=\'Ketchum\' font size=\'12\'>Based Gods</font></center><hr><center>Links: <a href=\'http://fullmetal.boards.net/thread/51/based-gods-league-originally-oora\'>League Info</a> | </font><a href=\'https://pokemonshowdown.com/damagecalc/\'> Damage Calculator</a> | <a href=\'http://fullmetal.boards.net/\'>Forums</a> | <a href=\'http://fullmetal.boards.net/board/9/rate-team\'>Rate my teams</a></center><hr><center><font size=\'7\'></font></center><center>Server Time: '+server_time+'<br><td><br><img src=\'pokemon:491\' align=right></td></tr></table> </b>')

        }
        require.callPlugins("step");
    },
    warning: function warning(func, message, backtrace) {
        require.callPlugins("warning", func, message, backtrace);
    },
    beforeNewMessage: function beforeNewMessage(message) {
        require.callPlugins("beforeNewMessage", message);
    },
    afterNewMessage: function afterNewMessage(message) {
        require.callPlugins("afterNewMessage", message);
    },
    beforeServerMessage: function (message) {
        require.callPlugins("beforeServerMessage", message);
    },
    beforeChannelJoin: function beforeChannelJoin(src, channel) {
        require.callPlugins("beforeChannelJoin", src, channel);
    },
    beforeChannelDestroyed: function beforeChannelDestroyed(channel) {
        require.callPlugins("beforeChannelDestroyed", channel);
    },
    afterChannelCreated: function afterChannelCreated(chan, name, src) {
        require.callPlugins("afterChannelCreated", chan, name, src);
    },
    afterChannelJoin: function afterChannelJoin(src, chan) {
        require.callPlugins("afterChannelJoin", src, chan);
    },
    beforeLogIn: function beforeLogIn(src) {
        require.callPlugins("beforeLogIn", src);
    },
    afterLogIn: function afterLogIn(src, defaultChan) {
        require.callPlugins("afterLogIn", src, defaultChan);
    },
    beforeChangeTier: function(src, team, oldtier, newtier) {
        require.callPlugins("beforeChangeTier", src, team, oldtier, newtier);
    },
    beforeChangeTeam: function beforeChangeTeam(src) {
        require.callPlugins("beforeChangeTeam", src);
    },
    beforeChatMessage: function beforeChatMessage(src, message, chan) {
        require.callPlugins("beforeChatMessage", src, message, chan);
    },
    beforeLogOut: function beforeLogOut(src) {
        require.callPlugins("beforeLogOut", src);
    },
    afterChangeTeam: function afterChangeTeam(src) {
        require.callPlugins("afterChangeTeam", src);
    },
    beforePlayerKick: function beforePlayerKick(src, bpl) {
        require.callPlugins("beforePlayerKick", src, bpl);
    },
    beforePlayerBan: function beforePlayerBan(src, bpl, time) {
        require.callPlugins("beforePlayerBan", src, bpl, time);
    },
    beforeChallengeIssued: function beforeChallengeIssued(src, dest) {
        require.callPlugins("beforeChallengeIssued", src, dest);
    },
    /*afterPlayerAway: function afterPlayerAway(src, mode) {
    },*/
    beforeBattleMatchup: function beforeBattleMatchup(src, dest, clauses, rated, mode, team1, team2) {
        require.callPlugins("beforeBattleMatchup", src, dest, clauses, rated, mode, team1, team2);
    },
    afterBattleStarted: function afterBattleStarted(src, dest, info, id, t1, t2) {
        require.callPlugins("afterBattleStarted", src, dest, info, id, t1, t2);
    },
    afterBattleEnded: function afterBattleEnded(src, dest, desc) {
        require.callPlugins("afterBattleEnded", src, dest, desc);
    },
    afterChatMessage: function afterChatMessage(src, message, chan) {
        require.callPlugins("afterChatMessage", src, message, chan);
    },
    beforePlayerRegister: function (src) {
        Utils.watch.notify(Utils.nameIp(src) + " registered.");
    },
    battleConnectionLost: function() {
        Utils.watch.notify("Connection to the battle server has been lost.");
    }
});
