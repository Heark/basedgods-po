/* Based Gods Server Scripts.
    By: [VP]Blade, TheUnknownOne, Ethan, Heark
    Credit to: Max, Lutra
*/

Config = {
    // Configuration for the script.
    servername: "Based Gods",

    maintainers: ['Heark', '[ᴠᴘ]ʙʟᴀᴅᴇ'],

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
step: function() {
        if (typeof stepCounter === "undefined") {
            stepCounter = 0;
        }

        stepCounter++;

        if (stepCounter % 1 === 0) {
            var steam_name;
            var steam_score;
                steam_name = sys.getFileContent("plugins/name.txt")
                steam_score = sys.getFileContent("plugins/score.txt")
            
            var d = new Date;
            var hour = d.getHours() == 0 ? 12 : (d.getHours() > 12 ? d.getHours() - 12 : d.getHours());
            var min = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes();
            var ampm = d.getHours() < 12 ? 'AM' : 'PM';
            var server_time = hour + ':' + min + ' ' + ampm;

            sys.setAnnouncement('<b><table width=100% border-color: \'#fffff\';\'><body style=\'background-color: qlineargradient(y1:0,x1:0,x2:1,y2:0 stop:0 orange,stop:.1 white,stop:.5 orange, stop:.9 white,stop:1 orange)\'><tr><td><br> <br><img src=\'pokemon:num=91&shiny=false\'></td><td><img src=\'pokemon:num=383-1&shiny=false\' align=left><img src=\'pokemon:num=717&shiny=false\' align=right><center><font face=\'Ketchum\' font size=\'12\'>Based Gods</font></center><hr><center>Links: <a href=\'http://fullmetal.boards.net/thread/51/based-gods-league-originally-oora\'>League Info</a> | </font><a href=\'https://pokemonshowdown.com/damagecalc/\'> Damage Calculator</a> | <a href=\'http://fullmetal.boards.net/\'>Forums</a> | <a href=\'http://fullmetal.boards.net/board/9/rate-team\'>Rate my teams</a> | <a href=\'http://fullmetal.boards.net/thread/53/based-tiers?page=1&scrollTo=111 \'> Based Tiers!</a> | <a href=\'http://basedmod.no-ip.org/index.html\'>Based Mod Download</a> | <a href=\'http://fullmetal.boards.net/thread/56/steamroller \'>Steamroller Rules!</a> | </center><hr><center><font size=\'7\'></font></center><center>Server Time: ' + server_time + '<br><a href="http://www.basedgods.co.nr">Showdown Server!</a><center>Current Steamroller: ' + steam_name + '<center> Score: ' + steam_score + '</center></center><td><br><img src=\'pokemon:491\' align=right></td></tr></table> </b>')
}
        
        if (stepCounter % 900 === 0) {
            var users = ["±Flippy", "±Random Guy", "±Glorious Prostitute", "±Elderly Pedophile", "±Omar", "±Harry Pothead", "±Infamous Sex Addict", "±Friendly Drug Dealer", "±Attractive Carsalesman", "±Drunken Nana", "±Pregnant Suicidal Teen", "±Fleece Johnson", "±Wrong Caller ID", "±Ebola Stricken Cowboy", "±Below Average IQ Waitress"]
            var random_name = users[Math.floor(Math.random() * users.length)];
            var messages = ["I'll slap you so hard, even google won't be able to find you.", "It's your birthday? Well merry thanksgiving easter bunny.", "All my life I thought air was free, until I bought a bag of crisps.", "Hey I'll be back in 5 minutes, but if i'm not, just read this message again.", "Deja Poo, that feeling that you've heard this shit before.", "You call me fat!? Oh hell no, hold my cake.", "When I die, I want my last words to be: I left a million dollars under the...", "The worst thing about eating an entire block of cheese by yourself... is everything I just said.", "Roads? Where we're going we don't need roads.", "What does a nosey pepper do?  Get jalapeno business!", "What do you call a fake noodle? An impasta.", "I hate when people say age ain't nothing but a number, age is clearly a word.", "Shout out to all the bathroom models, make sure you charge your phone and windex your mirror before your next photoshoot.", "If you ain't got no money take yo broke ass home."]
            var random_message = messages[Math.floor(Math.random() * messages.length)];
            var waitress_message = "Would you like a table?"
            var me_name = "±Based Insider"
            var me_message = "No not at all, I came here to sit on the floor. Carpet for 5 please."
            if (random_name == "±Omar") {
                random_message = "I'm coming."
            }
            var col1 = +Math.floor(Math.random() * 9) + 1
            var col2 = +Math.floor(Math.random() * 9) + 1
            var col3 = +Math.floor(Math.random() * 9) + 1
            var col4 = +Math.floor(Math.random() * 9) + 1
            var col5 = +Math.floor(Math.random() * 9) + 1
            var col6 = +Math.floor(Math.random() * 9) + 1
            var random_colour = "#" + col1 + "" + col2 + "" + col3 + "" + col4 + "" + col5 + "" + col6;
            if (random_name == "±Below Average IQ Waitress") {
                sys.sendHtmlAll("<i><font color=" + random_colour + "><timestamp/><b>" + random_name + ":</b> " + waitress_message + "</i></font>", 0);
                sys.sendHtmlAll("<i><font color=" + random_colour + "><timestamp/><b>" + me_name + ":</b> " + me_message + "</i></font>", 0);

            } else {
                sys.sendHtmlAll("<i><font color=" + random_colour + "><timestamp/><b>" + random_name + ":</b> " + random_message + "</i></font>", 0);
            }
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
