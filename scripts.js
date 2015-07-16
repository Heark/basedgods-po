/*      
    TheUnknownOne's Server Script (https://github.com/TheUnknownOne/PO-Server-Tools) @ v2.6.4
    
    By TheUnknownOne (https://github.com/TheUnknownOne/)
    License: MIT
    
    Special Thanks to Lutra, Intel_iX, Lamperi, coyotte508 & Mystra
    Default styles & rank icons partially by Lutra, Intel_iX & person6445

    Tested on PO v2.1.0
*/

// Source: https://github.com/TheUnknownOne/PO-Server-Tools/blob/master/src/scripts.js
/*jslint continue: true, es5: true, evil: true, forin: true, plusplus: true, sloppy: true, vars: true, regexp: true, newcap: true, nomen: true*/
/*global sys, SESSION, script: true, Qt, print, gc, version,
    Config: true*/

var Config = {
    Mafia: {
        norepeat: 3,
        stats_file: "MafiaStats.txt",
        max_name_length: 16
    },

    DWAbilityCheck: true,
    AutoChannelJoin: true,
    WelcomeMessages: false,
    FixChallenges: false,
    NoCrash: false,
    AdminsCanAuth: true,

    ClearLogsAt: 36700160, /** NO LONGER WORKING ON v2 **/
    HighPermission: {
        "This gives Administrator Auth to a Moderator.": [1, 2],
        "Don't forget the commas and collons.": [1, 2]
    }
};

/** Beyond this, you should not edit anything if you don't know what you're doing! **/


var EvaluationTimeStart = new Date().getTime(); /** Do not modify this! This is only to calculate load speed! **/
var Version = "2.6.4";
var ScriptURL = "https://raw.github.com/TheUnknownOne/PO-Server-Tools/master/scripts.js";
var CommitDataURL = "http://github.com/api/v2/json/commits/list/TheUnknownOne/PO-Server-Tools/master/scripts.js";
var IP_Resolve_URL = "http://ip2country.sourceforge.net/ip2c.php?ip=%1"; /* This URL will get formatted. %1 is the IP */

/** RECOVERY **/
var RECOVERY_BACKUP = {};

// Script globals
var Bot, html_escape, DataHash, hpAuth, AutoMute, WatchPlayer, cache, DefaultChannels, Tours, cData, isEmpty, player, JSESSIONInst, JSESSION, updateProto, hasTeam, TOUR_BORDER, getTimeString, toOn, Grammar, objLength, style, validTier, cmp, startupTime, StartUp, run, servername, poGlobal, loadOldPoll, Poll, WatchEvent, scriptchannel, staffchannel, Clantag, ClanTag, removespaces, ScriptLength, Prune, watch, mafiachan, WatchChannelEvent, RECOVERY, stepCounter, AutoStartTours, mafia, ChannelsAllowed, permission, unicodeAbuse, sendFailWhale, playerscache, testNameKickedPlayer, botAllExcept, startUpTime, maxPlayersOnline, putInMultipleChannels, format, ify, ChatColorRandomizers, motd, ScriptUpdateMessage, isHost, kick, AutoKick, stringToTime, disconnectAll, MaxMessageLength, silence, sendSTFUTruck, UseIcons, Icons, MessageEditor, hasCommandStart, RandFont, ignoreCommandStart, PointerCommands, Command_Templater, UserName, ModName, AdminName, OwnerName, Templater, evallock, sortHash, pokedex, playerInfo, implock, CommandsEnabled, InvisName, ChanUser, ChanMod, ChanAdmin, ChanOwner, Tour0, Tour1, ChanTour0, ChanTour1, FutureLimit, sendAuthLength, Table_Templater, testMafiaChat, formatPoke, AttackingMoves, CommandStats, IconManager, sendAuth, StyleManager, noPermission, lastName, BORDER, ChatColorRandomizer, DisableChatColorRandomizer, putInAuthChan, TourDisplay, self, rangeIP, ban, massKick, on, kickFromChannel, millitime, BattlesAllowed, bannedGSCSleep, bannedGSCTrap, TierBans, idsOfIP, aliasKick, authToString, Template, pokeNatures, lcpokemons, dwpokemons, breedingpokemons, fonts, checkForUpdates, updateChecking, randcolor, RandomColorSpan, AuthIMG, GlobalHostVar, auths, authByLevel, fancyJoin, clauseList, cap, isNonNegative, html_strip, regexp_escape, sendChanError, createFile, Poke_Data, formatStat, statsOf, formatStatsOf, movesOf, evosOf, formatEvosOf, formatMovesOf, baseStatTotal, formatBaseStatTotal, pokeType, firstGen, pokeAbilities, pokeGender, updateProtoForJSESSION, CacheInst, poGlobal;

(function () {
    var x;
    
    if (typeof script !== "undefined") {
        for (x in script) {
            RECOVERY_BACKUP[x] = script[x];
        }
    }
}());

/** DEFAULT VALUES **/
if (typeof Bot === "undefined") {
    Bot = {
        bot: "~Server~",
        botcolor: "red"
    };
}

/** BOTS **/
function botMessage(src, message, channel) {
    if (typeof Bot === "undefined") {
        return;
    }

    var color = Bot.botcolor,
        name = Bot.bot;

    if (typeof channel !== "undefined") {
        sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/><b>" + name + ":</i></b></font> " + message, channel);
    } else {
        sys.sendHtmlMessage(src, "<font color='" + color + "'><timestamp/><b>" + name + ":</i></b></font> " + message);
    }
}

function botEscapeMessage(src, message, channel) {
    botMessage(src, html_escape(message), channel);
}

function botAll(message, channel) {
    if (typeof Bot === 'undefined') {
        return;
    }

    var color = Bot.botcolor,
        name = Bot.bot;

    if (typeof channel !== "undefined") {
        sys.sendHtmlAll("<font color='" + color + "'><timestamp/><b>" + name + ":</i></b></font> " + message, channel);
    } else {
        sys.sendHtmlAll("<font color='" + color + "'><timestamp/><b>" + name + ":</i></b></font> " + message);
    }
}

function botEscapeAll(message, channel) {
    botAll(html_escape(message), channel);
}

function teamAlert(src, team, message) {
    botMessage(src, "Team #" + (team + 1) + ": " + message);
}

/** Invalid Command Messages **/
function invalidCommandMessage(src, command, chan) {
    botEscapeMessage(src, "The command " + command + " doesn't exist.", chan);
}

function noPermissionMessage(src, command, chan) {
    botEscapeMessage(src, "You may not use the " + command + " command.", chan);
}

function FormatError(mess, e) {
    if (typeof mess !== "string") {
        mess = "";
    }

    var lastChar = mess[mess.length - 1],
        lineData = "";
    if (mess !== "" && lastChar !== "." && lastChar !== "!" && lastChar !== "?" && lastChar !== ":") {
        mess += ".";
    }

    if (typeof e.toLowerCase !== 'undefined') { /** when throw is used **/
        return mess + " Custom Error: " + e;
    }

    if (e.lineNumber !== 1) {
        lineData = " on line " + e.lineNumber;
    }

    var name = e.name,
        msg = e.message,
        str = name + lineData + ": " + msg;

    lastChar = msg[msg.length - 1];

    if (lastChar !== "." && lastChar !== "?" && lastChar !== ":" && lastChar !== "!") {
        str += ".";
    }

    return mess + " " + str;
}

function ChannelLink(channel) {
    if (sys.channelId(channel) === undefined) {
        return "";
    }

    return "<a href='po:join/" + channel + "'>#" + channel + "</a>";
}

function ChannelNames() {
    var channelIds = sys.channelIds(),
        channelNames = [],
        x;

    for (x in channelIds) {
        channelNames.push(sys.channel(channelIds[x]));
    }

    return channelNames;
}

function addChannelLinks(str) {
    var channelNames = ChannelNames(),
        exp,
        i,
        nameslength = channelNames.length;

    for (i = 0; i < nameslength; i++) {
        exp = new RegExp("#" + channelNames[i], "gi");
        str = str.replace(exp, "<a href='po:join/" + channelNames[i] + "'>" + channelNames[i] + "</a>");
    }

    return str;
}

function capsMessage(mess) {
    return (/[QWERTYUIOPASDFGHJKLZXCVBNM]/).test(mess);
}

function normalLetter(l) {
    return (/[qwertyuiopasdfghjklzxcvbnm]/).test(l);
}

function fileLen(file) {
    return sys.getFileContent(file).length;
}

function sTB(bytes) {
    var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i;
    if (bytes === 0) {
        return '0 bytes';
    }
    i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) {
        return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function POUser(id) {
    var my_name = sys.name(id),
        mn_lc = my_name.toLowerCase(),
        date = +sys.time();
    if (my_name === undefined) {
        return;
    }

    this.id = id;
    this.impersonation = undefined;
    this.ip = sys.ip(id);
    this.name = my_name;
    this.lowername = mn_lc;
    this.lastMsg = 0;
    this.loginTime = date;
    this.lastChallenge = 0;
    this.floodCount = 0;
    this.caps = 0;
    this.lastFuture = 0;
    this.isAutoAFK = false;
    this.teamChanges = 0;

    if (typeof DataHash === "undefined" || typeof DataHash.voices === "undefined") { /* Shouldn't matter. */
        return;
    }

    var dh = DataHash;

    var d = dh.mutes;
    this.muted = d.has(this.ip);

    this.megauser = dh.megausers.has(mn_lc);

    var i = dh.rankicons;

    if (i.has(mn_lc)) {
        this.icon = i[mn_lc];
    }

    i = dh.voices;
    this.voice = i.has(mn_lc);

    i = dh.macros;
    this.macro = ["%m1", "%m2", "%m3", "%m4", "%m5"];

    if (i.has(mn_lc)) {
        this.macro = i[mn_lc];
    }
}

POUser.prototype.addFlood = function () {
    if (typeof hpAuth === 'undefined' || hpAuth(this.id) < 1) {
        this.floodCount++;
        sys.callLater('JSESSION.users(' + this.id + ').floodCount--', 6);
    }
};

POUser.prototype.capsMute = function (message, channel) {
    if (typeof hpAuth !== 'undefined' && hpAuth(this.id) > 0) {
        return false;
    }

    if (typeof AutoMute !== 'undefined' && !AutoMute) {
        return false;
    }

    var newCapsAmount = 0,
        z;
    for (z in message) {
        if (capsMessage(message[z])) {
            newCapsAmount += 1;
        } else {
            newCapsAmount -= 1;
        }
        if (newCapsAmount < 0) {
            newCapsAmount = 0;
        }
    }

    if (this.caps >= 70) {
        WatchPlayer(this.id, "CAPS Mute Message", message, channel);
        botAll(this.name + " was muted for 5 minutes for spamming caps!", channel);

        var bantime = 60 * 5;
        var thetime = +sys.time() + bantime;

        DataHash.mutes[this.ip] = {
            by: Bot.bot + "</i>",
            why: "Spamming caps.",
            "ip": this.ip,
            time: thetime
        };
        cache.write("mutes", JSON.stringify(DataHash.mutes));

        this.caps = 0;
        this.muted = true;
        return true;
    }

    return false;
};

function POChannel(id) {
    this.name = sys.channel(id);
    this.id = id;

    this.chanAuth = {};
    this.tourAuth = {};
    this.creator = '';
    this.topic = 'Welcome to ' + this.name + '!';
    this.topicsetter = '';
    this.toursEnabled = false;

    if ((typeof DefaultChannels !== "undefined" && DefaultChannels.indexOf(id) !== -1) || typeof DefaultChannels === "undefined") {
        this.perm = true;
        this.tour = new Tours(this.id);
        this.toursEnabled = true;
    } else {
        this.perm = false;
    }

    this.private = false;
    this.defaultTopic = true;
    this.silence = 0;

    this.banlist = {};
    this.mutelist = {};

}

POChannel.prototype.giveTourAuth = function (name) {
    var toLower = name.toLowerCase();

    if (this.tourAuth.has(toLower)) {
        return;
    }

    this.tourAuth[toLower] = {
        'name': name.name()
    };

    if (typeof cData === 'undefined') {
        return;
    }

    cData.changeTourAuth(this.id, this.tourAuth);
};

POChannel.prototype.takeTourAuth = function (name) {
    var toLower = name.toLowerCase();

    if (!this.tourAuth.has(toLower)) {
        return;
    }

    delete this.tourAuth[toLower];

    if (typeof cData === 'undefined') {
        return;
    }

    cData.changeTourAuth(this.id, this.tourAuth);
};

POChannel.prototype.changeTopic = function (src, topic, fullCommand) {
    if (isEmpty(topic)) {
        if (this.topic === '') {
            botMessage(src, "There is no topic.", this.id);
            return;
        }

        botEscapeMessage(src, "Topic: " + this.topic, this.id);

        if (this.topicsetter !== '') {
            botEscapeMessage(src, "Set by: " + this.topicsetter, this.id);
        }

        if (this.defaultTopic) {
            botMessage(src, "This is a default topic.", this.id);
        }

        return;
    }

    if (!this.isChanMod(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    var me = sys.name(src),
        mePlayer = player(me);

    if (topic.toLowerCase() === "default") {
        this.topic = "Welcome to " + this.name + "!";
        this.defaultTopic = true;
        this.topicsetter = '';
    } else {
        this.topic = topic;
        this.topicsetter = me;
        this.defaultTopic = false;
    }

    botAll("The topic was changed by " + mePlayer + " to: " + this.topic, this.id);
    return;
};

POChannel.prototype.changeAuth = function (name, newauth) {
    var nh;
    if (typeof name === "number") {
        nh = sys.name(name).toLowerCase();
    } else {
        nh = name.toLowerCase();
    }

    if (newauth === 0 && this.chanAuth.has(name)) {
        delete this.chanAuth[nh];
        return;
    }

    this.chanAuth[nh] = newauth;
};

POChannel.prototype.canIssue = function (src, tar) {
    if (typeof hpAuth === 'undefined') {
        return false;
    }

    var selfName = sys.name(src),
        targetName = sys.name(tar),
        srcID = src;

    if (typeof src === 'string') {
        selfName = src.toLowerCase();
        srcID = sys.id(src);
    } else {
        selfName = selfName.toLowerCase();
    }

    if (typeof tar === 'string') {
        targetName = tar.toLowerCase();
    } else {
        targetName = targetName.toLowerCase();
    }

    if (sys.dbIp(targetName) === undefined || sys.dbIp(selfName) === undefined) {
        return false;
    }

    if (hpAuth(src) <= hpAuth(tar) || srcID === undefined || ((this.chanAuth[selfName] <= this.chanAuth[targetName]) && !this.isChanOwner(src))) {
        return false;
    }

    return true;
};

POChannel.prototype.isBannedInChannel = function (ip) {
    return this.banlist.has(ip);
};

POChannel.prototype.isMutedInChannel = function (ip) {
    return this.mutelist.has(ip);
};

POChannel.prototype.isChanMod = function (src) {
    var toLower = sys.name(src).toLowerCase();

    return this.chanAuth[toLower] >= 1 || hpAuth(src) >= 1;
};

POChannel.prototype.isChanAdmin = function (src) {
    var toLower = sys.name(src).toLowerCase();

    return this.chanAuth[toLower] >= 2 || hpAuth(src) >= 2;
};

POChannel.prototype.isChanOwner = function (src) {
    var toLower = sys.name(src).toLowerCase();

    return this.chanAuth[toLower] >= 3 || hpAuth(src) >= 3;
};

function POGlobal(id) {
    this.mafiaVersion = "";
}

JSESSIONInst = function () {
    this.UserData = {};
    this.ChannelData = {};
    this.GlobalData = {};

    this.UserFunc = function () {};
    this.ChannelFunc = function () {};
    this.GlobalFunc = function () {};

    this.UsesUser = false;
    this.UsesChannel = false;
    this.UsesGlobal = false;

    this.ScriptID = undefined;
};

JSESSIONInst.prototype.refill = function () {
    var x, users = sys.playerIds(),
        channels = sys.channelIds();

    if (this.UsesUser) {
        for (x in users) {
            if (this.users(users[x]) === undefined) {
                this.createUser(users[x]);
            }
        }
    }

    if (this.UsesChannel) {
        for (x in channels) {
            if (this.channels(channels[x]) === undefined) {
                this.createChannel(channels[x]);
            }
        }
    }

    if (this.UsesGlobal) {
        if (this.global() === undefined) {
            this.GlobalData = new this.GlobalFunc();
        }
    }
};

JSESSIONInst.prototype.users = function (id) {
    if (!this.UsesUser) {
        return;
    }

    if (typeof this.UserData[id] === 'undefined') {
        return;
    }

    return this.UserData[id];
};

JSESSIONInst.prototype.channels = function (id) {
    if (!this.UsesChannel) {
        return;
    }

    if (typeof this.ChannelData[id] === 'undefined') {
        return;
    }

    return this.ChannelData[id];
};

JSESSIONInst.prototype.global = function () {
    if (!this.UsesGlobal) {
        return;
    }

    if (typeof this.GlobalData === 'undefined') {
        return;
    }

    return this.GlobalData;
};

JSESSIONInst.prototype.identifyScriptAs = function (script) {
    if (this.ScriptID === undefined || this.ScriptID !== script) {
        this.clearAll();
    }

    this.ScriptID = script;
    this.refill();
};

JSESSIONInst.prototype.registerUser = function (func) {
    if (typeof func !== "function") {
        return;
    }

    this.UserFunc = func;
    this.UsesUser = true;
};

JSESSIONInst.prototype.registerChannel = function (func) {
    if (typeof func !== "function") {
        return;
    }

    this.ChannelFunc = func;
    this.UsesChannel = true;
};

JSESSIONInst.prototype.registerGlobal = function (func) {
    if (typeof func !== "function") {
        return;
    }

    this.GlobalFunc = func;
    this.UsesGlobal = true;
    this.GlobalData = new func();
};

JSESSIONInst.prototype.createChannel = function (id) {
    if (!this.UsesChannel) {
        return false;
    }

    if (typeof this.ChannelData[id] !== "undefined") {
        return false;
    }

    if (sys.channel(id) === undefined) {
        return false;
    }

    this.ChannelData[id] = new this.ChannelFunc(id);
    return true;
};

JSESSIONInst.prototype.destroyChannel = function (id) {
    if (!this.UsesChannel) {
        return false;
    }
    if (id === 0) {
        return false;
    }

    if (typeof this.ChannelData[id] === "undefined") {
        return false;
    }

    delete this.ChannelData[id];
    return true;
};

JSESSIONInst.prototype.createUser = function (id) {
    if (!this.UsesUser) {
        return false;
    }

    if (typeof this.UserData[id] !== "undefined") {
        return false;
    }

    if (sys.name(id) === undefined) {
        return false;
    }

    this.UserData[id] = new this.UserFunc(id);
    return true;
};

JSESSIONInst.prototype.destroyUser = function (id) {
    if (!this.UsesUser) {
        return false;
    }
    if (typeof this.UserData[id] === "undefined") {
        return false;
    }
    if (sys.name(id) === undefined) {
        return false;
    }

    delete this.UserData[id];
    return true;
};

JSESSIONInst.prototype.hasUser = function (src) {
    return this.UserData.has(src);
};

JSESSIONInst.prototype.hasChannel = function (channel) {
    return this.ChannelData.has(channel);
};

JSESSIONInst.prototype.clearAll = function () {
    this.UserData = {};
    this.ChannelData = {};
    this.GlobalData = {};

    this.UserFunc = function () {};
    this.ChannelFunc = function () {};
    this.GlobalFunc = function () {};

    this.UsesUser = false;
    this.UsesChannel = false;
    this.UsesGlobal = false;

    this.ScriptID = undefined;
};

if (typeof JSESSION === "undefined") {
    // Otherwise will reset user/channel data every script load.
    JSESSION = new JSESSIONInst();
}

if (typeof updateProto !== "undefined") {
    updateProto(JSESSION, JSESSIONInst);
}

function cut(array, entry, join) {
    if (!join) {
        join = "";
    }

    if (!Array.isArray(array)) {
        return array;
    }

    return array.splice(entry).join(join);
}

function firstTeamForTier(id, tier) {
    if (Config.NoCrash) {
        return 0;
    }

    if (typeof tier !== 'string') {
        return -1;
    }
    
    var ttl = tier.toLowerCase(),
        x;

    for (x = 0; x < sys.teamCount(id); x++) {
        if (sys.tier(id, x).toLowerCase() === ttl) {
            return x;
        }
    }

    return -1;
}

function hasTeam(id, tier) {
    if (!tier) {
        return sys.teamCount(id) !== 0;
    }

    return sys.hasTier(id, tier);
}

function TourBox(message, chan) {
    sys.sendHtmlAll("<table><tr><td><center><hr width='300'>" + message + "<hr width='300'></center></td></tr></table>", chan);
}

function TourNotification(src, chan, info) { // info is an object
    var tour = JSESSION.channels(chan).tour,
        mode = tour.tourmode;

    if (src !== 0) {
        if (mode === 0) {
            return;
        }

        var white = function () {
            sys.sendMessage(src, "", chan);
        },
            border = function () {
                sys.sendHtmlMessage(src, TOUR_BORDER, chan);
            },
            startTime = getTimeString(+sys.time() - tour.startTime);

        white();
        border();

        sys.sendHtmlMessage(src, "<timestamp/><b><font color=green>A Tournament was started by " + player(tour.tourstarter) + " " + startTime + " ago! </b></font>", chan);
        sys.sendHtmlMessage(src, "<timestamp/><b><font color=red>Players:</font></b> " + tour.tournumber, chan);
        sys.sendHtmlMessage(src, "<timestamp/><b><font color=blue>Type:</b></font> " + tour.identify(), chan);
        sys.sendHtmlMessage(src, "<timestamp/><b><font color=orange>Tier:</b></font> " + tour.tourtier, chan);

        if (!isEmpty(tour.prize)) {
            sys.sendHtmlMessage(src, "<timestamp/><b><font color=brown>Prize:</b></font> " + tour.prize, chan);
        }

        border();

        if (mode === 1) {
            sys.sendHtmlMessage(src, "<timestamp/>Type <font color=green><b>/Join</b></font> to enter the tournament!</b></font>", chan);
        } else if (mode === 2) {
            var finalsStr = "";
            if (tour.finals) {
                finalsStr = " (<B>Finals</B>)";
            }

            sys.sendHtmlMessage(src, "<timestamp/>Currently in round " + tour.roundnumber + finalsStr + ". " + tour.remaining + " players remaining.", chan);

        }

        border();
        white();
    } else {
        if (tour.TourDisplay === tour.Displays.Normal) {
            tour.white();
            tour.border();
            // TODO: Implement color support for bot.
            sys.sendHtmlAll("<timestamp/><b><font color=green>A Tournament was started by " + player(info.starter) + "! </b></font>", chan);
            sys.sendHtmlAll("<timestamp/><b><font color=red>Players:</font></b> " + tour.tournumber, chan);
            sys.sendHtmlAll("<timestamp/><b><font color=blue>Type:</b></font> " + tour.identify(), chan);
            sys.sendHtmlAll("<timestamp/><b><font color=orange>Tier:</b></font> " + tour.tourtier, chan);
            if (!isEmpty(tour.prize)) {
                sys.sendHtmlAll("<timestamp/><b><font color=brown>Prize:</b></font> " + tour.prize, chan);
            }
            tour.border();
            sys.sendHtmlAll("<timestamp/>Type <font color=green><b>/Join</b></font> to enter the tournament!</b></font>", chan);
            tour.border();
            tour.white();
        } else {
            var prize = '';

            if (!isEmpty(tour.prize)) {
                prize = '<b style="color: brown;">Prize:</b> ' + tour.prize + '<br/>';
            }

            // Bots
            TourBox("A Tournament was started by <b style='color:" + info.color + "'>" + html_escape(info.starter) + "</b>! <br/> <b style='color:red'>Players:</b> " + tour.tournumber + " <br/> <b style='color: blue'>Type:</b> " + tour.identify() + " <br/> <b style='color: orange'>Tier:</b> " + tour.tourtier + " <br/> " + prize + " Type <b style='color:green'>/join</b> to join it!", chan);
        }
    }
}

function Tours(id) {
    this.id = id;
    this.tourmode = 0;
    this.tourstarter = "";
    this.prize = "";
    this.roundnumber = 0;
    this.tourtier = "";
    this.tournumber = 0;
    this.AutoStartBattles = false;
    this.remaining = 0;
    this.finals = false;

    this.battlemode = 0;

    this.roundStatus = {
        idleBattles: {},
        ongoingBattles: {},
        winLose: {}
    };

    this.couples = {};
    this.players = {};
    this.roundplayers = 0;
    this.startTime = 0;
    this.TourDisplay = 1;

    this.Displays = {
        Normal: 1,
        Clean: 2
    };
}

Tours.prototype.border = function () {
    sys.sendHtmlAll(TOUR_BORDER, this.id);
};

Tours.prototype.white = function () {
    sys.sendAll("", this.id);
};

Tours.prototype.hasTourAuth = function (id) {
    var poUser = JSESSION.users(id),
        poChannel = JSESSION.channels(this.id);

    return poChannel.tourAuth[poUser.lowername] !== undefined || poUser.megauser || poChannel.isChanMod(id);
};

Tours.prototype.identify = function (test) {
    if (typeof test !== 'number') {
        test = this.battlemode;
    }
    if (test === 0) {
        return "No tournament is running.";
    } else if (test === 1) {
        return "Single Elimination";
    } else if (test === 2) {
        return "Double Elimination";
    } else if (test === 3) {
        return "Triple Elimination";
    } else if (test === 4) {
        return "Tag Team Single Elimination";
    } else if (test === 5) {
        return "Tag Team Double Elimination";
    } else if (test === 6) {
        return "Tag Team Triple Elimination";
    } else {
        return "Unknown Mode";
    }
};

Tours.prototype.sendAll = function (message) {
    botAll(message, this.id);
};

Tours.prototype.sendPM = function (src, message) {
    botMessage(src, message, this.id);
};

Tours.prototype.TourBox = function (message, Display) {
    var x, curr;

    if (typeof message === "string") {
        message = [message]; // Make it an array.
    }

    if (Display !== this.Displays.Normal && Display !== this.Displays.Clean) {
        Display = this.TourDisplay;
    }

    if (Display === this.Displays.Normal) {
        this.white();
        this.border();
        this.white();

        for (x in message) {
            curr = message[x];
            if (curr.isEmpty()) {
                sys.sendAll("", this.id);
            } else {
                this.sendAll(message[x]);
            }
        }

        this.white();
        this.border();
        this.white();
    } else { // this.Displays.Clean
        TourBox(message.join("<br/>"), this.id);
    }
};

Tours.prototype.idleBattler = function (name) {
    var hash = this.roundStatus.idleBattles,
        x,
        chash;

    for (x in hash) {
        chash = hash[x];
        if (chash[0] === name || chash[1] === name) {
            return x;
        }
    }

    return false;
};

Tours.prototype.isBattling = function (name) {
    var hash = this.roundStatus.ongoingBattles,
        x,
        chash;

    for (x in hash) {
        chash = hash[x];
        if (chash[0] === name || chash[1] === name) {
            return x;
        }
    }

    return false;
};

Tours.prototype.command_display = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    var num = parseInt(commandData, 10);
    if (num !== 1 && num !== 2) {
        this.sendPM(src, "Valid tournament display modes are 1 (Normal) and 2 (Clean).");
        return;
    }
    if (this.TourDisplay === num) {
        this.sendPM(src, "The tournament display mode is already " + num + ".");
        return;
    }

    var me = player(src),
        mode = "Normal";

    if (num === this.Displays.Clean) {
        mode = "Clean";
    }

    this.TourBox(me + " changed the tournament display mode to " + mode + ".", num);

    this.TourDisplay = num;

    cData.changeTourOptions(this.id, num, this.AutoStartBattles);
};

Tours.prototype.command_autostartbattles = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    this.AutoStartBattles = !this.AutoStartBattles;
    var to_on = toOn(this.AutoStartBattles),
        me = player(src);

    this.TourBox(me + " turned auto start battles " + to_on + ".");

    cData.changeTourOptions(this.id, this.TourDisplay, this.AutoStartBattles);
};

Tours.prototype.command_tourprize = function (src, commandData, fullCommand) {
    if (this.tourmode === 0) {
        this.sendPM(src, "There is currently no tournament.");
        return;
    }
    if (isEmpty(this.prize)) {
        this.sendPM(src, "There is no prize.");
        return;
    }

    this.sendPM(src, "The tournament prize is: " + this.prize);
};

Tours.prototype.command_join = function (src, commandData, fullCommand) {
    if (this.tourmode !== 1) {
        botMessage(src, "You are unable to join because a tournament is not currently running or has passed the signups phase.", this.id);
        return;
    }

    var self = sys.name(src).toLowerCase();
    if (this.players.has(self)) {
        botMessage(src, "You are already in the tournament. You are not able to join more than once.", this.id);
        return;
    }
    if (!hasTeam(src, this.tourtier)) {
        botMessage(src, "You don't have a team for the " + this.tourtier + " tier. Load or make one to join.", this.id);
        return;
    }

    var me = player(src),
        spots = this.tourSpots(),
        message;
    if (spots > 0) {
        this.buildHash(src);
        spots = this.tourSpots();
        message = me + " joined the tournament! <b>" + spots + "</b> more " + Grammar.s("spot", spots) + " left!";

        if (this.tournumber < 9) { // Max spots is 8 for the bigger message.
            this.TourBox(message);
        } else {
            this.sendAll(message);
        }
        
        if (spots === 0) {
            this.tourmode = 2;
            this.roundnumber = 0;
            this.roundPairing();
        }
        return;
    }

    botMessage(src, "There are no spots remaining.", this.id);
};

Tours.prototype.command_unjoin = function (src, commandData, fullCommand) {
    if (this.tourmode === 0) {
        botMessage(src, "Wait untill the tournament has started.", this.id);
        return;
    }

    var self = sys.name(src).toLowerCase();
    if (!this.players.has(self)) {
        botMessage(src, "You have not joined the tournament.", this.id);
        return;
    }

    if (this.tourmode === 2) {
        this.remaining--;
    }

    var me = player(src),
        spotsNow = this.tourSpots() + 1;

    this.TourBox(me + " left the tournament! <b>" + spotsNow + "</b> spots left!");

    if (this.tourmode === 2 && this.players[self].couplesid !== -1) {
        this.tourBattleEnd(this.tourOpponent(self.name()), self.name(), true);
    }

    delete this.players[self];

    if (objLength(this.couples) === 0 && this.tourmode === 2) {
        this.roundPairing();
    }
};

Tours.prototype.command_viewround = function (src, commandData, fullCommand) {
    if (this.tourmode !== 2) {
        botMessage(src, "You are unable to view the round because a tournament is not currently running or is in signing up phase.", this.id);
        return;
    }

    var chan = this.id;

    sys.sendMessage(src, "", chan);
    sys.sendHtmlMessage(src, style.header, chan);
    sys.sendMessage(src, "", chan);

    var battleHash = this.roundStatus,
        idleBattles = battleHash.idleBattles,
        ongoingBattles = battleHash.ongoingBattles,
        winLose = battleHash.winLose,
        anyFinishedBattles = !winLose.isEmpty(),
        x,
        curr;

    var roundInfoStr = "Round " + this.roundnumber;
    if (this.finals) {
        roundInfoStr = "Finals";
    }

    botMessage(src, roundInfoStr + " of " + this.tourtier + " tournament:", chan);
    if (anyFinishedBattles) {
        sys.sendMessage(src, "", chan);
        botMessage(src, "Battles finished", chan);
        sys.sendMessage(src, "", chan);
        for (x in winLose) {
            curr = winLose[x];
            botMessage(src, player(curr[0]) + " won against " + player(curr[1]), chan);
        }

        sys.sendMessage(src, "", chan);
    }

    if (!ongoingBattles.isEmpty()) {
        sys.sendMessage(src, "", chan);
        botMessage(src, "Ongoing battles:", chan);
        sys.sendMessage(src, "", chan);
        for (x in ongoingBattles) {
            curr = ongoingBattles[x];
            botMessage(src, player(curr[0]) + " VS " + player(curr[1]), chan);
        }

        sys.sendMessage(src, "", chan);
    }

    if (!idleBattles.isEmpty()) {
        sys.sendMessage(src, "", chan);
        botMessage(src, "Yet to start battles:", chan);
        sys.sendMessage(src, "", chan);
        for (x in idleBattles) {
            curr = idleBattles[x];
            botMessage(src, player(curr[0]) + " VS " + player(curr[1]), chan);
        }
        sys.sendMessage(src, "", chan);
    }

    if (anyFinishedBattles) {
        sys.sendMessage(src, "", chan);
        botMessage(src, "Players to the next round:", chan);
        sys.sendMessage(src, "", chan);

        var str = "";
        for (x in winLose) {
            str += player(winLose[x][0]) + ", ";
        }

        str = str.substr(0, str.lastIndexOf(","));

        botMessage(src, str, chan);
        sys.sendMessage(src, "", chan);
    }

    sys.sendMessage(src, "", chan);
    sys.sendHtmlMessage(src, style.footer, chan);
};

Tours.prototype.command_dq = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    if (this.tourmode === 0) {
        botMessage(src, "Wait until the tournament has started.", this.id);
        return;
    }

    var target = commandData.toLowerCase();
    if (!this.players.has(target)) {
        botMessage(src, "This player is not in the tournament.", this.id);
        return;
    }

    if (this.tourmode === 2) {
        this.remaining--;
    }

    this.TourBox(player(target) + " was removed from the tournament by " + player(src) + "!");


    if (this.tourmode === 2 && this.players[target].couplesid !== -1) {
        this.tourBattleEnd(this.tourOpponent(target.name()), target.name(), true);
    }

    delete this.players[target];
};

Tours.prototype.command_switch = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    var parts = commandData.split(':');
    parts[1] = parts[1].toLowerCase();

    if (!this.isInTourney(parts[0]) || sys.id(parts[1]) === undefined) {
        botMessage(src, "The players need to exist!", this.id);
        return;
    }
    if (this.ongoingTourneyBattle(parts[0])) {
        botMessage(src, "You can't switch a battling player!", this.id);
        return;
    }

    var obj = this.players[parts[0].toLowerCase()],
        playerN = parts[0].name(),
        switchN = parts[1].name(),
        indexOfIdle = this.idleBattler(playerN),
        indexThingy,
        pNum;

    if (indexOfIdle !== false) {
        indexThingy = this.roundStatus.idleBattles[indexOfIdle];
        pNum = indexThingy[0] === playerN;
        delete this.roundStatus.idleBattlers[indexOfIdle];
        if (pNum) {
            this.roundStatus.idleBattlers[objLength(this.roundStatus.idleBattlers)] = [switchN, indexThingy[1]];
        } else {
            this.roundStatus.idleBattlers[objLength(this.roundStatus.idleBattlers)] = [indexThingy[0], switchN];
        }
    }

    this.players[parts[1]] = obj;
    this.players[parts[1]].name = switchN;
    delete this.players[parts[0].toLowerCase()];

    var spots = this.tourSpots(),
        message = [player(parts[0]) + " was switched with " + player(parts[1]) + " by " + player(src) + "!"];

    if (this.tourmode === 1) {
        message.push("<b>" + spots + "</b> more " + Grammar.s("spot", spots) + " left!");
    }

    this.TourBox(message);
};

Tours.prototype.command_push = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }
    if (this.tourmode === 0) {
        botMessage(src, "Wait until the tournament has started.", this.id);
        return;
    }

    if (sys.dbIp(commandData) === undefined) {
        botMessage(src, "This person doesn't exist.", this.id);
        return;
    }

    if (this.tourmode === 2 && this.tagteam_tour()) {
        botMessage(src, "You cannot add players to a running tag team tour!", this.id);
        return;
    }

    var target = player(commandData);
    if (this.isInTourney(commandData.toLowerCase())) {
        botMessage(src, target + " is already in the tournament.", this.id);
        return;
    }

    if (this.tourmode === 2) {
        this.remaining++;
    }

    var name = commandData.name(),
        me = player(src),
        message = [target + " was added to the tournament by " + me + "!"];

    this.buildHash(name);
    var spots = this.tourSpots();

    if (this.tourmode === 1) {
        message.push("<b>" + spots + "</b> more " + Grammar.s("spot", spots) + " left!");
    }

    this.TourBox(message);

    if (this.tourmode === 1 && spots === 0) {
        this.tourmode = 2;
        this.roundnumber = 0;
        this.roundPairing();
    }

    return;
};

Tours.prototype.command_cancelbattle = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }
    if (this.tourmode !== 2) {
        botMessage(src, "Wait until a tournament starts", this.id);
        return;
    }
    var name = commandData.toLowerCase();
    if (!this.players.has(name)) {
        botMessage(src, "This player is not in the tournament", this.id);
        return;
    }

    var startername = name.name(),
        bIndex = this.isBattling(startername);

    if (bIndex === false) {
        botMessage(src, "Either this player is through the next round, or his/her battle hasn't begon yet.", this.id);
        return;
    }

    delete this.roundStatus.startedBattles[bIndex];

    var target = player(startername);
    this.TourBox(target + " can forfeit their battle and rematch now.");
    return;
};

Tours.prototype.command_tour = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }
    if (this.tourmode > 0) {
        botMessage(src, "You are unable to start a tournament because one is still currently running.", this.id);
        return;
    }

    this.clearVariables();

    var mcmd = commandData.split(':');
    this.tournumber = parseInt(mcmd[1], 10);

    var cp = parseInt(mcmd[2], 10);
    if (this.identify(cp) === "Unknown Mode") {
        cp = 1; /* set to Single Elimination */
    }

    this.battlemode = cp;

    if (!this.tagteam_tour()) {
        if (isNaN(this.tournumber) || this.tournumber <= 2) {
            botMessage(src, "You must specify a tournament size of 3 or more.", this.id);
            return;
        }
    } else {
        if (isNaN(this.tournumber) || this.tournumber <= 3) {
            botMessage(src, "You must specify a tournament size of 4 or more.", this.id);
            return;
        }

        if (this.tournumber % 2 !== 0) {
            botMessage(src, "You must specify an even number of players for tag team tours. [4, 8, 12, ..]", this.id);
            return;
        }
    }

    if (this.tournumber > 150) {
        botMessage(src, "Having over 150 players would be impossible!", this.id);
        return;
    }

    var tierName = validTier(mcmd[0]);
    if (!tierName) {
        botMessage(src, "There does not seem to be a " + mcmd[0] + " tier.", this.id);
        return;
    }

    this.tourtier = tierName;
    mcmd[3] = cut(mcmd, 3, ':');
    this.prize = html_escape(mcmd[3]);

    if (isEmpty(this.prize)) {
        this.prize = "";
    }

    var m_name = sys.name(src);

    this.remaining = this.tournumber;
    this.tourmode = 1;
    this.startTime = +sys.time();
    this.tourstarter = m_name;

    TourNotification(0, this.id, {
        "starter": m_name,
        "color": script.namecolor(src)
    });
};

Tours.prototype.command_changespots = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    if (this.tourmode !== 1) {
        botMessage(src, "You cannot change the number of spots because the tournament has passed the sign-up phase.", this.id);
        return;
    }

    var count = parseInt(commandData, 10);
    if (!this.tagteam_tour()) {
        if (isNaN(count) || count < 3) {
            botMessage(src, "You must specify a size of 3 or more.", this.id);
            return;
        }
    } else {
        if (isNaN(count) || count <= 3) {
            botMessage(src, "You must specify a size of 4 or more.", this.id);
            return;
        }

        if (count % 2 !== 0) {
            botMessage(src, "You must specify an even number of players for tag team tours. [4, 8, 12]", this.id);
            return;
        }
    }

    if (count < this.players.length()) {
        botMessage(src, "There are more than that people registered.", this.id);
        return;
    }

    this.tournumber = count;
    this.remaining = count;

    var spots = this.tourSpots(),
        me = player(src),
        message = [me + " changed the numbers of entrants to " + count + "!", "<b>" + spots + "</b> more " + Grammar.s("spot", spots) + " left!"];

    this.TourBox(message);

    if (spots === 0) {
        this.tourmode = 2;
        this.roundnumber = 0;
        this.roundPairing();
    }

};

Tours.prototype.command_endtour = function (src, commandData, fullCommand) {
    if (!this.hasTourAuth(src)) {
        noPermissionMessage(src, fullCommand, this.id);
        return;
    }

    if (this.tourmode !== 0) {
        this.clearVariables();

        var me = player(src);
        this.TourBox("The tournament has been ended by " + me + "!");
        return;
    }

    botMessage(src, "No tournament is running.", this.id);
};

Tours.prototype.clearVariables = function () {
    this.tourmode = 0;
    this.tourstarter = "";
    this.prize = "";
    this.roundnumber = 0;
    this.tourtier = "";
    this.tournumber = 0;
    this.remaining = 0;
    this.finals = false;

    this.battlemode = 0;

    this.couples = {};
    this.roundStatus = {
        idleBattles: {},
        ongoingBattles: {},
        winLose: {}
    };

    this.winners = [];
    this.players = {};
    this.roundplayers = 0;
    this.startTime = 0;
};

Tours.prototype.cleanRoundVariables = function () {
    this.roundStatus = {
        idleBattles: {},
        ongoingBattles: {},
        winLose: {}
    };

    this.roundplayers = 0;
};

Tours.prototype.playerName = function (hash, hashno) {
    var x, now = 0;
    for (x in hash) {
        if (now === hashno) {
            return hash[x].name;
        }
        now++;
    }

    return "";
};

Tours.prototype.teamWin = function () {
    var b = this.Blue,
        r = this.Red,
        loser = "",
        winners = [],
        loseteam = -1;

    if (this.playersOfTeam(b) === 0) {
        loser = "Team Blue";
        winners = this.namesOfTeam(r);
        loseteam = b;
    } else if (this.playersOfTeam(r) === 0) {
        loser = "Team Red";
        winners = this.namesOfTeam(b);
        loseteam = r;
    }

    return {
        'winners': winners,
        'loser': loser,
        'losingteam': loseteam
    };
};

Tours.prototype.roundPairing = function () {
    var message = [],
        name,
        nameId,
        money = DataHash.money,
        randNum;
    
    if (this.roundnumber === 0 && this.tagteam_tour()) {
        this.buildTeams();
    }

    this.roundnumber++;
    this.cleanRoundVariables();

    if (this.players.length() === 1) {
        var winner = this.players.first().name;
        
        message = ["The winner of the " + this.tourtier + " tournament is " + winner + "!", "Congratulations, " + winner + ", on your success!"];
        if (!isEmpty(this.prize)) {
            message.push("", winner + " will receive the tournament prize: " + this.prize + "!");
        }

        this.TourBox(message);

        if (this.id === 0) {
            name = winner.toLowerCase();
            if (sys.dbIp(name) === undefined) {
                this.clearVariables();
                return;
            }
            nameId = sys.id(name);
            if (!money.has(name)) {
                money[name] = 0;
            }
            randNum = sys.rand(500, 1001);
            money[name] += randNum;
            cache.write("money", JSON.stringify(DataHash.money));

            if (nameId !== undefined) {
                botMessage(nameId, "You won " + randNum + " battle points!", this.id);
            }
        }

        this.clearVariables();
        return;
    }

    if (this.tagteam_tour()) {
        var winners = this.teamWin();
        if (winners.winners.length !== 0 && winners.loser !== "" && winners.losingteam !== -1) {
            // We have winners!
            var win = winners.winners.join(" and ");
            
            message = ["The winners of the " + this.tourtier + " tournament are " + win + "!", "Congratulations, " + win + ", on your success!"];

            if (!isEmpty(this.prize)) {
                message.push("", win + " will receive the tournament prize: " + this.prize + "!");
            }

            this.TourBox(message);

            if (this.id === 0) {
                var z, ww = winners.winners;
                
                for (z in ww) {
                    name = ww[z];
                    if (sys.dbIp(name) === undefined) {
                        continue;
                    }

                    nameId = sys.id(name);
                    if (money[name] === undefined) {
                        money[name] = 0;
                    }
                    
                    randNum = sys.rand(320, 751);

                    if (randNum < 350) {
                        randNum = sys.rand(330, 380); // Give some more points (most of the time)
                    }

                    money[name] += randNum;
                    cache.write("money", JSON.stringify(DataHash.money));

                    if (nameId !== undefined) {
                        botMessage(nameId, "You won " + randNum + " battle points!", this.id);
                    }
                }
            }

            this.clearVariables();
            return;
        }
    }

    var plr = this.players,
        x;
    
    for (x in plr) {
        if (plr[x] === "") {
            delete plr[x];
        }
    }

    this.finals = this.players.length() === 2;
    if (!this.finals) {
        message.push("Round " + this.roundnumber + " of the " + this.tourtier + " tournament:", "");
    } else {
        message.push("Finals of the " + this.tourtier + " tournament:", "");
    }

    var i = 0,
        p = this.players,
        tempplayers = ({}).extend(p),
        x1,
        name1,
        n1tl,
        x2,
        name2,
        n2tl,
        a,
        team,
        team2;

    if (this.tagteam_tour()) {
        team = "<b><font color=blue>[Team Blue]</font></b>";
        team2 = "<b><font color=red>[Team Red]</font></b>";
    } else {
        team = "";
        team2 = "";
    }

    for (a in tempplayers) {
        if (tempplayers.length() === 1) {
            break;
        }

        if (!this.tagteam_tour()) {
            x1 = this.randomPlayer(tempplayers);
            name1 = this.playerName(tempplayers, x1);
            n1tl = name1.toLowerCase();
            delete tempplayers[n1tl];

            x2 = this.randomPlayer(tempplayers);
            name2 = this.playerName(tempplayers, x2);
            n2tl = name2.toLowerCase();
            delete tempplayers[n2tl];

        } else {
            x1 = this.randomPlayer(tempplayers, 0);
            name1 = this.playerName(tempplayers, x1);
            n1tl = name1.toLowerCase();
            delete tempplayers[n1tl];

            x2 = this.randomPlayer(tempplayers, 1);
            name2 = this.playerName(tempplayers, x2);
            n2tl = name2.toLowerCase();
            delete tempplayers[n2tl];
        }

        this.couples[i] = [name1, name2];
        this.players[n1tl].couplesid = i;
        this.players[n2tl].couplesid = i;
        this.players[n1tl].couplenum = 0;
        this.players[n2tl].couplenum = 1;

        if (!this.AutoStartBattles) {
            this.roundStatus.idleBattles[i] = [name1, name2];
        }
        i++;

        if (!this.finals) {
            message.push(i + ". " + team + name1 + " VS " + team2 + name2);
        } else {
            message.push(team + name1 + " VS " + team2 + name2);
        }
    }

    message.push("");

    if (tempplayers.length() > 0) {
        message.push(tempplayers.first().name + " is randomly selected to go to next round!");
    }

    this.TourBox(message);

    if (this.AutoStartBattles) {
        var tourInst = this;
        sys.quickCall(function () {
            var tour = tourInst,
                t,
                p,
                op,
                meteams,
                oppteams,
                couples = tour.couples;
            for (t in couples) {
                p = couples[t][0].toLowerCase();
                op = couples[t][1].toLowerCase();
                if (sys.id(p) !== undefined && sys.id(op) !== undefined) {
                    meteams = firstTeamForTier(sys.id(p), tour.tourtier);
                    oppteams = firstTeamForTier(sys.id(op), tour.tourtier);
                    if (meteams !== -1 && oppteams !== -1) {
                        if (!tour.ongoingTourneyBattle(p) && !tour.ongoingTourneyBattle(op)) {
                            sys.forceBattle(sys.id(p), sys.id(op), meteams, oppteams, sys.getClauses(tour.tourtier), 0, false);
                            tour.roundStatus.ongoingBattles[tour.roundStatus.ongoingBattles.length()] = [p.name(), op.name()];
                        }
                    }
                }
            }
        }, 2500);
    }
};

Tours.prototype.isInTourney = function (name) {
    var name2 = name.toLowerCase();
    return this.players.has(name2);
};

Tours.prototype.isInTourneyId = function (id) {
    var name = sys.name(id).toLowerCase();
    return this.players.has(name);
};

Tours.prototype.tourOpponent = function (nam) {
    var name = nam.toLowerCase();
    if (this.players[name].couplesid === -1) {
        return "";
    }
    var namenum = this.players[name].couplenum,
        id = this.players[name].couplesid;

    if (namenum === 0) {
        namenum = 1;
    } else {
        namenum = 0;
    }

    return this.couples[id][namenum];
};

Tours.prototype.areOpponentsForTourBattle = function (src, dest) {
    return this.isInTourney(sys.name(src)) && this.isInTourney(sys.name(dest)) && this.tourOpponent(sys.name(src)).toLowerCase() === sys.name(dest).toLowerCase();
};

Tours.prototype.areOpponentsForTourBattle2 = function (src, dest) {
    return this.isInTourney(src) && this.isInTourney(dest) && this.tourOpponent(src).toLowerCase() === dest.toLowerCase();
};

Tours.prototype.ongoingTourneyBattle = function (name) {
    return this.isBattling(name.name());
};

Tours.prototype.afterBattleStarted = function (src, dest, clauses, rated, srcteam, destteam) {
    var idleBattleIndex;
    
    if (this.tourmode === 2) {
        if (this.areOpponentsForTourBattle(src, dest)) {
            var n1 = sys.name(src),
                n2 = sys.name(dest);
            if (Config.NoCrash) {
                if (sys.tier(src, srcteam) === sys.tier(dest, destteam) && cmp(sys.tier(src, srcteam), this.tourtier)) {
                    idleBattleIndex = this.idleBattler(n1);
                    if (this.roundStatus.idleBattles[idleBattleIndex] !== undefined) {
                        delete this.roundStatus.idleBattles[idleBattleIndex];
                        this.roundStatus.ongoingBattles[objLength(this.roundStatus.ongoingBattles)] = [n1, n2];
                    }
                    if (!this.finals) {
                        botAll("Round " + this.roundnumber + " tournament match between " + n1 + " and " + n2 + " has started!", this.id);
                    } else {
                        botAll("Final round tournament match between " + n1 + " and " + n2 + " has started!", this.id);
                    }
                } else {
                    botMessage(src, "Your or your opponents team does not match the tournament tier (the match is not official).");
                    botMessage(dest, "Your or your opponents team does not match the tournament tier (the match is not official).");
                }
            } else {
                idleBattleIndex = this.idleBattler(n1);
                if (this.roundStatus.idleBattles[idleBattleIndex] !== undefined) {
                    delete this.roundStatus.idleBattles[idleBattleIndex];
                    this.roundStatus.ongoingBattles[objLength(this.roundStatus.ongoingBattles)] = [n1, n2];
                }
                if (!this.finals) {
                    botAll("Round " + this.roundnumber + " tournament match between " + n1 + " and " + n2 + " has started!", this.id);
                } else {
                    botAll("Final round tournament match between " + n1 + " and " + n2 + " has started!", this.id);
                }
            }
        }
    }
};

Tours.prototype.tie = function (src, dest) {
    var s = sys.name(src),
        d = sys.name(dest),
        sTL = s.toLowerCase,
        dTL = d.toLowerCase(),
        me = player(src),
        target = player(dest);

    botAll(me + " and " + target + " tied and has to battle again for the tournament!", this.id);

    if (this.AutoStartBattles) {
        sys.forceBattle(src, dest, sys.getClauses(this.tourtier), 0, false);
    } else {
        var startedBattleIndex = this.isBattling(s);
        if (startedBattleIndex !== false) {
            delete this.roundStatus.startedBattles[startedBattleIndex];
            this.roundStatus.idleBattles[objLength(this.roundStatus.idleBattles)] = [s, d];
        }
    }
};

Tours.prototype.afterBattleEnded = function (src, dest, desc) {
    if (this.tourmode !== 2 || this.players.length() === 1) {
        return;
    }

    if (desc === "tie") {
        this.tie(src, dest);
        return;
    }

    this.tourBattleEnd(sys.name(src), sys.name(dest));
};

Tours.prototype.tourBattleEnd = function (src, dest, rush) {
    if ((!this.areOpponentsForTourBattle2(src, dest) || !this.ongoingTourneyBattle(src)) && !rush) {
        return;
    }

    var srcTL = src.toLowerCase(),
        destTL = dest.toLowerCase(),
        couplesLen,
        stuff,
        stuffSBIndex,
        message = [];

    if (this.battlemode === 1 || this.battlemode === 4 || rush) {
        stuff = this.roundStatus;
        stuffSBIndex = this.isBattling(src);

        stuff.winLose[objLength(stuff.winLose)] = [src, dest];
        if (stuffSBIndex !== false) {
            delete stuff.ongoingBattles[stuffSBIndex];
        }

        delete this.players[destTL];
        delete this.couples[this.players[srcTL].couplesid];
        this.players[srcTL].couplesid = -1;
        this.players[srcTL].couplenum = -1;
        this.players[srcTL].roundwins = 0;
        this.remaining--;

        message.push(src + " advances to the next round of the tournament.", dest + " is out of the tournament.");

        couplesLen = this.couples.length();
        if (couplesLen > 0) {
            message.push("", couplesLen + " " + Grammar.s("battle", couplesLen) + " remaining.");
        } else {
            this.roundPairing();
        }
    } else if (this.battlemode === 2 || this.battlemode === 3 || this.battlemode === 5 || this.battlemode === 6) {
        this.players[srcTL].roundwins++;

        var winnums = this.players[srcTL].roundwins + this.players[destTL].roundwins,
            srcwin = this.players[srcTL].roundwins,
            destwin = this.players[destTL].roundwins,
            winner = '',
            loser = '',
            winnerTL = '',
            loserTL = '',
            tln = this.battlemode - winnums;

        if (winnums >= this.battlemode) {
            if (srcwin === destwin) {
                this.tie();
                return;
            }

            if (srcwin > destwin) {
                winner = src;
                winnerTL = src.toLowerCase();
                loser = dest;
                loserTL = dest.toLowerCase();
            } else {
                winner = dest;
                winnerTL = dest.toLowerCase();
                loser = src;
                loserTL = src.toLowerCase();
            }

            stuff = this.roundStatus;
            stuffSBIndex = this.isBattling(src);
            winner = this.players[winnerTL];

            stuff.winLose[stuff.winLose.length()] = [src, dest];
            if (stuffSBIndex !== false) {
                delete stuff.ongoingBattles[stuffSBIndex];
            }

            delete this.players[loserTL];
            delete this.couples[winner.couplesid];
            winner.couplesid = -1;
            winner.couplenum = -1;
            winner.roundwins = 0;
            this.remaining--;

            message.push(winner + " advances to the next round of the tournament.", loser + " is out of the tournament.");

            couplesLen = this.couples.length();
            if (couplesLen > 0) {
                message.push("", couplesLen + " " + Grammar.s("battle", couplesLen) + " remaining.");
            } else {
                this.roundPairing();
            }
        } else {
            var sid = sys.id(src),
                did = sys.id(dest);

            botMessage(sid, "Great job, you've won this round! You have won " + srcwin + "/" + tln + " rounds so far.", this.id);
            botMessage(did, "Sadly, you have lost this round. Try to win next round! You have won " + destwin + "/" + tln + " rounds so far.", this.id);
            sys.forceBattle(sid, did, sys.getClauses(this.tourtier), 0, false);
        }
    }

    this.TourBox(message);
};

Tours.prototype.tourSpots = function () {
    return this.tournumber - objLength(this.players);
};

Tours.prototype.randomPlayer = function (hash, team) {
    var ol = objLength(hash);
    if (ol === 1 || ol === 0) {
        return 0;
    }
    if (ol === 2) {
        return sys.rand(0, 2);
    }
    var rand = sys.rand(0, ol);

    if (!this.tagteam_tour()) {
        return rand;
    }

    var h = this.hashOf(hash, rand);
    if (h === undefined) {
        return "";
    }

    while (h.team !== team) {
        rand = sys.rand(0, ol);
        h = this.hashOf(hash, rand);
    }

    return rand;
};

Tours.prototype.buildHash = function (src) {
    var name = sys.name(src);
    if (name === undefined) {
        name = src;
    }


    this.players[name.toLowerCase()] = {
        'name': name,
        'couplesid': -1,
        'couplenum': -1,
        'roundwins': 0,
        'team': -1
    };
};

Tours.prototype.tagteam_tour = function () {
    var b = this.battlemode;
    return b > 3 && b < 7;
};

Tours.prototype.buildTeams = function () {
    var p = this.players,
        y,
        team = 0,
        id;
    for (y in p) {
        p[y].team = team;
        id = sys.id(p[y].name);
        if (team === 0) {
            if (id !== undefined) {
                botMessage(id, "You are in Team Blue.", this.id);
            }

            team++;
        } else {
            if (id !== undefined) {
                botMessage(id, "You are in Team Red.", this.id);
            }

            team--;
        }
    }
};

Tours.prototype.playersOfTeam = function (team) {
    var y, p = this.players,
        ret = 0;
    for (y in p) {
        if (p[y].team === team) {
            ret++;
        }
    }

    return ret;
};

Tours.prototype.namesOfTeam = function (team) {
    var y, p = this.players,
        ret = [];
    for (y in p) {
        if (p[y].team === team) {
            ret.push(p[y].name);
        }
    }

    return ret;
};

Tours.prototype.totalPlayers = function () {
    return objLength(this.players);
};

Tours.prototype.hashOf = function (hash, num) {
    var y, i = 0;
    for (y in hash) {
        if (i === num) {
            return hash[y];
        }
        i++;
    }
};

Tours.prototype.Blue = 0;
Tours.prototype.Red = 1;

function Mail(sender, text, title) {
    var date = new Date();

    this.sender = sender;
    this.title = title;
    this.text = text;
    this.read = false;
    this.sendtime = String(date);
    this.sendAgo = +sys.time();
}

function defineCoreProperty(core, prop, func) {
    Object.defineProperty(core, prop, {
        "value": func,

        writable: true,
        enumerable: false,
        configurable: true
    });
}

defineCoreProperty(String.prototype, "reverse", function () {
    var strThis = this;
    
    return strThis.split("").reverse().join("");
});

defineCoreProperty(String.prototype, "isEmpty", function () {
    var mess = this;
    return mess === "" || mess.trim() === "";
});

defineCoreProperty(String.prototype, "contains", function (string) {
    var str = this;
    return str.indexOf(string) > -1;
});

defineCoreProperty(String.prototype, "has", function (string) {
    return this.contains(string);
});

defineCoreProperty(String.prototype, "name", function () {
    var str = this;
    if (typeof DataHash.names === "undefined") {
        return str;
    }

    var tl = str.toLowerCase();
    if (typeof DataHash.names[tl] !== "undefined") {
        str = DataHash.names[tl];
    }

    return str;
});

defineCoreProperty(String.prototype, "format", function () {
    var str = this,
        exp,
        i,
        args = arguments.length,
        icontainer = 0;
    
    for (i = 0; i < args; i++) {
        icontainer++;
        exp = new RegExp("%" + icontainer, "");
        str = str.replace(exp, arguments[i]);
    }
    return str;
});

defineCoreProperty(String.prototype, "fontsize", function (size) {
    var str = this;

    return "<font size='" + size + "'>" + str + "</font>";
});

defineCoreProperty(String.prototype, "linkify", function () {
    var urlPattern = /\b(?:https?|ftps?|git):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim,
        pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim,
        emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim,
        poPattern = /\bpo:[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

    return this.replace(urlPattern, '<a target="_blank" href="$&">$&</a>').replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>').replace(emailAddressPattern, '<a target="_blank" href="mailto:$1">$1</a>').replace(poPattern, function ($) {
        var type = $.substring($.indexOf(":", $.indexOf("/"))),
            thing = $.substring($.indexOf("/"));

        type = type[0].toUpperCase() + type.substring(1);

        return "<a href='" + $ + "'>" + type + " " + thing + "</a>";
    });
});

defineCoreProperty(Boolean.prototype, "isEmpty", function () {
    return this === false;
});

defineCoreProperty(Number.prototype, "isEmpty", function () {
    return !isFinite(this) || this === 0;
});

defineCoreProperty(Number.prototype, "positive", function () {
    return !this.isEmpty();
});

defineCoreProperty(Object.prototype, "isEmpty", function () {
    return this.length() === 0;
});

defineCoreProperty(Object.prototype, "keys", function () {
    return Object.keys(this);
});

defineCoreProperty(Object.prototype, "has", function (prop) {
    return typeof this[prop] !== "undefined";
});

defineCoreProperty(Object.prototype, "contains", function (prop) {
    return this.has(prop);
});

defineCoreProperty(Object.prototype, "insert", function (name, val) {
    this[name] = val;
});

defineCoreProperty(Object.prototype, "extend", function (other) {
    var x;

    if (typeof other === "object" && !Array.isArray(other) && other !== null) {
        for (x in other) {
            this[x] = other[x];
        }
    }

    return this;
});

defineCoreProperty(Object.prototype, "remove", function (name) {
    if (!this.has(name)) {
        return;
    }

    delete this[name];
});

defineCoreProperty(Object.prototype, "first", function () {
    // Prevent JSLint from complaining.
    var ret, x, sbreak = true;
    for (x in this) {
        ret = this[x];
        
        if (sbreak) {
            break;
        }
    }
    
    return ret;
});

defineCoreProperty(Object.prototype, "length", function () {
    return Object.keys(this).length;
});

defineCoreProperty(Array.prototype, "has", function (prop) {
    var x;
    for (x in this) {
        if (this[x] === prop) {
            return true;
        }
    }

    return false;
});

defineCoreProperty(Array.prototype, "isEmpty", function () {
    return this.length === 0;
});

defineCoreProperty(Array.prototype, "contains", function (prop) {
    return this.has(prop);
});

JSESSION.identifyScriptAs("TheUnknownOne's Server Script");
JSESSION.registerUser(POUser);
JSESSION.registerChannel(POChannel);
JSESSION.registerGlobal(POGlobal);
JSESSION.refill();

({
    serverStartUp: function () {
        startupTime = +sys.time();
        StartUp = true;

        if (sys.getFileContent(".scriptsession") === "") {
            Config.NoCrash = true;
            sys.writeToFile("nocrash.txt", "Delete this file to turn NoCrash off (in case of a system crash or something similar).");
        } else if (sys.getFileContent("nocrash.txt") !== undefined) {
            Config.NoCrash = true;
        }

        script.beforeNewMessage("Script Check: OK");

        sys.updateDatabase();

    },

    serverShutDown: function () {
        sys.deleteFile(".scriptsession");
    },

    loadAll: function () {
        if (typeof run === 'undefined') {
            run = function (f) {
                try {
                    script[f]();
                } catch (e) {
                    print(FormatError("Runtime Error: Could not call script." + f + "!", e));
                }
            };
        }

        var conf = sys.getFileContent("config");
        servername = conf.match(/Name=[^\n]+/i).toString().substr(5).trim();

        run("loadRequiredUtilities");
        run("loadCache");

        run("loadUtilities");
        run("loadChannelUtilities");

        run("loadMafia");
        run("loadPrune");

        run("loadTiers");
        run("loadStyles");
        run("loadRankIcons");
        run("loadPokemonStats");

        run("loadTemplateUtility");
        run("loadIfyUtility");
        run("loadCommandStatsUtility");

        poGlobal = JSESSION.global();

        loadOldPoll = function () {
            if (typeof Poll === 'undefined') {
                Poll = {};
                Poll.mode = 0;
                Poll.subject = "";
                Poll.starter = '';
                Poll.options = {};
                Poll.votes = 0;

                if (cache.get("Poll") !== "") {
                    try {
                        Poll = JSON.parse(cache.get("Poll"));
                    } catch (e) {
                        cache.remove("Poll");
                    }
                }
            }
        };

        loadOldPoll();

        if (typeof DataHash.spammers === "undefined") {
            DataHash.spammers = {};
        }

        if (typeof DataHash.teamSpammers === "undefined") {
            DataHash.teamSpammers = {};
        }

        if (typeof DataHash.reconnect === "undefined") {
            DataHash.reconnect = {};
        }

        if (typeof Clantag === "undefined" || Clantag.full !== ClanTag) {
            Clantag = {};
            Clantag.full = ClanTag;
            Clantag.fullText = removespaces(Clantag.full.replace(/[\[\]\{\}]/gi, ""));
            Clantag.fullTextLower = Clantag.fullText.toLowerCase();
        }

        ScriptLength = {};

        var date = String(new Date());
        cache.write("Script_LastLoad", date);
        cache.save("Script_Registered", date);
    },

    attemptToSpectateBattle: function (src, srcbattler, tarbattler) {
        var c = sys.channelIds(),
            b,
            chan;

        for (b in c) {
            chan = JSESSION.channels(c[b]);
            if (!chan.toursEnabled) {
                continue;
            }
            if (chan.tour.tourmode === 2 && chan.tour.finals) {
                botMessage(src, "Enjoy the finals!", chan.id);
                return "allow";
            }
        }
    },

    beforeFindBattle: function (src) {
        WatchEvent(src, "Find Battle");
    },

    beforeChannelJoin: function (src, c) {
        if (JSESSION.users(src) === undefined) {
            JSESSION.createUser(src);
        }
        if (JSESSION.channels(c) === undefined) {
            JSESSION.createChannel(c);
        }

        var chan = JSESSION.channels(c),
            srcname = sys.name(src).toLowerCase(),
            user = JSESSION.users(src);

        if (chan.isChanMod(src) || (sys.auth(src) >= 1 && sys.auth(src) <= 2 && c !== scriptchannel) || (sys.auth(src) > 2) || (DataHash.megausers.has(srcname) && c === staffchannel) || (DataHash.evalops.has(srcname) && c === scriptchannel)) {
            return;
        }

        var ip = sys.ip(src);
        if (chan.isBannedInChannel(ip)) {
            Prune.channelBans(c);
            if (chan.isBannedInChannel(ip)) { // repeat this because of ban pruning
                sys.stopEvent();
                var ban = chan.banlist[ip],
                    time;

                if (ban.time !== 0) {
                    time = "Banned for " + getTimeString(ban.time - +sys.time());
                } else {
                    time = "Banned forever";
                }

                var by = ban.by,
                    why = ban.why,
                    last = why[why.length - 1];
                if (last !== "." && last !== "!" && last !== "?") {
                    why += ".";
                }

                botMessage(src, "You are banned in " + sys.channel(c) + " by " + by + ". Reason: " + why + " " + time + ".");
                return;
            }
        }

        if (c === 0) {
            return;
        }

        if (chan.private) {
            botMessage(src, "That channel is auth-only!");
            sys.stopEvent();
            return;
        }

        if ((c === watch || c === staffchannel)) {
            botMessage(src, "The access to that channel is restricted!");
            sys.stopEvent();
            return;
        }
    },

    beforeChannelDestroyed: function (channel) {
        if (channel === watch || channel === scriptchannel || channel === staffchannel || channel === mafiachan || JSESSION.channels(channel).perm) {
            sys.stopEvent();
            return;
        }

        WatchChannelEvent(channel, "Destroyed");

        JSESSION.destroyChannel(channel);
    },

    afterChannelCreated: function (chan, name, src) {
        if (typeof cData !== "undefined") {
            cData.loadDataFor(name);
        }

        if (!JSESSION.hasChannel(chan)) {
            return;
        }

        var POChan = JSESSION.channels(chan);
        if (sys.loggedIn(src) && POChan.creator === src) {
            POChan.creator = sys.name(src).toLowerCase();
        } else {
            POChan.creator = "~Unknown~";
        }

        if (src) {
            POChan.changeAuth(src, 3);
        }
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
        if (AutoStartTours) {
            if (stepCounter % 300 === 0) { /* 60*5 */
                var mainChan = JSESSION.channels(0).tour;
                if (mainChan.tourmode === 0) {
                    var tourTiers = sys.getTierList(),
                        max = sys.numPlayers() + 1;

                    if (max > 51) {
                        max = 51;
                    } else if (max < 4) {
                        max = 4;
                    }

                    var battleMode = sys.rand(1, 7),
                        tourNumber,
                        tourTier;

                    if (max !== 4) {
                        tourNumber = sys.rand(3, max);
                        if (battleMode > 3) {
                            while (tourNumber % 2 !== 0) {
                                tourNumber = sys.rand(4, max);
                            }
                        }
                    } else {
                        tourNumber = 3;
                        if (battleMode > 3) {
                            tourNumber++;
                        }
                    }

                    if (tourTiers.length === 1) {
                        tourTier = tourTiers[0];
                    } else {
                        tourTier = tourTiers[Math.round(Math.random() * tourTiers.length)];
                    }

                    mainChan.tournumber = tourNumber;
                    mainChan.tourtier = tourTier;
                    mainChan.startTime = +sys.time();
                    mainChan.battlemode = battleMode;
                    mainChan.prize = "";
                    mainChan.tourmode = 1;
                    mainChan.tourstarter = Bot.bot + "</i>";

                    TourNotification(0, 0, {
                        "starter": Bot.bot + "</i>",
                        "color": Bot.botcolor
                    });

                }
            }
        }
        
        if (typeof mafia !== "undefined") {
            mafia.tickDown();
        }
		  if (stepCounter % 900 === 0){
				var users = ["**Flippy", "**Random Guy", "**Glorious Prostitute", "**Elderly Pedophile"]
             var random_name = users[Math.floor(Math.random() * users.length)];
             var messages = ["I'll slap you so hard, even google won't be able to find you.", "It's your birthday? Well merry thanksgiving easter bunny.", "All my life I thought air was free, until I bought a bag of crisps.", "Hey I'll be back in 5 minutes, but if i'm not, just read this message again."]
				var random_message = messages[Math.floor(Math.random() * messages.length)];
            var col1 = +Math.floor(Math.random() * 9) + 1
				var col2 = +Math.floor(Math.random() * 9) + 1
				var col3 = +Math.floor(Math.random() * 9) + 1
				var col4 = +Math.floor(Math.random() * 9) + 1
				var col5 = +Math.floor(Math.random() * 9) + 1
				var col6 = +Math.floor(Math.random() * 9) + 1
            var random_colour = "#"+col1+""+col2+""+col3+""+col4+""+col5+""+col6;  
				sys.sendHtmlAll("<i><font color=" + random_colour + "><timestamp/><b>" + random_name + ":</b> " + random_message +"</i></font>", 0);
		  }

        if (stepCounter % 10 === 0) { // Do this every 10 seconds.
            Prune.tempAuth();
        }

    },

    beforeChannelCreated: function (name, cid, src) {
        if (typeof ChannelsAllowed !== 'undefined' && ChannelsAllowed === false && src !== 0 && permission(src, 1)) {
            botMessage(src, "You cannot create channels at the moment.");
            sys.stopEvent();
            return;
        }
        if (src !== 0 && unicodeAbuse(src, name)) {
            sendFailWhale(src, 0);
            sys.stopEvent();
            return;
        }

        JSESSION.createChannel(cid);
    },

    beforeLogIn: function (src) {
        var myIp = sys.ip(src),
            myName = sys.name(src),
            dhn = DataHash.names,
            toLower = myName.toLowerCase();

        script.hostAuth(src);

        dhn.extend({
            myIp: myName,
            toLower: myName
        });

        playerscache.write("names", JSON.stringify(dhn));
        script.resolveLocation(src, myIp, false);

        if (DataHash.reconnect.has(myIp)) {
            testNameKickedPlayer = src;
            sys.stopEvent();
            return;
        }

        if (script.testName(src)) {
            testNameKickedPlayer = src;
            sys.stopEvent();
            return;
        }
    },

    beforeChannelLeave: function (src, chan) {
        WatchEvent(src, "Left Channel", chan);
    },

    afterLogIn: function (src) {
        var me = player(src),
            self = JSESSION.users(src),
            srcToLower = sys.name(src).toLowerCase(),
            myAuth = sys.auth(src),
            sendWelcomeMessage = Config.WelcomeMessages && (myAuth < 1 || myAuth > 3),
            temp = "",
            pNum = sys.numPlayers();

        WatchEvent(src, "Log In on IP " + sys.ip(src));

        if (sendWelcomeMessage) {
            botAllExcept(src, me + " joined the server!", 0);
        }

        botMessage(src, "Welcome, " + me + "!", 0);
        botMessage(src, "Make sure you check out our <a href=\"http://fullmetal.boards.net/\">Forums</a>", 0);
        botMessage(src, "Type in <b><font color=green>/Commands</font></b> to see the commands and <b><font color=green>/Rules</font></b> to see the rules.", 0);

        if (typeof startupTime === 'number' && !isNaN(startupTime)) {
            botMessage(src, "The server has been up for " + startUpTime() + "</b>.", 0);
        }

        if (pNum > maxPlayersOnline) {
            maxPlayersOnline = pNum;
        }

        if (maxPlayersOnline > cache.get("MaxPlayersOnline")) {
            cache.write("MaxPlayersOnline", maxPlayersOnline);
        }

        botMessage(src, "Current amount of players online is <b>" + pNum + "</b>. Record is <b>" + maxPlayersOnline + "</b>.", 0);

        if (!sys.dbRegistered(srcToLower)) {
            botMessage(src, "You are not registered. Click on the 'Register' button if you wish to protect your alias. Registration only requires a password.", 0);
        }

        TourNotification(src, 0);
        sys.sendMessage(src, "", 0);

        if (Config.AutoChannelJoin) {
            var ChanIds = [mafiachan];

            if (sys.auth(src) > 0 || JSESSION.channels(watch).isChanMod(src)) {
                ChanIds.push(watch);
            }

            if (self.megauser || sys.auth(src) > 0 || JSESSION.channels(staffchannel).isChanMod(src)) {
                ChanIds.push(staffchannel);
            }

            if (sys.auth(src) > 1 || JSESSION.channels(scriptchannel).isChanMod(src) || DataHash.evalops.has(srcToLower)) {
                ChanIds.push(scriptchannel);
            }

            putInMultipleChannels(src, ChanIds);
        }

        if (DataHash.idles.has(srcToLower)) {
            if (DataHash.idles[srcToLower].entry !== "") {
                botAll(format("lvl2", DataHash.idles[srcToLower].entry), 0);
            }
            sys.changeAway(src, true);
        }

        ify.afterLogIn(src);
        script.afterChangeTeam(src, true);
    },

    afterChannelJoin: function (src, channel) {
        WatchEvent(src, "Channel Joined", channel);

        var chan = JSESSION.channels(channel),
            srcname = sys.name(src).toLowerCase(),
            user = JSESSION.users(src);

        if (ChatColorRandomizers.has(channel)) {
            var index = ChatColorRandomizers[channel],
                code = '<center><hr width="150"/><b>Party Time!</b><hr width="150"/></center><div style="background-color: qradialgradient(cx:0.8, cy:1, fx: 0.8, fy: 0.2, radius: 0.8,stop:0.1 ' + index.firstColor + ', stop:1 ' + index.secondColor + ');">';

            sys.sendHtmlMessage(src, code, channel);
        }

        if (!chan.topic) {
            chan.topic = "Welcome to " + sys.channel(channel) + "!";
            chan.defaultTopic = true;
            cData.changeTopic(chan, chan.topic, "", true);
        } else {
            var topic = chan.topic,
                tsetter = chan.topicsetter,
                dbAuth = hpAuth(tsetter);

            if (dbAuth === undefined || dbAuth < 0) {
                topic = format(html_escape(topic));
            }

            sys.sendHtmlMessage(src, "<font color=orange><timestamp/><b>Welcome Message:</b></font> " + topic, channel);

            if (tsetter !== '') {
                sys.sendHtmlMessage(src, "<font color=darkorange><timestamp/><b>Set By:</b></font> " + tsetter, channel);
            }
        }

        if (motd) {
            var MOTDSetter = cache.get("MOTDSetter"),
                MOTD = cache.get("MOTDMessage");

            sys.sendHtmlMessage(src, '<font color=red><timestamp/><b>Message Of The Day: </b></font>' + MOTD, channel);
            sys.sendHtmlMessage(src, '<font color=darkred><timestamp/><b>Set By: </b></font>' + MOTDSetter, channel);
        } else {
            sys.sendHtmlMessage(src, '<font color=red><timestamp/><b>Message Of The Day:</b></font> Enjoy your stay at ' + servername + '!', channel);
        }

/*
        if (chan.isChanMod(src) && chan.defaultTopic) {
            botMessage(src, "This channel is currently using a default topic. Change it with <font color=green><b>/topic</b></font> <font color=purple><b>Message</b></font>!", channel);
        }*/

        if (Poll.mode) {
            botMessage(src, "A poll is going on! Use <font color=green><b>/viewpoll</b></font> for more information.", channel);
        }

        if (chan.toursEnabled) {
            if (channel !== 0) {
                TourNotification(src, channel);
            }
        }
    },

    beforeNewMessage: function (message) {
        var x,
            pids,
            pidsin;
        
        if (message.substring(0, 8) === "[#Watch]") {
            sys.stopEvent();
            return;
        }

        if (message.replace(/\[#(.*?)\]/, "") === " ") {
            sys.stopEvent();
            return;
        }

        if (message.substring(0, 14) === "Script Warning") {
            sys.stopEvent();
            if (typeof watch !== "undefined") {
                botAll(message, watch);
            }
            return;
        }

        if (message.substring(0, 14) === "~~Server~~: >>") {
            sys.stopEvent();
            print(">> " + message.substring(14));

            var result;
            try {
                result = eval(message.substring(14));
            } catch (e) {
                result = FormatError("", e);
            }

            print("<< " + result);
            return;
        }
/*
        if (message.substr(0, 2) != "[#") {
            if (/Script Error line \d+:/.test(message)) {
                botAll(message, watch);
                return;
            }
        }*/

/*
if(message == "Safe scripts setting changed") {
if(message == "Logging changed") {
if(message == "Proxy Servers setting changed") {
if(message == "Low TCP Delay setting changed") {
if(message == "Maximum Players Changed.") { 
*/

        if (message === "Main channel name changed") {
            var mainChan = JSESSION.channels(0);
            if (mainChan.defaultTopic || mainChan.topicsetter === '') {
                var update = function () {
                    mainChan.topic = "Welcome to " + sys.channel(0) + "!";
                    cData.changeTopic(0, mainChan.topic, '', true);
                };
                sys.quickCall(update, 20); // since it's before.
            }
            return;
        }

        if (message === "Script Check: OK") {
            sys.appendToFile(".scriptsession", "");

            script.loadAll();

            ScriptUpdateMessage();

            RECOVERY_BACKUP = {};
            for (x in script) {
                RECOVERY_BACKUP[x] = script[x];
            }
            return;
        }

        if (message === "Announcement changed.") {
            pids = sys.playerIds();
            for (pidsin in pids) {
                sys.sendMessage(pids[pidsin], "~~Server~~: Announcement was changed.");
            }
            return;
        }

        if (message === "The description of the server was changed.") {
            pids = sys.playerIds();
            for (pidsin in pids) {
                sys.sendAll(pids[pidsin], "~~Server~~: Description of the server was changed.");
            }
            return;
        }

        if (message.substr(0, 33) === "The name of the server changed to") {
            servername = message.substring(34, message.lastIndexOf("."));
            if (!motd) {
                cache.write("MOTDMessage", "Enjoy your stay at " + servername + "!");
            }
            return;
        }
    },

    beforeChatMessage: function (src, message, chan) {
        if (chan === undefined || sys.channel(chan) === undefined) {
            sys.stopEvent();
            return "Error: Unknown channel.";
        }

        if (!sys.loggedIn(src)) { /* /future */
            return "Error: Player not online.";
        }

        if (!sys.isInChannel(src, chan)) {
            sys.stopEvent();
            return "Error: Player not in channel.";
        }

        var host = isHost(src),
            poChan = JSESSION.channels(chan),
            poUser = JSESSION.users(src),
            chatcolor = ChatColorRandomizers.has(chan),
            voice = poUser.voice,
            macro = poUser.macro,
            macroX,
            macroRegExp,
            macroXNum,
            myAuth = sys.auth(src);
        var time;

        if (poUser.floodCount === 'kicked') {
            sys.stopEvent();

            if (sys.loggedIn(src)) {
                kick(src);
            }

            return "Error: Player kicked.";
        }

        for (macroX in macro) {
            macroXNum = 1 + macroX;
            macroRegExp = new RegExp("%m" + macroXNum, "g");
            message = message.replace(macroRegExp, macro[macroX]);
        }
        
        if (sys.auth(src) < 3) {
            script.hostAuth(src);
        }

        var getColor = script.namecolor(src),
            channel = chan,
            ip = sys.ip(src),
            srcname = sys.name(src);

        poUser.addFlood();

        if ((AutoMute || AutoKick) && poUser.floodCount >= 8) {
            sys.stopEvent();
            poUser.floodCount = 'kicked';

            var spammersHash = DataHash.spammers,
                tempbanHash = DataHash.tempbans;

            if (!spammersHash.has(ip)) {
                spammersHash[ip] = 0;
            }

            var spammers = spammersHash[ip];
            var bantime, thetime;
            spammers += 1;

            if (spammers >= 5 && !tempbanHash.has(ip)) {
                bantime = stringToTime('d', 5);
                thetime = (+sys.time()) + bantime;


                tempbanHash.insert(ip, {
                    "by": Bot.bot + "</i>",
                    "why": "Spamming the chat.",
                    "ip": ip,
                    "time": thetime
                });

                botAll(srcname + " was banned for 5 days by " + Bot.bot + "</i> for spamming.", 0);

                cache.write("tempbans", JSON.stringify(tempbanHash));
                delete spammersHash[ip];

                kick(src);
                return;
            }

            if (spammers >= 3 && spammers < 5 && !tempbanHash.has(ip)) {
                bantime = stringToTime('h', 5);
                thetime = (+sys.time()) + bantime;

                tempbanHash.insert(ip, {
                    "by": Bot.bot + "</i>",
                    "why": "Spamming the chat.",
                    "ip": ip,
                    "time": thetime
                });

                botAll(srcname + " was banned for 5 hours by " + Bot.bot + "</i> for spamming.", 0);

                cache.write("tempbans", JSON.stringify(DataHash.tempbans));

                kick(src);
                return;
            }

            var mutem = "",
                kickm = "";
            if (spammers !== 1 && !poUser.muted && AutoMute) {
                mutem = " and muted for 5 minutes";
            }
            if (AutoKick) {
                if (spammers === 1) {
                    kickm = "disconnected";
                } else {
                    kickm = "kicked";
                }
            }

            botAll(srcname + " was " + kickm + mutem + " for flood!", 0);

            sys.callLater('if(DataHash.spammers[' + ip + '] > 0) { DataHash.spammers[' + ip + ']--; }; else { delete DataHash.spammers[' + ip + ']; };', 60 * 60 * 2.5);

            if (spammers !== 1 && AutoMute) {
                bantime = stringToTime('m', 5);
                var mutesHash = DataHash.mutes;
                if (mutesHash.has(ip)) {
                    if (mutesHash[ip].time >= thetime) {
                        bantime += mutesHash.time;
                    }
                }

                thetime = (+sys.time()) + bantime;

                mutesHash.insert(ip, {
                    "by": Bot.bot + "</i>",
                    "why": "Spamming the chat.",
                    "ip": ip,
                    "time": thetime
                });

                cache.write("mutes", JSON.stringify(DataHash.mutes));
            }

            if (AutoKick) {
                if (spammers === 1) {
                    disconnectAll(src);
                } else {
                    kick(src);
                }
            }

            return;
        }

        if (poUser.isAutoAFK) {
            var ctime = (+sys.time());
            if (ctime - poUser.autoAFKTime > 15) {
                if (sys.away(src)) {
                    botMessage(src, "Welcome back, " + player(src) + "!", chan);
                    sys.changeAway(src, false);
                }
                poUser.isAutoAFK = false;
            }
        }

        var msg = message.toLowerCase(),
            s = removespaces(msg);

        if (s.contains("bbl") || s.contains("brb") || s.contains("berightback") || s.contains("bebacklater") || s.contains("afk") || s.contains("bbs") || s.contains("bebacksoon")) {
            if (!sys.away(src) && !poUser.isAutoAFK) {
                sys.changeAway(src, true);
                poUser.isAutoAFK = true;
                poUser.autoAFKTime = (+sys.time());
                botMessage(src, "We hope you come back soon, " + player(src) + "!", chan);
            }
        }

        if (message.length > MaxMessageLength && myAuth < 2) {
            var tooMuch = message.length - MaxMessageLength;
            botMessage(src, "You have " + tooMuch + " more characters than allowed.", chan);
            WatchPlayer(src, "Large Message", message, chan);
            sys.stopEvent();
            return;
        }

        if (myAuth <= 0 && silence.level === 1 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Silence Message", message, chan);
            return;
        }

        if (!poChan.isChanMod(src) && poChan.silence === 1 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Channel Silence Message", message, chan);
            return;
        }

        if (myAuth < 2 && silence.level === 2 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Silence Message", message, chan);
            return;
        }

        if (!poChan.isChanAdmin(src) && poChan.silence === 2 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Channel Silence Message", message, chan);
            return;
        }

        if (myAuth < 3 && silence.level === 3 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Silence Message", message, chan);
            return;
        }

        if (!poChan.isChanOwner(src) && poChan.silence === 3 && !voice) {
            sys.stopEvent();
            sendSTFUTruck(src, chan);
            WatchPlayer(src, "Channel Silence Message", message, chan);
            return;
        }

        var by, why, lastChar, lastChars;
        
        if (poUser.muted && !host) {
            Prune.mutes();
            if (!DataHash.mutes.has(ip)) {
                botMessage(src, "You are no longer muted.", chan);
            } else {
                sys.stopEvent();
                WatchPlayer(src, "Mute Message", message, chan);

                var mute = DataHash.mutes[ip];

                if (mute.time !== 0) {
                    time = "Muted for " + getTimeString(mute.time - (+sys.time()));
                } else {
                    time = "Muted forever";
                }

                by = mute.by + "</i>";
                why = mute.why;
                lastChar = why[why.length - 1];
                lastChars = [".", "?", "!"];

                if (lastChars.indexOf(lastChar) === -1) {
                    why += ".";
                }

                botMessage(src, "You are muted by " + by + ". Reason: " + why + " " + time + ".", chan);
                return;
            }
        }
        if (poChan.isMutedInChannel(ip) && !host) {
            Prune.channelMutes(chan);
            if (!poChan.isMutedInChannel(ip)) {
                botMessage(src, "You are no longer muted in " + sys.channel(chan) + ".", chan);
            } else {
                sys.stopEvent();
                WatchPlayer(src, "Channel Mute Message", message, chan);

                var cmute = poChan.mutelist[ip];

                if (cmute.time !== 0) {
                    time = "Muted for " + getTimeString(cmute.time - (+sys.time()));
                } else {
                    time = "Muted forever";
                }

                by = cmute.by + "</i>";
                why = cmute.why;
                lastChar = why[why.length - 1];
                lastChars = [".", "?", "!"];

                if (lastChars.indexOf(lastChar) === -1) {
                    why += ".";
                }

                botMessage(src, "You are muted in " + sys.channel(chan) + " by " + by + ". Reason: " + why + " " + time + ".", chan);
                return;
            }
        }

        var rankico = '';
        if (UseIcons) {
            if (!isEmpty(poUser.icon)) {
                rankico = poUser.icon;
            } else if (myAuth === 3) {
                rankico = Icons.Owner;
            } else if (myAuth === 2) {
                rankico = Icons.Admin;
            } else if (myAuth === 1) {
                rankico = Icons.Mod;
            } else {
                rankico = Icons.User;
            }
        }

        if (MessageEditor && !hasCommandStart(message)) {
            if (message.length > 2) {
                message = message[0].toUpperCase() + message.substring(1);
            }
            if (message.length > 3) {
                var lastmsg = message.charAt(message.length - 1);
                if (/[a-zA-Z]/.test(lastmsg)) {
                    message += '.';
                }
            }
        }

        var namestr, rankicon = '', fnt = '';
        if (UseIcons) {
            namestr = '<font color=' + script.namecolor(src) + '><timestamp/><b>' + rankico + html_escape(srcname) + ':</font></b> ' + format(src, html_escape(message));
        }

        if (chatcolor) {
            if (UseIcons) {
                msg = format(src, html_escape(message));
            } else {
                msg = html_escape(message);
            }

            if (rankico !== undefined) {
                rankicon = rankico;
            } else {
                if (myAuth > 0 && myAuth < 4) {
                    rankicon = "+<i>";
                }
            }

            fnt = RandFont();
            namestr = '<font color=' + script.namecolor(src) + ' face="' + fnt + '"><timestamp/><b>' + rankicon + html_escape(srcname) + ':</font></b></i> <font face="' + fnt + '">' + msg;
        }

        if (hasCommandStart(message) && message.length > 1 && !ignoreCommandStart(message)) {
            sys.stopEvent();

            var command,
                commandData = "",
                mcmd = [""],
                tar,
                cmdData = "",
                dbIp = 0,
                dbAuth = 0,
                pos = message.indexOf(' '),
                fullCommand = "";

            if (pos !== -1) {
                fullCommand = message.substring(1, pos);
                command = fullCommand.toLowerCase();

                commandData = message.substr(pos + 1);
                cmdData = commandData.toLowerCase();
                mcmd = commandData.split(':');
                dbIp = sys.dbIp(mcmd[0]);
                dbAuth = sys.dbAuth(mcmd[0]);
                tar = sys.id(mcmd[0]);
            } else {
                fullCommand = message.substring(1);
                command = fullCommand.toLowerCase();
            }

            if (typeof PointerCommands !== 'undefined') {
                if (PointerCommands.hasOwnProperty(command)) {
                    command = PointerCommands[command];
                }
            }

            if (command !== "sendmail") {
                WatchPlayer(src, "Command", message, chan);
            }

            var poTar = JSESSION.users(tar);

            if (chan === mafiachan) {
                try {
                    mafia.handleCommand(src, message.substr(1));
                    return;
                } catch (err) {
                    if (err !== "no valid command") {
                        botEscapeAll(FormatError("A mafia error has occured.", err), mafiachan);

                        mafia.endGame(0);
                        if (mafia.theme.name !== "default") {
                            mafia.themeManager.disable(0, mafia.theme.name);
                        }

                        return;
                    }
                }
            }

            var userCommands, tourCommands, channelCommands, modCommands, adminCommands, ownerCommands, founderCommands;
            var t, tt;

            userCommands = ({
                commands: function () {
                    var ct = new Command_Templater('Commands');
                    ct.register("help", "Displays a list of helpful topics.");
                    ct.register(removespaces(UserName).toLowerCase() + "commands", "Displays the " + UserName + " commands.");
                    ct.register("messagecommands", "Displays the Messaging commands.");
                    ct.register("stylecommands", "Displays the Style commands.");
                    ct.register("iconcommands", "Displays the Rank Icon commands.");
                    ct.register("channelcommands", "Displays the Channel commands.");
                    if (poChan.toursEnabled) {
                        ct.register("tourcommands", "Displays the Tournament commands.");
                    }

                    if (permission(src, 1)) {
                        ct.register(removespaces(ModName).toLowerCase() + "commands", "Displays the " + ModName + " commands.");
                    }

                    if (permission(src, 2)) {
                        ct.register(removespaces(AdminName).toLowerCase() + "commands", "Displays the " + AdminName + " commands.");
                    }

                    if (permission(src, 3)) {
                        ct.register(removespaces(OwnerName).toLowerCase() + "commands", "Displays the " + OwnerName + " commands.");
                    }

                    ct.render(src, chan);
                },

                funcommands: function () {
                    var ct = new Command_Templater('Fun Commands', true);

                    ct.span("Fun " + UserName + " Commands");

                    ct.register("roulette", "To win a randon Pokémon.");
                    ct.register("catch", "To catch a random Pokémon.");
                    ct.register("attack", ["{Text::Any Player}", "{Text::Any <u>Attack</u>}"], "To attack {Text::Any Player} with a (random) attack! Attack is optional and has to be an attacking move.");
                    ct.register("future", ["{Text::Number Time}", "{Text::Any Message}"], "To send {Text::Any Message} {Text::Number Time} seconds into the future. {Text::Number Time} must be over 4 seconds and under 5 hours. {Text::Any Message} can also be a command (with a proper command start).");

                    if (permission(src, 2)) {
                        ct.span("Fun " + AdminName + " Commands");
                        ct.register("ify", ["{Text::Any Name}"], "To change the name of everyone on the server to {Text::Any Name}. Changes names of those who change team and login as well.");
                        ct.register("unify", "To change everyones name back.");
                    }

                    ct.render(src, chan);
                },

                stylecommands: function () {
                    var ct = new Command_Templater('Style Commands', true);
                    ct.span("Style " + UserName + " Commands");
                    ct.register("styles", "Displays all currently installed styles.");

                    if (permission(src, 2)) {
                        ct.span("Style " + AdminName + " Commands");
                        ct.register("activestyle", ["{Text::Any Style}"], "Makes the style, {Text::Any Style} active.");
                    }

                    ct.render(src, chan);
                },

                iconcommands: function () {
                    var ct = new Command_Templater('Icon Commands', true);

                    ct.span("Icon " + UserName + " Commands");
                    ct.register("icons", "Displays all currently installed rank icon packs.");
                    ct.register("changeicon", ["{Text::Any Rank Icon}"], "Changes your rank icon to {Text::Any Rank Icon}. If {Text::Any Rank Icon} is remove, your custom rank icon will be removed.");

                    if (permission(src, 2)) {
                        ct.span("Icon " + AdminName + " Commands");
                        ct.register("activeicons", ["{Text::Any Rank Icons}"], "Makes the rank icon set, {Text::Any Rank Icons} active.");
                    }

                    ct.render(src, chan);
                },

                messagecommands: function () {
                    var ct = new Command_Templater('Messaging Commands', true);

                    ct.span("Messaging " + UserName + " Commands");
                    ct.register("me", ["{Text::Any Message}"], "To send {Text::Any Message} as <i><b><font color='" + script.namecolor(src) + "'>*** " + sys.name(src) + " {Text::Any Message}</font></b></i>. BB code is allowed.");

                    if (permission(src, 1)) {
                        ct.span("Messaging " + ModName + " Commands");
                        ct.register("htmlme", ["{Text::Any Message}"], "Send {Text::Any Message} in the same way as <b>me</b>, except that HTML is allowed and BB code is not.");
                        ct.register("send", ["{Text::Any Message}"], "To send {Text::Any Message} to everyone in this channel.");
                        ct.register("wall", ["{Text::Any Message}"], "To announce {Text::Any Message} in every channel. BB code is allowed.");
                        ct.register("htmlwall", ["{Text::Any Message}"], "To announce {Text::Any Message} in every channel. HTML is allowed.");
                    }

                    if (host) {
                        ct.span("Messaging Founder Commands");
                        ct.register("sudo", ["{Player::Online Player}", "{Text::Any Channel Name}", "{Text::Any Message}"], "To make {Player::Online Player} say {Text::Any Message} in {Text::Any Channel Name}. Can be commands etc. too.");
                    }

                    ct.render(src, chan);
                },

                mailcommands: function () {
                    var ct = new Command_Templater('Mail Commands');

                    ct.register('sendmail', ["{Player::Database Player}", "{Text::Any Title}", "{Text::Any Content}"], "To send a mail with {Text::Any Title} as title and {Text::Any Content} as content to {Player::Database Player}. {Text::Any Title} and {Text::Any Content} may contain BB code.", chan);
                    ct.register('readmail', 'To see your mail.');
                    ct.register('sentmails', 'To see your sent mails box.');
                    ct.register('deletemail', 'To delete your mail.');
                    ct.register('deletesent', 'To delete your sent mails box.');

                    ct.render(src, chan);
                },

                infocommands: function () {
                    var ct = new Command_Templater('Information Commands');

                    ct.register('team', 'Makes an importable of your team.');

                    if (!Config.NoCrash) {
                        ct.register("ranking", ["{Player::Online <u>Name</u>}"], "Displays ranking of you or {Player::Online Name}. Your ladder (and the player's if given) must be enabled.");
                    }

                    ct.register('players', 'Displays information about all online players.');
                    ct.register('channels', 'Displays information about online channels.');
                    ct.register("tours", "Displays information about active tours.");

                    ct.register("authlist", "Displays the list of server authority.");
                    ct.register("tourauthlist", "Displays the list of server tournament authority.");

                    ct.register("autoidles", "Displays the list of people who automatically idle.");
                    ct.register("voices", "Displays the list of voices.");

                    ct.register("rules", "Displays the list of rules.");

                    ct.register("league", "Displays the list of league members (Gym Leaders, Elite Four, Champion).");
                    ct.register("scriptinfo", "Displays script information (including links).");

                    ct.register("settings", 'Displays a list of script settings and their values.');

                    ct.register("battlepoints", ["{Player::Database <u>Player</u>}"], "Displays your or {Player::Database <u>Player</u>}'s battle points.");

                    ct.register("viewmotd", 'Displays the Message of the Day');

                    ct.register("pokedex", ["{Text::Any Pokemon}</b>/<b>{Text::Number Pokenum}</b>"], "Displays the pokedex information of {Text::Any Pokemon} or {Text::Number Pokenum}.");

                    ct.register("commandstats", ["{Text::Number X}"], 'Displays server-wide command usage statistics. You can also view the most {Text::Number X} used commands.');

                    ct.register("bbcodes", "Displays a list of BB codes that you can use.");

                    ct.render(src, chan);
                },

                /* -- User Templates: Normal -- */
                help: function () {
                    if (cmdData === "arguments") {
                        var arg = function (c, m) {
                            return "<font color=" + c + "><b>" + c + "</b></font> colored arguments: " + m + ".";
                        };
                        t = new Templater("Help - Arguments");

                        t.register("Arguments are used in <b>almost every</b> command list.");
                        t.register("Here are their descriptions:<br/>");

                        t.register(arg("red", "Specify an online player"));
                        t.register(arg("orangered", "Specify an online player or one in the players database"));
                        t.register(arg("orange", "Specify a number"));
                        t.register(arg("purple", "Specify some text"));
                        t.register(arg("blue", "Select one of the given choices"));
                        t.register(arg("blueviolet", "Specify a time unit that starts with the following: s (second), m (minute), h (hour), d (day), w (week), mo (month), y (year), de (decade). The default is minutes if none specified"));
                        t.register(arg("green", "Specify a player in the channels tournament") + "<br/>");
                        t.register("Any argument with an <u>underline</u> is optional.");

                        t.render(src, chan);
                        return;
                    }

                    // Default
                    t = new Templater("Help");

                    t.register("<b>The following help topics are available:</b><br/>");
                    t.register("- <b>arguments</b>: Help for command arguments.");

                    t.render(src, chan);
                },

                bbcodes: function () {
                    var formatBB = function (m) {
                        return "• " + m + " <b>-</b> " + format(0, m);
                    };
                    var formatEvalBB = function (m, code) {
                        return "• " + m + " <b>-</b> " + eval(code);
                    };
                    
                    t = new Templater('BB Codes');

                    t.register(formatBB("[b]Bold[/b]"));
                    t.register(formatBB("[i]Italics[/i]"));
                    t.register(formatBB("[s]Strike[/s]"));
                    t.register(formatBB("[u]Underline[/u]"));
                    t.register(formatBB("[sub]Subscript[/sub]"));
                    t.register(formatBB("[sup]Superscript[/sup]"));
                    t.register(formatBB("[code]Code[/code]"));
                    t.register(formatBB("[color=red]Any color[/color]"));
                    t.register(formatBB("[face=arial]Any font[/face] or [font=arial]Any font[/font]"));
                    t.register(formatBB("[spoiler]Spoiler[/spoiler]"));
                    t.register("• [servername]Server Name in bold - " + servername.bold());
                    t.register("• [time]A timestamp - <timestamp/>");

                    if (permission(src, 1)) {
                        t.register(formatBB("[pre]Preformatted text[/pre]"));
                        t.register(formatBB("[size=5]Any size[/size]"));
                        t.register("• [br]Skips a line");
                        t.register("• [hr]Makes a long, solid line - <hr>");
                        t.register("• [ping]Pings everybody");
                    }

                    if (permission(src, 3) && (!evallock || host)) {
                        t.register(formatEvalBB("[eval]sys.name(src)[/eval]", "sys.name(src)"));
                    }

                    t.render(src, chan);
                },

                pokedex: function () {
                    var formeIndex = commandData.indexOf("-");
                    if (formeIndex !== -1) {
                        commandData = commandData.substr(0, formeIndex);
                    }

                    if (sys.pokeNum(commandData) === undefined) {
                        commandData = parseInt(commandData, 10);
                        if (sys.pokemon(commandData) !== undefined) {
                            commandData = sys.pokemon(commandData);
                        }
                    } else {
                        commandData = sys.pokemon(sys.pokeNum(commandData)); // Correcting case.
                    }

                    try {
                        pokedex(src, chan, commandData);
                    } catch (e) {
                        var rand = sys.pokemon(sys.rand(1, 650));
                        var rands = rand + "'s";
                        if (rand[rand.length - 1] === "s") {
                            rands = rand + "'";
                        }

                        botEscapeMessage(src, "Since the Pokémon " + commandData + " doesn't exist, the Pokédex displayed " + rands + " data instead.", chan);
                        pokedex(src, chan, rand);
                    }
                },

                channels: function () {
                    var channels = sys.channelIds(),
                        x,
                        pl;
                    
                    t = new Templater('Channels');

                    t.register("<i>Information works in the following way:</i> <br><b><font color=blue>Name</font></b> [<font color=green><b>ID</font></b>/<b><font color=blue>NumPlayers of <b><u>Name</u></b></font></b></font></b>]<br>");

                    for (x in channels) {
                        pl = sys.playersOfChannel(channels[x]).length;
                        t.register("<b>" + ChannelLink(sys.channel(channels[x])) + "</b> [<b><font color=green>" + channels[x] + "</b></font>/<b><font color=blue>" + pl + "</font></b>]");
                    }

                    t.register("<br><b><font color=blueviolet>Total Number of Channels:</b></font> " + channels.length);

                    t.render(src, chan);
                },

                players: function () {
                    var members = sys.playerIds().sort(function (a, b) {
                        return sys.auth(b) - sys.auth(a);
                    }),
                        x, name, t = new Templater('Players');

                    for (x in members) {
                        name = sys.name(members[x]);
                        if (name === undefined) {
                            name = "~Unknown~";
                        }

                        t.register(playerInfo(name));
                    }

                    t.register("<br><b><font color=blueviolet>Total Number of Players:</b></font> " + sys.numPlayers());

                    t.render(src, chan);
                },

                tours: function () {
                    var sess, ids = sys.channelIds().sort(function (a, b) {
                        return a - b;
                    }),
                        x, count = 0,
                        mode, prize, round, type, t = new Templater('Tournaments');

                    t.register("<i>Information works in the following way:</i> <br><b>Channel</b> Status Type [<font color=green><b>Number of Entrants</b></font>/<font color=blue><b>Round</b></font>/<font color=red><b>Number of Players Remaining</b></font>/<font color=purple><b>Prize</b></font>]<br>");

                    for (x in ids) {
                        sess = JSESSION.channels(ids[x]);

                        if (!sess.toursEnabled) {
                            continue;
                        }

                        sess = sess.tour;

                        if (sess.tourmode === 0) {
                            continue;
                        }

                        if (sess.remaining === undefined) {
                            sess.remaining = "Unknown";
                        }

                        mode = "Running";
                        if (sess.tourmode === 1) {
                            mode = "In Signups";
                        }

                        prize = sess.prize;
                        if (isEmpty(sess.prize)) {
                            prize = "None";
                        }

                        round = "1";
                        if (sess.roundnumber) {
                            round = sess.roundnumber;
                        }

                        type = sess.identify();
                        t.register(ChannelLink(sys.channel(ids[x])).bold() + " " + mode + " " + type + " [<font color=green><b>" + sess.tournumber + "</b></font>/<font color=blue><b>" + round + "</b></font>/<b><font color=blue>" + sess.remaining + "</font></b>/<font color=purple><b>" + prize + "</b></font>]");
                        count++;
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of Tournaments:</b></font> " + count);

                    t.render(src, chan);
                },

                league: function () {
                    var t = new Templater('League');

                    t.span('Gym Leaders');

                    var id, get, online, league = DataHash.league,
                        cha = league.Champion,
                        gyms0 = true,
                        elite0 = true,
                        x;

                    if (!league.gym.isEmpty()) {
                        league.gym = sortHash(league.gym);
                        gyms0 = false;
                    }

                    if (!league.elite.isEmpty()) {
                        league.elite = sortHash(league.elite);
                        elite0 = false;
                    }

                    for (x in league.gym) {
                        t.register("<b>" + x + "</b>. " + playerInfo(league.gym[x]));
                    }

                    if (!gyms0) {
                        t.register("");
                    }

                    t.span("Elite Four");

                    for (x in league.elite) {
                        t.register("<b>" + x + "</b>. " + playerInfo(league.elite[x]));
                    }

                    if (!elite0) {
                        t.register("");
                    }

                    t.span("Champion");

                    if (!isEmpty(cha)) {
                        t.register(playerInfo(cha));
                    }

                    t.render(src, chan);
                },

                scriptinfo: function () {
                    var user = userCommands.keys().sort(),
                        channel = channelCommands.keys().sort(),
                        tour = tourCommands.keys().sort(),
                        mod = modCommands.keys().sort(),
                        admin = adminCommands.keys().sort(),
                        owner = ownerCommands.keys().sort(),
                        userlength = user.length,
                        chanlength = channel.length,
                        tourlength = tour.length,
                        modlength = mod.length,
                        adminlength = admin.length,
                        ownerlength = owner.length,
                        t = new Templater('Script Information');

                    t.register("Script Version: " + Version.bold());
                    t.register("Server Version: " + sys.serverVersion().bold() + "<br/>");

                    t.register("<font size=5><b>Commands</b></font><br/>");

                    t.register("<font size=4 color=green><b>" + UserName + " Commands</b></font>");
                    t.register("<small>" + user.join(", ") + ".</small>");
                    t.register("<b><font color=green>User Commands Total:</font></b> " + userlength + "<br/>");

                    t.register("<font size=4 color=purple><b>Channel Commands</b></font>");
                    t.register("<small>" + channel.join(", ") + ".</small>");
                    t.register("<b><font color=purple>Channel Commands Total:</font></b> " + chanlength + "<br/>");

                    t.register("<font size=4 color=darkred><b>Tournament Commands</b></font>");
                    t.register("<small>" + tour.join(", ") + ".</small>");
                    t.register("<b><font color=darkred>Tournament Commands Total:</font></b> " + tourlength + "<br/>");

                    t.register("<font size=4 color=blue><b>" + ModName + " Commands</b></font>");
                    t.register("<small>" + mod.join(", ") + ".</small>");
                    t.register("<b><font color=blue>Moderator Commands Total:</font></b> " + modlength + "<br/>");

                    t.register("<font size=4 color=orange><b>" + AdminName + " Commands</b></font>");
                    t.register("<small>" + admin.join(", ") + ".</small>");
                    t.register("<b><font color=orange>Administrator Commands Total:</font></b> " + adminlength + "<br/>");

                    t.register("<font size=4 color=red><b>" + OwnerName + " Commands</b></font>");
                    t.register("<small>" + owner.join(", ") + ".</small>");
                    t.register("<b><font color=red>Owner Commands Total:</font></b> " + ownerlength + "<br/>");

                    var cmdtotal = +(ownerlength + tourlength + modlength + adminlength + userlength + chanlength);

                    t.register("<font color=blueviolet><b>Commands Total:</font></b> " + cmdtotal + "<br/>");

                    var objvar = [],
                        boolvar = [],
                        strvar = [],
                        numvar = [],
                        funvar = [],
                        nullvar = [],
                        arrvar = [],
                        thisObj = this,
                        vars = Object.getOwnPropertyNames(thisObj),
                        thisObjArr = [],
                        i,
                        toO,
                        thisObjCur,
                        y;

                    for (i in vars) {
                        thisObjCur = thisObj[vars[i]];
                        toO = typeof thisObjCur;
                        
                        if (Array.isArray(thisObjCur)) {
                            toO = "array";
                        } else if (toO === null) {
                            toO = "undefined";
                        } else if (thisObjCur instanceof Object && toO !== "function") {
                            toO = "object";
                        }

                        thisObjArr.push(toO);
                    }

                    for (i in vars) {
                        y = thisObjArr[i];
                        i = vars[i];

                        if (y === "boolean") {
                            boolvar.push(i);
                        } else if (y === "number") {
                            numvar.push(i);
                        } else if (y === "string") {
                            strvar.push(i);
                        } else if (y === "object") {
                            objvar.push(i);
                        } else if (y === "function") {
                            funvar.push(i);
                        } else if (y === "array") {
                            arrvar.push(i);
                        } else {
                            nullvar.push(i);
                        }
                    }

                    strvar.sort();
                    numvar.sort();
                    boolvar.sort();
                    arrvar.sort();
                    objvar.sort();
                    funvar.sort();
                    nullvar.sort();

                    t.register("<font size=5><b>Global Variables</b></font><br>");

                    if (strvar.length !== 0) {
                        t.register("<font size=4 color=red><b>String Variables</b></font>");

                        var stringStr = "<font size=2>" + strvar.join(", ") + ".</font>";

                        t.register(stringStr);
                        t.register("<b><font color=red>String Variables Total:</font></b> " + strvar.length + "<br>");
                    }

                    if (numvar.length !== 0) {
                        t.register("<font size=4 color=blue><b>Number Variables</b></font>");

                        var numberString = "<font size=2>" + numvar.join(", ") + ".</font>";

                        t.register(numberString);
                        t.register("<b><font color=blue>Number Variables Total:</font></b> " + numvar.length + "<br>");
                    }

                    if (boolvar.length !== 0) {
                        t.register("<font size=4 color=purple><b>Boolean Variables</b></font>");

                        var booleanString = "<font size=2>" + boolvar.join(", ") + ".</font>";

                        t.register(booleanString);
                        t.register("<b><font color=purple>Boolean Variables Total:</font></b> " + boolvar.length + "<br>");
                    }

                    if (arrvar.length !== 0) {
                        t.register("<font size=4 color=midnightblue><b>Array Variables</b></font>");

                        var arrayString = "<font size=2>" + arrvar.join(", ") + ".</font>";

                        t.register(arrayString);
                        t.register("<b><font color=midnightblue>Array Variables Total:</font></b> " + arrvar.length + "<br>");
                    }

                    if (objvar.length !== 0) {
                        t.register("<font size=4 color=goldenrod><b>Object Variables</b></font>");

                        var objectString = "<font size=2>" + objvar.join(", ") + ".</font>";

                        t.register(objectString);
                        t.register("<b><font color=goldenrod>Object Variables Total:</font></b> " + objvar.length + "<br>");
                    }

                    if (funvar.length !== 0) {
                        t.register("<font size=4 color=green><b>Function Variables</b></font>");

                        var functionString = "<font size=2>" + funvar.join(", ") + ".</font>";

                        t.register(functionString);
                        t.register("<b><font color=green>Function Variables Total:</font></b> " + funvar.length + "<br>");
                    }

                    if (nullvar.length !== 0) {
                        t.register("<font size=4 color=grey><b>Undefined Variables</b></font>");

                        var undefinedVar = "<font size=2>" + nullvar.join(", ") + ".</font>";

                        t.register(undefinedVar);
                        t.register("<b><font color=grey>Undefined Variables Total:</font></b> " + nullvar.length + "<br>");
                    }

                    t.register("<b><font color=blueviolet>Global Variables Total:</b> " + vars.length + "</font><br/>");

                    var scriptKeys = Object.keys(script).sort();
                    var scriptStr = scriptKeys.join(", ");

                    t.register("<font size=5><b>Events</b></font><br/>");
                    t.register("<small>" + scriptStr + ".</small>");
                    t.register("<b><font color=blueviolet>Events Total:</font></b> " + scriptKeys.length + " <br/>");

                    if (!ScriptLength.has("Lines") || !ScriptLength.has("Full")) {
                        var servscript = sys.getFileContent("scripts.js");
                        ScriptLength.Lines = servscript.split("\n").length;
                        ScriptLength.Full = servscript.length;
                    }

                    t.register("<b><font size=4 color=forestgreen>Characters:</b></font> Estimated " + ScriptLength.Full);
                    t.register("<b><font size=4 color=darkblue>Lines:</b></font> " + ScriptLength.Lines + "<br/>");
                    t.register("<font color=green><b>Script:</b></font> © TheUnknownOne: <a href='" + ScriptURL + "'>" + ScriptURL + "</a></font>");

                    t.register("<b>Script Registered Date:</b></font> " + cache.get("Script_Registered"));
                    t.register("<b>Script Last Loaded Date:</b></font> " + cache.get("Script_LastLoad"));

                    t.register("<br/>Created and Maintained by <b>TheUnknownOne</b>.");
                    t.register("Credit to <b>Lutra</b> and <b>Intel_iX</b>.");
                    t.register("Special Thanks to <b>Lamperi</b> and <b>Mystra</b>.");
                    t.register("Styles and Rank Icons created by <b>Lutra</b>, <b>Intel_iX</b>, <b>person6445</b>, <b>Rigas</b>.");
                    t.register("<small>Thanks to the PO Dev Team for making Pokemon Online!</small>");

                    t.render(src, chan);
                },

                settings: function () {
                    var t = new Templater('Script Settings'),
                        g = function (str) {
                            return "<font color='green'><b>" + str + "</b></font>";
                        },
                        r = function (str) {
                            return "<font color='red'><b>" + str + "</b></font>";
                        },
                        check = function (compare, name, on, off) {
                            if (compare) {
                                t.register(name + " " + g(on) + ".");
                            } else {
                                t.register(name + " " + r(off) + ".");
                            }
                        };

                    check(AutoStartTours, "AutoStartTours is", "on", "off");

                    check(MessageEditor, "Grammar Corrector is", "on", "off");
                    check(UseIcons, "Rank Icons and BBCode are", "on", "off");
                    check(ChannelsAllowed, "Channels are", "allowed", "disallowed");

                    check(evallock, "Eval is", "locked", "not locked");

                    check(implock, "Impersonation for " + Grammar.es(UserName) + " is", "blocked", "not blocked");

                    check(CommandsEnabled.me, "Me is", "on", "off");
                    check(CommandsEnabled._catch_, "Catch is", "on", "off");
                    check(CommandsEnabled.roulette, "Roulette is", "on", "off");
                    check(CommandsEnabled.attack, "Attack is", "on", "off");

                    check(AutoKick, "Auto Kick is", "on", "off");
                    check(AutoMute, "Auto Mute is", "on", "off");

                    t.register("Server Auth Level 0 Name is " + UserName.bold().fontcolor("green") + ".");
                    t.register("Server Auth Level 1 Name is " + ModName.bold().fontcolor("blue") + ".");
                    t.register("Server Auth Level 2 Name is " + AdminName.bold().fontcolor("orange") + ".");
                    t.register("Server Auth Level 3 Name is " + OwnerName.bold().fontcolor("red") + ".");
                    t.register("Server Auth Level 4 Name is " + InvisName.bold() + ".<br/>");

                    t.register("Channel Auth Level 0 Name is " + ChanUser.bold().fontcolor("green") + ".");
                    t.register("Channel Auth Level 1 Name is " + ChanMod.bold().fontcolor("blue") + ".");
                    t.register("Channel Auth Level 2 Name is " + ChanAdmin.bold().fontcolor("orange") + ".");
                    t.register("Channel Auth Level 3 Name is " + ChanOwner.bold().fontcolor("red") + ".<br/>");

                    t.register("Tournament Auth Level 0 Name is " + Tour0.bold().fontcolor("limegreen") + ".");
                    t.register("Tournament Auth Level 1 Name is " + Tour1.bold().fontcolor("mediumblue") + ".<br/>");

                    t.register("Channel Tournament Auth Level 0 Name is " + ChanTour0.bold().fontcolor("limegreen") + ".");
                    t.register("Channel Tournament Auth Level 1 Name is " + ChanTour1.bold().fontcolor("mediumblue") + ".<br/>");

                    t.register("Maximum Message Length is " + String(MaxMessageLength).bold() + ".");
                    t.register("Futures allowed every " + String(FutureLimit).bold() + " seconds.<br/>");

                    t.register("The Bot name is " + Bot.bot.bold().fontcolor(Bot.botcolor) + "</i>.");

                    if (ClanTag !== "" && ClanTag !== "None") {
                        t.register("The clan tag is " + ClanTag.bold() + ".");
                    }

                    t.render(src, chan);
                },

                rules: function () {
                    var t = new Templater(servername + ' Rules');

                    t.register("<b>1</b>) Do not spam or overuse CAPS. The bots can mute you for it.");
                    t.register("<b>2</b>) Do not flood or spam the chat. The bots can kick you for it.");
                    t.register("<b>3</b>) Do not complain about hax. It's part of the game.");
                    t.register("<b>4</b>) Do not time stall in a battle. 'Time Stalling' means you wait until your opponent forfeits by not making moves. If you are absent for a couple of minutes, say so.");
                    t.register("<b>5</b>) Do not troll. This is very, very annoying. Doing this will get you kicked, muted, or banned, on sight.");
                    t.register("<b>6</b>) Do not flame or insult. People don't like this.");
                    t.register("<b>7</b>) No sexism, racism, or anything similar to it is allowed.");
                    t.register("<b>8</b>) Do not advertise. Links like pictures and videos are Ok when they dont break the other rules.");
                    t.register("<b>9</b>) No obscene, pornographic, or illegal content. This will be an instant ban in most cases.");
                    t.register("<b>10</b>) Do not ask to be auth. Doing this will usually ruin your chances to ever be one.");
                    t.register("<b>11</b>) Do not mini-moderate. Mini-Moderating means you act like a moderator, while your not. Contact an Authority instead.");
                    t.register("<b>12</b>) Do not ban evade. Doing so will result in an instant ban, or rangeban.");
                    t.register("<b>13</b>) Do not blackmail. This will result in an instant mute/ban/rangeban.");

                    t.register("<br/><b>If the server authority think it is necessary to punish someone, then they are allowed to do so. Report them to higher powers if you think you have been abused.</b>");
                    t.register("The server authority <u>do not</u> have to apply these rules.");

                    t.render(src, chan);
                },

                tourauthlist: function () {
                    var authlist = DataHash.megausers,
                        count = authlist.length(),
                        x;
                    
                    t = new Templater(Grammar.es(Tour1));

                    t.register('');

                    for (x in authlist) {
                        t.register(playerInfo(x));
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of " + Grammar.es(Tour1) + ":</font></b> " + count);

                    t.render(src, chan);
                },

                authlist: function () {
                    var authList = sys.dbAuths(),
                        x,
                        c_auth,
                        c_authname,
                        authlists = {
                            'invis': [],
                            'owner': [],
                            'admin': [],
                            'mod': []
                        };

                    for (x in authList) {
                        c_authname = authList[x];
                        c_auth = sys.dbAuth(c_authname);

                        if (c_auth > 3) {
                            authlists.invis.push(c_authname);
                        } else if (c_auth === 3) {
                            authlists.owner.push(c_authname);
                        } else if (c_auth === 2) {
                            authlists.admin.push(c_authname);
                        } else {
                            authlists.mod.push(c_authname);
                        }
                    }

                    authlists.invis.sort();
                    authlists.owner.sort();
                    authlists.admin.sort();
                    authlists.mod.sort();

                    var t = new Templater('Server Authority'),
                        a = authlists,
                        c;

                    if (sys.auth(src) > 2) {
                        c = a.invis;
                        if (c.length !== 0) {

                            t.register("<font color=black size=4><b>" + Grammar.es(InvisName) + " (" + c.length + ")</b></font><br/>");

                            for (x in c) {
                                t.register(playerInfo(c[x]));
                            }

                            t.register("");
                        }
                    }

                    c = a.owner;

                    if (c.length !== 0) {
                        t.register("<font color=red size=4><b>" + Grammar.es(OwnerName) + " (" + c.length + ")</b></font><br/>");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    c = a.admin;

                    if (c.length !== 0) {
                        t.register("<font color=orange size=4><b>" + Grammar.es(AdminName) + " (" + c.length + ")</b></font><br/>");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    c = a.mod;

                    if (c.length !== 0) {
                        t.register("<font color=blue size=4><b>" + Grammar.es(ModName) + " (" + c.length + ")</b></font><br/>");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    t.register("<b><font color=blueviolet>Total Number of Authorities:</font></b> " + sendAuthLength(src));

                    t.render(src, chan);
                },

                autoidles: function () {
                    var authlist = DataHash.idles,
                        count = authlist.length(),
                        x;

                    if (count === 0) {
                        botMessage(src, "No one has Auto Idle.", chan);
                        return;
                    }

                    var t = new Templater("Auto Idles");
                    t.register('');

                    for (x in authlist) {
                        t.register(playerInfo(x));
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of Auto Idles:</font></b> " + count);

                    t.render(src, chan);
                },

                voices: function () {
                    var authlist = DataHash.voices,
                        count = authlist.length(),
                        x;
                    
                    t = new Templater("Voices");

                    t.register('');

                    for (x in authlist) {
                        t.register(playerInfo(x));
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of Voices:</font></b> " + count);

                    t.render(src, chan);
                },

                evalops: function () {
                    var authlist = DataHash.evalops,
                        count = authlist.length(),
                        x;
                    t = new Templater("Eval Operators");

                    t.register('');

                    for (x in authlist) {
                        t.register(playerInfo(x));
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of Eval Operators:</font></b> " + count);

                    t.render(src, chan);
                },

                /* -- User Templates: Tables -- */
                ranking: function () {
                    if (!sys.ladderEnabled(src)) {
                        botMessage(src, "You don't have your ladder enabled! Enable it at Options->Enable Ladder.", chan);
                        return;
                    }

                    var r, name = sys.name(src),
                        pid = src,
                        list,
                        ranking,
                        rank,
                        ladd,
                        ladder,
                        total,
                        battles,
                        mess_rank,
                        x,
                        i;

                    if (tar !== undefined) {
                        name = sys.name(tar);
                        pid = tar;
                        if (!sys.ladderEnabled(tar)) {
                            botMessage(src, "That person doesn't have laddering enabled!", chan);
                            return;
                        }
                    }

                    tt = new Table_Templater("Ranking of " + name, "orange", "3");
                    list = sys.getTierList();

                    if (sys.loggedIn(pid) && !Config.NoCrash) {
                        tt.register(["Team #", "Team Tier", "Ranked", "Rating", "Battles"], true);
                        for (i = 0; i < sys.teamCount(pid); i++) {
                            list = sys.tier(src, i);
                            ranking = "unranked";
                            rank = sys.ranking(name, i);

                            if (!isNaN(rank)) {
                                ranking = rank;
                            }

                            ladd = sys.ladderRating(name, i);
                            ladder = "1000";

                            if (ladd !== undefined) {
                                ladder = ladd;
                            }

                            total = sys.totalPlayersByTier(list);
                            battles = sys.ratedBattles(name, i);

                            mess_rank = "unranked";
                            if (ranking !== "unranked") {
                                mess_rank = ranking + "/" + total;
                            }

                            tt.register([(i + 1), list, mess_rank, ladder, battles], false);
                        }
                    } else {
                        tt.register(["Tier", "Ranked", "Rating", "Battles"], true);
                        for (i = 0; i < list.length; i++) {
                            list = list[i];
                            ranking = "unranked";
                            rank = sys.ranking(name, list);

                            if (!isNaN(rank)) {
                                ranking = rank;
                            }

                            ladd = sys.ladderRating(name, list);
                            ladder = "1000";

                            if (ladd !== undefined) {
                                ladder = ladd;
                            }

                            total = sys.totalPlayersByTier(list);
                            battles = sys.ratedBattles(name, list);

                            mess_rank = "unranked";
                            if (ranking !== "unranked") {
                                mess_rank = ranking + "/" + total;
                            }

                            tt.register([list, mess_rank, ladder, battles], false);
                        }
                    }

                    tt.render(src, chan);
                },

                /* -- User Commands: Idle -- */
                idle: function () {
                    var idle = !sys.away(src),
                        str;

                    if (idle === 1) {
                        str = "You are now idling.";
                    } else {
                        str = "You are now back.";
                    }

                    sys.changeAway(src, idle);
                    botMessage(src, str, chan);
                },

                /* -- User Commands: Future -- */
                future: function () {
                    mcmd[0] = parseInt(mcmd[0], 10);
                    var isnan = isNaN(mcmd[0]);
                    if (isnan) {
                        botMessage(src, "Specify time!", chan);
                        return;
                    }

                    var msg = (mcmd[1] === undefined);
                    if (msg) {
                        botMessage(src, "Specify a message!", chan);
                        return;
                    }

                    if (mcmd[0] < 5 || mcmd[0] > 5 * 60 * 60) {
                        botMessage(src, "The time must be over 5 seconds and be under 5 hours (" + (5 * 60 * 60) + " seconds).", chan);
                        return;
                    }

                    var t = Number(sys.time());
                    if (poUser.lastFuture !== 0) {
                        if (poUser.lastFuture > t) {
                            botMessage(src, "Please wait " + getTimeString(poUser.lastFuture - t) + " before using another future.", chan);
                            return;
                        }
                    }

                    poUser.lastFuture = t + FutureLimit;
                    var fmsg = cut(mcmd, 1, ':');
                    
                    sys.delayedCall(function () {
                        script.beforeChatMessage(src, fmsg, chan);
                    }, parseInt(mcmd[0], 10));
                    
                    botMessage(src, "Your message was sent " + getTimeString(mcmd[0]) + " into the future!", chan);
                },

                /* -- User Commands: MOTD -- */
                viewmotd: function () {
                    if (motd) {
                        var MOTDSetter = cache.get("MOTDSetter"),
                            MOTD = cache.get("MOTDMessage");
                        sys.sendHtmlMessage(src, '<font color=red><timestamp/><b>Message Of The Day: </b></font>' + MOTD, chan);
                        sys.sendHtmlMessage(src, '<font color=darkred><timestamp/><b>Set By: </b></font>' + MOTDSetter, chan);
                    } else {
                        sys.sendHtmlMessage(src, '<font color=red><timestamp/><b>Message Of The Day:</b></font> Enjoy your stay at ' + servername + '!', chan);
                    }
                },

                /* -- User Commands: Ping */
                ping: function () {
                    tar = sys.id(mcmd[0]);
                    if (mcmd[1] === undefined) {
                        tar = sys.id(commandData);
                    }

                    if (tar === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }

                    var msg = true,
                        me = player(src),
                        target = player(tar);
                    if (isEmpty(mcmd[1])) {
                        mcmd[1] = "";
                        msg = false;
                    }

                    if (unicodeAbuse(src, mcmd[1])) {
                        if (!sys.loggedIn(src)) {
                            return;
                        }
                        botMessage(src, "Ping sent to " + target + "!", chan);
                        return;
                    }

                    botMessage(src, "Ping sent to " + target + "!", chan);
                    if (msg) {
                        mcmd[1] = cut(mcmd, 1, ':');
                        botMessage(tar, me + " has pinged you and sent the following message: " + html_escape(mcmd[1]) + "<ping/>");
                        return;
                    }
                    botMessage(tar, me + " has pinged you!<ping/>");
                },

                /* -- User Commands: Poll */
                vote: function () {
                    if (!Poll.mode) {
                        botMessage(src, "No poll is going on.", chan);
                        return;
                    }
                    var datanum = parseInt(commandData, 10);
                    if (!Poll.options.has(datanum)) {
                        botMessage(src, "Invalid option.", chan);
                        return;
                    }
                    if (Poll.options[datanum].votes.has(ip)) {
                        botMessage(src, "You already voted!", chan);
                        return;
                    }
                    Poll.options[datanum].votes.push(ip);
                    Poll.votes++;
                    botMessage(src, "Voted option " + datanum + " (" + Poll.options[datanum].name + ") on the poll.", chan);
                },

                viewpoll: function () {
                    if (!Poll.mode) {
                        botMessage(src, "No poll is going on.", chan);
                        return;
                    }

                    botMessage(src, "Poll started by " + Poll.starter.bold() + "!", chan);

                    var x, current_votes, option;
                    for (x in Poll.options) {
                        option = Poll.options[x].name;
                        botMessage(src, x + ". " + option, chan);
                    }

                    sys.sendMessage(src, '', chan);

                    if (Poll.votes === 0) {
                        botMessage(src, "No one voted yet.", chan);
                        return;
                    }

                    botMessage(src, Poll.subject + " - Results so far:", chan);

                    for (x in Poll.options) {
                        option = Poll.options[x];
                        current_votes = option.votes;
                        botMessage(src, x + ". " + option.name + " - " + current_votes.length, chan);
                    }
                },

                /* -- User Commands: Macro -- */
                macro: function () {
                    mcmd[1] = cut(mcmd, 1, ':');

                    if (isEmpty(mcmd[1])) {
                        botMessage(src, "Your macros are: " + poUser.macro.join(", "), chan);
                        return;
                    }

                    mcmd[1] = html_escape(mcmd[1]);
                    var num = Math.round(+mcmd[0]);
                    if (num > 5 || num < 1) {
                        botMessage(src, "Specify a range of 1-5", chan);
                        return;
                    }

                    poUser.macro[num - 1] = mcmd[1];
                    var toL = sys.name(src).toLowerCase(),
                        macros = DataHash.macros;

                    if (typeof macros[toL] !== "object") {
                        macros[toL] = ["%m1", "%m2", "%m3", "%m4", "%m5"];
                    }

                    macros[toL] = poUser.macro;

                    botMessage(src, "You changed macro " + num + " to " + mcmd[1], chan);
                },

                /* -- User Commands: Fun -- */
                "catch": function () {
                    if (!CommandsEnabled._catch_) {
                        botMessage(src, fullCommand + " is turned off!", chan);
                        return;
                    }

                    if (testMafiaChat(src, chan)) {
                        return;
                    }

                    var num = sys.rand(1, 649),
                        pokemon = sys.pokemon(num),
                        nature = sys.nature(sys.rand(1, 24)),
                        rand = sys.rand(30, 531),
                        shiny = sys.rand(30, 531),
                        ivs = [],
                        lvl = sys.rand(1, 101),
                        x;

                    for (x = 0; x <= 6; x++) {
                        ivs.push(sys.rand(0, 32));
                    }

                    if (shiny !== rand) {
                        botMessage(src, formatPoke(num, false, false, 0, 5) + " " + formatPoke(num, false, true, 0, 5), chan);
                        botAll(player(src) + " caught a level " + lvl + " " + pokemon + " with a " + nature + " nature!", chan);
                        botMessage(src, pokemon + " has the following IVs:", chan);
                        botMessage(src, "HP: " + ivs[0] + " Atk: " + ivs[1] + " Def: " + ivs[2] + " SpA: " + ivs[3] + " SpD: " + ivs[4] + " Spd: " + ivs[5] + ".", chan);
                    } else {
                        botMessage(formatPoke(num, true, false, 0, 5) + " " + formatPoke(num, true, true, 0, 5), chan);
                        botAll(player(src) + " has caught a level " + lvl + " shiny " + pokemon + " with a " + nature + " nature!", chan);
                        botMessage(src, pokemon + " has the following IVs:", chan);
                        botMessage(src, "HP: " + ivs[0] + " Atk: " + ivs[1] + " Def: " + ivs[2] + " SpA: " + ivs[3] + " SpD: " + ivs[4] + " Spd: " + ivs[5] + ".", chan);
                        botAll("This is truly a rare event", chan);
                    }
                },

                attack: function () {
                    if (!CommandsEnabled.attack) {
                        botMessage(src, fullCommand + " is turned off.", chan);
                        return;
                    }
                    if (testMafiaChat(src, chan)) {
                        return;
                    }
                    if (poUser.capsMute(commandData, chan)) { // Combine both.
                        return;
                    }

                    if (commandData.length > 25) {
                        botMessage(src, "The persons name must be under 26 characters.", chan);
                        return;
                    }

                    if (typeof AttackingMoves === "undefined") {
                        AttackingMoves = [];
                        var file = sys.getFileContent("db/moves/5G/damage_class.txt").split("\n"),
                            arr = AttackingMoves,
                            x;

                        for (x in file) {
                            if (file[x] === "0 0") {
                                continue;
                            }

                            arr.push(Number(file[x].split(" ")[0]));
                        }
                    }

                    var attack = sys.move(AttackingMoves[Math.floor(AttackingMoves.length * Math.random())]),
                        movenum = sys.moveNum(mcmd[1]);
                    if (AttackingMoves.has(movenum)) {
                        attack = sys.move(movenum); // Corrects case.
                    }


                    if (unicodeAbuse(src, commandData)) {
                        return;
                    }

                    botAll(player(src) + " used " + attack + " on " + player(mcmd[0]) + "!", chan);
                },

                roulette: function () {
                    if (!CommandsEnabled.roulette) {
                        botMessage(src, fullCommand + " is turned off.", chan);
                        return;
                    }
                    if (testMafiaChat(src, message)) {
                        return;
                    }

                    var randpoke = sys.rand(1, 494),
                        rand = sys.rand(1, 4),
                        poke,
                        shine;

                    if (rand === 1 || rand === 3) {
                        poke = formatPoke(randpoke, false, false, false, 5, true);
                        shine = "";
                    } else {
                        poke = formatPoke(randpoke, true, false, false, 5, true);
                        shine = "Shiny ";
                    }

                    var shiny = Grammar.an(shine + sys.pokemon(randpoke)) + "!";

                    botMessage(src, "You got a " + shiny + " " + poke, chan);
                    botAllExcept(src, player(src) + " got a " + shiny, chan, botAllExcept.Normal);
                },

                /* -- User Commands: CommandStats */
                commandstats: function () {
                    var num = Number(commandData);
                    if (num > objLength(CommandStats.stats.commands)) {
                        CommandStats.display(src, chan, Number(commandData));
                    }
                },

                /* -- User Commands: Mail */
                sendmail: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "This person doesn't exist!", chan);
                        return;
                    }

                    if (isEmpty(mcmd[1])) {
                        botMessage(src, "Specify a title!", chan);
                        return;
                    }

                    if (isEmpty(mcmd[2])) {
                        botMessage(src, "Specify text!", chan);
                        return;
                    }

                    if (typeof (DataHash.mail[mcmd[0].toLowerCase()]) === "undefined") {
                        DataHash.mail[mcmd[0].toLowerCase()] = [];
                    }

                    if (typeof (DataHash.mail["SENT_" + sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail["SENT_" + sys.name(src).toLowerCase()] = [];
                    }

                    var result = cut(mcmd, 2, ':');

                    DataHash.mail[mcmd[0].toLowerCase()].push(new Mail(sys.name(src), result, mcmd[1]));
                    DataHash.mail["SENT_" + sys.name(src).toLowerCase()].push(new Mail(mcmd[0], result, mcmd[1]));

                    botMessage(src, "Mail sent! A copy of the mail was also sent to your sent mails box. Type /sentmails to view.", chan);

                    if (tar !== undefined) {
                        botMessage(tar, "You got mail from " + player(src) + "! Type /readmail to view .<ping/>", 0);
                    }

                    cache.write("mail", JSON.stringify(DataHash.mail));
                },
                sentmails: function () {
                    if (typeof (DataHash.mail["SENT_" + sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail["SENT_" + sys.name(src).toLowerCase()] = [];
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    if (DataHash.mail["SENT_" + sys.name(src).toLowerCase()].length < 1) {
                        botMessage(src, "You don't have any sent mails!", chan);
                        return;
                    }

                    botMessage(src, "Here are your sent mails:", chan);

                    var read = "",
                        y,
                        mail = DataHash.mail["SENT_" + sys.name(src).toLowerCase()];

                    var arr = [];
                    for (y in mail) {
                        var m = mail[y];
                        arr.push("<b>" + format("lvl0", html_escape(m.title)) + "</b>: Sent to " + m.sender + " on " + m.sendtime + " (" + getTimeString((+sys.time()) - m.sendAgo) + " ago)", "<i>" + format("lvl0", html_escape(m.text)) + "</i>");
                    }

                    arr.push('');
                    sys.sendHtmlMessage(src, arr.join("<br/>"), chan);
                },
                deletesent: function () {
                    if (typeof (DataHash.mail["SENT_" + sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail["SENT_" + sys.name(src).toLowerCase()] = [];
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    if (DataHash.mail["SENT_" + sys.name(src).toLowerCase()].length < 1) {
                        botMessage(src, "You don't have any sent mails!", chan);
                        return;
                    }

                    DataHash.mail["SENT_" + sys.name(src).toLowerCase()] = [];
                    botMessage(src, "Sent Mail deleted!", chan);
                    cache.write("mail", JSON.stringify(DataHash.mail));
                },
                readmail: function () {
                    if (typeof (DataHash.mail[sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail[sys.name(src).toLowerCase()] = [];
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    if (typeof (DataHash.mail["SENT_" + sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail["SENT_" + sys.name(src).toLowerCase()] = [];
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    if (DataHash.mail[sys.name(src).toLowerCase()].length < 1) {
                        botMessage(src, "You don't have any mail!", chan);
                        return;
                    }

                    botMessage(src, "Here is your mail:", chan);

                    var arr = [];
                    var read = "",
                        y,
                        mail = DataHash.mail[sys.name(src).toLowerCase()],
                        save = false;
                    var time = +sys.time();

                    for (y in mail) {
                        var m = mail[y];
                        read = "[<b><font color=blue>Old</font></b>]";

                        if (!m.read) {
                            read = "[<b><font color=red>New</font></b>]";
                            m.read = true;
                            save = true;
                        }

                        arr.push(read + " <b>" + format("lvl0", html_escape(m.title)) + "</b>: Sent by " + m.sender + " on " + m.sendtime + " (" + getTimeString(time - m.sendAgo) + " ago)", "<i>" + format("lvl0", html_escape(m.text)) + "</i>");
                    }

                    if (save) {
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    arr.push('');
                    sys.sendHtmlMessage(src, arr.join("<br>"), chan);
                },
                deletemail: function () {
                    if (typeof (DataHash.mail[sys.name(src).toLowerCase()]) === "undefined") {
                        DataHash.mail[sys.name(src).toLowerCase()] = [];
                        cache.write("mail", JSON.stringify(DataHash.mail));
                    }

                    if (DataHash.mail[sys.name(src).toLowerCase()].length < 1) {
                        botMessage(src, "You don't have any mail!", chan);
                        return;
                    }

                    DataHash.mail[sys.name(src).toLowerCase()] = [];
                    botMessage(src, "Mail deleted!", chan);
                    cache.write("mail", JSON.stringify(DataHash.mail));
                },

                /* -- User Commands: Rank Icons */
                changeicon: function () {
                    if (isEmpty(commandData)) {
                        botMessage(src, "Specify an icon!", chan);
                        return;
                    }
                    var resets = ['reset', 'remove', 'delete', 'off'];

                    if (resets.has(cmdData) && DataHash.rankicons.has(sys.name(src).toLowerCase())) {
                        botMessage(src, "Removed rank icon.", chan);

                        poUser.icon = "";
                        delete DataHash.rankicons[sys.name(src).toLowerCase()];

                        cache.write("rankicons", JSON.stringify(DataHash.rankicons));
                        return;
                    }

                    if (commandData.length !== 1) {
                        botMessage(src, "You can only specify one character for your rank icon!", chan);
                        return;
                    }

                    if (commandData === "<" && (sys.auth(src) < 4 && Config.HighPermission[sys.name(src)] !== undefined && Config.HighPermission[sys.name(src)][1] !== 3)) {
                        botMessage(src, "Can't pick this icon!", chan);
                        return;
                    }

                    poUser.icon = commandData;
                    DataHash.rankicons[sys.name(src).toLowerCase()] = commandData;
                    cache.write("rankicons", JSON.stringify(DataHash.rankicons));

                    botMessage(src, "Rank icon changed to " + commandData + "!", chan);
                },

                icons: function () {
                    IconManager.iconInfo(src, chan);
                },

                /* -- User Commands: Register */
                unregister: function () {
                    var name = sys.name(src);
                    if (!sys.dbRegistered(name)) {
                        botMessage(src, "You can't unregister an alias which is not registered!", chan);
                        return;
                    }
                    sys.clearPass(name);
                    botMessage(src, "Your password was succesfully cleared!", chan);
                    sys.sendNetworkCommand(src, 14);
                    if (sys.auth(src) > 0) {
                        sendAuth(name + " cleared their password!");
                        botMessage(src, "Please register again (before logging out)! This is for the safety of the server!", chan);
                    }
                },

                /* -- User Commands: Styles */
                styles: function () {
                    StyleManager.styleInfo(src, chan);
                },

                /* -- User Commands: Messaging */
                me: function () {
                    if (!CommandsEnabled.me) {
                        botMessage(src, fullCommand + " is turned off.", chan);
                        return;
                    }
                    if (commandData === "") {
                        botMessage(src, "Specify a message to send.", chan);
                        return;
                    }
                    if (testMafiaChat(src, message)) {
                        return;
                    }

                    if (poUser.capsMute(commandData, chan)) {
                        return;
                    }

                    if (unicodeAbuse(src, commandData)) {
                        return;
                    }

                    sys.sendHtmlAll("<font color=" + getColor + "><timestamp/><i><b>*** " + sys.name(src) + "</b> " + format(src, html_escape(commandData)) + "</font></b></i>", chan);
                },

                /* -- User Commands: Auth */
                callauth: function () {
                    if (mcmd[0] === undefined) {
                        botMessage(src, "Please select an auth level or auth name for the /callauth", chan);
                        return;
                    }

                    var h = mcmd[0].toLowerCase(),
                        l = function (v) {
                            return v.toLowerCase();
                        },
                        a = h;

                    if (h !== "1" && h !== "2" && h !== "3" && h !== l(ModName) && h !== l(AdminName) && h !== l(OwnerName)) {
                        botMessage(src, "Please select an auth level or auth name for the /callauth", chan);
                        return;
                    }

                    if (l(ModName) === a) {
                        a = 1;
                    } else if (l(AdminName) === a) {
                        a = 2;
                    } else if (l(OwnerName) === a) {
                        a = 3;
                    } else {
                        a = Number(a);
                    }

                    var y,
                        t,
                        PL = sys.playerIds(),
                        count = 0;

                    for (y in PL) {
                        t = PL[y];
                        if (sys.auth(t) === a) {
                            count++;

                            botMessage(t, player(src) + " has called you!<ping/>", 0);
                        }
                    }

                    if (count === 0) {
                        botMessage(src, "No auths could be pinged.", chan);
                        return;
                    }

                    var s = "s";
                    if (count < 2) {
                        s = "";
                    }

                    botMessage(src, count + " auth" + s + " could be pinged.", chan);
                },

                /* -- User Commands: Team */
                team: function () {
                    script.importable(src, src, chan);
                },

                /* -- User Commands: Impersonation */
                imp: function () {
                    if (implock && sys.auth(src) < 1) {
                        botMessage(src, 'Imping has been locked for ' + Grammar.es(UserName) + '.', chan);
                        return;
                    }

                    if (poUser.capsMute(commandData, chan)) {
                        return;
                    }

                    if (unicodeAbuse(src, commandData)) {
                        if (!sys.loggedIn(src)) {
                            return;
                        }
                        sendFailWhale(src, chan);
                        if (sys.auth(src) < 1) {
                            kick(src);
                        }
                        return;
                    }

                    if (commandData === '') {
                        botMessage(src, "Specify a name!", chan);
                        return;
                    }

                    if (commandData.length > 20) {
                        botMessage(src, "Maximum characters allowed: 20. Current: " + commandData.length, chan);
                        return;
                    }

                    if (commandData === "off") {
                        delete poUser.impersonation;
                        botMessage(src, "Now you are yourself again!", chan);
                        return;
                    }

                    poUser.impersonation = commandData;

                    if (sys.auth(src) === 0) {
                        sendAuth(poUser.impersonation + " was impersonated by " + player(src) + "!");
                    }

                    botMessage(src, "You now are " + poUser.impersonation + "!", chan);
                },

                impoff: function () {
                    if (implock && sys.auth(src) < 1) {
                        botMessage(src, "Imping has been locked for " + Grammar.es(UserName) + ".", chan);
                        return;
                    }
                    if (poUser.impersonation === undefined) {
                        botMessage(src, "You currently don't have any impersonation.", chan);
                        return;
                    }

                    delete poUser.impersonation;
                    botMessage(src, "Now you are yourself again!", chan);
                },

                /* -- User Commands: Battle Points */
                battlepoints: function () {
                    var name = sys.name(src).toLowerCase(),
                        hash = DataHash.money,
                        displaystr = 'You have %1 battle points.';
                    if (hash[name] === undefined) {
                        hash[name] = 0;
                    }

                    if (dbIp !== undefined && !isEmpty(commandData)) {
                        if (hash[cmdData] === undefined) {
                            hash[cmdData] = 0;
                        }

                        displaystr = player(commandData) + ' has %1 battle points.';
                        name = cmdData;
                    }

                    hash = hash[name];
                    botMessage(src, displaystr.format(hash), chan);
                    return;
                }
            });

            /* -- User Commands */
            userCommands[removespaces(UserName).toLowerCase() + "commands"] = function () {
                var ct = new Command_Templater(UserName + ' Commands');

                ct.register("funcommands", "Displays the Fun commands.");
                ct.register("mailcommands", "Displays the Mail commands.");
                ct.register("infocommands", "Displays the Information commands.");

                ct.register("ping", ["{Player::Online Player}", "{Text::Any <u>Message</u>}"], "To ping {Player::Online Player} with an optional {Text::Any Message}.");
                ct.register("callauth", ["{Text::Choice Auth Level/Auth Name}"], "Pings all authority of {Text::Number Auth Level} or {Text::Any Auth Name}.");
                ct.register("idle", "To reverse your away status.");

                if (Clantag.full !== "None" && Clantag.full !== "") {
                    ct.register("join" + Clantag.fullTextLower, "To join the " + Clantag.fullText.bold() + " clan.");
                    ct.register("unjoin" + Clantag.fullTextLower, "To unjoin the " + Clantag.fullText.bold() + " clan.");
                }

                if (Poll.mode) {
                    ct.register("viewpoll", "Displays the poll's information.");
                    ct.register("vote", ["{Text::Number Option}"], "To vote the option, {Text::Number Option}, in the poll.");
                }

                ct.register("unregister", "To unregister your alias.");
                ct.register("macro", ["{Text::Number 1-5}", "{Text::Any Message}"], "Changes one of your five macros to {Text::Any Message}. If no macro is specified, displays your macros. %m(macronumber) is replaced by that macro in your message (this adds up to your caps and flood count, and can be used for commands).");

                if (!implock) {
                    ct.register("imp", ["{Text::Any Target}"], "To impersonate {Text::Any Target}");
                    ct.register("impoff", "To remove your impersonation.");
                }

                ct.render(src, chan);
            };

            /* -- User Commands: Clan */
            if (Clantag.full !== "None" && Clantag.full !== "") {
                userCommands["join" + Clantag.fullTextLower] = function () {
                    var name = sys.name(src);
                    if (name.substr(0, Clantag.full.length) === Clantag.full) {
                        botMessage(src, "You already joined the " + Clantag.full + " clan!", chan);
                        return;
                    }
                    if (sys.id(Clantag.full + name) !== undefined) {
                        botMessage(src, "Someone with your name and that tag is already online.", chan);
                        return;
                    }
                    if (ify.onChangeName() === "disallow") {
                        botMessage(src, "Ify is active. You can't join the clan now!", chan);
                        return;
                    }
                    var newName = Clantag.full + sys.name(src);
                    if (newName.length > 20) {
                        botMessage(src, "Please make your name shorter.", chan);
                        return;
                    }
                    botAll(player(src) + " joined the " + Clantag.full.bold() + " clan!", 0);
                    sys.changeName(src, newName);
                };

                userCommands["unjoin" + Clantag.fullTextLower] = function () {
                    var name = sys.name(src);
                    if (name.substr(0, Clantag.full.length) !== Clantag.full) {
                        botMessage(src, "You didn't join the " + Clantag.full + " clan!", chan);
                        return;
                    }
                    if (ify.onClanCommand() === "disallow") {
                        botMessage(src, "Ify is active. You can't unjoin the clan now!", chan);
                        return;
                    }

                    var without = name.substr(Clantag.full.length);
                    if (sys.id(without) !== src && sys.id(without) !== undefined) {
                        botMessage(src, "Someone with your name without the clan tag is already online.", chan);
                        return;
                    }

                    botAll(player(src) + " left the " + Clantag.full.bold() + " clan!", 0);
                    sys.changeName(src, without);
                };
            }

            /* -- Channel Commands: Start */
            channelCommands = ({ /* -- Channel Templates: Commands */
                channelcommands: function () {
                    var ct = new Command_Templater("Channel Commands", true),
                        topicContent = ["topic", "To display this channels topic."],
                        isChanMod = poChan.isChanMod(src);

                    if (isChanMod) {
                        topicContent = ["topic", "{Text::Any Topic}", "To display this channels topic if {Text::Any Topic} is empty. Otherwise sets it to {Text::Any Topic}."];
                    }

                    ct.span("Channel " + ChanUser + " Commands");

                    ct.register("csettings", "Displays channel settings and information.");
                    ct.register("cauth", "Displays the authority of this channel.");
                    ct.register.apply(ct, topicContent);

                    if (isChanMod) {
                        ct.span("Channel " + ChanMod + " Commands");

                        if (permission(src, 1)) {
                            ct.register("perm", "Makes the channel permanent or temporally.");
                        }
                        ct.register("channelwall", ["{Text::Any Message}"], "To announce {Text::Any Message} in this channel.");
                        ct.register("channelhtmlwall", ["{Text::Any Message}"], "To announce {Text::Any Message} with HTML in this channel.");
                        ct.register("html", ["{Text::Any Message}"], "To send {Text::Any Message} with HTML in this channel.");
                        ct.register("channelkick", ["{Player::Online Player}", "{Text::Any <u>Reason</u>}"], "To kick {Player::Online Player} with an optional {Text::Any Reason} in this channel.");
                        ct.register("channelmute", ["{Player::Database Player}", "<u>{Text::Number Time}</u>", "{Text::Time <u>Time Unit</u>}", "{Text::Any <u>Reason</u>}"], "To mute {Player::Database Player} for an optional {Text::Number Time}, {Text::Time Time Unit}, and/or {Text::Any Reason} in this channel.");
                        ct.register("channelunmute", ["{Player::Database Player}", "{Text::Any <u>Reason</u>}"], "To unmute {Player::Database Player} with an optional {Text::Any Reason} in this channel.");
                        ct.register("invite", ["{Player::Online Player}"], "To invite {Player::Online Player} to this channel.");
                        ct.register("topic", ["{Text::Any Topic}"], "To change the channel topic to {Text::Any Topic}. If {Text::Any Topic} is default, changes this channel's topic back to it's default.");
                        ct.register("cbanlist", "Displays this channel's banlist.");
                        ct.register("cmutelist", "Displays this channel's mutelist.");
                        ct.register("csilence", "To silence everyone whos channel authority is lower than yours.");
                        ct.register("cunsilence", "To unsilence the channel.");
                        ct.register("chatcolor", ["{Text::Any Color}", "{Text::Any Second Color}"], "Adds the chat color effect to this channel using the colors {Text::Any Color} and {Text::Any Second Color} If {Text::Any Color} or {Text::Any Second Color} is random, then uses a random color.");
                        ct.register("chatcoloroff", "Removes the chat color effect from this channel.");
                    }

                    if (poChan.isChanAdmin(src)) {
                        ct.span("Channel " + ChanAdmin + " Commands");

                        if (permission(src, 2)) {
                            ct.register("destroychannel", "To destory this channel.");
                        }

                        ct.register("cclearchat", "To clear the channel's chat.");
                        ct.register("installtour", "To install tournaments in this channel.");
                        ct.register("uninstalltour", "To uninstall tournaments in this channel.");

                        ct.register(removespaces(ChanUser).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanUser) + " in this channel.");
                        ct.register(removespaces(ChanMod).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanMod) + " in this channel.");
                        ct.register(removespaces(ChanTour0).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanTour0) + " in this channel.");
                        ct.register(removespaces(ChanTour1).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanTour1) + " in this channel.");

                        ct.register("channelban", ["{Player::Database Player}", "<u>{o Time}</u>", "{bv <u>Time Unit</b>}", "<u>{p Reason}</u>"], "Bans or unbans someone from this channel. Note that if the target has authority or is an operator, this doesn't work.");
                    }

                    if (poChan.isChanOwner(src)) {
                        ct.span("Channel " + ChanOwner + " Commands");

                        if (noPermission(src, 2)) {
                            ct.register("destroychannel", "To destory this channel.");
                        }

                        ct.register("channelpublic", "To allow everyone (with the exception of players on the channel banlist) into the channel.");
                        ct.register("channelprivate", "To make the channel auth-only. Also kicks everyone out of the channel who isn't (channel) auth.");
                        ct.register(removespaces(ChanAdmin).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanAdmin) + " in this channel.");
                        ct.register(removespaces(ChanOwner).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ChanOwner) + " in this channel.");
                    }

                    ct.render(src, chan);
                },

                /* -- Channel Templates: Normal */
                ctourauthlist: function () {
                    var authlist = poChan.tourAuth,
                        count = authlist.length(),
                        x;
                    
                    t = new Templater(Grammar.es(ChanTour1));

                    t.register("");

                    for (x in authlist) {
                        t.register(playerInfo(x));
                    }

                    t.register("<br/><b><font color=blueviolet>Total Number of " + Grammar.es(ChanTour1) + ":</font></b> " + count);

                    t.render(src, chan);
                },

                csettings: function () {
                    var t = new Templater('Channel Settings'),
                        g = function (str) {
                            return "<font color='green'><b>" + str + "</b></font>";
                        },
                        r = function (str) {
                            return "<font color='red'><b>" + str + "</b></font>";
                        },
                        check = function (compare, name, on, off) {
                            if (compare) {
                                t.register(name + " " + g(on) + ".");
                            } else {
                                t.register(name + " " + r(off) + ".");
                            }
                        };

                    check(poChan.perm, "The channel is", "permanent", "temporally");
                    check(poChan.private, "The channel is", "private", "public"); /* private = when the channel is private */
                    check(!poChan.defaultTopic, "The channel is using a", "custom topic", "default topic"); /* give custom topic green, not red. */
                    check(poChan.toursEnabled, "The channel has", "tours enabled", "tours disabled");
                    check(chatcolor, "The channel has", "chat color enabled", "chat color disabled");

                    if (poChan.toursEnabled) {
                        check(poChan.tour.AutoStartBattles, "Auto Start Battles for this channel is", "on", "off");
                    }

                    if (poChan.creator !== '' && poChan.creator !== '~Unknown~') {
                        t.register("The channel creator is " + poChan.creator.bold().fontcolor("green") + ".");
                    }

                    t.register("The channel topic is " + poChan.topic + ".");
                    if (poChan.topicsetter !== '') {
                        t.register("The channel topic setter is " + poChan.topicsetter + ".");
                    }

                    t.register("");

                    t.register("The channel silence level is " + String(poChan.silence).bold().fontcolor("blue") + ".");
                    t.register("The channel ID is " + String(chan).bold().fontcolor("orange") + ".<br/>");

                    t.register("The channel name is " + poChan.name.bold().fontcolor("red") + ".");

                    t.render(src, chan);
                },

                cauth: function () {
                    var authList = poChan.chanAuth,
                        x,
                        cauth,
                        auths = {
                            'mods': [],
                            'admins': [],
                            'owners': []
                        },
                        authTotal = authList.length();

                    for (x in authList) {
                        cauth = authList[x];
                        if (cauth === 3) {
                            auths.owners.push(x);
                        } else if (cauth === 2) {
                            auths.admins.push(x);
                        } else {
                            auths.mods.push(x);
                        }
                    }

                    var t = new Templater("Channel Authority"),
                        c = auths.owners;

                    if (c.length !== 0) {
                        t.register("<font color=red size=4><strong>" + Grammar.es(ChanOwner) + " (" + c.length + ")</strong></font>");
                        t.register("");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    c = auths.admins;
                    if (c.length !== 0) {
                        t.register("<font color=orange size=4><strong>" + Grammar.es(ChanAdmin) + " (" + c.length + ")</strong></font>");
                        t.register("");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    c = auths.mods;
                    if (c.length !== 0) {
                        t.register("<font color=blue size=4><strong>" + Grammar.es(ChanMod) + " (" + c.length + ")</strong></font>");
                        t.register("");

                        for (x in c) {
                            t.register(playerInfo(c[x]));
                        }

                        t.register("");
                    }

                    t.register("<b><font color=blueviolet>Total Number of Channel Authorities:</b></font> " + authTotal);

                    t.render(src, chan);
                },

                /* -- Channel Templates: Tables */
                cbanlist: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    Prune.channelBans(chan);

                    var bans = poChan.banlist,
                        last,
                        lastname,
                        l,
                        add,
                        t,
                        n = (+sys.time()),
                        perm = permission(src, 1),
                        y;

                    var tt = new Table_Templater('Channel Banlist', 'red', '3');
                    if (perm) {
                        add = ["IP", "Banned Name", "Banned By", "Reason", "Time", "Last Used Name"];
                    } else {
                        add = ["Banned Name", "Banned By", "Reason", "Time", "Last Used Name"];
                    }

                    tt.register(add, true);

                    for (y in bans) {
                        last = "N/A";
                        lastname = lastName(y);
                        l = bans[y];
                        t = getTimeString(l.time - n);
                        if (lastname !== "~Unknown~") {
                            last = lastname;
                        }
                        if (perm) {
                            add = [y, l.who, l.by, l.why, t, last];
                        } else {
                            add = [l.who, l.by, l.why, t, last];
                        }
                        tt.register(add, false);
                    }

                    tt.render(src, chan);
                },

                cmutelist: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    Prune.channelMutes(chan);

                    var mutes = poChan.mutelist,
                        last,
                        lastname,
                        l,
                        add,
                        tstr,
                        now = (+sys.time()),
                        perm = permission(src, 1),
                        y;
                    
                    tt = new Table_Templater('Channel Mutelist', 'blue', '3');

                    if (perm) {
                        add = ["IP", "Muted Name", "Muted By", "Reason", "Length", "Last Used Name"];
                    } else {
                        add = ["Muted Name", "Muted By", "Reason", "Length", "Last Used Name"];
                    }

                    tt.register(add, true);

                    for (y in mutes) {
                        last = "N/A";
                        lastname = lastName(y);
                        l = mutes[y];
                        tstr = getTimeString(l.time - now);
                        if (lastname !== "~Unknown~") {
                            last = lastname;
                        }
                        if (perm) {
                            add = [y, l.name, l.by, l.why, tstr, last];
                        } else {
                            add = [l.name, l.by, l.why, tstr, last];
                        }
                        tt.register(add, false);
                    }


                    tt.render(src, chan);
                },

                cclearchat: function () {
                    if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    
                    var me = player(src),
                        y;

                    for (y = 0; y < 2999; y++) {
                        sys.sendAll("", chan);
                    }

                    botAll(me + " cleared the chat!", chan);
                },
                
                channelhtmlwall: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    var color = script.namecolor(src),
                        l = '';

                    sys.sendHtmlAll(BORDER + "<br>", chan);

                    if (UseIcons) {
                        l = rankico;
                    }

                    sys.sendHtmlAll('<font color=' + script.namecolor(src) + '><timestamp/><b>' + l + html_escape(sys.name(src)) + ':</font></b> ' + commandData, chan);
                    sys.sendHtmlAll("<br>" + BORDER, chan);
                },

                channelwall: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    var color = script.namecolor(src),
                        srcname = sys.name(src),
                        l = '',
                        send = sys.sendAll,
                        f = commandData,
                        displaystr = srcname + ': ' + f;

                    sys.sendHtmlAll(BORDER + "<br>", chan);

                    if (UseIcons) {
                        l = rankico;
                        send = sys.sendHtmlAll;
                        f = format(src, html_escape(commandData));
                        displaystr = '<font color=' + script.namecolor(src) + '><timestamp/><b>' + l + html_escape(srcname) + ':</font></b> ' + f;
                    }

                    send(displaystr, chan);
                    sys.sendHtmlAll("<br>" + BORDER, chan);
                },

                html: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (noPermission(src, 1)) {
                        var sendStr = '<font color=' + script.namecolor(src) + '><timestamp/><b>' + sys.name(src) + ':</font></b> ' + commandData;
                        sys.sendHtmlAll(sendStr, chan);
                        return;
                    }

                    sys.sendHtmlAll(commandData, chan); /* Direct HTML for auth */
                },

                csilence: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    var auth = poChan.chanAuth[sys.name(src).toLowerCase()];

                    if (sys.auth(src) > poChan.chanAuth[sys.name(src).toLowerCase()]) {
                        auth = sys.auth(src);
                    }

                    if (poChan.silence === auth) {
                        botMessage(src, "The channel is already silenced!", chan);
                        return;
                    }

                    poChan.silence = auth;

                    if (poChan.silence > 3) {
                        poChan.silence = 3;
                    }

                    var type = {
                        1: "",
                        2: "super ",
                        3: "mega "
                    }[poChan.silence];

                    botAll(player(src) + " " + type + "silenced the channel!", chan);

                    cData.changeStatus(chan, poChan.perm, poChan.private, poChan.silence);
                },

                cunsilence: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if ((+poChan.silence) === 0) {
                        botMessage(src, "There is no silence!");
                        return;
                    }

                    poChan.silence = 0;
                    botAll(player(src) + " unsilenced the channel!", chan);
                    cData.changeStatus(chan, poChan.perm, poChan.private, 0);
                },

                /* -- Channel Commands: Privacy */
                channelprivate: function () {
                    if (!poChan.isChanOwner(src) && noPermission(src, 3)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (poChan.private) {
                        botMessage(src, 'This channel is already private!', chan);
                        return;
                    }
                    if (chan === 0) {
                        botMessage(src, "Cant do this in the main channel!", chan);
                        return;
                    }

                    var players = sys.playersOfChannel(chan),
                        x,
                        lc,
                        curr;

                    for (x in players) {
                        curr = players[x];
                        lc = sys.name(curr).toLowerCase();
                        if (!poChan.chanAuth.has(lc) && hpAuth(curr) < 1) {
                            sys.kick(curr, chan);
                        }
                    }

                    poChan.private = true;
                    botAll("This channel has been made private by " + player(src) + "!", chan);
                    cData.changeStatus(chan, poChan.perm, true, poChan.silence);
                },

                channelpublic: function () {
                    if (!poChan.isChanOwner(src) && noPermission(src, 3)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (!poChan.private) {
                        botMessage(src, 'This channel is already public!', chan);
                        return;
                    }
                    if (chan === 0) {
                        botMessage(src, "Cant do this in the main channel!");
                        return;
                    }

                    poChan.private = false;
                    botAll("This channel has been made public by " + player(src) + "!", chan);
                    cData.changeStatus(chan, cData.perm, false, cData.silence);
                },

                /* -- Channel Commands: Fun -- */
                chatcolor: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    if (chatcolor) {
                        botMessage(src, "This channel already has colorchat enabled!", chan);
                        return;
                    }

                    var c1 = mcmd[0];
                    var c2 = mcmd[1];

                    if (isEmpty(c1)) {
                        c1 = "random";
                    }
                    if (isEmpty(c2)) {
                        c2 = "random";
                    }

                    ChatColorRandomizer(c1, c2, chan);
                },

                chatcoloroff: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (!chatcolor) {
                        botMessage(src, "This channel does not have colorchat enabled!", chan);
                        return;
                    }

                    DisableChatColorRandomizer(chan);
                },

                /* -- Channel Commands: Perm */
                perm: function () {
                    if (noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    poChan.perm = !poChan.perm;

                    var status = "permanent";
                    if (!poChan.perm) {
                        status = "temporally";
                    }

                    botAll(player(src) + " made this channel " + status + ".", chan);
                    cData.changeStatus(chan, poChan.perm, poChan.private, poChan.silence);
                },

                /* -- Channel Commands: Topic */
                topic: function () {
                    if (!poChan.isChanMod(src) && noPermission(src, 1)) {
                        commandData = "";
                    }
                    if (commandData.length > 500 && noPermission(src, 1)) {
                        botMessage(src, "The topic may not be over 500 characters.", chan);
                        return;
                    }

                    poChan.changeTopic(src, commandData, fullCommand);
                    if (commandData !== "") {
                        cData.changeTopic(chan, commandData, sys.name(src), false);
                    }
                },

                /* -- Channel Commands: Destruction */
                destroychannel: function () {
                    var x;
                    if (!poChan.isChanOwner(src, chan) && noPermission(src, 2)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (DefaultChannels.has(chan)) {
                        botMessage(src, "This channel can't be destoryed!", chan);
                        return;
                    }

                    var players = sys.playersOfChannel(chan),
                        curr;

                    delete cData.channelData[sys.channel(chan)];
                    cData.save();

                    poChan.perm = false;

                    for (x in players) {
                        curr = players[x];
                        sys.kick(curr, chan);
                        if (sys.isInChannel(curr, 0) !== true) {
                            sys.putInChannel(curr, 0);
                        }
                    }
                },

                /* -- Channel Commands: Mute */
                channelmute: function () {
                    if (!poChan.isChanMod(src, chan) && noPermission(src, 1)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }
                    if (poChan.isMutedInChannel(dbIp)) {
                        botMessage(src, 'That person is already channel muted.', chan);
                        return;
                    }
                    if (!poChan.canIssue(src, mcmd[0])) {
                        botMessage(src, 'That person has either equal or higher Channel Authority than you.', chan);
                        return;
                    }
                    if (self(src, mcmd[0])) {
                        botMessage(src, 'You cannot mute yourself.', chan);
                        return;
                    }

                    var unitTime = stringToTime(mcmd[2], mcmd[1]),
                        time = 0,
                        timestr = "forever",
                        time_now = +sys.time();

                    if (!isNaN(unitTime)) {
                        mcmd[1] = unitTime;
                        time = time_now + unitTime;
                        timestr = "for " + getTimeString(unitTime);
                    }

                    var reason = "None.";

                    botAll(player(mcmd[0]) + " has been muted by " + player(src) + " " + timestr + " in this channel!", chan);
                    if (!isEmpty(mcmd[3])) {
                        reason = cut(mcmd, 3, ':');
                        botEscapeAll("Reason: " + reason, chan);
                    }

                    poChan.mutelist[dbIp] = {
                        'by': sys.name(src),
                        'name': mcmd[0].name(),
                        'why': reason,
                        'time': time
                    };
                    cData.changeBans(chan, poChan.mutelist, poChan.banlist);
                },

                channelunmute: function () {
                    if (!poChan.isChanMod(src, chan)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }
                    if (!poChan.isMutedInChannel(dbIp)) {
                        botMessage(src, "That person isn't muted in this channel.", chan);
                        return;
                    }
                    botAll(player(mcmd[0]) + " has been unmuted by " + player(src) + " in this channel!", chan);
                    if (!isEmpty(mcmd[1])) {
                        var reason = cut(mcmd, 1, ':');
                        botEscapeAll("Reason: " + reason, chan);
                    }

                    delete poChan.mutelist[dbIp];
                    cData.changeBans(chan, poChan.mutelist, poChan.banlist);
                },

                installtour: function () {
                    if (!poChan.isChanAdmin(src)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    if (poChan.tour !== undefined && !poChan.toursEnabled) {
                        poChan.toursEnabled = true;
                    }

                    if (poChan.toursEnabled && poChan.has("tour")) {
                        botMessage(src, "Tours are already installed!", chan);
                        return;
                    }

                    if (DefaultChannels.has(chan)) {
                        botMessage(src, "You cannot install tours in this channel.", chan);
                        return;
                    }

                    botAll("Installing channel tours...", chan);

                    poChan.toursEnabled = true;
                    poChan.tour = new Tours(chan);

                    botAll("Install successful!", chan);

                    cData.changeToursEnabled(chan, true);
                },

                uninstalltour: function () {
                    if (!poChan.isChanAdmin(src)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }

                    if (poChan.tour === undefined && poChan.toursEnabled) {
                        poChan.toursEnabled = false;
                    }

                    if (!poChan.toursEnabled || !poChan.has("tour")) {
                        botMessage(src, "Tours are not installed!", chan);
                        return;
                    }
                    if (DefaultChannels.has(chan)) {
                        botMessage(src, "You cannot remove tours in this channel.", chan);
                        return;
                    }

                    botAll("Uninstalling channel tours...", chan);

                    poChan.toursEnabled = false;
                    delete poChan.tour;

                    botAll("Uninstall successful!", chan);

                    cData.changeToursEnabled(chan, false);
                },

                invite: function () {
                    if (!poChan.isChanMod(src)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (tar === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }

                    if (sys.isInChannel(tar, chan)) {
                        botMessage(src, "That person is already in this channel.", chan);
                        return;
                    }

                    botMessage(tar, player(src) + " invites you to go to " + ChannelLink(sys.channel(chan)) + "! <ping/>", chan);
                    botMessage(src, player(tar) + " was invited.");
                },

                channelban: function () {
                    if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }
                    if (poChan.isBannedInChannel(dbIp)) {
                        botMessage(src, 'That person is already channel banned.', chan);
                        return;
                    }
                    if (poChan.isChanMod(sys.id(mcmd[0])) || hpAuth(mcmd[0]) > 0) {
                        botMessage(src, "You can't channel ban channel operators or server authority.", chan);
                        return;
                    }
                    if (self(src, mcmd[0])) {
                        botMessage(src, 'You cannot channel ban yourself.', chan);
                        return;
                    }

                    var unitTime = stringToTime(mcmd[2], mcmd[1]),
                        time = 0,
                        timestr = "forever",
                        time_now = +sys.time(),
                        reason = "None given.";
                    if (!isNaN(unitTime)) {
                        mcmd[1] = unitTime;
                        time = time_now + unitTime;
                        timestr = "for " + getTimeString(unitTime);
                    }

                    botAll(player(mcmd[0]) + " has been banned by " + player(src) + " " + timestr + " in this channel!", chan);
                    if (!isEmpty(mcmd[3])) {
                        reason = cut(mcmd, 3, ':');
                        botEscapeAll("Reason: " + reason, chan);
                    }

                    poChan.banlist[dbIp] = {
                        'by': sys.name(src),
                        'who': mcmd[0].name(),
                        'why': reason,
                        'time': time
                    };

                    if (tar !== undefined) {
                        sys.kick(tar, chan);
                    }

                    cData.changeBans(chan, poChan.mutelist, poChan.banlist);
                },

                channelunban: function () {
                    if (!poChan.isChanAdmin(src)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }
                    if (!poChan.isBannedInChannel(dbIp)) {
                        botMessage(src, "That person isn't banned in this channel.", chan);
                        return;
                    }

                    botEscapeAll(mcmd[0].name() + " has been unbanned by " + sys.name(src) + " in this channel!", chan);
                    if (!isEmpty(mcmd[1])) {
                        var reason = cut(mcmd, 1, ':');
                        botEscapeAll("Reason: " + reason, chan);
                    }

                    delete poChan.banlist[dbIp];
                    cData.changeBans(chan, poChan.mutelist, poChan.banlist);
                },

                /* -- Channel Commands: Kick */
                channelkick: function () {
                    if (!poChan.isChanMod(src)) {
                        noPermissionMessage(src, fullCommand, chan);
                        return;
                    }
                    if (!poChan.canIssue(src, mcmd[0])) {
                        botMessage(src, 'That person has either equal or higher channel authority than you.', chan);
                        return;
                    }
                    if (tar === undefined) {
                        botMessage(src, "That person is either not online, or doesn't exist.", chan);
                        return;
                    }
                    if (self(src, mcmd[0])) {
                        botMessage(src, "You cannot channel kick yourself.", chan);
                        return;
                    }
                    if (!sys.isInChannel(tar, chan)) {
                        botMessage(src, "That person isn't in this channel.", chan);
                        return;
                    }
                    botAll(player(tar) + " has been kicked in this channel by " + player(src) + "!", chan);
                    if (!isEmpty(mcmd[1])) {
                        var reason = cut(mcmd, 1, ':');
                        botEscapeAll("Reason: " + reason, chan);
                    }
                    sys.kick(tar, chan);
                }
            });

            channelCommands[removespaces(ChanTour0).toLowerCase()] = function () {
                if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                    noPermissionMessage(src, fullCommand, chan);
                    return;
                }
                if (mcmd[0] === "") {
                    botMessage(src, "Specify a name!", chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist", chan);
                    return;
                }
                if (poChan.tourAuth[mcmd[0].toLowerCase()] === undefined) {
                    botMessage(src, "That person is already " + ChanTour0 + "!", chan);
                    return;
                }
                poChan.takeTourAuth(mcmd[0]);
                if (tar !== undefined) {
                    botEscapeAll(sys.name(tar) + " has been made " + ChanTour0 + " by " + sys.name(src) + ".", chan);
                    return;
                }
                botEscapeAll(commandData + " has been made " + ChanTour0 + " by " + sys.name(src) + ".", chan);
            };

            channelCommands[removespaces(ChanTour1).toLowerCase()] = function () {
                if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                    noPermissionMessage(src, fullCommand, chan);
                    return;
                }
                if (mcmd[0] === "") {
                    botMessage(src, "Specify a name!", chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist", chan);
                    return;
                }
                if (poChan.tourAuth[mcmd[0].toLowerCase()] !== undefined) {
                    botMessage(src, "That person is already " + ChanTour1 + "!", chan);
                    return;
                }
                poChan.giveTourAuth(mcmd[0]);
                if (tar !== undefined) {
                    botEscapeAll(sys.name(tar) + " has been made " + ChanTour1 + " by " + sys.name(src) + ".", chan);
                    return;
                }
                botEscapeAll(commandData + " has been made " + ChanTour1 + " by " + sys.name(src) + ".", chan);
                putInAuthChan(commandData, "cauth", chan);
            };

            channelCommands[removespaces(ChanUser).toLowerCase()] = function () {
                if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                    noPermissionMessage(src, fullCommand, chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist!", chan);
                    return;
                }
                var chanAuth = poChan.chanAuth,
                    player = chanAuth[commandData.toLowerCase()];
                if (player === undefined) {
                    botMessage(src, "That person is already " + ChanUser + "!", chan);
                    return;
                }
                if ((player >= 2 && !poChan.isChanOwner(src) && sys.auth(src) < 3) || (dbAuth === 2 && sys.auth(src) < 3)) {
                    botMessage(src, "You can't deauth higher auth!", chan);
                    return;
                }

                botEscapeAll(commandData + " was made " + ChanUser + " by " + sys.name(src) + ".", chan);
                poChan.changeAuth(commandData.toLowerCase(), 0);

                cData.changeChanAuth(chan, poChan.chanAuth);
            };

            channelCommands[removespaces(ChanMod).toLowerCase()] = function () {
                if (!poChan.isChanAdmin(src) && noPermission(src, 2)) {
                    noPermissionMessage(src, fullCommand, chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist!", chan);
                    return;
                }
                if (poChan.chanAuth[commandData.toLowerCase()] === 1) {
                    botMessage(src, "That person is already " + ChanMod + "!", chan);
                    return;
                }
                if (((+poChan.chanAuth[commandData.toLowerCase()]) >= 2 && !poChan.isChanOwner(src) && sys.auth(src) < 3) || (dbAuth === 2 && sys.auth(src) < 3)) {
                    botMessage(src, "You can't deauth higher auth!", chan);
                    return;
                }

                botEscapeAll(commandData + " was made " + ChanMod + " by " + sys.name(src) + ".", chan);
                poChan.changeAuth(commandData.toLowerCase(), 1);

                cData.changeChanAuth(chan, poChan.chanAuth);

                putInAuthChan(commandData, "cauth", chan);
            };

            channelCommands[removespaces(ChanAdmin).toLowerCase()] = function () {
                if (!poChan.isChanOwner(src) && noPermission(src, 3)) {
                    botMessage(src, "You don't have the permission to do that", chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist!", chan);
                    return;
                }
                if (poChan.chanAuth[commandData.toLowerCase()] === 2) {
                    botEscapeMessage(src, "That person is already " + ChanAdmin + "!", chan);
                    return;
                }
                if (sys.auth(src) < 3 && dbAuth > 1 && dbAuth < 3) {
                    botMessage(src, "You can't deauth higher auth!", chan);
                    return;
                }
                botEscapeAll(commandData + " was made " + ChanAdmin + " by " + sys.name(src) + ".", chan);
                poChan.changeAuth(commandData.toLowerCase(), 2);

                cData.changeChanAuth(chan, poChan.chanAuth);

                putInAuthChan(commandData, "cauth", chan);
            };

            channelCommands[removespaces(ChanOwner).toLowerCase()] = function () {
                if (!poChan.isChanOwner(src) && noPermission(src, 3)) {
                    botMessage(src, "You don't have the permission to do that", chan);
                    return;
                }
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist!", chan);
                    return;
                }
                if (poChan.chanAuth[commandData.toLowerCase()] === 3) {
                    botEscapeMessage(src, "That person is already " + ChanOwner + "!", chan);
                    return;
                }
                botEscapeAll(commandData + " was made " + ChanOwner + " by " + sys.name(src) + ".", chan);
                poChan.changeAuth(commandData.toLowerCase(), 3);

                cData.changeChanAuth(chan, poChan.chanAuth);

                putInAuthChan(commandData, "cauth", chan);
            };

            tourCommands = ({
                tourcommands: function () {
                    if (!poChan.toursEnabled) {
                        return;
                    }

                    var ct = new Command_Templater("Tournament Commands", true);
                    ct.span("Tournament " + ChanTour0 + " Commands");

                    ct.register("join", "To join this channel's tournament.");
                    ct.register("unjoin", "To unjoin this channel's tournament.");
                    ct.register("viewround", "Displays information about the current round.");
                    ct.register("tourprize", "Displays this channel's tournament prize.");

                    if (poChan.tour.hasTourAuth(src)) {
                        ct.span("Tournament " + ChanTour1 + " Commands");
                        ct.register("tour", ["{Text::Any Tier}", "{Text::Number Players}", "{Text::Number <u>Type</u>}", "{Text::Any <u>Prize</u>}"], "Starts a new tournament. Type will be Single Elimination (1) if not specified. Types are: Single Elimination (1), Double Elimination (2), Triple Elimination (3), Tag Team Single Elimination (4), Tag Team Double Elimination (5), Tag Team Triple Elimination (6). For Tag Team Tournaments, the entrants must be an even number.");
                        ct.register("dq", ["{Player::Tournament Player}"], "Disqualifies {Player::Tournament Player} from this channel's tournament.");
                        ct.register("cancelbattle", ["{Player::Tournament Player}"], "Makes someones battle unofficial.");
                        ct.register("changespots", ["{Text::Number Spots}"], "Changes the number of entry spots to {Text::Number Spots}. In Tag Team Tournaments, the entrants must be an even number.");
                        ct.register("push", ["{Player::Database Player}"], "Adds {Player::Database Player} to the tournament. In Tag Team Tournaments, you cannot add players after the signup.");
                        ct.register("endtour", "Ends this channel's running tournament.");
                        ct.register("switch", ["{Player::Tournament Player}", "{Player::Online New Player}"], "Switches {Player::Tournament Player} with {Player::Online New Player} in this channel's tournament.");
                        ct.register("autostartbattles", "Toggles auto start battles in this channel.");
                        ct.register("display", ["{Text::Choice 1/2}"], "To change this channel's tournament display mode. 1 is Normal, 2 is Clean.");
                    }

/*
                    if (permission(src, 1) || poUser.megauser) {
                        ct.span("Tournament " + Tour1 + " Commands");
                    }*/

                    ct.render(src, chan);
                },


                display: function () {
                    poChan.tour.command_display(src, commandData, fullCommand);
                },

                "switch": function () {
                    poChan.tour.command_switch(src, commandData, fullCommand);
                },

                autostartbattles: function () {
                    poChan.tour.command_autostartbattles(src, commandData, fullCommand);
                },

                tourprize: function () {
                    poChan.tour.command_tourprize(src, commandData, fullCommand);
                },

                join: function () {
                    poChan.tour.command_join(src, commandData, fullCommand);
                },

                unjoin: function () {
                    poChan.tour.command_unjoin(src, commandData, fullCommand);
                },

                viewround: function () {
                    poChan.tour.command_viewround(src, commandData, fullCommand);
                },

                dq: function () {
                    poChan.tour.command_dq(src, commandData, fullCommand);
                },

                push: function () {
                    poChan.tour.command_push(src, commandData, fullCommand);
                },

                cancelbattle: function () {
                    poChan.tour.command_cancelbattle(src, commandData, fullCommand);
                },

                changespots: function () {
                    poChan.tour.command_changespots(src, commandData, fullCommand);
                },

                tour: function () {
                    if (TourDisplay === 2) {
                        DisableChatColorRandomizer(chan);
                    }

                    poChan.tour.command_tour(src, commandData, fullCommand);
                },

                endtour: function () {
                    poChan.tour.command_endtour(src, commandData, fullCommand);
                }
            });

            modCommands = ({
                cmdcommands: function () {
                    var ct = new Command_Templater("Command Commands", true);
                    ct.span("Command " + ModName + " Commands");
                    ct.register("enable", ["{Text::Any Command}"], "Enables {Text::Any Command}. Valid commands are: me, attack, roulette, catch.");
                    ct.register("disable", ["{Text::Any Command}"], "Disables {Text::Any Command}. Valid commands are: me, attack, roulette, catch.");

                    if (permission(src, 2)) {
                        ct.span("Command " + AdminName + " Commands");
                        ct.register("implock", "Locks impersonation commands for " + Grammar.es(UserName) + ".");
                        ct.register("impunlock", "Unlocks impersonation commands for " + Grammar.es(UserName) + ".");
                    }

                    if (permission(src, 3)) {
                        ct.span("Command " + OwnerName + " Commands");
                        ct.register("pointercommand", ["{Text::Any Name}", "{Text::Any Command}"], "Creates the pointer command, {Text::Any Name}, that points to {Text::Any Command}.");
                        ct.register("delpointercommand", ["{Text::Any Name}"], "Deletes the pointer command, {Text::Any Name}.");
                        ct.register("futurelimit", ["{Text::Number Limit}"], "Changes the futures allowed to every {Text::Number Limit} seconds.");
                    }

                    if (host) {
                        ct.span("Command Founder Commands");
                        ct.register("evallock", "To lock eval for everyone but you and eval operators.");
                        ct.register("evalunlock", "To unlock eval.");
                    }

                    ct.render(src, chan);
                },

                moderatecommands: function () {
                    var ct = new Command_Templater("Moderation Commands", true);
                    ct.span("Moderation " + ModName + " Commands");

                    ct.register("kick", ["{Player::Online Player}", "{Text::Any <u>Reason</u>}"], "To kick {Player::Online Player} with the optional reason, {Text::Any Reason}.");
                    ct.register("mute", ["{Player::Database Player}", "{Text::Number <u>Time</u>}", "{Text::Time <u>Time Unit</u>}", "{Text::Any <u>Reason</u>}"], "To mute {Player::Database Player} for {Text::Number Time} with {Text::Time Time Unit} as time unit, with the reason being {Text::Any Reason}.");
                    ct.register("unmute", ["{Player::Database Player}", "{Text::Any <u>Reason</u>}"], "To unmute {Player::Database Player}, with the reason being {Text::Any Reason}.");
                    ct.register("tempban", ["{Player::Database Player}", "{Text::Number <u>Time</u>}", "{Text::Time <u>Time Unit</u>}", "{Text::Any <u>Reason</u>}"], "To ban {Player::Database Player} for {Text::Number Time} with {Text::Time Time Unit} as time unit, with the reason being {Text::Any Reason}.");
                    ct.register("untempban", ["{Player::Database Player}", "{Text::Any <u>Reason</u>}"], "To un-tempban {Player::Database Player}, with the reason being {Text::Any Reason}.");
                    ct.register("rangebanlist", "Displays the list of range bans.");
                    ct.register("banlist", "Displays the list of bans.");
                    ct.register("tempbanlist", "Displays the list of temp bans.");
                    ct.register("mutelist", "Displays the list of mutes.");

                    if (permission(src, 2)) {
                        ct.span("Moderation " + AdminName + " Commands");
                        ct.register("ban", ["{Player::Database Player}", "{Text::Any <u>Reason</u>}"], "To ban {Player::Database Player}, with the reason being {Text::Any Reason}.");
                        ct.register("unban", ["{Player::Database Player}", "{Text::Any <u>Reason</u>}"], "To unban {Player::Database Player}, with the reason being {Text::Any Reason}.");
                    }

                    if (permission(src, 3)) {
                        ct.span("Moderation " + OwnerName + " Commands");
                        ct.register("rangeban", ["{Text::Any Range IP}", "{Text::Number <u>Time</u>}", "{Text::Time <u>Time Unit</u>}", "{Text::Any <u>Reason</u>}"], "To range ban {Text::Any Range IP} for {Text::Number Time} with {Text::Time Time Unit} as time unit, with the reason being {Text::Any Reason}.");
                        ct.register("rangeunban", ["{Text::Any Range IP}"], "To un-range ban {Text::Any Range IP}.");
                    }

                    ct.render(src, chan);
                },

                impcommands: function () {
                    var ct = new Command_Templater("Impersonation Commands");

                    if (implock) {
                        ct.register("imp", ["{Text::Any Target}"], "To impersonate {Text::Any Target}.");
                        ct.register("impoff", "To stop impersonating.");
                    }

                    ct.register("unimp", ["{Player::Online Player}"], "Removes {Player::Online Player}'s impersonation.");

                    ct.register("superimp", ["{Text::Any Target}"], "Changes your name to ~{Text::Any Target}~.");
                    ct.register("superimpoff", "Restores your name to it's original.");

                    ct.render(src, chan);
                },

                silencecommands: function () {
                    var ct = new Command_Templater("Silence Commands", true);
                    ct.span("Silence " + ModName + " Commands");

                    ct.register("silence", ["{Text::Number <u>Time</u>}"], "Silences the chat for all auth under " + Grammar.es(UserName) + " for {Text::Number Time}. If no {Text::Number Time} specified, silences the chat forever.");
                    ct.register("unsilence", "Unsilences the chat.");
                    ct.register("voice", ["{Player::Database Player}"], "Gives {Player::Database Player} voice (the ability to talk through channel silences and normal silence).");
                    ct.register("unvoice", ["{Player::Database Player}"], "Removes {Player::Database Player}'s voice.");

                    if (sys.auth(src) < 2) {
                        ct.span("Silence " + AdminName + " Commands");
                        ct.register("supersilence", ["{Text::Number <u>Time</u>}"], "Silences the chat for all auth under " + Grammar.es(ModName) + " for {Text::Number Time}. If no {Text::Number Time} specified, silences the chat forever.");
                    }

                    if (sys.auth(src) < 3) {
                        ct.span("Silence " + OwnerName + " Commands");
                        ct.register("megasilence", ["{Text::Number <u>Time</u>}"], "Silences the chat for all auth under " + Grammar.es(AdminName) + " for {Text::Number Time}. If no {Text::Number Time} specified, silences the chat forever.");
                    }

                    ct.render(src, chan);
                },

                /* -- Mod Templates: Tables */
                rangebanlist: function () {
                    Prune.rangeBans();

                    var range = DataHash.rangebans,
                        t = +sys.time(),
                        r,
                        i,
                        s;

                    tt = new Table_Templater("Range Ban List", "darkviolet", "3");
                    tt.register(["Range IP", "By", "Reason", "Duration"], true);

                    for (i in range) {
                        r = range[i];
                        s = "for " + getTimeString(r.time - time);

                        if (r.time === 0) {
                            s = "forever";
                        }

                        tt.register([r.ip, r.by, r.why, s], false);
                    }


                    tt.render(src, chan);
                },

                tempbanlist: function () {
                    Prune.bans();

                    var temp = DataHash.tempbans,
                        last,
                        lastname,
                        i,
                        r,
                        s,
                        t = +sys.time();
                    
                    tt = new Table_Templater('Temp Ban List', 'limegreen', '3');

                    tt.register(["IP", "Last Used Name", "By", "Reason", "Duration"], true);

                    for (i in temp) {
                        r = temp[i];
                        s = "forever";

                        if (r.time !== 0) {
                            s = "for " + getTimeString(r.time - t);
                        }

                        last = "N/A";
                        lastname = lastName(r.ip);

                        if (lastname !== "~Unknown~") {
                            last = lastname;
                        }

                        tt.register([r.ip, last, r.by, r.why, s], false);
                    }


                    tt.render(src, chan);
                },
                mutelist: function () {
                    Prune.mutes();

                    var mutes = DataHash.mutes,
                        s,
                        last,
                        lastname,
                        r,
                        t = +sys.time(),
                        i;
                    
                    tt = new Table_Templater("Mute List", "midnightblue", "3");

                    tt.register(["IP", "Last Used Name", "By", "Reason", "Duration"], true);

                    for (i in mutes) {
                        r = mutes[i];
                        s = "forever";

                        if (r.time !== 0) {
                            s = "for " + getTimeString(r.time - t);
                        }

                        last = "N/A";
                        lastname = lastName(r.ip);
                        if (lastname !== "~Unknown~") {
                            last = lastname;
                        }

                        tt.register([r.ip, last, r.by, r.why, s], false);
                    }


                    tt.render(src, chan);
                },

                info: function () {
                    var ip = dbIp;
                    if (ip === undefined) {
                        botMessage(src, "That person doesn't exist", chan);
                        return;
                    }

                    var color = "N/A",
                        id = "N/A",
                        laston = "N/A",
                        lastname = "N/A",
                        aliases = sys.aliases(ip).map(function (n) {
                            return n.name();
                        }),
                        reg = "no";

                    if (sys.dbRegistered(commandData)) {
                        reg = "yes";
                    }

                    var ban = 'no',
                        banned,
                        banlist = sys.banList();

                    for (banned in banlist) {
                        if (cmdData === banlist[banned]) {
                            ban = 'yes';
                            break;
                        }
                    }

                    var online = 'yes';
                    if (tar === undefined) {
                        online = 'no';
                    }

                    var name = commandData.name(),
                        range = rangeIP(commandData);

                    if (sys.dbLastOn(commandData) !== undefined) {
                        laston = sys.dbLastOn(commandData);
                        lastname = lastName(ip);
                    }

                    Prune.mutes();
                    Prune.bans();

                    var auth = dbAuth,
                        t = parseInt(sys.time(), 10),
                        hash = DataHash,
                        hash_mute = hash.mutes[ip],
                        hash_ban = hash.tempbans[ip],
                        mutepart = "no";

                    if (hash_mute !== undefined) {
                        mutepart = "yes";
                    }

                    var mute = mutepart,
                        part;

                    if (mutepart !== "no") {
                        part = "forever";
                        if (hash_mute.time !== 0) {
                            part = "for " + getTimeString(hash_mute.time - t);
                        }

                        mute = mutepart + ", " + part + "!";
                    }

                    var banpart = "no";
                    if (hash_ban !== undefined) {
                        banpart = "yes";
                    }

                    var tban = banpart;

                    if (banpart !== "no") {
                        part = "forever";
                        if (hash_ban.time !== 0) {
                            part = "for " + getTimeString(hash_ban.time - t);
                        }

                        tban = banpart + ", " + part + "!";
                    }

                    if (online === 'yes') {
                        id = tar;
                        color = script.namecolor(tar);
                    }

                    script.resolveLocation(0, dbIp, true);

                    var loc = hash.locations[dbIp],
                        hostname = loc.hostname,
                        country = loc.country_name;

                    var tt = new Table_Templater("Information of " + name, "orange", "2");

                    tt.register(["Name", "IP", "Range IP", "Last On At", "With Name", "Registered", "Auth Level", "Aliases"], true);
                    tt.register([name, ip, range, laston, lastname, reg, auth, "<small>" + aliases + "</small>"], false);
                    tt.register(["Online", "Hex Color", "ID", "Muted", "Temp Banned", "Banned", "Country", "Hostname"], true);
                    tt.register([online, color, id, mute, tban, ban, country, hostname], false);


                    tt.render(src, chan);
                },

                banlist: function () {
                    var list = sys.banList().sort();

                    if (list.length === 0) {
                        botMessage(src, "No one is banned.", chan);
                        return;
                    }

                    var tt = new Table_Templater("Ban List", "red", "3");
                    tt.register(["Name", "Last Used Name", "IP"], true);

                    var last, lastname, ly, ip, y;

                    for (y in list) {
                        ly = list[y];
                        ip = sys.dbIp(ly);
                        last = "N/A";
                        lastname = lastName(ip);
                        if (lastname !== undefined) {
                            last = lastname;
                        }

                        tt.register([ly.name(), last, ip], false);
                    }


                    tt.render(src, chan);
                },

                /* -- Mod Commands: Voice */
                voice: function () {
                    var v = DataHash.voices,
                        n = mcmd[0];

                    if (dbIp === undefined || n === "") {
                        botMessage(src, "No such player!", chan);
                        return;
                    }
                    if (v.has(n.toLowerCase())) {
                        botMessage(src, "That player already has Voice!", chan);
                        return;
                    }

                    v[n.toLowerCase()] = {
                        'by': sys.name(src)
                    };
                    if (poTar !== undefined) {
                        poTar.voice = true;
                    }

                    botAll(n + " was made Voice by " + sys.name(src) + "!", 0);
                },

                unvoice: function () {
                    var v = DataHash.voices,
                        n = mcmd[0];

                    if (!v.has(n.toLowerCase())) {
                        botMessage(src, "That player does not have Voice!", chan);
                        return;
                    }

                    delete DataHash.voices[n.toLowerCase()];

                    if (poTar !== undefined) {
                        poTar.voice = false;
                    }

                    botAll(n + "'s voice was taken by " + sys.name(src) + "!", 0);
                },

                /* -- Mod Commands: Me -- */
                htmlme: function () {
                    if (commandData === "") {
                        return;
                    }

                    sys.sendHtmlAll("<font color=" + getColor + "><timestamp/><i>*** <b>" + srcname + "</b> " + commandData + "</i>", chan);
                },

                /* -- Mod Commands: Impersonation -- */
                unimp: function () {
                    if (tar === undefined) {
                        botMessage(src, "This person isn't online or doesn't exist.", chan);
                        return;
                    }
                    if (poTar.impersonation === undefined || poTar.impersonation === "") {
                        botMessage(src, "This person does not have an impersonation.", chan);
                        return;
                    }

                    sendAuth(sys.name(tar) + " (" + poTar.impersonation + ") was de-impersonated by " + srcname + "!");
                    delete poTar.impersonation;
                    if (sys.auth(tar) < 1) {
                        botMessage(tar, "You have been un-impersonated by " + srcname + "!");
                    }
                },

                /* -- Mod Commands: Wall -- */
                htmlwall: function () {
                    var color = script.namecolor(src),
                        l = '';

                    sys.sendHtmlAll(BORDER + "<br>");

                    if (UseIcons) {
                        l = rankico;
                    }

                    sys.sendHtmlAll('<font color=' + color + '><timestamp/><b>' + l + html_escape(srcname) + ':</font></b> ' + commandData);
                    sys.sendHtmlAll("<br>" + BORDER);
                },

                wall: function () {
                    var color = script.namecolor(src),
                        l = '',
                        send = sys.sendAll,
                        f = commandData,
                        displaystr = sys.name(src) + ': ' + f;

                    sys.sendHtmlAll(BORDER + "<br>");

                    if (UseIcons) {
                        l = rankico;
                        send = sys.sendHtmlAll;
                        f = format(src, html_escape(commandData));
                        displaystr = '<font color=' + color + '><timestamp/><b>' + l + html_escape(srcname) + ':</font></b> ' + f;
                    }

                    send(displaystr);
                    sys.sendHtmlAll("<br>" + BORDER);
                },

                /* -- Mod Commands: Silence -- */
                silence: function () {
                    if (silence.level) {
                        botMessage(src, "The chat is already silenced.", chan);
                        return;
                    }
                    var time = commandData * 60,
                        timeStr = "!";
                    if (!isNaN(time) && commandData !== "") {
                        timeStr = " for " + getTimeString(time) + "!";
                    }

                    silence = {
                        "by": sys.name(src),
                        "level": 1
                    };
                    botAll(sys.name(src) + " silenced the chat" + timeStr);

                    if (timeStr === "!") {
                        return;
                    }

                    var timeOut = function () {
                        if (!silence.level) {
                            return;
                        }

                        silence = {
                            "by": "",
                            "level": 0
                        };
                        botAll("Silence is over.");
                    };

                    sys.delayedCall(timeOut, time);
                },

                unsilence: function () {
                    if (!silence.level) {
                        botMessage(src, "The chat isn't silenced.", chan);
                        return;
                    }

                    silence = {
                        "by": "",
                        "level": 0
                    };

                    botAll(sys.name(src) + " unsilenced the chat!");
                },

                /* -- Mod Commands: Auth -- */
                resign: function () {
                    if (sys.auth(src) === 0) { // Auth perms
                        return;
                    }

                    var n = sys.name(src);
                    sys.changeAuth(src, 0);
                    botAll(n + " resigned from auth!", 0);
                },


                passauth: function () {
                    if (dbIp === undefined || dbIp !== sys.ip(src)) {
                        botMessage(src, "That player doesn't have your ip or does not exist.", chan);
                        return;
                    }

                    var myAuth = sys.auth(src),
                        trgtAuth = sys.dbAuth(commandData);
                    if (myAuth <= trgtAuth) {
                        botMessage(src, "That alias has either equal or higher auth!", chan);
                        return;
                    }

                    if (!sys.dbRegistered(commandData)) {
                        botMessage(src, "That alias is not registered. Please register it before passing auth.", chan);
                        return;
                    }


                    var myID = src;

                    var tarId = sys.id(commandData);

                    sys.changeDbAuth(commandData, myAuth);
                    if (tarId) {
                        sys.changeAuth(tarId, myAuth);
                    }

                    sys.changeAuth(myID, 0);

                    botMessage(src, "You passed your auth to " + commandData.name() + "!", chan);
                },

                /* -- Mod Commands: Poll -- */
                poll: function () {

                    if (!mcmd[1]) {
                        mcmd[1] = '';
                    }
                    if (Poll.mode) {
                        botMessage(src, "A poll is already going on", chan);
                        return;
                    }

                    Poll.mode = 1;
                    Poll.votes = 0;
                    Poll.subject = mcmd[0];
                    Poll.starter = sys.name(src);

                    mcmd[1] = cut(mcmd, 1, ':');
                    var arr = mcmd[1].split('/'),
                        y,
                        num;

                    for (y in arr) {
                        num = Number(y) + 1;
                        Poll.options[num] = {
                            name: arr[y],
                            votes: []
                        };
                    }

                    if (objLength(Poll.options) < 2) {
                        Poll.mode = 0;
                        Poll.votes = 0;
                        Poll.subject = "";
                        Poll.starter = '';
                        Poll.options = {};
                        botMessage(src, "Please specify atleast 2 options.", chan);
                        return;
                    }

                    botAll("A poll was started by " + sys.name(src).bold() + "!", 0);
                    botAll("Subject: " + mcmd[0], 0);
                    botAll("Please vote! Use <font color='green'><b>/Vote</b></font> Option Number to vote.", 0);

                    var i;
                    for (i in Poll.options) {
                        botAll(i + ". " + Poll.options[i].name, 0);
                    }
                },

                closepoll: function () {
                    if (Poll.mode !== 1) {
                        botMessage(src, "No poll is going on.", chan);
                        return;
                    }
                    Poll.mode = 0;
                    botAll(sys.name(src) + " closed the poll started by " + Poll.starter.bold() + "!", 0);
                    Poll.starter = '';

                    if (Poll.votes === 0) {
                        botAll("No one voted on the " + Poll.subject + " poll!", 0);
                        Poll.subject = '';
                        Poll.options = {};
                        Poll.votes = 0;
                        return;
                    }

                    botAll(Poll.subject + " - Results:", 0);
                    Poll.subject = '';

                    var x, option, current_votes;
                    for (x in Poll.options) {
                        option = Poll.options[x];
                        current_votes = option.votes.length;
                        botAll(x + ". " + option.name + " - " + current_votes, chan);
                    }

                    Poll.options = {};
                    Poll.votes = 0;
                },

                /* -- Mod Commands: Command Status -- */
                enable: function () {
                    if (cmdData === "me") {
                        if (!CommandsEnabled.me) {
                            botAll('/me was turned on!', 0);
                            CommandsEnabled.me = true;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/me is already on.', chan);
                        return;
                    } else if (cmdData === "roulette") {
                        if (!CommandsEnabled.roulette) {
                            botAll('/roulette was turned on!', 0);
                            CommandsEnabled.roulette = true;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/roulette is already on.', chan);
                        return;
                    } else if (cmdData === 'catch') {
                        if (!CommandsEnabled._catch_) {
                            botAll('/catch was turned on!', 0);
                            CommandsEnabled._catch_ = true;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/catch is already on.', chan);
                        return;
                    } else if (cmdData === "attack") {
                        if (!CommandsEnabled.attack) {
                            botAll('/attack was turned on!', 0);
                            CommandsEnabled.attack = true;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/attack is already on.', chan);
                    }
                },

                disable: function () {
                    if (cmdData === "me") {
                        if (CommandsEnabled.me) {
                            botAll('/me was turned off!', 0);
                            CommandsEnabled.me = false;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/me is already off.', chan);
                        return;
                    } else if (cmdData === "roulette") {
                        if (CommandsEnabled.roulette) {
                            botAll('/roulette was turned off!', 0);
                            CommandsEnabled.roulette = false;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/roulette is already off.', chan);
                        return;
                    } else if (cmdData === 'catch') {
                        if (CommandsEnabled._catch_) {
                            botAll('/catch was turned off!', 0);
                            CommandsEnabled._catch_ = false;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/catch is already off.', chan);
                        return;
                    } else if (cmdData === "attack") {
                        if (CommandsEnabled.attack) {
                            botAll('/attack was turned off!', 0);
                            CommandsEnabled.attack = false;
                            cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                            return;
                        }
                        botMessage(src, '/attack is already off.', chan);
                    }
                },

                /* -- Mod Commands: Message Sending -- */
                send: function () {
                    sys.sendAll(commandData, chan);
                },

                /* -- Mod Commands: MOTD -- */
                changemotd: function () {
                    if (cmdData === "default") {
                        if (!motd) {
                            botMessage(src, "The MOTD is already set to default.", chan);
                            return;
                        }

                        motd = false;
                        cache.write("motd", false);

                        cache.remove("MOTDMessage");
                        cache.remove("MOTDSetter");

                        botEscapeMessage(src, "You changed the MOTD back to default.", chan);
                        botAllExcept(src, "The MOTD has been changed to default by " + player(src) + ".", 0, "");
                        return;
                    }

                    motd = true;
                    cache.write("motd", true);

                    cache.write("MOTDMessage", commandData);
                    cache.write("MOTDSetter", sys.name(src));

                    botEscapeMessage(src, "You changed the MOTD to: " + commandData, chan);
                    botAllExcept(src, "The MOTD has been changed by " + player(src) + ".", 0, "");
                },

                /* -- Mod Commands: Kick -- */
                kick: function () {
                    var tarid = sys.id(mcmd[0]);
                    var tn = sys.name(tarid);
                    if (sys.maxAuth(dbIp) >= sys.auth(src) && !host) {
                        botMessage(src, "Can't kick that person!", chan);
                        return;
                    }

                    if (tar === undefined) {
                        botMessage(src, "This person is not online or doesn't exist.", chan);
                        return;
                    }

                    if (self(src, tar)) {
                        botMessage(src, "Can't kick yourself!", chan);
                        return;
                    }

                    sys.sendHtmlAll("<timestamp/> <font color=midnightblue><b>" + tn + " was kicked from the server by " + sys.name(src) + "!</b></font>", 0);
                    if (mcmd[1] !== undefined) {
                        mcmd[1] = cut(mcmd, 1, ':');
                        sys.sendHtmlAll("<timestamp/> <font color=midnightblue><b>Reason: </b></font>" + mcmd[1], 0);
                    }
                    kick(tarid);
                },

                /* -- Mod Commands: Mute -- */
                mute: function () {
                    script.issueMute(src, mcmd[0], cut(mcmd, 3, ':'), Number(mcmd[1]), chan, mcmd[2]);
                },

                unmute: function () {
                    script.removeMute(src, mcmd[0], cut(mcmd, 1, ':'), chan);
                },

                /* -- Mod Commands: Ban -- */
                tempban: function () {
                    mcmd[3] = cut(mcmd, 3, ':');
                    script.issueTempBan(src, mcmd[0], mcmd[3], Number(mcmd[1]), chan, mcmd[2]);
                },

                untempban: function () {
                    mcmd[1] = cut(mcmd, 1, ':');
                    script.removeTempBan(src, mcmd[0], mcmd[1], chan);
                },

                /* -- Mod Commands: Aliases -- */
                aliases: function () {
                    if (!/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(commandData)) {
                        botMessage(src, "Invalid IP.", chan);
                        return;
                    }
                    var alias = sys.aliases(commandData);
                    if (alias === "") {
                        botMessage(src, "This IP is not registered.", chan);
                        return;
                    }
                    var temp = alias;
                    botMessage(src, "The aliases of " + commandData + " are: ", chan);
                    botMessage(src, "<small><b>" + alias.join("</b>, <b>") + "</b></small>", chan);
                    botMessage(src, temp.length + " aliases in total.", chan);
                },

                hostname: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player does not exist.", chan);
                        return;
                    }

                    script.resolveLocation(0, dbIp, true);
                    botMessage(src, "The hostname of " + commandData.name().bold() + " is: " + DataHash.locations[dbIp].hostname, chan);
                },

                superimp: function () {
                    if (commandData === "") {
                        botMessage(src, "Specify a name to imp.", chan);
                        return;
                    }
                    if (commandData.length > 20) {
                        botMessage(src, "Specify a shorter name.", chan);
                        return;
                    }

                    if (ify.onChangeName() === "disallow") {
                        botMessage(src, "Ify is active. You can't superimp!", chan);
                        return;
                    }

                    if (poUser.superimp === undefined) {
                        poUser.superimp = sys.name(src);
                    }

                    botAll(sys.name(src) + " superimped " + commandData + "!", 0);
                    sys.changeName(src, "~" + commandData + "~");
                },

                superimpoff: function () {
                    if (poUser.superimp === undefined) {
                        botMessage(src, "You aren't superimping!", chan);
                        return;
                    }

                    if (ify.onChangeName() === "disallow") {
                        botMessage(src, "Ify is active. You can't turn superimp off now!", chan);
                        return;
                    }

                    sys.changeName(src, poUser.superimp);
                    botAll(sys.name(src) + " changed their name back!", 0);
                }
            });

            modCommands[removespaces(ModName).toLowerCase() + "commands"] = function () {
                var ct = new Command_Templater(ModName + " Commands");

                ct.register("impcommands", "Displays the Impersonation commands.");
                ct.register("silencecommands", "Displays the Silence commands.");
                ct.register("cmdcommands", "Displays the Command commands.");
                ct.register("moderatecommands", "Displays the Moderation commands.");
                ct.register("poll", ["{Text::Any Subject}", "{Text::Any Options}"], "To start a poll with the subject as {Text::Any Subject}, and options as {Text::Any Options}, which are separated with '/'.");
                ct.register("closepoll", "To close the running poll.");
                ct.register("info", ["{Player::Database Player}"], "Displays player information of {Player::Database Player}.");
                ct.register("aliases", ["{Text::Any IP}"], "Displays the aliases of {Text::Any IP}.");
                ct.register("hostname", ["{Player::Database Player}"], "Displays the hostname of {Player::Database Player}.");
                ct.register('changemotd', ["{Text::Any MOTD}"], "Changes the Message of the Day to {Text::Any MOTD}. Use /changemotd default to set this to default.");
                ct.register("passauth", ["{Player::Database Player}"], "To pass your auth to {Player::Database Player}. The alias must be registered and under your ip.");

                ct.render(src, chan);
            };

            adminCommands = ({
                leaguecommands: function () {
                    var ct = new Command_Templater("League Commands");

                    ct.register("changegl", ["{Text::Number Number}", "{Player::Database Player}"], "To make {Player::Database Player} the league Gym Leader #{Text::Number Spot}, which can be 1-16.");
                    ct.register("changeelite", ["{Text::Number Number}", "{Player::Database Player}"], "To make {Player::Database Player} the league Elite Four #{Text::Number Spot}, which can be 1-4.");
                    ct.register("changechampion", ["{Player::Database Player}"], "To make {Player::Database Player} the league champion.");

                    ct.register("removegl", ["{Text::Number Spot}"], "To remove Gym Leader {Text::Number Spot} from the league. {Text::Number Spot} can be 1-4.");
                    ct.register("removeelite", ["{Text::Number Spot}"], "To remove Elite Four {Text::Number Spot} from the league. {Text::Number Spot} can be 1-4.");
                    ct.register("removechampion", "To remove the league's champion.");

                    ct.render(src, chan);
                },

                authcommands: function () {
                    var ct = new Command_Templater("Authority Commands", true);

                    ct.span("Authority " + AdminName + " Commands");

                    if (Config.AdminsCanAuth) {
                        ct.register(removespaces(UserName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(UserName) + ".");
                        ct.register(removespaces(ModName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ModName) + ".");
                        ct.register("tempauth", ["{Player::Database Player}", "{Text::Number Auth Level}", "{Text::Number Time}", "{Text::Time Time Unit}"], "To give {Player::Database Player} temporary authority. Any other authing command (except tourauth) will delete this temp auth. Valid levels are: 1, 2, 3, 4. Only " + Grammar.es(OwnerName) + " can do 2, 3, or 4.");
                    }
                    ct.register(removespaces(Tour0).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(Tour0) + ".");
                    ct.register(removespaces(Tour1).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(Tour1) + ".");

                    if (permission(src, 3)) {
                        ct.span("Authority " + OwnerName + " Commands");

                        if (!Config.AdminsCanAuth) {
                            ct.register(removespaces(UserName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(UserName) + ".");
                            ct.register(removespaces(ModName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(ModName) + ".");
                            ct.register("tempauth", ["{Player::Database Player}", "{Text::Number Auth Level}", "{Text::Number Time}", "{Text::Time Time Unit}"], "To give {Player::Database Player} temporary authority. Any other authing command (except tourauth) will delete this temp auth. Valid levels are: 1, 2, 3, 4.");
                        }
                        ct.register(removespaces(AdminName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(AdminName) + ".");
                        ct.register(removespaces(OwnerName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(OwnerName) + ".");
                        ct.register(removespaces(InvisName).toLowerCase(), ["{Player::Database Player}"], "To make {Player::Database Player} " + Grammar.a(InvisName) + ".");
                        ct.register("changeauthname", ["{Text::Choice Server/Channel/Tournament/CTour}", "{Text::Number Auth Level}", "{Text::Any New Name}"], "To change the name of the {Text::Number Auth Level} authority level, which is part of {Text::Choice Auth Levels}, to {Text::Any New Name}. Server can be 0-4 | Channel can be 0-3 | Tournament and CTour can be 0-1. {Text::Any New Name} can have spaces, letters 0-9, and characters a-Z_.");
                    }

                    if (host) {
                        ct.register("evaluser", ["{Player::Database Player}"], "To make {Player::Database Player} an Eval User.");
                        ct.register("evalop", ["{Player::Database Player}"], "To make {Player::Database Player} an Eval Operator. Eval Ops can use eval unregarding their auth, and can use eval when it's locked.");
                    }

                    ct.render(src, chan);
                },

                supersilence: function () {
                    if (silence.level) {
                        botMessage(src, "The chat is already silenced.", chan);
                        return;
                    }

                    var time = commandData * 60,
                        timeStr = "!";
                    if (!isNaN(time) && commandData !== "") {
                        timeStr = " for " + getTimeString(time) + "!";
                    }

                    silence = {
                        "by": sys.name(src),
                        "level": 2
                    };

                    botAll(player(src) + " super-silenced the chat" + timeStr);

                    if (timeStr === "!") {
                        return;
                    }

                    var timeOut = function () {
                        if (!silence.level) {
                            return;
                        }

                        silence = {
                            "by": "",
                            "level": 0
                        };

                        botAll("Silence is over.");
                    };

                    sys.delayedCall(timeOut, time);
                },

                implock: function () {
                    if (implock) {
                        botMessage(src, "Implock is already on.", chan);
                        return;
                    }

                    botAll("Implock has been turned on!", 0);
                    implock = true;
                    cache.write("implock", true);
                },

                impunlock: function () {
                    if (!implock) {
                        botMessage(src, "Implock is already off.", chan);
                        return;
                    }

                    botAll("Implock has been turned off!", 0);
                    implock = false;
                    cache.write("implock", false);
                },

                activestyle: function () {
                    StyleManager.setActiveStyle(src, commandData, chan);
                },

                activeicons: function () {
                    IconManager.setActiveIcons(src, commandData, chan);
                },

                changegl: function () {
                    mcmd[0] = Math.round(parseInt(mcmd[0], 10));
                    if (isNaN(mcmd[0]) || mcmd[0] > 16 || mcmd[0] < 1) {
                        botMessage(src, "You can't make over 16 gym leaders.", chan);
                        return;
                    }
                    if (sys.dbIp(mcmd[1]) === undefined) {
                        botMessage(src, "That person doesn't exist in the db.", chan);
                        return;
                    }
                    DataHash.league.gym[mcmd[0]] = mcmd[1];
                    botEscapeAll(sys.name(src) + " made " + mcmd[1] + " gym leader #" + mcmd[0] + "!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                changeelite: function () {
                    mcmd[0] = Math.round(parseInt(mcmd[0], 10));
                    if (isNaN(mcmd[0]) || mcmd[0] > 4 || mcmd[0] < 1) {
                        botMessage(src, "You can't make over 4 elite members.", chan);
                        return;
                    }
                    if (sys.dbIp(mcmd[1]) === undefined) {
                        botMessage(src, "That person doesn't exist in the db.", chan);
                        return;
                    }
                    DataHash.league.elite[mcmd[0]] = mcmd[1];
                    botEscapeAll(sys.name(src) + " made " + mcmd[1] + " elite four number #" + mcmd[0] + "!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                changechampion: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist in the db.", chan);
                        return;
                    }
                    DataHash.league.Champion = commandData;
                    botEscapeAll(sys.name(src) + " made " + commandData + " the champion!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                removegl: function () {
                    mcmd[0] = Math.round(parseInt(mcmd[0], 10));
                    if (isNaN(mcmd[0]) || mcmd[0] > 16 || mcmd[0] < 1) {
                        botMessage(src, "Select 1-16.", chan);
                        return;
                    }
                    delete DataHash.league.gym[mcmd[0]];
                    botEscapeAll(sys.name(src) + " removed gym leader #" + mcmd[0] + "!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                removeelite: function () {
                    mcmd[0] = Math.round(parseInt(mcmd[0], 10));
                    if (isNaN(mcmd[0]) || mcmd[0] > 4 || mcmd[0] < 1) {
                        botMessage(src, "Select 1-4.", chan);
                        return;
                    }
                    delete DataHash.league.elite[mcmd[0]];
                    botEscapeAll(sys.name(src) + " removed elite four #" + mcmd[0] + "!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                removechampion: function () {
                    DataHash.league.Champion = "";
                    botEscapeAll(sys.name(src) + " removed the champion!", 0);
                    cache.write("league", JSON.stringify(DataHash.league));
                },

                ban: function () {
                    if (dbIp === undefined || mcmd[0] === "") {
                        botMessage(src, "No player exists by this name!", chan);
                        return;
                    }
                    if (sys.maxAuth(dbIp) >= hpAuth(src) && !isHost(src)) {
                        botMessage(src, "Can't do that to higher or equal auth!", chan);
                        return;
                    }

                    var banlist = sys.banList(),
                        a,
                        toBan = mcmd[0].toLowerCase();

                    for (a in banlist) {
                        if (banlist[a] === toBan) {
                            botMessage(src, "That person is already banned!", chan);
                            return;
                        }
                    }

                    var me = player(src),
                        name = mcmd[0],
                        target = player(name);

                    botAll(target + " was banned from the server by " + me + "!", 0);

                    if (mcmd[1] !== undefined) {
                        mcmd[1] = cut(mcmd, 1, ':');
                        botEscapeAll("Reason: " + mcmd[1], 0);
                    }

                    ban(name);
                },

                unban: function () {
                    if (sys.dbIp(mcmd[0]) === undefined) {
                        botMessage(src, "No player exists by this name!", chan);
                        return;
                    }

                    var banlist = sys.banList();
                    var a, me;

                    for (a in banlist) {
                        if (sys.dbIp(mcmd[0]) === sys.dbIp(banlist[a])) {
                            sys.unban(mcmd[0]);

                            me = player(src);
                            botAll(player(mcmd[0]) + " was unbanned from the server by " + me + "!", 0);

                            if (mcmd[1] !== undefined) {
                                mcmd[1] = cut(mcmd, 1, ':');
                                botEscapeAll('Reason: ' + mcmd[1], 0);
                            }
                            return;
                        }
                    }

                    botMessage(src, "He/she's not banned!", chan);
                },

                clearchat: function () {
                    var me = player(src),
                        y;

                    for (y = 0; y < 2999; y++) {
                        sys.sendAll("", chan);
                    }

                    botAll(me + " cleared the chat!");
                },

                showteam: function () {
                    if (tar === undefined) {
                        botMessage(src, "That person seems to be offline or does not exist.", chan);
                        return;
                    }
                    
                    if (typeof mcmd[1] === "string") {
                        return script.importable(src, tar, chan, true);
                    }
                    script.importable(src, tar, chan);
                },

                masskick: function () {
                    botAll(player(src) + " started the masskick!");
                    massKick();
                },

                'ify': function () {
                    ify.command_ify(src, commandData, chan);
                },

                'unify': function () {
                    ify.command_unify(src, commandData, chan);
                },

                autoidle: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "Unknown target!", chan);
                        return;
                    }

                    var name = mcmd[0];
                    mcmd[0] = mcmd[0].toLowerCase();
                    if (!mcmd[1]) {
                        mcmd[1] = "";
                    }

                    var only_msg_change = false;

                    if (typeof DataHash.idles[mcmd[0]] !== "undefined") {
                        if (DataHash.idles[mcmd[0]].entry === mcmd[1]) {
                            botMessage(src, "This person already has Auto-Idle. You can only change the entry message.", chan);
                            return;
                        } else {
                            only_msg_change = true;
                        }
                    }

                    if (!only_msg_change) {
                        botAll(name + " was given Auto-Idle by " + player(src) + ".", 0);
                    } else {
                        botMessage(src, "The Auto-Idle Entry Message of " + name + " was changed.", chan);
                    }

                    if (tar !== undefined) {
                        sys.changeAway(tar, true);
                    }

                    mcmd[1] = cut(mcmd, 1, ':');
                    DataHash.idles[mcmd[0]] = {
                        'entry': mcmd[1],
                        'setterauth': sys.auth(src)
                    };

                    cache.write("idles", JSON.stringify(DataHash.idles));
                },

                autoidleoff: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "This player doesn't exist.", chan);
                        return;
                    }

                    var name = mcmd[0];
                    mcmd[0] = mcmd[0].toLowerCase();

                    if (!DataHash.idles.has(mcmd[0])) {
                        botMessage(src, "This player doesn't have auto idle.", chan);
                        return;
                    }

                    botAll(player(src) + " removed " + Grammar.es(name) + " auto idle!", 0);

                    if (tar !== undefined) {
                        sys.changeAway(tar, false);
                    }

                    DataHash.idles.remove(mcmd[0]);
                    cache.write("idles", JSON.stringify(DataHash.idles));
                },

                bot: function () {
                    if (commandData === "") {
                        botMessage(src, "Specify a name for the bot!", chan);
                        return;
                    }
                    if (commandData.length > 40) {
                        botMessage(src, "The bot name cannot be over 40 characters. Current: " + commandData.length, chan);
                        return;
                    }
                    botAll("The bot was changed to " + commandData + "</i> by " + sys.name(src) + "!", 0);
                    Bot.bot = commandData;
                    cache.write("Bot", JSON.stringify(Bot));
                },

                botcolor: function () {
                    if (commandData === "") {
                        botMessage(src, "Specify a name for the bot color!", chan);
                        return;
                    }
                    if (!sys.validColor(commandData)) {
                        botMessage(src, "The bot color is invalid.", chan);
                        return;
                    }

                    botAll("The bot color was changed to <font color=" + commandData + ">" + commandData + "</font> by " + sys.name(src) + "!", 0);
                    Bot.botcolor = commandData;
                    cache.write("Bot", JSON.stringify(Bot));
                },

                talk: function () {
                    if (commandData === "") {
                        botMessage(src, "Specify a message.", chan);
                        return;
                    }

                    botAll(commandData, chan);
                },

                clantag: function () {
                    if (commandData.isEmpty()) {
                        botMessage(src, "Specify a tag.", chan);
                        return;
                    }
                    if (commandData === ClanTag) {
                        botMessage(src, "This is already the clan tag.", chan);
                        return;
                    }

                    botAll(player(src) + " changed the clan tag to " + commandData.bold() + "!", 0);

                    ClanTag = commandData;
                    cache.write("ClanTag", ClanTag);

                    Clantag = {};
                    Clantag.full = ClanTag;
                    Clantag.fullText = Clantag.full.replace(/[\[\]\{\}]/gi, "").split(' ').join('');
                    Clantag.fullTextLower = Clantag.fullText.toLowerCase();
                },

                tempauth: function () {
                    script.tAuth(src, mcmd[0], Number(mcmd[1]), Number(mcmd[2]), chan, mcmd[3]);
                },

                forcebattle: function () {
                    if (!mcmd[1]) {
                        mcmd[1] = "";
                    }
                    if (!mcmd[2]) {
                        mcmd[2] = "";
                    }
                    if (!mcmd[3]) {
                        mcmd[3] = "";
                    }
                    if (!mcmd[4]) {
                        mcmd[4] = "";
                    }

                    var tierName = validTier(mcmd[2]),
                        clauses = 0;

                    if (tierName) {
                        clauses = sys.getClauses(tierName);
                    }

                    var player1 = sys.id(mcmd[0]),
                        player2 = sys.id(mcmd[1]),
                        pl1 = sys.name(player1),
                        pl2 = sys.name(player2);

                    if (player1 === undefined || player2 === undefined) {
                        botMessage(src, "Those players don't exist!", chan);
                        return;
                    }

                    if (player1 === player2) {
                        botMessage(src, "Can't force battles between the same player!", chan);
                        return;
                    }

                    if (sys.battling(player1) || sys.battling(player2)) {
                        botMessage(src, "These players are already battling.", chan);
                        return;
                    }

                    if (sys.teamCount(player1) === 0 || sys.teamCount(player2) === 0) {
                        botMessage(src, "Both players must have one team.", chan);
                        return;
                    }

                    var modeToString = mcmd[3].toLowerCase(),
                        mode = 0;

                    if (modeToString === "doubles") {
                        mode = 1;
                    } else if (modeToString === "triples") {
                        mode = 2;
                    }

                    var rated = mcmd[4].toLowerCase();
                    if (!on(rated) || rated !== "rated") {
                        rated = false;
                    } else {
                        rated = true;
                    }

                    var player1_team = firstTeamForTier(player1, tierName),
                        player2_team = firstTeamForTier(player2, tierName);

                    if (player1_team === -1) {
                        player1_team = 0;
                    }
                    if (player2_team === -1) {
                        player2_team = 0;
                    }

                    sys.forceBattle(player1, player2, player1_team, player2_team, clauses, mode, rated);
                    script.afterBattleStarted(src, tar, clauses, rated, player1_team, player2_team);
                    botEscapeAll("A battle between " + pl1 + " and " + pl2 + " has been forced by " + sys.name(src) + "!", 0);
                }
            });

            adminCommands[removespaces(AdminName).toLowerCase() + "commands"] = function () {
                var ct = new Command_Templater(AdminName + " Commands");

                ct.register("leaguecommands", "Displays the League commands.");
                ct.register("authcommands", "Displays the Authority commands.");
                ct.register("masskick", "Kicks all users from the server.");
                ct.register("clearchat", "Clears the chat.");
                ct.register("showteam", ["{Player::Online Player}", "{Text::Any <u>\"simple\"</u>}"], "Displays {Player::Online Player}'s team. If {Text::Any <u>\"simple\"</u>} is specified (can be anything), then displays an importable instead (no images).");
                ct.register("forcebattle", ["{Player::Online Player1}", "{Player::Online Player2}", "{Text::Any <u>Tier</u>}", "{Text::Any <u>Mode</u>}", "{Text::Any <u>Rated</u>}"], "Forces a battle between {Player::Online Player1} and {Player::Online Player2}, using {Text::Any Tier}'s clauses, {Text::Any Mode} as battle mode, and {Text::Any Rated} deciding if the battle is rated. Tier must be a valid tier for clauses (teams of this are also prioritized if any). Mode can be Doubles or Triples. Rated must be one of the following: true, rated, yes, on. If not, the battle won't be rated.");
                ct.register("bot", ["{Text::Any Name}"], "Changes the bot's name to {Text::Any Name}.");
                ct.register("botcolor", ["{Text::Any Color}"], "Changes the bot's color to {Text::Any Color}.");
                ct.register("clantag", ["{Text::Any Clan Tag}"], "Changes the clan tag to {Text::Any Clan Tag}. If Tag is None, turns the clan feature off.");
                ct.register("autoidle", ["{Player::Database Player}", "{Text::Any <u>Entry Message</u>}"], "To enable automatic idling of {Player::Database Player} with an optional entry message displayed when he/she logs on. Also works when you only want to change the entry message.");
                ct.register("autoidleoff", ["{Player::Database Player}"], "Removes {Player::Database Player}'s auto idle.");

                ct.render(src, chan);
            };

            if (Config.AdminsCanAuth) {
                adminCommands[removespaces(UserName).toLowerCase()] = function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist");
                        return;
                    }
                    if (dbAuth === 0) {
                        botMessage(src, "That player already is " + UserName + "!", chan);
                        return;
                    }
                    if (sys.auth(src) <= sys.maxAuth(dbIp) && sys.auth(src) < 3) {
                        botMessage(src, "You can't deauth this person!", chan);
                        return;
                    }

                    if (DataHash.tempauth[cmdData] !== undefined) {
                        delete DataHash.tempauth[cmdData];
                        cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                    }

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + UserName + " by " + sys.name(src) + ".", 0);
                        sys.changeAuth(tar, 0);
                        return;
                    }

                    botEscapeAll(commandData + " has been made " + UserName + " by " + sys.name(src) + ".", 0);
                    sys.changeDbAuth(commandData, 0);

                    kickFromChannel(commandData, scriptchannel);
                    kickFromChannel(commandData, watch);
                    kickFromChannel(commandData, staffchannel);
                };

                adminCommands[removespaces(ModName).toLowerCase()] = function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist", chan);
                        return;
                    }
                    if (dbAuth === 1) {
                        botMessage(src, "That player already is " + ModName + "!", chan);
                        return;
                    }
                    if (!sys.dbRegistered(commandData)) {
                        botMessage(src, "This player is not registered.", chan);
                        if (tar !== undefined) {
                            botMessage(tar, "Please register for auth.");
                        }
                        return;
                    }
                    if (sys.auth(src) <= sys.maxAuth(dbIp) && sys.auth(src) < 3) {
                        botMessage(src, "You can't deauth this person!", chan);
                        return;
                    }

                    if (DataHash.tempauth[cmdData] !== undefined) {
                        delete DataHash.tempauth[cmdData];
                        cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                    }

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + ModName + " by " + sys.name(src) + ".", 0);
                        sys.changeAuth(tar, 1);
                        return;
                    }
                    botEscapeAll(commandData + " has been made " + ModName + " by " + sys.name(src) + ".", 0);
                    sys.changeDbAuth(commandData, 1);
                    putInAuthChan(commandData, "mod");
                };

                adminCommands[removespaces(Tour0).toLowerCase()] = function () {
                    if (mcmd[0] === '') {
                        botMessage(src, "Specify a name!", chan);
                        return;
                    }
                    var tari = JSESSION.users(tar);
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist", chan);
                        return;
                    }
                    var h = mcmd[0].toLowerCase();
                    if (DataHash.megausers[h] === undefined) {
                        botMessage(src, "That person is already " + Tour0 + "!", chan);
                        return;
                    }

                    delete DataHash.megausers[h];
                    cache.write("megausers", JSON.stringify(DataHash.megausers));

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + Tour0 + " by " + sys.name(src) + ".", 0);
                        tari.megauser = false;
                        sys.kick(tar, staffchannel);
                        return;
                    }
                    botEscapeAll(mcmd[0].name() + " has been made " + Tour0 + " by " + sys.name(src) + ".", 0);
                };

                adminCommands[removespaces(Tour1).toLowerCase()] = function () {
                    if (mcmd[0] === '') {
                        botMessage(src, "Specify a name!", chan);
                        return;
                    }
                    var tari = JSESSION.users(tar);
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist", chan);
                        return;
                    }
                    var h = mcmd[0].toLowerCase();
                    if (DataHash.megausers[h] !== undefined) {
                        botMessage(src, "That person is already " + Tour1 + "!", chan);
                        return;
                    }

                    DataHash.megausers[h] = {
                        "name": h.name()
                    };

                    cache.write("megausers", JSON.stringify(DataHash.megausers));

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + Tour1 + " by " + sys.name(src) + ".", 0);
                        tari.megauser = true;
                        putInAuthChan(mcmd[0], "mu");
                        return;
                    }

                    botEscapeAll(mcmd[0].name() + " has been made " + Tour1 + " by " + sys.name(src) + ".", 0);
                };
            }

            ownerCommands = ({
                dbcommands: function () {
                    var ct = new Command_Templater("Database Commands");

                    ct.register("clearpass", ["{Player::Database Player}"], "To clear {Player::Database Player}'s password.");
                    ct.register("exporttiers", "To export all tiers to tier_(tiername).txt.");
                    ct.register("exportplayers", "To export the all players in the database to members.txt.");
                    ct.register("deleteplayer", ["{Player::Database Player}"], "To delete {Player::Database Player} from the players database.");
                    ct.register("dbplayers", "Displays all players in the players database.");

                    ct.render(src, chan);
                },

                chatcommands: function () {
                    var ct = new Command_Templater("Chat Commands");

                    ct.register("rankicon", "To toggle Rank Icons and BB Code.");
                    ct.register("autoedit", "To toggle automatic grammar correction.");
                    ct.register("messagelimit", ["{Text::Number Limit}"], "To set a character limit for players under " + AdminName + " to {Text::Number Limit}.");
                    ct.register("autokick", "To toggle automatic kicks.");
                    ct.register("automute", "To toggle automatic mutes.");

                    ct.render(src, chan);
                },

                servercommands: function () {
                    var ct = new Command_Templater("Server Commands");

                    ct.register("public", "To make the server public.");
                    ct.register("private", "To make the server private.");
                    ct.register("allowchannels", "To toggle the allowance of creation of non-script channels.");
                    ct.register("battles", "To toggle the allowance of battles.");

                    ct.render(src, chan);
                },

                anncommands: function () {
                    var ct = new Command_Templater("Announcement Commands");

                    ct.register("getannouncement", "Displays the raw announcement.");
                    ct.register("changeannouncement", ["{Text::Any Text}"], "To change the announcement to {Text::Any Text}.");
                    ct.register("testannouncement", ["{Text::Any Text}"], "To change the announcement to {Text::Any Text}, for yourself only (useful when testing).");

                    ct.render(src, chan);
                },

                tiercommands: function () {
                    var ct = new Command_Templater("Tier Commands");

                    ct.register("updatetiers", ["{Text::Any <u>URL</u>}"], "To update the server's tiers from {Text::Any URL} (default is <a href='http://pokemon-online.eu/tiers.xml'>pokemon-online.eu/tiers.xml</a>). Tiers must be XML.");
                    ct.register("resetladder", ["{Text::Any Tier}"], "To reset {Text::Any Tier}'s ladders.");
                    ct.register("resetladders", "To reset all ladders.");
                    ct.register("banfrom", ["{Text::Any Tier}", "{Text::Any Pokemon}", "{Text::Any Ability}"], "To ban the ability, {Text::Any Ability}, on {Text::Any Pokemon}, in {Text::Any Tier}.");
                    ct.register("unbanfrom", ["{Text::Any Tier}", "{Text::Any Pokemon}", "{Text::Any Ability}"], "To unban the ability, {Text::Any Ability}, on {Text::Any Pokemon}, in {Text::Any Tier}.");
                    ct.register("listbans", "Displays all banned abilities.");

                    ct.render(src, chan);
                },

                listbans: function () {
                    var banned = DataHash.bannedAbilities,
                        tt = new Table_Templater("Ability Bans", "brown", "3"),
                        x,
                        poke,
                        z,
                        abilities;

                    tt.register(["Tier", "Pokemon", "Abilities"], true);

                    for (x in banned) {
                        poke = banned[x];
                        for (z in poke) {
                            abilities = poke[z];
                            tt.register([x, z, abilities.join(", ")], false);
                        }
                    }


                    tt.render(src, chan);
                },

                randomspam: function () {
                    var spam_user = [],
                        spam_color = [],
                        spam_array = [],
                        spam_script = "Script Check",
                        spam_script_color = Bot.botcolor,
                        x,
                        pl = sys.playerIds(),
                        cur,
                        curn,
                        randomUser = function () {
                            var ret = Math.round(pl.length * Math.random());
                            if (ret === 0) {
                                ret = "~~Server~~";
                            } else {
                                ret = sys.name(ret);
                                if (ret === undefined) {
                                    ret = randomUser();
                                }
                            }
                            return ret;
                        },
                        rCmdList = ["rangeban", "ban", "mute", "kick", "tempban"],
                        reasons = ["Existance", "Spam", "None. I'm just abusive.", "pro", "STFU!"],
                        randomCommand = function () {
                            var ret = Math.floor(rCmdList.length * Math.random());

                            if (ret === undefined || ret === "undefined") {
                                ret = randomCommand();
                            }

                            return rCmdList[ret];
                        },
                        randomReason = function () {
                            var ret = Math.floor(reasons.length * Math.random());

                            if (ret === undefined || ret === "undefined") {
                                ret = randomReason();
                            }

                            return reasons[ret];
                        },
                        min = parseInt(commandData, 10),
                        currentRand;

                    if (isNaN(min) || min > 75) {
                        min = 30;
                    }

                    for (x in pl) {
                        cur = pl[x];
                        currentRand = sys.rand(1, min + 1);
                        while (currentRand !== 0) {
                            curn = sys.name(cur);
                            spam_user.push(curn);
                            spam_color.push(script.namecolor(cur));

                            spam_array.push("STOP RIGHT THERE " + curn.toUpperCase() + " YOU FUCKER", "This is bad. I'm blaming " + curn + "!", "Do you have some spare change " + curn + "???", curn + " was banned by " + randomUser() + "!", "\\" + randomCommand() + " " + randomUser());
                            currentRand--;
                        }
                    }

                    spam_array.sort(function () {
                        return 0.5 - Math.random();
                    });

                    spam_user.sort(function () {
                        return 0.5 - Math.random();
                    });

                    spam_color.sort(function () {
                        return 0.5 - Math.random();
                    });

                    var y, sal = spam_array.length,
                        sul = spam_user.length,
                        scl = spam_color.length,
                        random_spam = '',
                        random_color = '',
                        random_user = '';

                    for (y = 0; y < min; y++) {
                        random_spam = spam_array[Math.floor(sal * Math.random())];
                        random_color = spam_color[Math.floor(scl * Math.random())];
                        random_user = spam_user[Math.floor(sul * Math.random())];

                        if (random_spam.contains("Fatal Script Error:")) {
                            random_color = spam_script_color;
                            random_user = spam_script;
                        }
                        if (random_spam.contains("was banned by") && !random_user.contains("was banned by")) {
                            sys.sendHtmlAll("<font color=darkorange><timestamp/><b>" + random_spam + "</b></font>", 0);
                            sys.sendHtmlAll("<font color=darkorange><timestamp/><b>Reason:</b></font> " + randomReason(), 0);
                            continue;
                        }

                        sys.sendHtmlAll("<font color=" + random_color + "><timestamp/><b>" + random_user + ":</b></font> " + random_spam, 0);
                    }

                },

                recreate: function () {
                    var m = mcmd[0].toLowerCase(),
                        type = "";
                    if (m === "global") {
                        JSESSION.GlobalData = {};
                        type = "Globals";
                    } else if (m === "user" || m === "users") {
                        JSESSION.UserData = {};
                        type = "Users";
                    } else if (m === "channel" || m === "channels") {
                        JSESSION.ChannelData = {};
                        cData.loadDataForAll();
                        type = "Channels";
                    } else if (m === "tour" || m === "tours") {
                        var x, z = JSESSION.ChannelData,
                            curr;
                        for (x in z) {
                            curr = z[x];
                            if (curr.toursEnabled) {
                                delete curr.tour;
                                curr.tour = new Tours(x);
                            }
                        }
                        type = "Channel Tournaments";
                    } else {
                        JSESSION.ChannelData = {};
                        JSESSION.UserData = {};
                        JSESSION.GlobalData = {};
                        type = "Channels, Users and Global";
                    }

                    JSESSION.refill();
                    botAll("JSESSION " + type + " have been reset by " + player(src) + "!", 0);
                },

                rankicon: function () {
                    UseIcons = !UseIcons;
                    botAll("Rank Icons have been turned " + toOn(UseIcons) + " by " + player(src) + "!", 0);
                    cache.write("UseIcons", UseIcons);
                },

                futurelimit: function () {
                    var permin = parseInt(mcmd[0], 10);
                    if (isNaN(permin)) {
                        botMessage(src, "Limit must be a number!", chan);
                        return;
                    }
                    if (FutureLimit === permin) {
                        botMessage(src, "The limit is already " + permin + "!", chan);
                        return;
                    }
                    if (FutureLimit > 60) {
                        botMessage(src, "The limit has to be lower than 1 minute.", chan);
                        return;
                    }

                    cache.write("FutureLimit", permin);
                    botAll("The x futures allowed was changed to per " + permin + " seconds by " + sys.name(src) + "!", 0);
                    FutureLimit = permin;
                },

                autoedit: function () {
                    MessageEditor = !MessageEditor;
                    botEscapeAll("Auto Editing has been turned " + toOn(MessageEditor) + " by " + sys.name(src) + "!", 0);
                    cache.write("MessageEditor", MessageEditor);
                },

                messagelimit: function () {
                    commandData = parseInt(commandData, 10);
                    if (isNaN(commandData)) {
                        botMessage(src, "That isn't a valid number.", chan);
                        return;
                    }
                    if (MaxMessageLength === commandData) {
                        botMessage(src, "The message limit is already " + commandData, chan);
                        return;
                    }
                    MaxMessageLength = commandData;
                    cache.write('MaxMessageLength', commandData);
                    botEscapeAll('The message limit has been set to ' + commandData + ' by ' + sys.name(src) + '!', 0);
                },

                getannouncement: function () {
                    botEscapeMessage(src, "The raw announcement is: " + sys.getAnnouncement());
                },

                changeannouncement: function () {
                    if (commandData === "") {
                        commandData = "<";
                    }
                    sys.changeAnnouncement(commandData);
                },

                testannouncement: function () {
                    sys.setAnnouncement(commandData, src);
                },

                updatetiers: function () {
                    var URL = "http://pokemon-online.eu/tiers.xml";
                    if (/http[s]\:\/\//.test(commandData)) {
                        URL = commandData;
                    }
                    sys.webCall(URL, function (resp) {
                        if (resp === "") {
                            botMessage(src, "Couldn't download tiers from " + URL, chan);
                            return;
                        }
                        if (sys.getFileContent('tiers.xml') === resp) {
                            botMessage(src, 'Same tiers.', chan);
                            return;
                        }
                        sys.writeToFile('tiers.xml', resp);
                        sys.reloadTiers();
                        botAll(player(src) + ' updated the tiers!', 0);
                    });
                },

                "public": function () {
                    if (!sys.isServerPrivate()) {
                        botMessage(src, "The server is already public.", chan);
                        return;
                    }


                    var conf = sys.getFileContent("config");
                    conf.replace(/Private=1/, "Private=0");
                    sys.writeToFile("config", conf);

                    sys.makeServerPublic(true);

                    botAll(player(src) + " made the server public!", 0);
                },

                "private": function () {
                    if (sys.isServerPrivate()) {
                        botMessage(src, "The server is already private.", chan);
                        return;
                    }
                    var conf = sys.getFileContent("config");
                    conf.replace(/Private=0/, "Private=1");
                    sys.writeToFile("config", conf);

                    sys.makeServerPublic(false);

                    botAll(player(src) + " made the server private!", 0);
                },

                clearpass: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That person doesn't exist.", chan);
                        return;
                    }
                    if (!sys.dbRegistered(commandData)) {
                        botMessage(src, "That person isn't registered.", chan);
                        return;
                    }

                    sendAuth(commandData + "'s password was cleared by " + sys.name(src) + ".");
                    sys.clearPass(commandData);
                    botMessage(src, "You cleared " + commandData + "'s password.", chan);

                    if (tar !== undefined) {
                        sys.sendNetworkCommand(tar, 14);
                        botMessage(tar, "<ping/>Your password has been cleared by " + html_escape(sys.name(src)) + ".");
                    }
                },

                reloadscript: function () {
                    var LoadScript = sys.getFileContent("scripts.js");
                    try {
                        sys.changeScript(LoadScript);
                        script.beforeChatMessage(src, "Hooray! New scripts :D", chan);
                    } catch (e) {
                        botMessage(src, FormatError("Error occured.", e), chan);
                        return;
                    }
                },

                rangeban: function () {
                    var ip = mcmd[0].split('.').join(""),
                        z;
                    if (isNaN(ip) || ip === undefined || ip === "") {
                        botMessage(src, "Invalid IP.", chan);
                        return;
                    }

                    var isValidIP = function (ipz, codeat) {
                        var i = ipz.split('.');
                        if ((i[codeat] < 0 || i[codeat] > 255) && i !== undefined) {
                            return false;
                        }

                        for (z = 0; z < 3; z++) {
                            if (i[z] !== undefined) {
                                if (i[z].length > 3) {
                                    return false;
                                }
                            }
                        }

                        if (i[3] !== undefined) {
                            return false;
                        }
                        return true;
                    };

                    var c = mcmd[0];
                    if (!isValidIP(c, 0) || !isValidIP(c, 1) || !isValidIP(c, 2)) {
                        botMessage(src, "Invalid IP.", chan);
                        return;
                    }

                    Prune.rangeBans();

                    if (DataHash.rangebans[mcmd[0]] !== undefined) {
                        botMessage(src, "Can't ban an already banned IP.", chan);
                        return;
                    }

                    var time = 0,
                        timestr,
                        timeUnitTime = stringToTime(mcmd[2], (+mcmd[1]));

                    if (!isNaN(timeUnitTime)) {
                        time = (+sys.time()) + timeUnitTime;
                    }
                    if (time === 0) {
                        timestr = 'forever';
                    } else {
                        timestr = "for " + getTimeString((+mcmd[1]) + timeUnitTime);
                    }

                    var re = "None given";
                    if (!isEmpty(mcmd[1])) {
                        re = mcmd[3];
                    }

                    DataHash.rangebans[mcmd[0]] = {
                        by: sys.name(src),
                        why: re,
                        ip: mcmd[0],
                        "time": time
                    };

                    botEscapeAll(sys.name(src) + " banned IP range " + mcmd[0] + " " + timestr + "!", 0);
                    if (re !== "None given") {
                        botAll("Reason: " + re, 0);
                    }

                    var l = mcmd[0].length,
                        p = sys.playerIds(),
                        q;

                    for (q in p) {
                        var b = p[q];
                        if (sys.ip(b).substring(0, l) === mcmd[0]) {
                            sys.kick(b);
                        }
                    }

                    cache.write("rangebans", JSON.stringify(DataHash.rangebans));
                },

                rangeunban: function () {
                    Prune.rangeBans();

                    if (DataHash.rangebans.has(commandData)) {
                        botMessage(src, "Removed rangeban for " + commandData + ".", chan);

                        delete DataHash.rangebans[commandData];
                        cache.write("rangebans", JSON.stringify(DataHash.rangebans));
                        return;
                    }

                    botEscapeMessage(src, "Couldn't find range IP " + commandData + " in the range banlist.", chan);
                },

                eval: function () {
                    var isEOp = DataHash.evalops[sys.name(src).toLowerCase()] !== undefined;
                    if (evallock && !host && !isEOp) {
                        botMessage(src, 'Eval has been blocked by the host!', chan);
                        return;
                    }

                    var srcname = sys.name(src),
                        code = commandData;

                    sys.sendHtmlAll(BORDER, scriptchannel);
                    botAll(srcname + " evaluated the following code:", scriptchannel);
                    sys.sendHtmlAll("<code>" + html_escape(code) + "</code>", scriptchannel);
                    sys.sendHtmlAll(BORDER, scriptchannel);

                    try {

                        var now = millitime(),
                            result = eval(code),
                            end = millitime();

                        botEscapeAll(result, scriptchannel);

                        var took = end - now,
                            sec = took / 1000,
                            micro = took * 1000;
                        botAll("Code took " + took + " milliseconds / " + sec + " seconds to run. ", scriptchannel);
                    } catch (err) {
                        var ferr = FormatError("", err);
                        botAll(ferr, scriptchannel);
                    }

                },

                resetcommandstats: function () {
                    CommandStats.stats.startTime = +sys.time();
                    CommandStats.save();

                    botAll("Command stats were reset by " + player(src) + "!", 0);
                },

                changeauthname: function () {
                    if (isEmpty(mcmd[0]) || isEmpty(mcmd[1]) || isEmpty(mcmd[2])) {
                        botMessage(src, "Specify the type of auth, the level, and it's new name.", chan);
                        return;
                    }
                    mcmd[2] = cut(mcmd, 2, ':');

                    var d = removespaces(mcmd[2]).toLowerCase(),
                        inObj = function (variable, obj) {
                            return obj.hasOwnProperty(variable);
                        };

                    if (inObj(d, userCommands) || inObj(d, channelCommands) || inObj(d, tourCommands) || inObj(d, modCommands) || inObj(d, adminCommands) || inObj(d, ownerCommands) || inObj(d, founderCommands)) {
                        botMessage(src, "That name already exists in a command!", chan);
                        return;
                    }

                    var y = removespaces(mcmd[2]).toLowerCase();
                    if (/\W/.test(y)) {
                        botMessage(src, "You can only use letters A-z, numbers 0-9, spaces, and _.", chan);
                        return;
                    }

                    if (mcmd[0].toLowerCase() !== "ctour" && mcmd[0].toLowerCase() !== "tournament" && mcmd[0].toLowerCase() !== "channel" && mcmd[0].toLowerCase() !== "server") {
                        botMessage(src, "Currently, you can only pick ctour, channel, tournament, or server as auth type.", chan);
                        return;
                    }

                    if (mcmd[0].toLowerCase() === "ctour") {
                        if (mcmd[1] !== "1" && mcmd[1] !== "0") {
                            botMessage(src, "Choose auth number 0 or 1 for authtype ctour", chan);
                            return;
                        }
                        sys.sendHtmlAll("<timestamp/><b><font color=darkviolet>Auth type CTour's auth level " + mcmd[1] + " name has been changed to " + mcmd[2] + " by " + sys.name(src) + "!</b></font>", 0);
                        if (mcmd[1] === "0") {
                            ChanTour0 = mcmd[2];
                        } else if (mcmd[1] === "1") {
                            ChanTour1 = mcmd[2];
                        }
                        cache.write("ChanTour" + mcmd[1] + "Name", mcmd[2]);
                        return;
                    }

                    if (mcmd[0].toLowerCase() === "tournament") {
                        if (mcmd[1] !== "1" && mcmd[1] !== "0") {
                            botMessage(src, "Choose select auth number 0 or 1 for authtype tournament", chan);
                            return;
                        }
                        sys.sendHtmlAll("<timestamp/><b><font color=darkviolet>Auth type Tournament's auth level " + mcmd[1] + " name has been changed to " + mcmd[2] + " by " + sys.name(src) + "!</b></font>", 0);
                        if (mcmd[1] === "0") {
                            Tour0 = mcmd[2];
                        } else if (mcmd[1] === "1") {
                            Tour1 = mcmd[2];
                        }
                        cache.write("TourLevel" + mcmd[1] + "Name", mcmd[2]);
                        return;
                    }

                    if (mcmd[0].toLowerCase() === "server") {
                        if (mcmd[1] !== "1" && mcmd[1] !== "0" && mcmd[1] !== "2" && mcmd[1] !== "3" && mcmd[1] !== "4") {
                            botMessage(src, "Choose auth number 0, 1, 2, 3 or 4 for authtype server", chan);
                            return;
                        }
                        sys.sendHtmlAll("<timestamp/><b><font color=darkviolet>Auth type Server's auth level " + mcmd[1] + " name has been changed to " + mcmd[2] + " by " + sys.name(src) + "!</b></font>", 0);
                        if (mcmd[1] === "0") {
                            UserName = mcmd[2];
                        } else if (mcmd[1] === "1") {
                            ModName = mcmd[2];
                        } else if (mcmd[1] === "2") {
                            AdminName = mcmd[2];
                        } else if (mcmd[1] === "3") {
                            OwnerName = mcmd[2];
                        } else if (mcmd[1] === "4") {
                            InvisName = mcmd[2];
                        }
                        cache.write("AuthLevel" + mcmd[1] + "Name", mcmd[2]);
                        return;
                    }

                    if (mcmd[0].toLowerCase() === "channel") {
                        if (mcmd[1] !== "1" && mcmd[1] !== "0" && mcmd[1] !== "2" && mcmd[1] !== "3") {
                            botMessage(src, "Choose auth number 0, 1, 2 or 3 for authtype channel", chan);
                            return;
                        }
                        sys.sendHtmlAll("<timestamp/><b><font color=darkviolet>Auth type Channel's auth level " + mcmd[1] + " name has been changed to " + mcmd[2] + " by " + sys.name(src) + "!</b></font>", 0);
                        if (mcmd[1] === "0") {
                            ChanUser = mcmd[2];
                        } else if (mcmd[1] === "1") {
                            ChanMod = mcmd[2];
                        } else if (mcmd[1] === "2") {
                            ChanAdmin = mcmd[2];
                        } else if (mcmd[1] === "3") {
                            ChanOwner = mcmd[2];
                        }
                        cache.write("ChanLevel" + mcmd[1] + "Name", mcmd[2]);
                    }
                },

                autokick: function () {
                    AutoKick = !AutoKick;
                    cache.write("AutoKick", AutoKick);
                    botAll("Auto Kick was turned " + toOn(AutoKick) + " by " + player(src) + "!", 0);
                },

                automute: function () {
                    AutoMute = !AutoMute;

                    cache.write("AutoMute", AutoMute);
                    botAll("Auto Mute was turned " + toOn(AutoMute) + " by " + player(src) + "!", 0);
                },

                allowchannels: function () {
                    ChannelsAllowed = !ChannelsAllowed;
                    cache.write("ChannelsAllowed", ChannelsAllowed);
                    botAll("Channels were turned " + toOn(ChannelsAllowed) + " by " + player(src) + "!", 0);
                },

                battles: function () {
                    BattlesAllowed = !BattlesAllowed;
                    cache.write("BattlesAllowed", BattlesAllowed);
                    botAll("Battles were turned " + toOn(BattlesAllowed) + " by " + player(src) + "!", 0);
                },

                deleteplayer: function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist", chan);
                        return;
                    }

                    var name = commandData.name();
                    botEscapeAll(player(name) + " was deleted from the players database by " + player(src) + "!", 0);
                    sys.dbDelete(name);

                    if (tar !== undefined) {
                        sys.kick(tar);
                    }
                },

                exportmembers: function () {
                    sys.exportMemberDatabase();
                    botEscapeAll(player(src) + " exported the players database!", 0);
                },

                exporttiers: function () {
                    sys.exportTierDatabase();
                    botEscapeAll(player(src) + " exported the tiers database!", 0);
                },

                megasilence: function () {
                    if (silence.level) {
                        botMessage(src, "The chat is already silenced.", chan);
                        return;
                    }

                    var time = commandData * 60,
                        timeStr = "!";
                    if (!isNaN(time) && commandData !== "") {
                        timeStr = " for " + getTimeString(time) + "!";
                    }

                    silence = {
                        "by": sys.name(src),
                        "level": 3
                    };

                    botAll(player(src) + " mega-silenced the chat" + timeStr);

                    if (timeStr === "!") {
                        return;
                    }

                    var timeOut = function () {
                        if (!silence.level) {
                            return;
                        }

                        silence = {
                            "by": "",
                            "level": 0
                        };
                        botAll("Silence is over.");
                    };

                    sys.delayedCall(timeOut, time);

                },

                dbplayers: function () { /* Format DB into multiple packages. */
                    var Strings = {
                        1: ""
                    },
                        x, d = sys.dbAll(),
                        c = 0,
                        cstr = "",
                        o;

                    for (x in d) {
                        if (c > 250) {
                            o = Strings.length() + 1;
                            Strings[o - 1] = cstr;
                            Strings[o] = "";
                            cstr = Strings[o];
                            c = 0;
                        }

                        cstr += player(d[x]) + ", ";
                        c++;
                    }

                    Strings[Strings.length()] = cstr;

                    botMessage(src, "The following players are in the players database:", chan);

                    for (x in Strings) {
                        botMessage(src, Strings[x]);
                    }
                },

                resetladder: function () {
                    var tier = validTier(commandData);

                    if (!tier) {
                        botEscapeMessage(src, "The tier " + commandData + " doesn't exist.", chan);
                        return;
                    }

                    botAll("The ladder of the tier " + tier + " has been reset by " + player(src) + "!", 0);
                    sys.resetLadder(tier);
                },

                resetladders: function () {
                    var tiers = sys.getTierList(),
                        y;
                    for (y in tiers) {
                        sys.resetLadder(tiers[y]);
                    }

                    botAll("Every ladder has been reset by " + player(src) + "!", 0);
                },

                pointercommand: function () {
                    if (isEmpty(mcmd[0]) || isEmpty(mcmd[1])) {
                        botMessage(src, "Specify a command.", chan);
                        return;
                    }

                    mcmd[1] = cut(mcmd, 1, ':');

                    var pointer = mcmd[0].toLowerCase(),
                        command = mcmd[1].toLowerCase(),
                        rmPoint = removespaces(pointer),
                        rmCmd = removespaces(command);

                    if (rmPoint.toLowerCase() === "!!/reverse/!!" || hasCommandStart(rmPoint)) {
                        botMessage(src, "This pointer is reserved.");
                        return;
                    }

                    var inObj = function (variable, obj) {
                        return obj.hasOwnProperty(variable);
                    };

                    if (inObj(rmPoint, userCommands) || inObj(rmPoint, channelCommands) || inObj(rmPoint, tourCommands) || inObj(rmPoint, modCommands) || inObj(rmPoint, adminCommands) || inObj(rmPoint, ownerCommands) || inObj(rmPoint, founderCommands)) {
                        botMessage(src, "That pointer is already defined as a normal command.", chan);
                        return;
                    }
                    if (!inObj(rmCmd, userCommands) && !inObj(rmCmd, channelCommands) && !inObj(rmCmd, tourCommands) && !inObj(rmCmd, modCommands) && !inObj(rmCmd, adminCommands) && !inObj(rmCmd, ownerCommands) && !inObj(rmCmd, founderCommands)) {
                        botMessage(src, "That command doesn't exist!", chan);
                        return;
                    }
                    if (/\W/.test(rmPoint)) {
                        botMessage(src, "You can only use letters A-z, numbers 0-9, and _.", chan);
                        return;
                    }
                    if (PointerCommands.hasOwnProperty(rmPoint) && PointerCommands[rmPoint] === rmCmd) {
                        botMessage(src, "Pointer is already defined with that command!", chan);
                        return;
                    }

                    var re = ['defined', 'as'];
                    if (PointerCommands.hasOwnProperty(rmPoint)) {
                        re = ['redefined', 'differently as'];
                    }

                    PointerCommands[rmPoint] = rmCmd;
                    var points = PointerCommands["!!/Reverse/!!"];
                    if (!points.has(rmPoint)) {
                        points[rmPoint] = {};
                    }
                    points[rmPoint][rmCmd] = '';

                    botAll(sys.name(src) + " " + re[0] + " Pointer Command " + pointer + " " + re[1] + " " + command + "!", 0);
                    cache.write("pointercommands", JSON.stringify(PointerCommands));
                },

                delpointercommand: function () {
                    var d = removespaces(cmdData);
                    if (d === "") {
                        botMessage(src, "Specify a Pointer Command.", chan);
                        return;
                    }
                    if (d === "!!/Reverse/!!") {
                        botMessage(src, "This pointer cannot be deleted.");
                        return;
                    }
                    if (!PointerCommands.hasOwnProperty(d)) {
                        botMessage(src, "Pointer doesn't exist!", chan);
                        return;
                    }
                    delete PointerCommands[d];
                    delete PointerCommands["!!/Reverse/!!"][d];

                    botAll(sys.name(src) + " removed the Pointer Command " + d + "!", 0);
                    cache.write("pointercommands", JSON.stringify(PointerCommands));
                },

                banfrom: function () {
                    if (mcmd[0] === undefined || mcmd[1] === undefined || mcmd[2] === undefined) {
                        botMessage(src, "Invalid parameters.", chan);
                        return;
                    }

                    var name = validTier(mcmd[0]);

                    if (!name) {
                        botEscapeMessage(src, "The tier " + mcmd[0] + " doesn't exist!", chan);
                        return;
                    }

                    var num = sys.pokeNum(mcmd[1]);
                    if (num === undefined) {
                        botEscapeMessage(src, "The pokemon " + mcmd[1] + " doesn't exist!", chan);
                        return;
                    }

                    var abilityarr = [], y;

                    for (y = 0; y < 5; y++) {
                        abilityarr.push(sys.ability(sys.pokeAbility(num, y, 5)).toLowerCase());
                    }

                    if (!abilityarr.has(mcmd[2].toLowerCase())) {
                        botEscapeMessage(src, "The ability " + mcmd[2] + " for pokemon " + mcmd[1] + " doesn't exist!", chan);
                        return;
                    }
                    var bans = DataHash.bannedAbilities;
                    if (bans[name] === undefined) {
                        bans[name] = {};
                    }

                    var pN = sys.pokemon(num).toLowerCase();
                    if (bans[name][pN] === undefined) {
                        bans[name][pN] = [];
                    }

                    if (bans[name][pN].has(mcmd[2].toLowerCase())) {
                        botMessage(src, "The ability " + mcmd[2] + " is already banned on " + mcmd[1] + " in tier " + mcmd[0], chan);
                        return;
                    }

                    bans[name][pN].push(mcmd[2].toLowerCase());

                    botAll(sys.name(src) + " has banned the ability " + mcmd[2] + " on " + mcmd[1] + " in tier " + mcmd[0] + "!", 0);
                    cache.write("bannedAbilities", JSON.stringify(DataHash.bannedAbilities));
                },

                unbanfrom: function () {
                    if (mcmd[0] === undefined || mcmd[1] === undefined || mcmd[2] === undefined) {
                        botMessage(src, "Invalid parameters.", chan);
                        return;
                    }

                    var name = validTier(mcmd[0]);

                    if (!name) {
                        botEscapeMessage(src, "The tier " + mcmd[0] + " doesn't exist!", chan);
                        return;
                    }

                    var num = sys.pokeNum(mcmd[1]);
                    if (num === undefined) {
                        botEscapeMessage(src, "The pokemon " + mcmd[1] + " doesn't exist!", chan);
                        return;
                    }

                    var abilityarr = [], y;

                    for (y = 0; y < 5; y++) {
                        abilityarr.push(sys.ability(sys.pokeAbility(num, y, 5)).toLowerCase());
                    }

                    if (!abilityarr.has(mcmd[2].toLowerCase())) {
                        botEscapeMessage(src, "The ability " + mcmd[2] + " for pokemon " + mcmd[1] + " doesn't exist!", chan);
                        return;
                    }
                    var bans = DataHash.bannedAbilities;
                    if (typeof bans[name] === 'undefined') {
                        botMessage(src, name + " doesn't have any ability bans.", chan);
                        return;
                    }

                    var pN = sys.pokemon(num).toLowerCase();
                    if (typeof bans[name][pN] === 'undefined') {
                        botMessage(src, sys.pokemon(num) + " doesn't have any ability bans in " + name, chan);
                        return;
                    }

                    if (!bans[name][pN].has(mcmd[2].toLowerCase())) {
                        botMessage(src, "The ability " + mcmd[2] + " isn't banned on " + mcmd[1] + " in tier " + mcmd[0], chan);
                        return;
                    }

                    if (bans[name][pN].length === 1) {
                        delete bans[name][pN];
                    } else {
                        bans[name][pN].splice(mcmd[2].toLowerCase(), 1);
                    }

                    botAll(sys.name(src) + " has unbanned the ability " + mcmd[2] + " on " + mcmd[1] + " in tier " + mcmd[0] + "!", 0);
                    cache.write("bannedAbilities", JSON.stringify(DataHash.bannedAbilities));
                }
            });

            founderCommands = ({
                evallock: function () {
                    if (evallock) {
                        botMessage(src, "Eval is already disabled!", chan);
                        return;
                    }
                    evallock = true;
                    cache.write("evallock", true);
                    botEscapeAll(sys.name(src) + " has locked eval.", scriptchannel);
                },

                evalunlock: function () {
                    if (!evallock) {
                        botMessage(src, "Eval is already enabled!", chan);
                        return;
                    }
                    evallock = false;
                    cache.write("evallock", false);
                    botEscapeAll(sys.name(src) + " has unlocked eval.", scriptchannel);
                },

                evalop: function () {
                    var m = mcmd[0].toLowerCase();
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist!", chan);
                        return;
                    }
                    var d = DataHash.evalops;
                    if (d.has(m)) {
                        botMessage(src, "This player already is Eval Operator.", chan);
                        return;
                    }
                    if (!sys.dbRegistered(commandData)) {
                        botMessage(src, "This player is not registered.", chan);
                        if (tar !== undefined) {
                            botMessage(tar, "Please register for auth.");
                        }
                        return;
                    }

                    DataHash.evalops[m] = {
                        'by': sys.name(src)
                    };

                    cache.write("evalops", JSON.stringify(DataHash.evalops));

                    putInAuthChan(m, "evalop");
                    botAll(sys.name(src) + " made " + m.name() + " Eval Operator!", scriptchannel);
                },

                evaluser: function () {
                    var m = mcmd[0].toLowerCase();
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist!", chan);
                        return;
                    }
                    var d = DataHash.evalops;
                    if (!d.has(m)) {
                        botMessage(src, "This player isn't an Eval Operator.", chan);
                        return;
                    }

                    botAll(sys.name(src) + " made " + m.name() + " Eval User!", scriptchannel);

                    delete DataHash.evalops[m];
                    if (tar !== undefined) {
                        sys.kick(tar, scriptchannel);
                    }

                    cache.write("evalops", JSON.stringify(DataHash.evalops));
                },

                sudo: function () {
                    var res = script.beforeChatMessage(sys.id(mcmd[0]), cut(mcmd[2], ':'), sys.channelId(mcmd[1]));
                    if (res !== undefined) {
                        print(res);
                    }
                },

            });

            ownerCommands[removespaces(OwnerName).toLowerCase() + "commands"] = function () {
                var ct = new Command_Templater(OwnerName + " Commands");

                ct.register("chatcommands", "Displays the Chat commands.");
                ct.register("dbcommands", "Displays the the Database commands.");
                ct.register("anncommands", "Displays the Announcement commands.");
                ct.register("servercommands", "Displays the Server commands.");
                ct.register("tiercommands", "Displays the Tier commands.");
                ct.register("eval", ["{Text::Any Code}"], "To evaluate a QtScript {Text::Any Code} server-side and returns the result.");
                ct.register("randomspam", ["{Text::Number Times}"], "To spam the chat with random messages, {Text::Number Times} times (default is 30).");
                ct.register("recreate", ["{Text::Any <u>Type</u>}"], "To reset JSESSION data and refill. {Text::Any Type} can be Channels, Global, Tours, Users, All. Default is All.");
                ct.register("resetcommandstats", "To reset command stats.");

                ct.render(src, chan);
            };

            if (!Config.AdminsCanAuth) {
                ownerCommands[removespaces(UserName).toLowerCase()] = function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist");
                        return;
                    }
                    if (dbAuth === 0) {
                        botMessage(src, "That player already is " + UserName + "!", chan);
                        return;
                    }
                    if (sys.auth(src) <= sys.maxAuth(dbIp) && sys.auth(src) < 3) {
                        botMessage(src, "You can't deauth this person!", chan);
                        return;
                    }

                    if (DataHash.tempauth[cmdData] !== undefined) {
                        delete DataHash.tempauth[cmdData];
                        cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                    }

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + UserName + " by " + sys.name(src) + ".", 0);
                        sys.changeAuth(tar, 0);
                        return;
                    }

                    botEscapeAll(commandData + " has been made " + UserName + " by " + sys.name(src) + ".", 0);
                    sys.changeDbAuth(commandData, 0);

                    kickFromChannel(commandData, scriptchannel);
                    kickFromChannel(commandData, watch);
                    kickFromChannel(commandData, staffchannel);
                };

                ownerCommands[removespaces(ModName).toLowerCase()] = function () {
                    if (dbIp === undefined) {
                        botMessage(src, "That player doesn't exist", chan);
                        return;
                    }
                    if (dbAuth === 1) {
                        botMessage(src, "That player already is " + ModName + "!", chan);
                        return;
                    }
                    if (!sys.dbRegistered(commandData)) {
                        botMessage(src, "This player is not registered.", chan);
                        if (tar !== undefined) {
                            botMessage(tar, "Please register for auth.");
                        }
                        return;
                    }
                    if (sys.auth(src) <= sys.maxAuth(dbIp) && sys.auth(src) < 3) {
                        botMessage(src, "You can't deauth this person!", chan);
                        return;
                    }

                    if (DataHash.tempauth[cmdData] !== undefined) {
                        delete DataHash.tempauth[cmdData];
                        cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                    }

                    if (tar !== undefined) {
                        botEscapeAll(sys.name(tar) + " has been made " + ModName + " by " + sys.name(src) + ".", 0);
                        sys.changeAuth(tar, 1);
                        return;
                    }
                    botEscapeAll(commandData + " has been made " + ModName + " by " + sys.name(src) + ".", 0);
                    sys.changeDbAuth(commandData, 1);
                    putInAuthChan(commandData, "mod");
                };
            }

            ownerCommands[removespaces(AdminName).toLowerCase()] = function () {
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist.", chan);
                    return;
                }
                if (dbAuth === 2) {
                    botMessage(src, "That player already is " + AdminName + "!", chan);
                    return;
                }

                if (!sys.dbRegistered(commandData)) {
                    botMessage(src, "This player is not registered.", chan);
                    if (tar !== undefined) {
                        botMessage(tar, "Please register for auth.");
                    }
                    return;
                }

                if (DataHash.tempauth[cmdData] !== undefined) {
                    delete DataHash.tempauth[cmdData];
                    cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                }

                if (tar !== undefined) {
                    botEscapeAll(sys.name(tar) + " has been made " + AdminName + " by " + sys.name(src) + ".", 0);
                    sys.changeAuth(tar, 2);
                    return;
                }
                botEscapeAll(commandData + " has been made " + AdminName + " by " + sys.name(src) + ".", chan);
                sys.changeDbAuth(commandData, 2);
                putInAuthChan(commandData, "admin");
            };

            ownerCommands[removespaces(OwnerName).toLowerCase()] = function () {
                if (dbIp === undefined) {
                    botMessage(src, "That player doesn't exist.", chan);
                    return;
                }
                if (dbAuth === 3) {
                    botMessage(src, "That player already is " + OwnerName + "!", chan);
                    return;
                }

                if (!sys.dbRegistered(commandData)) {
                    botMessage(src, "This player is not registered.", chan);
                    if (tar !== undefined) {
                        botMessage(tar, "Please register for auth.");
                    }
                    return;
                }

                if (DataHash.tempauth[cmdData] !== undefined) {
                    delete DataHash.tempauth[cmdData];
                    cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                }

                if (tar !== undefined) {
                    botEscapeAll(sys.name(tar) + " has been made " + OwnerName + " by " + sys.name(src) + ".", 0);
                    sys.changeAuth(tar, 3);
                    return;
                }

                botEscapeAll(commandData + " has been made " + OwnerName + " by " + sys.name(src) + ".", 0);
                sys.changeDbAuth(commandData, 3);
                putInAuthChan(commandData, "admin");
            };

            ownerCommands[removespaces(InvisName).toLowerCase()] = function () {
                if (sys.dbIp(commandData) === undefined) {
                    botMessage(src, "That player doesn't exist.", chan);
                    return;
                }
                if (dbAuth >= 4) {
                    botMessage(src, "That player already is " + InvisName + "!", chan);
                    return;
                }

                if (!sys.dbRegistered(commandData)) {
                    botMessage(src, "This player is not registered.", chan);
                    if (tar !== undefined) {
                        botMessage(tar, "Please register for auth.");
                    }
                    return;
                }

                if (DataHash.tempauth[cmdData] !== undefined) {
                    delete DataHash.tempauth[cmdData];
                    cache.write("tempauth", JSON.stringify(DataHash.tempauth));
                }

                var users = sys.playerIds(),
                    y,
                    sendArr3 = [],
                    sendArr0 = [],
                    x;

                for (y in users) {
                    if (sys.auth(users[y]) > 2) {
                        sendArr3.push(users[y]);
                    } else {
                        sendArr0.push(users[y]);
                    }
                }

                var m_name = sys.name(src),
                    t_name = commandData.name();
                if (tar !== undefined) {
                    for (x in sendArr3) {
                        botMessage(sendArr3[x], t_name + " has been made " + InvisName + " by " + m_name + ".", 0);
                    }
                    for (x in sendArr0) {
                        botMessage(sendArr0[x], t_name + " has been made " + UserName + " by " + m_name + ".", 0);
                    }
                    sys.changeAuth(tar, 127);
                    putInAuthChan(commandData, "admin");
                    return;
                }

                for (x in sendArr3) {
                    botMessage(sendArr3[x], t_name + " has been made " + InvisName + " by " + m_name + ".", 0);
                }
                for (x in sendArr0) {
                    botMessage(sendArr0[x], t_name + " has been made " + UserName + " by " + m_name + ".", 0);
                }

                sys.changeDbAuth(commandData, 127);
            };

            var getCommand = ({
                '0': function (name) {
                    if (tourCommands.hasOwnProperty(name) && poChan.toursEnabled) {
                        return tourCommands[name];
                    } else if (channelCommands.hasOwnProperty(name)) {
                        return channelCommands[name];
                    } else if (userCommands.hasOwnProperty(name)) {
                        return userCommands[name];
                    }
                },
                '1': function (name) {
                    if (modCommands.hasOwnProperty(name)) {
                        return modCommands[name];
                    } else if (tourCommands.hasOwnProperty(name) && poChan.toursEnabled) {
                        return tourCommands[name];
                    } else if (channelCommands.hasOwnProperty(name)) {
                        return channelCommands[name];
                    } else if (userCommands.hasOwnProperty(name)) {
                        return userCommands[name];
                    }
                },
                '2': function (name) {
                    if (adminCommands.hasOwnProperty(name)) {
                        return adminCommands[name];
                    } else if (modCommands.hasOwnProperty(name)) {
                        return modCommands[name];
                    } else if (tourCommands.hasOwnProperty(name) && poChan.toursEnabled) {
                        return tourCommands[name];
                    } else if (channelCommands.hasOwnProperty(name)) {
                        return channelCommands[name];
                    } else if (userCommands.hasOwnProperty(name)) {
                        return userCommands[name];
                    }
                },
                '3': function (name) {
                    if (founderCommands.hasOwnProperty(name) && host) {
                        return founderCommands[name];
                    } else if (ownerCommands.hasOwnProperty(name)) {
                        return ownerCommands[name];
                    } else if (adminCommands.hasOwnProperty(name)) {
                        return adminCommands[name];
                    } else if (modCommands.hasOwnProperty(name)) {
                        return modCommands[name];
                    } else if (tourCommands.hasOwnProperty(name) && poChan.toursEnabled) {
                        return tourCommands[name];
                    } else if (channelCommands.hasOwnProperty(name)) {
                        return channelCommands[name];
                    } else if (userCommands.hasOwnProperty(name)) {
                        return userCommands[name];
                    }
                }
            });

            var op = sys.auth(src),
                ch = Config.HighPermission;

            if (op > 3) {
                op = 3;
            }

            if (op < 0) {
                op = 0;
            }

            if (ch[sys.name(src)] !== undefined && ch[sys.name(src)][0] === sys.auth(src)) {
                op = ch[sys.name(src)][1];
            }

            if (command === "eval" && DataHash.evalops.has(sys.name(src).toLowerCase())) {
                op = 3;
            }

            var cmd = getCommand[op](command);
            if (!cmd) {
                if (!getCommand[3](command)) {
                    invalidCommandMessage(src, fullCommand, chan);
                } else {
                    noPermissionMessage(src, fullCommand, chan);
                }
                return;
            }
            cmd();
            return;
        }

        WatchPlayer(src, "Message", message, chan);

        if (testMafiaChat(src, chan)) {
            sys.stopEvent();
            return;
        }

        if (poUser.capsMute(message, chan)) {
            sys.stopEvent();
            return;
        }

        sys.stopEvent();

        var nc = script.namecolor(src),
            sendHtml = sys.sendHtmlAll,
            send = sys.sendAll;

        if (unicodeAbuse(src, message)) {
            if (!sys.loggedIn(src)) {
                poUser.floodCount = 'kicked';
                return;
            }

            return;
        }

        if (typeof poUser.impersonation !== 'undefined') {
            if (myAuth <= 0 && implock) {
                delete poUser.impersonation;
                botMessage(src, "You are now yourself again!", chan);
                sys.stopEvent();
                return;
            }

            nc = script.namecolor(src);
            var font = '',
                font2 = '%1';

            if (chatcolor) {
                font = ' face="' + fnt + '"';
                font2 = '<font face="' + fnt + '">%1</font>';
            }

            var l = "",
                f;
            if (UseIcons) {
                l = rankico;
            } else if (myAuth >= 1 && myAuth <= 3) {
                l = "+<i>";
            }

            if (UseIcons) {
                f = format(src, html_escape(message));
            } else {
                f = html_escape(message);
            }

            if (chan === watch) {
                sendHtml("<font color=" + nc + " " + font + "><timestamp/>" + l + "<b>" + html_escape(poUser.impersonation) + ":</b></i></font> " + font2.format(f));
            } else {
                sendHtml("<font color=" + nc + " " + font + "><timestamp/>" + l + "<b>" + html_escape(poUser.impersonation) + ":</b></i></font> " + font2.format(f), chan);
            }

            if (chan === watch) {
                send(srcname + ": " + message);
            }

            return;
        }


        if (UseIcons || chatcolor) {
            if (chan === watch) {
                sendHtml(namestr);
                return;
            } else {
                sendHtml(namestr, chan);
                return;
            }
        }

        if (chan === watch) {
            send(srcname + ": " + message);
            return;
        }
        
        sys.sendAll(srcname + ": " + message, chan);
    },

    beforeLogOut: function (src) {
        var func = function (id, name, color, autoKicked) {
            if (typeof autoKicked !== 'number') {
                WatchEvent(id, "Log Out");

                if (Config.WelcomeMessages) {
                    botAll("Goodbye, " + name + "!", 0);
                }
            }
        };

        func(src, sys.name(src), script.namecolor(src), typeof testNameKickedPlayer === 'number');
        testNameKickedPlayer = null;

        ify.beforeLogOut(src);
        JSESSION.destroyUser(src);
    },

    afterPlayerAway: function (src, mode) {
        var m = "Now active and ready for battles.";
        if (mode) {
            m = "Now idling.";
        }

        WatchEvent(src, m);
    },

    afterChangeTeam: function (src, logging) {
        var myName = sys.name(src),
            lc = myName.toLowerCase();

        if (!logging) {
            // UPDATING DATA
            var myUser = JSESSION.users(src),
                myIcon,
                dh = DataHash;

            myUser.name = myName;
            myUser.lowername = lc;
            myUser.megauser = dh.megausers.has(lc);
            myUser.voice = dh.voices.has(lc);
            myUser.icon = undefined;

            if (dh.rankicons.has(lc)) {
                myIcon = dh.icons[lc];
            }

            if (typeof myUser.teamChanges === 'object') {
                myUser.teamChanges = 0;
            }

            myUser.teamChanges++;

            var teamChanges = myUser.teamChanges,
                ip = sys.ip(src);

            if (teamChanges > 2) {
                if (typeof dh.teamSpammers[ip] === "undefined") {
                    dh.teamSpammers[ip] = 0;
                    sys.callLater("if(typeof DataHash.teamSpammers['" + ip + "'] != 'undefined') DataHash.teamSpammers['" + ip + "']--; ", 60 * 3);
                } else if (dh.teamSpammers[ip] === 0) {
                    dh.teamSpammers[ip] = 1;
                    botAll("Alert: Possible spammer on ip " + ip + " and name " + myName + ". Kicked.", watch);
                    kick(src);
                    sys.callLater("if(typeof DataHash.teamSpammers['" + ip + "'] != 'undefined') DataHash.teamSpammers['" + ip + "']--; ", 60 * 5);
                    return;
                } else {
                    botAll("Spammer: ip " + ip + ", name " + myName + ". Banned.<ping/>", watch);
                    ban(myName);
                    delete dh.teamSpammers[ip];
                    return;
                }
            }

            script.resolveLocation(src, ip, false);

            sys.callLater("if(JSESSION.users(" + src + ") != undefined) JSESSION.users(" + src + ").teamChanges--;", 5);

            // Everything else //
            var getColor = script.namecolor(src),
                dhn = DataHash.names;

            WatchEvent(src, "Changed Team/Name");

            dhn[ip] = myName;
            dhn[lc] = myName;
            playerscache.write("names", JSON.stringify(dhn));

            script.hostAuth(src);

            if (script.testName(src) === true) {
                testNameKickedPlayer = src;
                kick(src);
                return;
            }
        } /* END OF LOGGING */

        var myMail = DataHash.mail[lc];
        if (myMail !== undefined) {
            if (myMail.length > 0) {
                var p, count = 0;
                for (p in myMail) {
                    if (!myMail[p].read) {
                        count++;
                    }
                }

                if (count > 0) {
                    botMessage(src, "You have " + count + " new mails! Type <font color='green'><b>/readmail</b></font> to view!");
                }
            }
        }

        var team, i, j, k, lcontinue;
        for (team = 0; team < sys.teamCount(src); team++) {
            if (sys.gen(src, team) === 2) {
                for (i = 0; i <= 6; i++) {
                    if (lcontinue) {
                        lcontinue = false;
                        continue;
                    }
                    
                    for (j = 0; j < bannedGSCSleep.length; ++j) {
                        if (sys.hasTeamPokeMove(src, team, i, bannedGSCSleep[j])) {
                            for (k = 0; k < bannedGSCTrap.length; ++k) {
                                if (sys.hasTeamPokeMove(src, team, i, bannedGSCTrap[k])) {
                                    teamAlert(src, team, "SleepTrapping is banned in GSC. Pokemon " + sys.pokemon(sys.teamPoke(src, team, i)) + "  removed from your team.");
                                    sys.changePokeNum(src, team, i, 0);
                                    lcontinue = true;
                                }
                            }
                        }
                    }
                }
            }

            if (!Config.NoCrash) {
                if (!TierBans.isLegalTeam(src, team, sys.tier(src, team))) {
                    TierBans.findGoodTier(src, team);
                }
            }

        }

        if (!logging) {
            ify.afterChangeTeam(src);
        }
    },

    afterBattleEnded: function (winner, loser, result, battle_id) {
        if (result !== "tie" && sys.ip(winner) !== sys.ip(loser)) {
            var winMoney = sys.rand(50, 81),
                loseMoney = sys.rand(13, 36),
                winnerName = sys.name(winner).toLowerCase(),
                loserName = sys.name(loser).toLowerCase(),
                money = DataHash.money;

            if (typeof money[loserName] === "undefined") {
                money[loserName] = 0;
            }
            if (typeof money[winnerName] === "undefined") {
                money[winnerName] = 0;
            }

            money[winnerName] += winMoney;
            money[loserName] -= loseMoney;

            botMessage(winner, 'You won ' + winMoney + ' battle points!');
            botMessage(loser, 'You lost ' + loseMoney + ' battle points!');

            cache.write("money", JSON.stringify(DataHash.money));
        }

        var c = sys.channelIds(),
            b,
            c_chan;

        for (b in c) {
            c_chan = JSESSION.channels(c[b]);
            if (c_chan.toursEnabled) {
                c_chan.tour.afterBattleEnded(winner, loser, result);
            }
        }
    },

    afterBattleStarted: function (src, dest, clauses, rated, srcteam, destteam) {
        var c = sys.channelIds(),
            b,
            c_chan;

        for (b in c) {
            c_chan = JSESSION.channels(c[b]);
            if (c_chan.toursEnabled) {
                c_chan.tour.afterBattleStarted(src, dest, clauses, rated, srcteam, destteam);
            }
        }
    },

    beforeBattleMatchup: function (src) {
        if (!BattlesAllowed) {
            botMessage(src, "Battles are currently disabled.");
            return sys.stopEvent();
        }
    },
    
    beforeChallengeIssued: function (src, dest, clauses, rated, mode, team, destTier) {
        if (Config.FixChallenges) {
            return sys.stopEvent();
        }
        
        if (!BattlesAllowed) {
            botMessage(src, "Battles are currently disabled.");
            return sys.stopEvent();
        }

        var poUser = JSESSION.users(src);
        if (poUser === undefined) {
            JSESSION.createUser(src);
            poUser = JSESSION.users(src);
        }

        var time = +sys.time();
        if (poUser.lastChallenge + 15 - time > 0 && sys.auth(src) < 2 && poUser.lastChallenge !== 0) {
            botMessage(src, "Please wait " + getTimeString(poUser.lastChallenge + 15 - time) + " before challenging.");
            return sys.stopEvent();
        }

        poUser.lastChallenge = time;

        var isChallengeCup = sys.getClauses(destTier) % 32 >= 16,
            hasChallengeCupClause = (clauses % 32) >= 16;

        if (isChallengeCup && !hasChallengeCupClause) {
            botMessage(src, "Challenge Cup must be enabled in the challenge window for a CC battle");
            sys.stopEvent();
            return;
        }

        if ((clauses % 32) >= 16) {
            return;
        }

        if (!Config.NoCrash) {
            if (sys.tier(src, team).contains("Doubles") && destTier.contains("Doubles") && mode !== 1) {
                botMessage(src, "To fight in doubles, enable doubles in the challenge window!");
                sys.stopEvent();
                return;
            }
            if (sys.tier(src, team).contains("Triples") && destTier.contains("Triples") && mode !== 2) {
                botMessage(src, "To fight in triples, enable triples in the challenge window!");
                sys.stopEvent();
                return;
            }
        }
    },

    beforeChangeTier: function (src, team, oldtier, newtier) {
        if (!TierBans.isLegalTeam(src, team, newtier)) {
            sys.stopEvent();
            teamAlert(src, team, "You cannot go in the " + newtier + " tier. Appointing another tier for this team...");
            TierBans.findGoodTier(src, team);
        }
    },

    beforePlayerKick: function (src, tar) {
        sys.stopEvent();

        var myName = sys.name(src),
            theirName = sys.name(tar);

        if (JSESSION.users(src).muted) {
            var ip = sys.ip(src),
                dhm = DataHash.mutes[ip];

            WatchEvent(src, "Attempted to kick " + theirName + " while muted.");

            var time;
            if (dhm.time !== 0) {
                time = "Muted for " + getTimeString(dhm.time - +sys.time());
            } else {
                time = "Muted forever";
            }

            var by = dhm.by + "</i>",
                why = dhm.why,
                lastChar = why[why.length - 1],
                lastChars = [".", "?", "!"];

            if (lastChars.indexOf(lastChar) === -1) {
                why += ".";
            }

            botMessage(src, "You are muted by " + by + ". Reason: " + why + " " + time + "!");
            return;
        }

        sys.sendHtmlAll("<font color='midnightblue'><timestamp/><b> " + myName + " kicked " + theirName + "!</b></font>");
        kick(tar);
    },

    beforePlayerBan: function (src, tar) {
        sys.stopEvent();

        var myName = sys.name(src),
            theirName = sys.name(tar);

        if (JSESSION.users(src).muted) {
            var ip = sys.ip(src),
                dhm = DataHash.mutes[ip];

            WatchEvent(src, "Attempted to ban " + theirName + " while muted.");

            var time;
            if (dhm.time !== 0) {
                time = "Muted for " + getTimeString(dhm.time - +sys.time());
            } else {
                time = "Muted forever";
            }

            var by = dhm.by + "</i>",
                why = dhm.why,
                lastChar = why[why.length - 1],
                lastChars = [".", "?", "!"];

            if (lastChars.indexOf(lastChar) === -1) {
                why += ".";
            }

            botMessage(src, "You are muted by " + by + ". Reason: " + why + " " + time + "!");
            return;
        }


        sys.sendHtmlAll("<font color='darkorange'><timestamp/><b> " + sys.name(src) + " banned " + sys.name(tar) + "!</b></font>");
        ban(theirName);
    },

    testName: function (src, nomessage) {
        var name = sys.name(src),
            ip = sys.ip(src),
            dh = DataHash,
            auth = sys.maxAuth(ip),
            time;
        var reason, by, why, lastChar, lastChars;

        Prune.bans();
        Prune.rangeBans();

        if (auth <= 0) {
            var rb = dh.rangebans,
                i,
                i_l = 0,
                xT,
                c_rb;
            for (i in rb) {
                i_l = i.length;
                for (xT = 0; xT < i_l; xT++) {
                    if (i === sys.ip(src).substring(0, xT)) {
                        if (!nomessage) {
                            c_rb = rb[i];
                            if (c_rb.time !== 0) {
                                time = 'Banned for ' + getTimeString(c_rb.time - +sys.time());
                            } else {
                                time = "Banned forever";
                            }

                            by = c_rb.by;
                            why = c_rb.why;
                            lastChar = why[why.length - 1];
                            lastChars = [".", "?", "!"];

                            if (lastChars.indexOf(lastChar) === -1) {
                                why += ".";
                            }

                            sendFailWhale(src, 0);
                            botMessage(src, 'Your ip range ' + i + ' is banned by ' + by + '. Reason: ' + why + ' ' + time + '.', 0);
                            botAll('Player ' + name + ' with range IP ' + i + ' has attempted to enter the server and failed. [Reason: Rangebanned]', watch);
                        }
                        return true;
                    }
                }
            }
        }

        var tb = DataHash.tempbans[ip];
        if (tb !== undefined && auth < 1) {
            if (!nomessage) {
                if (tb.time !== 0) {
                    time = "for " + getTimeString(tb.time - (+sys.time()));
                } else {
                    time = "forever";
                }

                reason = tb.why;
                by = tb.by;
                lastChar = reason[reason.length - 1];
                lastChars = [".", "?", "!"];

                if (lastChars.indexOf(lastChar) === -1) {
                    reason += ".";
                }

                sendFailWhale(src, 0);
                botMessage(src, "You are banned! By " + by + ". Reason " + why + " " + time + "!", 0);
                botAll('Player ' + name + ' (' + ip + ') has attempted to enter the server and failed. [Reason: Tempbanned]', watch);
            }
            return true;
        }

        var cyrillic = /\u0408|\u03a1|\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/,
            space = /\u0009-\u000D|\u0085|\u00A0|\u1680|\u180E|\u2000-\u200A|\u2028|\u2029|\u2029|\u202F|\u205F|\u3000/,
            dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|\uFE31-\uFE32|\uFE58|\uFE63|\uFF0D/,
            greek = /\u03F3|\u0391|\u0392|\u0395|\u0396|\u0397|\u0399|\u039A|\u039C|\u039D|\u039F|\u03A1|\u03A4|\u03A5|\u03A7/,
            armenian = /\u0555|\u0585/,
            creek = /[\u0370-\u03ff]/,
            special = /[\ufff0-\uffff]/,
            other = /\u3061|\u65532/,
            zalgo = /[\u0300-\u036F]/,
            thai = /[\u0E00-\u0E7F]/,
            fakei = /\xA1/;

        if (fakei.test(name) || creek.test(name) || armenian.test(name) || dash.test(name) || space.test(name) || cyrillic.test(name) || greek.test(name) || special.test(name) || other.test(name) || zalgo.test(name) || thai.test(name)) {
            if (!nomessage) {
                sendFailWhale(src, 0);
                botMessage(src, "You are using bad characters in your name.");
                botAll('Player ' + name + ' (' + ip + ') has failed to log in. [Reason: Unicode characters]', watch);
            }
            return true;
        }

        if (name[0] === "S" && name[1] === "E" && name[2] === "N" && name[3] === "T" && name[4] === "_") {
            if (!nomessage) {
                sendFailWhale(src, 0);
            }
            return true;
        }

        return false;
    },

    namecolor: function (src) {
        var myColor = sys.getColor(src);
        if (myColor === '#000000') {
            var namecolorlist = ['#5811b1', '#399bcd', '#0474bb', '#f8760d', '#a00c9e', '#0d762b', '#5f4c00', '#9a4f6d', '#d0990f', '#1b1390', '#028678', '#0324b1'];
            return namecolorlist[src % namecolorlist.length];
        }
        return myColor;
    },


    hostAuth: function (src) {
        var auth = sys.auth(src);
        if (auth < 3 || auth > 3) {
            return;
        }

        if (!isHost(src)) {
            return;
        }

        if (!sys.dbRegistered(sys.name(src))) {
            return;
        }

        sys.changeAuth(src, 3);
    },

    issueMute: function (src, target, reason, mtime, c, timeunit) {
        var time = parseInt(mtime, 10),
            theIP = sys.dbIp(target),
            srcauth = sys.auth(src),
            srcname = sys.name(src),
            tarid = sys.id(target),
            now_time = +sys.time(),
            timeUnitTime = stringToTime(timeunit, time);
        var all, z, re;

        if (theIP === undefined) {
            botMessage(src, "Unknown target!", c);
            return;
        }
        if (sys.maxAuth(theIP) >= srcauth && !isHost(src)) {
            botMessage(src, "You don't have sufficient auth to mute " + target + ".", c);
            return;
        }

        Prune.mutes();
        var oldtime = 0;
        if (DataHash.mutes.has(theIP)) {
            oldtime = DataHash.mutes[theIP].time - now_time;
        }

        if (time === undefined || timeunit === undefined || isNaN(timeUnitTime) || timeUnitTime === "forever") {
            botEscapeAll(target + " was muted by " + srcname + " forever!", 0);

            if (!isEmpty(reason)) {
                botEscapeAll("Reason: " + reason, 0);
            }

            all = idsOfIP(theIP);
            for (z in all) {
                JSESSION.users(all[z]).muted = true;
            }

            re = "None given";

            if (!isEmpty(reason)) {
                re = reason;
            }

            DataHash.mutes[theIP] = {
                by: sys.name(src),
                why: re,
                ip: theIP,
                time: 0
            };
            return;
        }

        var timestr = getTimeString(timeUnitTime + oldtime),
            thetime = now_time + timeUnitTime + oldtime;

        botEscapeAll(target + " was muted by " + srcname + " for " + timestr + "!", 0);

        if (!isEmpty(reason)) {
            botEscapeAll("Reason: " + reason, 0);
        }

        all = idsOfIP(theIP);
        for (z in all) {
            JSESSION.users(all[z]).muted = true;
        }

        re = "None given";

        if (!isEmpty(reason)) {
            re = reason;
        }

        DataHash.mutes[theIP] = {
            by: sys.name(src),
            why: re,
            ip: theIP,
            time: thetime
        };
        cache.write("mutes", JSON.stringify(DataHash.mutes));
    },

    removeMute: function (src, target, reason, c) {
        var theIP = sys.dbIp(target),
            srcauth = sys.auth(src),
            srcname = sys.name(src);

        if (theIP === undefined) {
            botMessage(src, "This person doesn't exist.", c);
            return;
        }

        Prune.mutes();

        if (!DataHash.mutes.has(theIP)) {
            botMessage(src, "You cannot unmute someone who isn't muted!", c);
            return;
        }

        botEscapeAll(target + " was unmuted by " + srcname + "!", 0);

        if (!isEmpty(reason)) {
            botEscapeAll("Reason: " + reason, 0);
        }

        var all = idsOfIP(theIP),
            z;

        for (z in all) {
            JSESSION.users(all[z]).muted = false;
        }

        delete DataHash.mutes[theIP];
        cache.write("mutes", JSON.stringify(DataHash.mutes));
    },

    issueTempBan: function (src, target, reason, time, c, timeunit) {
        var theIP = sys.dbIp(target),
            srcauth = sys.auth(src),
            srcname = sys.name(src),
            tarid = sys.id(target),
            timeUnitTime = stringToTime(timeunit, time);

        if (theIP === undefined) {
            botMessage(src, "Unknown target!");
            return;
        }
        if (sys.maxAuth(theIP) >= srcauth && !isHost(src)) {
            botMessage(src, "You don't have sufficient auth to temp ban " + target + ".", c);
            return;
        }

        Prune.bans();

        if (DataHash.tempbans.has(theIP)) {
            botMessage(src, "You cannot ban an already banned player!", c);
            return;
        }

        if (time === undefined || isNaN(timeUnitTime)) {
            botMessage(src, "Specify time!", c);
            return;
        }
        if (timeUnitTime > 7200 && srcauth < 2) {
            botMessage(src, "You may only ban for a maximum of 5 days.", c);
            return;
        }

        var thetime = +sys.time() + timeUnitTime,
            thestr = thetime - (+sys.time()),
            timestr = getTimeString(thestr);

        botEscapeAll(target + " was banned by " + srcname + " for " + timestr + "!", 0);

        if (!isEmpty(reason)) {
            botEscapeAll("Reason: " + reason, 0);
        }

        if (tarid !== undefined) {
            kick(tarid);
        } else {
            aliasKick(theIP);
        }

        var re = "None given";

        if (!isEmpty(reason)) {
            re = reason;
        }

        DataHash.tempbans[theIP] = {
            by: sys.name(src),
            why: re,
            ip: theIP,
            time: thetime
        };
        cache.write("tempbans", JSON.stringify(DataHash.tempbans));
    },

    removeTempBan: function (src, target, reason, c) {
        var theIP = sys.dbIp(target),
            srcauth = sys.auth(src),
            srcname = sys.name(src),
            tarid = sys.id(target);

        if (theIP === undefined) {
            botMessage(src, "Unknown target!", c);
            return;
        }

        Prune.bans();

        if (!DataHash.tempbans.has(theIP)) {
            botMessage(src, "You cannot unban someone who isn't banned!", c);
            return;
        }

        botEscapeAll(target + " was un-tempbanned by " + srcname + "!", 0);

        if (!isEmpty(reason)) {
            botEscapeAll("Reason: " + reason, 0);
        }

        delete DataHash.tempbans[theIP];
        cache.write("tempbans", JSON.stringify(DataHash.tempbans));
    },

    tAuth: function (src, tar, auth, time, chan, timeUnit) {
        var sa = sys.auth(src),
            ta = sys.dbAuth(tar),
            theIP = sys.dbIp(tar),
            timeUnitTime = stringToTime(timeUnit, time);

        auth = Math.round(auth);

        if (theIP === undefined) {
            botMessage(src, "Unknown target!", chan);
            return;
        }

        if (auth <= 0) {
            botMessage(src, "You cannot give " + UserName + " authority to someone.", chan);
            return;
        }

        if (!sys.dbRegistered(tar)) {
            botMessage(src, "This player is not registered.", chan);
            if (sys.id(tar) !== undefined) {
                botMessage(sys.id(tar), "Please register for Authority.");
            }
            return;
        }

        if (auth > 1 && sa === 2) {
            botMessage(src, "You cannot give any authority higher than " + ModName + " to " + tar, chan);
            return;
        }

        if (auth > 3) {
            auth = 127;
        }

        var toAuth = "admin";
        if (auth < 2) {
            toAuth = "mod";
        }

        if (sys.maxAuth(theIP) >= sa && (sa < 3 || ta >= auth)) {
            botMessage(src, "You cannot give " + authToString(auth) + " to " + tar + "!", chan);
            return;
        }

        if (isNaN(timeUnitTime)) {
            botMessage(src, "Specify valid time!", chan);
            return;
        }

        if (DataHash.tempauth[tar.toLowerCase()] !== undefined) {
            botMessage(src, "This user already has tempauth.", chan);
            return;
        }

        var timey = getTimeString(timeUnitTime);

        putInAuthChan(tar, toAuth);
        botAll(sys.name(src) + " made " + tar + " " + authToString(auth) + " for " + timey + ".", 0);

        if (sys.id(tar) !== undefined) {
            sys.changeAuth(sys.id(tar), auth);
        }

        sys.changeDbAuth(tar, auth);
        var correctCase = tar;

        tar = tar.toLowerCase();
        time = timeUnitTime;
        time += +sys.time();

        DataHash.tempauth[tar] = {
            'time': time,
            'role': auth,
            'name': correctCase,
            'oldauth': ta
        };
        cache.write("tempauth", JSON.stringify(DataHash.tempauth));
    },

    importable: function (src, tar, chan, simple) {
        var natureNames = {
            24: "Quirky</font></b> Nature",
            23: "Careful</font></b> Nature (+SDef, -SAtk)",
            22: "Sassy</font></b> Nature (+SDef, -Spd)",
            21: "Gentle</font></b> Nature (+SDef, -Def)",
            20: "Calm</font></b> Nature (+SDef, -Atk)",
            19: "Rash</font></b> Nature (+SAtk, -SDef)",
            18: "Bashful</font></b> Nature",
            17: "Quiet</font></b> Nature (+SAtk, -Spd)",
            16: "Mild</font></b> Nature (+SAtk, -Def)",
            15: "Modest</font></b> Nature (+SAtk, -Atk)",
            14: "Naive</font></b> Nature (+Spd, -SDef)",
            13: "Jolly</font></b> Nature (+Spd, -SAtk)",
            12: "Serious</font></b> Nature",
            11: "Hasty</font></b> Nature (+Spd, -Def)",
            10: "Timid</font></b> Nature (+Spd, -Atk)",
            9: "Lax</font></b> Nature (+Def, -SDef)",
            8: "Impish</font></b> Nature (+Def, -SAtk)",
            7: "Relaxed</font></b> Nature (+Def, -Spd)",
            6: "Docile</font></b> Nature",
            5: "Bold</font></b> Nature (+Def, -Atk)",
            4: "Naughty</font></b> Nature (+Atk, -SDef)",
            3: "Adamant</font></b> Nature (+Atk, -SAtk)",
            2: "Brave</font></b> Nature (+Atk, -Spd)",
            1: "Lonely</font></b> Nature (+Atk, -Def)",
            0: "Hardy</font></b> Nature"
        },
            colorNames = {
                0: "#a8a878",
                1: "#c03028",
                2: "#a890f0",
                3: "#a040a0",
                4: "#e0c068",
                5: "#b8a038",
                6: "#a8b820",
                7: "#705898",
                8: "#b8b8d0",
                9: "#f08030",
                10: "#6890f0",
                11: "#78c850",
                12: "#f8d030",
                13: "#f85888",
                14: "#98d8d8",
                15: "#7038f8",
                16: "#705848"
            },
            genderNames = {
                2: "female",
                1: "male",
                0: "neutral"
            },
            evNames = {
                0: "HP",
                1: "Atk",
                2: "Def",
                3: "SAtk",
                4: "SDef",
                5: "Spd"
            },
            hiddenPowerNum = 237,
            t = new Template(),
            teamno, gen, fullgen, n, numteams = sys.teamCount(tar);

        t.register(style.header);
        t.register("<font color=" + script.namecolor(tar) + "><b>" + sys.name(tar) + "</b></font>'s Teams<br/>");

        for (n = 0; n < numteams; n++) {
            teamno = n + 1;
            gen = sys.gen(tar, n);
            fullgen = sys.generation(gen, sys.subgen(tar, n));

            if (n !== 0) {
                t.register("");
            }

            t.register("#" + teamno + ": Gen " + gen + " (" + fullgen + ")<br/>");

            var i, color, gender, pokeId, nick, item, level, evstr, w, evtable, dvstr, dvtable, nature, j, moveNum, moveName, moveStr, hpdvs, hp, movetype, hptype, shinyPoke;

            for (i = 0; i < 6; i++) {
                color = colorNames[sys.pokeType1(sys.teamPoke(tar, n, i), gen)];
                pokeId = sys.teamPoke(tar, n, i);

                if (pokeId === 0) {
                    continue;
                }

                gender = genderNames[sys.teamPokeGender(tar, n, i)];
                shinyPoke = sys.teamPokeShine(tar, n, i);
                if (!simple) {
                    t.register("<img src='pokemon:num=" + pokeId + "&gen=" + gen + "&back=false&shiny=" + shinyPoke + "&gender=" + gender + "'><img src='pokemon:num=" + pokeId + "&gen=" + gen + "&back=true&shiny=" + shinyPoke + "&gender=" + gender + "'>");
                }

                nick = sys.teamPokeNick(tar, n, i) + "</b></font> (<b><font color=" + color + ">" + sys.pokemon(sys.teamPoke(tar, n, i)) + "</b></font>)";
                if (sys.teamPokeNick(tar, n, i) === sys.pokemon(sys.teamPoke(tar, n, i))) {
                    nick = sys.pokemon(sys.teamPoke(tar, n, i)) + "</b></font>";
                }

                item = "<img src='item:" + sys.teamPokeItem(tar, n, i) + "'>";
                if (sys.item(sys.teamPokeItem(tar, n, i)) === "(No Item)") {
                    item = "";
                }

                if (!simple) {
                    t.register("<font color=" + color + "><b> " + nick + " " + sys.gender(sys.teamPokeGender(tar, n, i)).replace(/female/g, "<img src='Themes/Classic/genders/gender2.png'> (F)").replace(/male/g, "<img src='Themes/Classic/genders/gender1.png'> (M)").replace(/genderless/g, "<img src='Themes/Classic/genders/gender0.png'>") + " @ " + item + " " + sys.item(sys.teamPokeItem(tar, n, i)));
                } else {
                    t.register("<font color=" + color + "><b> " + nick + " " + sys.gender(sys.teamPokeGender(tar, n, i)).replace(/female/g, "(F)").replace(/male/g, "(M)").replace(/genderless/g, "") + " @ " + sys.item(sys.teamPokeItem(tar, n, i)));
                }

                if (gen > 2) {
                    t.register("<font color=" + color + "><b>Trait:</b></font> " + sys.ability(sys.teamPokeAbility(tar, n, i)));
                }

                level = sys.teamPokeLevel(tar, n, i);

                if (level !== 100) {
                    t.register('<b><font color=' + color + '>Level:</b></font> ' + level);
                }

                evstr = [];

                for (w = 0; w < 6; w++) {
                    evtable = evNames[w];
                    if (sys.teamPokeEV(tar, n, i, w) !== 0 || (gen === 2 && sys.teamPokeEV(tar, n, i, w) !== 255)) {
                        evstr.push(sys.teamPokeEV(tar, n, i, w) + " " + evtable);
                    }
                }

                if (evstr.length !== 0) {
                    t.register("<font color=" + color + "><b>EVs:</b></font> " + evstr.join(" / "));
                }

                dvstr = [];
                for (w = 0; w < 6; w++) {
                    dvtable = evNames[w];
                    if (sys.teamPokeDV(tar, n, i, w) !== 31 || (gen === 2 && sys.teamPokeDV(tar, n, i, w) !== 15)) {
                        dvstr.push(sys.teamPokeDV(tar, n, i, w) + " " + dvtable);
                    }
                }

                if (dvstr.length !== 0) {
                    t.register("<font color=" + color + "><b>IVs:</b></font> " + dvstr.join(" / "));
                }

                if (gen > 2) {
                    nature = natureNames[sys.teamPokeNature(tar, n, i)];
                    t.register("<b><font color=" + color + ">" + nature + "</font></b>");
                }

                for (j = 0; j < 4; j++) {
                    moveNum = sys.teamPokeMove(tar, n, i, j);
                    moveName = sys.move(moveNum);
                    moveStr = "<b><font color=" + colorNames[sys.moveType(moveNum)] + ">" + moveName + "</font></b>";

                    if (moveNum === 0) {
                        continue;
                    }

                    if (moveNum === hiddenPowerNum) {
                        hpdvs = [];

                        for (w = 0; w < 6; w++) {
                            hpdvs.push(sys.teamPokeDV(src, n, i, w));
                        }

                        hp = sys.hiddenPowerType.apply(sys, [gen].concat(hpdvs));
                        movetype = sys.type(hp);

                        hptype = "<font color=" + colorNames[hp] + "><b>" + movetype + "</b></font>";
                        moveStr = "<font color=" + colorNames[hp] + "><b>Hidden Power</b></font> [" + hptype + "]";
                    }

                    t.register("-" + moveStr);
                }
                
                t.register("");

                if (teamno !== numteams) {
                    t.register("<hr/>");
                }
            }
        }

        t.render(src, chan, "<br/>");
    },

    loadTiers: function () {
        TierBans = (new function () {
            this.bans = [];

            this.Include = 0;
            this.Exclude = 1;

            this.newBan = function (method, tiers, ban) {
                this.bans.push({
                    method: method,
                    tiers: tiers,
                    ban: ban
                });
            };

            this.isLegalTeam = function (src, team, tier, silent) {
                if (tier === "Challenge Cup") {
                    return true;
                }


                if (!sys.hasLegalTeamForTier(src, team, tier)) {
                    return false;
                }

                var alerts = [],
                    x,
                    b = this.bans,
                    cban,
                    correct,
                    z,
                    alert;

                for (x in b) {
                    cban = b[x];
                    if (cban.method === this.Include) {
                        correct = cban.tiers.has(tier);
                    } else {
                        correct = !cban.tiers.has(tier);
                    }

                    if (correct) {
                        alert = cban.ban(src, team, tier);
                        if (typeof alert === "object") {
                            alerts.concat(alert);
                        }
                    }

                    if (alerts.length === 0) {
                        return true; // Team is valid
                    } else if (!silent) {
                        for (z in alerts) {
                            teamAlert(src, team, alerts[z]);
                        }
                        return false;
                    }
                }
            };

            this.findGoodTier = function (src, team) {
                var path = ["Wifi LC", "DW LC", "Wifi LC Ubers", "Wifi NU", "Wifi LU", "Wifi UU", "Wifi OU", "No Preview OU", "Wifi Ubers", "No Preview Ubers", "Challenge Cup"],
                    i,
                    tier;
                for (i in path) {
                    tier = path[i];
                    if (sys.hasLegalTeamForTier(src, team, tier) && this.isLegalTeam(src, team, tier, true)) {
                        teamAlert(src, team, "Your team's tier is now " + tier + ".");
                        sys.changeTier(src, team, tier);
                        return;
                    }
                }
            };
        }());

        var INCLUDING = TierBans.Include,
            EXCLUDING = TierBans.Exclude,
            cc = ["Challenge Cup", "CC 1v1"],
            dw = ["No Preview OU", "No Preview Ubers", "Monotype", "Gen 5 1v1 Ubers", "Gen 5 1v1", "Challenge Cup", "CC 1v1", "DW Uber Triples", "No Preview OU Triples", "No Preview Uber Doubles", "No Preview OU Doubles", "Shanai Cup", "Monocolour"];
        var beasts, pokeColours;

        TierBans.newBan(EXCLUDING, [], function eventShinies(player, team) {
            if (typeof beasts === "undefined") {
                beasts = {};
                beasts[sys.pokeNum('Raikou')] = ['Extremespeed', 'Aura Sphere', 'Weather Ball', 'Zap Cannon'].map(sys.moveNum);
                beasts[sys.pokeNum('Suicune')] = ['Extremespeed', 'Aqua Ring', 'Sheer Cold', 'Air Slash'].map(sys.moveNum);
                beasts[sys.pokeNum('Entei')] = ['Extremespeed', 'Howl', 'Crush Claw', 'Flare Blitz'].map(sys.moveNum);
            }

            var beast, slot, i;
            for (beast in beasts) {
                for (slot = 0; slot < 6; slot++) {
                    if (sys.teamPoke(player, team, slot) === beast) {
                        for (i = 0; i < 4; i++) {
                            if (beasts[beast].has(sys.teamPokeMove(player, team, slot, i))) {
                                sys.changePokeShine(player, team, slot, true);
                            }
                        }
                    }
                }
            }
        });

        TierBans.newBan(EXCLUDING, cc, function customAbilityBans(src, team, tier) {
            var ltier = tier.toLowerCase(),
                ret = [],
                bans = DataHash.bannedAbilities,
                i,
                ability,
                lability,
                poke,
                lpoke;
            for (i = 0; i < 6; ++i) {
                ability = sys.ability(sys.teamPokeAbility(src, team, i));
                lability = ability.toLowerCase();
                poke = sys.pokemon(sys.teamPoke(src, team, i));
                lpoke = poke.toLowerCase();

                if (bans[ltier] !== undefined) {
                    if (bans[ltier][lpoke] !== undefined) {
                        if (bans[ltier][lpoke].indexOf(lability) !== -1) {
                            ret.push(poke + " is not allowed to have ability " + ability + " in " + tier + ". Please change it in Teambuilder.");
                        }
                    }
                }
            }
            return ret;
        });

        TierBans.newBan(EXCLUDING, cc, function eventMovesCheck(src, team, tier) {
            var ret = [],
                i,
                poke,
                x,
                y,
                nat,
                move;
            for (i = 0; i < 6; i++) {
                poke = sys.teamPoke(src, team, i);
                if (pokeNatures.has(poke)) {
                    for (x in pokeNatures[poke]) {
                        nat = pokeNatures[poke][x];
                        for (y in nat[0]) {
                            move = nat[0][y];
                            if (sys.hasTeamPokeMove(src, team, i, sys.moveNum(move)) && sys.teamPokeNature(src, team, i) !== sys.natureNum(nat[1])) {
                                ret.push(sys.pokemon(poke) + " with " + move + " must be a " + nat[1] + " nature. Change it in the teambuilder.");
                            }
                        }
                    }
                }
            }
            return ret;
        });

        TierBans.newBan(INCLUDING, ["Wifi LC", "Wifi LC Ubers", "Wifi UU LC"], function littleCupCheck(src, team, tier) {
            var ret = [],
                i,
                x;
            for (i = 0; i < 6; i++) {
                x = sys.teamPoke(src, team, i);
                if (x !== 0 && sys.hasDreamWorldAbility(src, team, i) && lcpokemons.indexOf(x) !== -1) {
                    ret.push(sys.pokemon(x) + " is not allowed with a Dream World ability in the " + tier + " tier. Change it in the teambuilder.");

                }
            }
            return ret;
        });

        TierBans.newBan(INCLUDING, ["Wifi NU"], function evioliteCheck(src, team, tier) {
            var evioliteLimit = 6,
                eviolites = 0,
                i,
                x,
                item;

            for (i = 0; i < 6; i++) {
                x = sys.teamPoke(src, team, i);
                item = sys.teamPokeItem(src, team, i);
                if (item !== undefined) {
                    item = sys.item(item);
                } else {
                    item = "";
                }
                if (item === "Eviolite" && ++eviolites > evioliteLimit) {
                    return ["Only 1 pokemon is allowed with eviolite in " + tier + " tier. Please remove extra evioites in teambuilder."];
                }
            }
        });

        TierBans.newBan(EXCLUDING, dw, function dwAbilityCheck(src, team, tier) {
            if (sys.gen(src, team) < 5) {
                return;
            }
            var ret = [],
                i,
                x;
            for (i = 0; i < 6; i++) {
                x = sys.teamPoke(src, team, i);
                if (x !== 0 && sys.hasDreamWorldAbility(src, team, i) && (!(dwpokemons.hasOwnProperty(x)) || (breedingpokemons.indexOf(x) !== -1 && sys.compatibleAsDreamWorldEvent(src, team, i) !== true))) {
                    if (!(dwpokemons.hasOwnProperty(x))) {
                        ret.push(sys.pokemon(x) + " is not allowed with a Dream World ability in " + tier + " tier. Change it in the teambuilder.");
                    } else {
                        ret.push(sys.pokemon(x) + " has to be Male and have no egg moves with its Dream World ability in  " + tier + " tier. Change it in the teambuilder.");
                    }
                }
            }
            return ret;
        });

        TierBans.newBan(INCLUDING, ["No Preview OU", "Wifi OU", "Wifi UU", "Wifi LU", "Wifi LC", "DW LC", "Wifi Ubers", "No Preview Ubers", "Clear Skies", "Clear Skies DW", "Monotype", "Monocolour", "Monogen", "Smogon OU", "Smogon UU", "Smogon RU", "Wifi NU"], function inconsistentCheck(src, team, tier) {
            var moody = sys.abilityNum("Moody"),
                ret = [],
                i,
                x;

            for (i = 0; i < 6; i++) {
                x = sys.teamPoke(src, team, i);
                if (x !== 0 && sys.teamPokeAbility(src, team, i) === moody) {
                    ret.push(sys.pokemon(x) + " is not allowed with Moody in " + tier + ". Change it in the teambuilder.");
                }
            }
            return ret;
        });

        TierBans.newBan(INCLUDING, ["Clear Skies"], function weatherlesstiercheck(src, team, tier) {
            var ret = [],
                i,
                ability,
                tl;
            for (i = 0; i < 6; i++) {
                ability = sys.ability(sys.teamPokeAbility(src, team, i));
                tl = ability.toLowerCase();

                if (tl === "drizzle" || tl === "drought" || tl === "snow warning" || tl === "sand stream") {
                    ret.push("Your team has a pokemon with the ability " + ability + ", please remove before entering " + tier + " tier.");
                }
            }
            return ret;
        });

        TierBans.newBan(INCLUDING, ["Monotype"], function monotypeCheck(src, team, tier) {
            var TypeA = sys.pokeType1(sys.teamPoke(src, team, 0), 5),
                TypeB = sys.pokeType2(sys.teamPoke(src, team, 0), 5),
                k,
                checkType,
                i,
                temptypeA,
                temptypeB;
            
            for (i = 1; i < 6; i++) {
                if (sys.teamPoke(src, team, i) === 0) {
                    continue;
                }

                temptypeA = sys.pokeType1(sys.teamPoke(src, team, i), 5);
                temptypeB = sys.pokeType2(sys.teamPoke(src, team, i), 5);

                if (checkType !== undefined) {
                    k = 3;
                }
                if (i === 1) {
                    k = 1;
                }
                if (TypeB !== 17) {
                    if ((temptypeA === TypeA && temptypeB === TypeB && k === 1) || (temptypeA === TypeB && temptypeB === TypeA && k === 1)) {
                        k = 2;
                    }
                }
                if ((temptypeA === TypeA && k === 1) || (temptypeB === TypeA && k === 1)) {
                    checkType = TypeA;
                }
                if ((temptypeA === TypeB && k === 1) || (temptypeB === TypeB && k === 1)) {
                    if (TypeB !== 17) {
                        checkType = TypeB;
                    }
                    if (TypeB === 17) {
                        checkType = TypeA;
                    }
                }
                if (i > 1 && k === 2) {
                    k = 1;
                    if ((temptypeA === TypeA && temptypeB === TypeB && k === 1) || (temptypeA === TypeB && temptypeB === TypeA && k === 1)) {
                        k = 2;
                    }
                    if ((temptypeA === TypeA && k === 1) || (temptypeB === TypeA && k === 1)) {
                        checkType = TypeA;
                    }
                    if ((temptypeA === TypeB && k === 1) || (temptypeB === TypeB && k === 1)) {
                        if (TypeB !== 17) {
                            checkType = TypeB;
                        }
                        if (TypeB === 17) {
                            checkType = TypeA;
                        }
                    }
                }
                if (k === 3) {
                    if (temptypeA !== checkType && temptypeB !== checkType) {
                        return ["Your team is not Monotype as " + sys.pokemon(sys.teamPoke(src, team, i)) + " is not of type " + sys.type(checkType) + "!"];
                    }
                }

                if (k === 1) {
                    if (TypeB === 17) {
                        TypeB = TypeA;
                    }
                    if (temptypeA !== TypeA && temptypeB !== TypeA && temptypeA !== TypeB && temptypeB !== TypeB) {
                        return ["Your team is not Monotype as " + sys.pokemon(sys.teamPoke(src, team, i)) + " does not share a type with " + sys.pokemon(sys.teamPoke(src, team, 0)) + "!"];
                    }

                }
            }
        });

        TierBans.newBan(INCLUDING, ["Monogen"], function monoGenCheck(src, team, tier) {
            var GEN_MAX = [0, 151, 252, 386, 493, 647],
                gen = 0,
                i,
                pokenum,
                species;
            for (i = 0; i < 6; ++i) {
                pokenum = sys.teamPoke(src, team, i);
                species = pokenum % 65536; // remove alt formes
                if (species === 0) {
                    continue;
                }
                if (gen === 0) {
                    while (species > GEN_MAX[gen]) {
                        ++gen; // Search for correct gen for first poke
                    }
                } else if (!(GEN_MAX[gen - 1] < species && species <= GEN_MAX[gen])) {
                    return [sys.pokemon(pokenum) + " is not from gen " + gen + "!"];
                }
            }
        });


        TierBans.newBan(INCLUDING, ["Monocolour"], function monoColourCheck(src, team, tier) {
            if (typeof pokeColours === 'undefined') {
                pokeColours = {
                    'Red': ['Charmander', 'Charmeleon', 'Charizard', 'Vileplume', 'Paras', 'Parasect', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Goldeen', 'Seaking', 'Jynx', 'Magikarp', 'Magmar', 'Flareon', 'Ledyba', 'Ledian', 'Ariados', 'Yanma', 'Scizor', 'Slugma', 'Magcargo', 'Octillery', 'Delibird', 'Porygon2', 'Magby', 'Ho-Oh', 'Torchic', 'Combusken', 'Blaziken', 'Wurmple', 'Medicham', 'Carvanha', 'Camerupt', 'Solrock', 'Corphish', 'Crawdaunt', 'Latias', 'Groudon', 'Deoxys', 'Deoxys-A', 'Deoxys-D', 'Deoxys-S', 'Kricketot', 'Kricketune', 'Magmortar', 'Porygon-Z', 'Rotom', 'Rotom-H', 'Rotom-F', 'Rotom-W', 'Rotom-C', 'Rotom-S', 'Tepig', 'Pignite', 'Emboar', 'Pansear', 'Simisear', 'Throh', 'Venipede', 'Scolipede', 'Krookodile', 'Darumaka', 'Darmanitan', 'Dwebble', 'Crustle', 'Scrafty', 'Shelmet', 'Accelgor', 'Druddigon', 'Pawniard', 'Bisharp', 'Braviary', 'Heatmor'],
                    'Blue': ['Squirtle', 'Wartortle', 'Blastoise', 'Nidoran?', 'Nidorina', 'Nidoqueen', 'Oddish', 'Gloom', 'Golduck', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Tentacool', 'Tentacruel', 'Tangela', 'Horsea', 'Seadra', 'Gyarados', 'Lapras', 'Vaporeon', 'Omanyte', 'Omastar', 'Articuno', 'Dratini', 'Dragonair', 'Totodile', 'Croconaw', 'Feraligatr', 'Chinchou', 'Lanturn', 'Marill', 'Azumarill', 'Jumpluff', 'Wooper', 'Quagsire', 'Wobbuffet', 'Heracross', 'Kingdra', 'Phanpy', 'Suicune', 'Mudkip', 'Marshtomp', 'Swampert', 'Taillow', 'Swellow', 'Surskit', 'Masquerain', 'Loudred', 'Exploud', 'Azurill', 'Meditite', 'Sharpedo', 'Wailmer', 'Wailord', 'Swablu', 'Altaria', 'Whiscash', 'Chimecho', 'Wynaut', 'Spheal', 'Sealeo', 'Walrein', 'Clamperl', 'Huntail', 'Bagon', 'Salamence', 'Beldum', 'Metang', 'Metagross', 'Regice', 'Latios', 'Kyogre', 'Piplup', 'Prinplup', 'Empoleon', 'Shinx', 'Luxio', 'Luxray', 'Cranidos', 'Rampardos', 'Gible', 'Gabite', 'Garchomp', 'Riolu', 'Lucario', 'Croagunk', 'Toxicroak', 'Finneon', 'Lumineon', 'Mantyke', 'Tangrowth', 'Glaceon', 'Azelf', 'Phione', 'Manaphy', 'Oshawott', 'Dewott', 'Samurott', 'Panpour', 'Simipour', 'Roggenrola', 'Boldore', 'Gigalith', 'Woobat', 'Swoobat', 'Tympole', 'Palpitoad', 'Seismitoad', 'Sawk', 'Tirtouga', 'Carracosta', 'Ducklett', 'Karrablast', 'Eelektrik', 'Eelektross', 'Elgyem', 'Cryogonal', 'Deino', 'Zweilous', 'Hydreigon', 'Cobalion', 'Thundurus'],
                    'Green': ['Bulbasaur', 'Ivysaur', 'Venusaur', 'Caterpie', 'Metapod', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Scyther', 'Chikorita', 'Bayleef', 'Meganium', 'Spinarak', 'Natu', 'Xatu', 'Bellossom', 'Politoed', 'Skiploom', 'Larvitar', 'Tyranitar', 'Celebi', 'Treecko', 'Grovyle', 'Sceptile', 'Dustox', 'Lotad', 'Lombre', 'Ludicolo', 'Breloom', 'Electrike', 'Roselia', 'Gulpin', 'Vibrava', 'Flygon', 'Cacnea', 'Cacturne', 'Cradily', 'Kecleon', 'Tropius', 'Rayquaza', 'Turtwig', 'Grotle', 'Torterra', 'Budew', 'Roserade', 'Bronzor', 'Bronzong', 'Carnivine', 'Yanmega', 'Leafeon', 'Shaymin', 'Shaymin-S', 'Snivy', 'Servine', 'Serperior', 'Pansage', 'Simisage', 'Swadloon', 'Cottonee', 'Whimsicott', 'Petilil', 'Lilligant', 'Basculin', 'Maractus', 'Trubbish', 'Garbodor', 'Solosis', 'Duosion', 'Reuniclus', 'Axew', 'Fraxure', 'Golett', 'Golurk', 'Virizion', 'Tornadus'],
                    'Yellow': ['Kakuna', 'Beedrill', 'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Ninetales', 'Meowth', 'Persian', 'Psyduck', 'Ponyta', 'Rapidash', 'Drowzee', 'Hypno', 'Exeggutor', 'Electabuzz', 'Jolteon', 'Zapdos', 'Moltres', 'Cyndaquil', 'Quilava', 'Typhlosion', 'Pichu', 'Ampharos', 'Sunkern', 'Sunflora', 'Girafarig', 'Dunsparce', 'Shuckle', 'Elekid', 'Raikou', 'Beautifly', 'Pelipper', 'Ninjask', 'Makuhita', 'Manectric', 'Plusle', 'Minun', 'Numel', 'Lunatone', 'Jirachi', 'Mothim', 'Combee', 'Vespiquen', 'Chingling', 'Electivire', 'Uxie', 'Cresselia', 'Victini', 'Sewaddle', 'Leavanny', 'Scraggy', 'Cofagrigus', 'Archen', 'Archeops', 'Deerling', 'Joltik', 'Galvantula', 'Haxorus', 'Mienfoo', 'Keldeo'],
                    'Purple': ['Rattata', 'Ekans', 'Arbok', 'Nidoran?', 'Nidorino', 'Nidoking', 'Zubat', 'Golbat', 'Venonat', 'Venomoth', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar', 'Koffing', 'Weezing', 'Starmie', 'Ditto', 'Aerodactyl', 'Mewtwo', 'Crobat', 'Aipom', 'Espeon', 'Misdreavus', 'Forretress', 'Gligar', 'Granbull', 'Mantine', 'Tyrogue', 'Cascoon', 'Delcatty', 'Sableye', 'Illumise', 'Swalot', 'Grumpig', 'Lileep', 'Shellos', 'Gastrodon', 'Ambipom', 'Drifloon', 'Drifblim', 'Mismagius', 'Stunky', 'Skuntank', 'Spiritomb', 'Skorupi', 'Drapion', 'Gliscor', 'Palkia', 'Purrloin', 'Liepard', 'Gothita', 'Gothorita', 'Gothitelle', 'Mienshao', 'Genesect'],
                    'Pink': ['Clefairy', 'Clefable', 'Jigglypuff', 'Wigglytuff', 'Slowpoke', 'Slowbro', 'Exeggcute', 'Lickitung', 'Chansey', 'Mr. Mime', 'Porygon', 'Mew', 'Cleffa', 'Igglybuff', 'Flaaffy', 'Hoppip', 'Slowking', 'Snubbull', 'Corsola', 'Smoochum', 'Miltank', 'Blissey', 'Whismur', 'Skitty', 'Milotic', 'Gorebyss', 'Luvdisc', 'Cherubi', 'Cherrim', 'Mime Jr.', 'Happiny', 'Lickilicky', 'Mesprit', 'Munna', 'Musharna', 'Audino', 'Alomomola'],
                    'Brown': ['Weedle', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Raticate', 'Spearow', 'Fearow', 'Vulpix', 'Diglett', 'Dugtrio', 'Mankey', 'Primeape', 'Growlithe', 'Arcanine', 'Abra', 'Kadabra', 'Alakazam', 'Geodude', 'Graveler', 'Golem', 'Farfetch\'d', 'Doduo', 'Dodrio', 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Kangaskhan', 'Staryu', 'Pinsir', 'Tauros', 'Eevee', 'Kabuto', 'Kabutops', 'Dragonite', 'Sentret', 'Furret', 'Hoothoot', 'Noctowl', 'Sudowoodo', 'Teddiursa', 'Ursaring', 'Swinub', 'Piloswine', 'Stantler', 'Hitmontop', 'Entei', 'Zigzagoon', 'Seedot', 'Nuzleaf', 'Shiftry', 'Shroomish', 'Slakoth', 'Slaking', 'Shedinja', 'Hariyama', 'Torkoal', 'Spinda', 'Trapinch', 'Baltoy', 'Feebas', 'Regirock', 'Chimchar', 'Monferno', 'Infernape', 'Starly', 'Staravia', 'Staraptor', 'Bidoof', 'Bibarel', 'Buizel', 'Floatzel', 'Buneary', 'Lopunny', 'Bonsly', 'Hippopotas', 'Hippowdon', 'Mamoswine', 'Heatran', 'Patrat', 'Watchog', 'Lillipup', 'Conkeldurr', 'Sandile', 'Krokorok', 'Sawsbuck', 'Beheeyem', 'Stunfisk', 'Bouffalant', 'Vullaby', 'Mandibuzz', 'Landorus'],
                    'Black': ['Snorlax', 'Umbreon', 'Murkrow', 'Unown', 'Sneasel', 'Houndour', 'Houndoom', 'Mawile', 'Spoink', 'Seviper', 'Claydol', 'Shuppet', 'Banette', 'Duskull', 'Dusclops', 'Honchkrow', 'Chatot', 'Munchlax', 'Weavile', 'Dusknoir', 'Giratina', 'Darkrai', 'Blitzle', 'Zebstrika', 'Sigilyph', 'Yamask', 'Chandelure', 'Zekrom'],
                    'Gray': ['Machop', 'Machoke', 'Machamp', 'Magnemite', 'Magneton', 'Onix', 'Rhyhorn', 'Rhydon', 'Pineco', 'Steelix', 'Qwilfish', 'Remoraid', 'Skarmory', 'Donphan', 'Pupitar', 'Poochyena', 'Mightyena', 'Nincada', 'Nosepass', 'Aron', 'Lairon', 'Aggron', 'Volbeat', 'Barboach', 'Anorith', 'Armaldo', 'Snorunt', 'Glalie', 'Relicanth', 'Registeel', 'Shieldon', 'Bastiodon', 'Burmy', 'Wormadam', 'Wormadam-G', 'Wormadam-S', 'Glameow', 'Purugly', 'Magnezone', 'Rhyperior', 'Probopass', 'Arceus', 'Herdier', 'Stoutland', 'Pidove', 'Tranquill', 'Unfezant', 'Drilbur', 'Excadrill', 'Timburr', 'Gurdurr', 'Whirlipede', 'Zorua', 'Zoroark', 'Minccino', 'Cinccino', 'Escavalier', 'Ferroseed', 'Ferrothorn', 'Klink', 'Klang', 'Klinklang', 'Durant', 'Terrakion', 'Kyurem'],
                    'White': ['Butterfree', 'Seel', 'Dewgong', 'Togepi', 'Togetic', 'Mareep', 'Smeargle', 'Lugia', 'Linoone', 'Silcoon', 'Wingull', 'Ralts', 'Kirlia', 'Gardevoir', 'Vigoroth', 'Zangoose', 'Castform', 'Absol', 'Shelgon', 'Pachirisu', 'Snover', 'Abomasnow', 'Togekiss', 'Gallade', 'Froslass', 'Dialga', 'Regigigas', 'Swanna', 'Vanillite', 'Vanillish', 'Vanilluxe', 'Emolga', 'Foongus', 'Amoonguss', 'Frillish', 'Jellicent', 'Tynamo', 'Litwick', 'Lampent', 'Cubchoo', 'Beartic', 'Rufflet', 'Larvesta', 'Volcarona', 'Reshiram', 'Meloetta', 'Meloetta-S']
                };
            }

            var poke = sys.pokemon(sys.teamPoke(src, team, 0)),
                thecolour = '',
                colour,
                i;

            for (colour in pokeColours) {
                if (pokeColours[colour].indexOf(poke) > -1) {
                    thecolour = colour;
                }
            }
            for (i = 1; i < 6; ++i) {
                poke = sys.pokemon(sys.teamPoke(src, team, i));
                if (pokeColours[thecolour].indexOf(poke) === -1 && poke !== "Missingno") {
                    return [Grammar.es(poke) + " colour is not " + thecolour];
                }
            }
        });

        TierBans.newBan(INCLUDING, ["Smogon OU", "Wifi OU", "No Preview OU"], function swiftSwimCheck(src, team, tier) {
            var i, j;
            for (i = 0; i < 6; ++i) {
                if (sys.ability(sys.teamPokeAbility(src, team, i)) === "Drizzle") {
                    for (j = 0; j < 6; ++j) {
                        if (sys.ability(sys.teamPokeAbility(src, team, j)) === "Swift Swim") {
                            return ["You cannot have the combination of Swift Swim and Drizzle in " + tier];
                        }
                    }
                }
            }
        });

        TierBans.newBan(INCLUDING, ["Smogon UU"], function droughtCheck(src, team, tier) {
            var i;
            for (i = 0; i < 6; ++i) {
                if (sys.ability(sys.teamPokeAbility(src, team, i)) === "Drought") {
                    return ["Drought is not allowed in Smogon UU"];
                }
            }
        });

        TierBans.newBan(INCLUDING, ["Wifi UU", "Wifi LU", "Wifi NU"], function sandStreamCheck(src, team, tier) {
            var i;
            for (i = 0; i < 6; ++i) {
                if (sys.ability(sys.teamPokeAbility(src, team, i)) === "Sand Stream") {
                    return ["Sand Stream is not allowed in " + tier + "."];
                }
            }
        });

        TierBans.newBan(INCLUDING, ["Wifi UU", "Wifi LU", "Wifi NU"], function snowWarningCheck(src, team, tier) {
            var i;
            for (i = 0; i < 6; ++i) {
                if (sys.ability(sys.teamPokeAbility(src, team, i)) === "Snow Warning") {
                    return ["Snow Warning is not allowed in " + tier + "."];
                }
            }
        });

        TierBans.newBan(INCLUDING, ["Shanai Cup"], function shanaiAbilityCheck(src, team, tier) {
            var bannedAbilities = {
                'treecko': ['overgrow'],
                'chimchar': ['blaze'],
                'totodile': ['torrent'],
                'spearow': ['sniper'],
                'skorupi': ['battle armor', 'sniper'],
                'spoink': ['thick fat'],
                'golett': ['iron fist'],
                'magnemite': ['magnet pull', 'analytic'],
                'electrike': ['static', 'lightningrod'],
                'nosepass': ['sturdy', 'magnet pull'],
                'axew': ['rivalry'],
                'croagunk': ['poison touch', 'dry skin'],
                'cubchoo': ['rattled'],
                'joltik': ['swarm'],
                'shroomish': ['effect spore', 'quick feet'],
                'pidgeotto': ['big pecks'],
                'karrablast': ['swarm']
            },
                ret = [],
                ability,
                lability,
                poke,
                lpoke,
                i;

            for (i = 0; i < 6; ++i) {
                ability = sys.ability(sys.teamPokeAbility(src, team, i));
                lability = ability.toLowerCase();
                poke = sys.pokemon(sys.teamPoke(src, team, i));
                lpoke = poke.toLowerCase();
                if (bannedAbilities.hasOwnProperty(lpoke) && bannedAbilities[lpoke].indexOf(lability) !== -1) {
                    ret.push(poke + " is not allowed to have ability " + ability + " in " + tier + ". Please change it in Teambuilder.");
                }
            }
            return ret;
        });

        TierBans.newBan(EXCLUDING, cc, function hasOneUsablePokemon(player, team) {
            var slot, move;
            for (slot = 0; slot < 6; slot++) {
                if (sys.teamPoke(player, team, slot) !== 0) {
                    for (move = 0; move < 4; move++) {
                        if (sys.teamPokeMove(player, team, slot, move) !== 0) {
                            return;
                        }
                    }
                }
            }

            return ["You do not have any valid pokemon. (Please make at least one in Teambuilder)"];
        });

        dwpokemons = {};

        var dwpok, pnum = sys.pokeNum;

        if (Config.DWAbilityCheck) {
            var dwlist = ["Rattata", "Raticate", "Nidoran-F", "Nidorina", "Nidoqueen", "Nidoran-M", "Nidorino", "Nidoking", "Oddish", "Gloom", "Vileplume", "Bellossom", "Bellsprout", "Weepinbell", "Victreebel", "Ponyta", "Rapidash", "Farfetch'd", "Doduo", "Dodrio", "Exeggcute", "Exeggutor", "Lickitung", "Lickilicky", "Tangela", "Tangrowth", "Kangaskhan", "Sentret", "Furret", "Cleffa", "Clefairy", "Clefable", "Igglybuff", "Jigglypuff", "Wigglytuff", "Mareep", "Flaaffy", "Ampharos", "Hoppip", "Skiploom", "Jumpluff", "Sunkern", "Sunflora", "Stantler", "Poochyena", "Mightyena", "Lotad", "Ludicolo", "Lombre", "Taillow", "Swellow", "Surskit", "Masquerain", "Bidoof", "Bibarel", "Shinx", "Luxio", "Luxray", "Psyduck", "Golduck", "Growlithe", "Arcanine", "Scyther", "Scizor", "Tauros", "Azurill", "Marill", "Azumarill", "Bonsly", "Sudowoodo", "Girafarig", "Miltank", "Zigzagoon", "Linoone", "Electrike", "Manectric", "Castform", "Pachirisu", "Buneary", "Lopunny", "Glameow", "Purugly", "Natu", "Xatu", "Skitty", "Delcatty", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Bulbasaur", "Charmander", "Squirtle", "Ivysaur", "Venusaur", "Charmeleon", "Charizard", "Wartortle", "Blastoise", "Croagunk", "Toxicroak", "Turtwig", "Grotle", "Torterra", "Chimchar", "Infernape", "Monferno", "Piplup", "Prinplup", "Empoleon", "Treecko", "Sceptile", "Grovyle", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Caterpie", "Metapod", "Butterfree", "Pidgey", "Pidgeotto", "Pidgeot", "Spearow", "Fearow", "Zubat", "Golbat", "Crobat", "Aerodactyl", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Yanma", "Yanmega", "Murkrow", "Honchkrow", "Delibird", "Wingull", "Pelipper", "Swablu", "Altaria", "Starly", "Staravia", "Staraptor", "Gligar", "Gliscor", "Drifloon", "Drifblim", "Skarmory", "Tropius", "Chatot", "Slowpoke", "Slowbro", "Slowking", "Krabby", "Kingler", "Horsea", "Seadra", "Kingdra", "Goldeen", "Seaking", "Magikarp", "Gyarados", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Wooper", "Quagsire", "Qwilfish", "Corsola", "Remoraid", "Octillery", "Mantine", "Mantyke", "Carvanha", "Sharpedo", "Wailmer", "Wailord", "Barboach", "Whiscash", "Clamperl", "Gorebyss", "Huntail", "Relicanth", "Luvdisc", "Buizel", "Floatzel", "Finneon", "Lumineon", "Tentacool", "Tentacruel", "Corphish", "Crawdaunt", "Lileep", "Cradily", "Anorith", "Armaldo", "Feebas", "Milotic", "Shellos", "Gastrodon", "Lapras", "Dratini", "Dragonair", "Dragonite", "Elekid", "Electabuzz", "Electivire", "Poliwag", "Poliwrath", "Politoed", "Poliwhirl", "Vulpix", "Ninetales", "Musharna", "Munna", "Darmanitan", "Darumaka", "Mamoswine", "Togekiss", "Burmy", "Wormadam", "Mothim", "Pichu", "Pikachu", "Raichu", "Abra", "Kadabra", "Alakazam", "Spiritomb", "Mr. Mime", "Mime Jr.", "Meditite", "Medicham", "Meowth", "Persian", "Shuppet", "Banette", "Spinarak", "Ariados", "Drowzee", "Hypno", "Wobbuffet", "Wynaut", "Snubbull", "Granbull", "Houndour", "Houndoom", "Smoochum", "Jynx", "Ralts", "Gardevoir", "Gallade", "Sableye", "Mawile", "Volbeat", "Illumise", "Spoink", "Grumpig", "Stunky", "Skuntank", "Bronzong", "Bronzor", "Mankey", "Primeape", "Machop", "Machoke", "Machamp", "Magnemite", "Magneton", "Magnezone", "Koffing", "Weezing", "Rhyhorn", "Rhydon", "Rhyperior", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Phanpy", "Donphan", "Magby", "Magmar", "Magmortar", "Larvitar", "Pupitar", "Tyranitar", "Makuhita", "Hariyama", "Numel", "Camerupt", "Torkoal", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Absol", "Beldum", "Metang", "Metagross", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Tyrogue", "Hitmonlee", "Hitmonchan", "Hitmontop", "Bagon", "Shelgon", "Salamence", "Seel", "Dewgong", "Shellder", "Cloyster", "Chinchou", "Lanturn", "Smeargle", "Porygon", "Porygon2", "Porygon-Z", "Drilbur", "Excadrill", "Basculin", "Basculin-a", "Alomomola", "Stunfisk", "Druddigon", "Foongus", "Amoonguss", "Liepard", "Purrloin", "Minccino", "Cinccino", "Sandshrew", "Sandslash", "Vullaby", "Mandibuzz", "Rufflet", "Braviary", "Frillish", "Jellicent", "Weedle", "Kakuna", "Beedrill", "Shroomish", "Breloom", "Zangoose", "Seviper", "Combee", "Vespiquen", "Patrat", "Watchog", "Blitzle", "Zebstrika", "Woobat", "Swoobat", "Mienfoo", "Mienshao", "Bouffalant", "Staryu", "Starmie", "Togepi", "Shuckle", "Togetic", "Rotom", "Sigilyph", "Riolu", "Lucario", "Lugia", "Ho-Oh", "Dialga", "Palkia", "Giratina", "Grimer", "Muk", "Ditto", "Venonat", "Venomoth", "Herdier", "Lillipup", "Stoutland", "Sewaddle", "Swadloon", "Leavanny", "Cubchoo", "Beartic", "Landorus", "Thundurus", "Tornadus", "Dunsparce", "Sneasel", "Weavile", "Nosepass", "Probopass", "Karrablast", "Escavalier", "Shelmet", "Accelgor", "Snorunt", "Glalie", "Froslass", "Heatran", "Pinsir", "Emolga", "Heracross", "Trubbish", "Garbodor", "Snover", "Abomasnow", "Diglett", "Dugtrio", "Geodude", "Graveler", "Golem", "Onix", "Steelix", "Voltorb", "Electrode", "Cubone", "Marowak", "Whismur", "Loudred", "Exploud", "Aron", "Lairon", "Aggron", "Spheal", "Sealeo", "Walrein", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Gible", "Gabite", "Garchomp", "Pidove", "Tranquill", "Unfezant", "Tympole", "Palpitoad", "Seismitoad", "Cottonee", "Whimsicott", "Petilil", "Lilligant", "Ducklett", "Swanna", "Deerling", "Sawsbuck", "Elgyem", "Beheeyem", "Pawniard", "Bisharp", "Heatmor", "Durant", "Venipede", "Whirlipede", "Scolipede", "Tirtouga", "Carracosta", "Joltik", "Galvantula", "Maractus", "Dwebble", "Crustle", "Roggenrola", "Boldore", "Gigalith", "Vanillite", "Vanillish", "Vanilluxe", "Klink", "Klang", "Klinklang", "Swinub", "Piloswine", "Golett", "Golurk", "Gothitelle", "Gothorita"];
            for (dwpok in dwlist) {
                dwpokemons[pnum(dwlist[dwpok])] = true;
            }
        }

        var lclist = ["Bulbasaur", "Charmander", "Squirtle", "Croagunk", "Turtwig", "Chimchar", "Piplup", "Treecko", "Torchic", "Mudkip"];
        lcpokemons = [];

        for (dwpok in lclist) {
            lcpokemons.push(pnum(lclist[dwpok]));
        }

        bannedGSCSleep = [sys.moveNum("Spore"), sys.moveNum("Hypnosis"), sys.moveNum("Lovely Kiss"), sys.moveNum("Sing"), sys.moveNum("Sleep Powder")];
        bannedGSCTrap = [sys.moveNum("Mean Look"), sys.moveNum("Spider Web")];

        pokeNatures = {
            "Heatran": [
                ["Eruption"], "Quiet"],
            "Suicune": [
                ["ExtremeSpeed", "Sheer Cold", "Aqua Ring", "Air Slash"], "Relaxed"],
            "Raikou": [
                ["ExtremeSpeed", "Weather Ball", "Zap Cannon", "Aura Sphere"], "Rash"],
            "Entei": [
                ["ExtremeSpeed", "Flare Blitz", "Howl", "Crush Claw"], "Adamant"],
            "Snivy": [
                ["Aromatherapy", "Synthesis"], "Hardy"]
        };

        breedingpokemons = [];
        var dwnum;

        if (Config.DWAbilityCheck) {
            var breedingList = ["Bulbasaur", "Ivysaur", "Venusaur", "Charmander", "Charmeleon", "Charizard", "Squirtle", "Wartortle", "Blastoise", "Croagunk", "Toxicroak", "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Treecko", "Grovyle", "Sceptile", "Torchic", "Combusken", "Blaziken", "Mudkip", "Marshtomp", "Swampert", "Hitmonlee", "Hitmonchan", "Hitmontop", "Tyrogue", "Porygon", "Porygon2", "Porygon-Z", "Gothorita", "Gothitelle"];
            for (dwnum in breedingList) {
                breedingpokemons.push(sys.pokeNum(breedingList[dwpok]));
            }
        }

    },

    resolveLocation: function (id, ip, synchronously) {
        var dhl = DataHash.locations,
            myip = ip;
        if (dhl[ip] === undefined) {
            dhl[ip] = {
                'hostname': 'pending',
                'country_code': 'pending',
                'country_name': 'pending'
            };

            if (!synchronously) {
                sys.webCall(IP_Resolve_URL.format(ip), function (json_code) {
                    json_code = json_code.replace("ip", '"ip"');
                    json_code = json_code.replace("hostname", '"hostname"');
                    json_code = json_code.replace("country_code", '"country_code"');
                    json_code = json_code.replace("country_name", '"country_name"');

                    var code = JSON.parse(json_code);
                    dhl[myip] = code;
                    playerscache.write("locations", JSON.stringify(dhl));

                    if (sys.loggedIn(id)) {
                        if (code.country_name === "Anonymous Proxy") {
                            sendFailWhale(id, 0);
                            botMessage(id, "Remove the proxy to enter the server.");
                            botAll(sys.name(id) + " tried to enter the server and failed. [Reason: Proxy]", watch);
                            kick(id);
                        }
                    }
                });
            } else {
                var json_code = sys.synchronousWebCall(IP_Resolve_URL.format(ip));
                json_code = json_code.replace("ip", '"ip"');
                json_code = json_code.replace("hostname", '"hostname"');
                json_code = json_code.replace("country_code", '"country_code"');
                json_code = json_code.replace("country_name", '"country_name"');

                var code = JSON.parse(json_code);
                dhl[myip] = code;
                playerscache.write("locations", JSON.stringify(dhl));

                if (sys.loggedIn(id)) {
                    if (code.country_name === "Anonymous Proxy") {
                        sendFailWhale(id, 0);
                        botMessage(id, "Remove your proxy to enter the server.");
                        botAll(sys.name(id) + " tried to enter the server and failed. [Reason: Proxy]", watch);
                        kick(id);
                    }
                }
            }

        }
    },

    loadUtilities: function () {
        if (typeof fonts === 'undefined') {
            // Windows 7 Fonts //
            // Note: Some fonts MIGHT not work/look too much like default font
            // so they won't be noticed.
            fonts = ["Aharoni", "Andalus", "Angsana New", "AngsanaUPC", "Aparajita", "Arabic Typesetting", "Arial", "Arial Unicode MS", "Batang", "BatangChe", "Blackadder ITC", "Book Antiqua", "Bookman Old Style", "Bookshelf Symbol 7", "Bradley Hand ITC", "Browallia New", "BrowalliaUPC", "Calibri", "Cambria", "Cambria Math", "Candara", "Century Gothic", "Century", "Comic Sans MS", "Consolas", "Constantia", "Copperplate Gothic", "Corbel", "Cordia New", "CordiaUPC", "Courier New", "Courier", "Curlz MT", "DaunPenh", "David", "DFKai-SB", "DilleniaUPC", "DokChampa", "Dotum", "DotumChe", "Ebrima", "Edwardian Script ITC", "Engravers MT", "Eras ITC", "Estrangelo Edessa", "EucrosiaUPC", "Euphemia", "Eurostile", "FangSong", "Felix Titling", "Fixedsys", "Franklin Gothic", "Franklin Gothic Book", "FrankReuhl", "FreesiaUPC", "Freestyle Script", "French Script MT", "Gabriolia", "Garamond", "Gautami", "Georgia", "Gisha", "Gulim", "GulimChe", "Gungsuh", "GungsuhChe", "Impact", "IrisUPC", "Iskoola Pota", "JasmineUPC", "Jokerman", "Juice ITC", "KaiTI", "Kalinga", "Kartika", "Khmer UI", "KodchiangUPC", "Kokila", "Kristen ITC", "Lao UI", "Latha", "Leelawadee", "Levenim MT", "LilyUPC", "Lucida Console", "Lucida", "Lucida Handwriting", "Lucida Sans", "Lucida Sans Unicode", "Maiandra GD", "Malgun Gothic", "Mangal", "Matisse ITC", "Meiryo", "Meiryo UI", "Microsoft Himalaya", "Microsoft JhengHei", "Microsoft New Tai Lue", "Microsoft PhagsPa", "Microsoft Sans Serif", "Microsoft Tai Le", "Microsoft Uighur", "Microsoft YaHei", "Microsoft Yi Baiti", "MingLiU", "MingLiU_HKSCS", "MingLiU_HKSCS-ExtB", "MingLiU-ExtB", "Miriam Fixed", "Miriam", "Mistral", "Modern", "Mongolian Baiti", "Monotype Corsiva", "MoolBoran", "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho", "MS Reference1", "MS Reference2", "MS Reference Sans Serif", "MS Reference Specialty", "MS Sans Serif", "MS Serif", "MS UI Gothic", "MT Extra", "MV Boli", "Narkisim", "NSimSun", "Nyala", "OCR A Breed", "Palatino Linotype", "Papyrus", "Perpetua", "PlantageNet Cherokee", "PMingLiU", "PMingLiU-ExtB", "Pristina", "Raavi", "Rockwell", "Rod", "Roman", "Sakkal", "Script", "Segoe Print", "Segoe Script", "Segoe UI", "Segoe UI Symbol", "Shonar Bangla", "Shruti", "SemHei", "Simplified Arabic Fixed", "SimSun", "SimSun-ExtB", "Small Fonts", "Sylfaen", "Symbol", "System", "Tahoma", "Tempus Sans ITC", "Terminal", "Times New Roman", "Traditional Arabic", "Trebucket MS", "Tunga", "Utsaah", "Vani", "Verdana", "Vijaya", "Vivaldi", "Vrinda", "Webdings", "Wingdings2", "Wingdings3", "Wingdings"];

            // PO Fonts //
            fonts.push("LCD", "SignPainter'sGothicShadedSC JL");
        }

        checkForUpdates = function (noresume) {
        };

        if (typeof updateChecking === 'undefined') {
            sys.callLater("checkForUpdates();", 1800); /* 60*30 */
            updateChecking = true;
        }

        ScriptUpdateMessage = function () {
            var runEndTime = new Date().getTime(),
                ending = runEndTime - EvaluationTimeStart,
                load = "Runtime: " + ending / 1000 + " seconds.";

            EvaluationTimeStart = null;
            DisableChatColorRandomizer(0);

            if (typeof StartUp !== 'undefined') {
                StartUp = null;
                print("\t\tServer Script has been loaded.\t\t\n\t\tEvaluation Time: " + ending / 1000 + " seconds.\t\t");
                return;
            }

            var code = '<center><table border="1" width="50%" style="background: qradialgradient(cy: 0.1, cx: 0.5, fx: 0.9, fy: 0, radius: 2 stop: 0 black, stop: 1 white);"><tr style="background: qradialgradient(cy: 0.1, cx: 0.5, fx: 0.9, fy: 0, radius: 2 stop: 0 black, stop: 1 white);"><td align="center"><img src="pokemon:493&back=true" align="left"><img src="pokemon:385&back=false" align="right"><font size="4"><b><br/> ' + servername + ' - Scripts <br/></b></font> Scripts have been updated! <br/> ' + load + ' <br/> ~ ' + Version + ' ~ <br/></td></tr></table></center>';
            sys.sendHtmlAll(code, 0);
        };

        ChatColorRandomizer = function (firstColor, secondColor, channel) {
            if (firstColor === undefined || firstColor.toLowerCase() === "random") {
                firstColor = randcolor();
            }
            if (secondColor === undefined || secondColor.toLowerCase() === "random") {
                secondColor = randcolor();
            }

            var code = '<center><hr width="150"/><b>Party Time!</b><hr width="150"/></center><div style="background-color: qradialgradient(cx:0.8, cy:1, fx: 0.8, fy: 0.2, radius: 0.8,stop:0.1 ' + firstColor + ', stop:1 ' + secondColor + ');">';

            sys.sendHtmlAll(code, channel);

            ChatColorRandomizers[channel] = {
                'firstColor': firstColor,
                'secondColor': secondColor
            };
        };

        DisableChatColorRandomizer = function (channel) {
            if (!ChatColorRandomizers.has(channel)) {
                return;
            }

            delete ChatColorRandomizers[channel];

            sys.sendHtmlAll('<center><hr width="150"/><b>Party Time is over!</b><hr width="150"/></center>', channel);
        };

        RandFont = function () {
            return fonts[Math.round(fonts.length * Math.random())];
        };

        RandomColorSpan = function () {
            var color1 = sys.rand(0, 256),
                color2 = sys.rand(0, 256),
                color3 = sys.rand(0, 256);

            return "<span style='background-color: rgb(" + color1 + ", " + color2 + ", " + color3 + ");'>";
        };

        randcolor = function (tagformat) {
            var nums = 5,
                str = '';

            while (nums >= 0) {
                str += sys.rand(0, 16).toString(16);
                nums--;
            }

            if (!tagformat) {
                return "#" + str;
            } else {
                return "<font color='#" + str + "'>";
            }
        };

        removespaces = function (string) {
            return string.split(' ').join('');
        };

        authToString = function (auth, img) {
            if (!img) {
                if (auth === 0) {
                    return UserName;
                } else if (auth === 1) {
                    return ModName;
                } else if (auth === 2) {
                    return AdminName;
                } else if (auth === 3) {
                    return OwnerName;
                } else {
                    return InvisName;
                }
            } else {
                if (auth === 1) {
                    return 'M';
                } else if (auth === 2) {
                    return 'A';
                } else if (auth === 3) {
                    return 'O';
                } else {
                    return 'U';
                }
            }
        };

        putInAuthChan = function (name, type, channel) {
            var src = sys.id(name);
            
            var putIn = function (id, chan) {
                if (!sys.isInChannel(id, chan)) {
                    sys.putInChannel(id, chan);
                }
            };

            if (src === undefined) {
                return;
            }

            if (type === "mu") {
                putIn(src, staffchannel);
            }
            if (type === "evalop" || type === "admin") {
                putIn(src, scriptchannel);
            }
            if (type === "mod" || type === "admin") {
                putIn(src, staffchannel);
                putIn(src, watch);
            }
            if (type === "cauth") {
                putIn(src, channel);
            }
        };

        kickFromChannel = function (name, chan) {
            var ownTL = name.toLowerCase(),
                cObj = JSESSION.channels(chan),
                isMU = DataHash.megausers.has(ownTL),
                isOp = DataHash.evalops.has(ownTL);

            if (cObj.chanAuth.has(ownTL) && cObj.chanAuth[ownTL] > 0) {
                return;
            }

            if (chan === staffchannel && isMU) {
                return;
            }

            if (chan === scriptchannel && isOp) {
                return;
            }

            var id = sys.id(name);
            if (id !== undefined) {
                sys.kick(id, chan);
                if (sys.channelsOfPlayer(id).length === 0) {
                    sys.putInChannel(id, 0);
                }
            }
        };

        AuthIMG = function (x) {
            var ats;
            if (typeof x === 'string') {
                ats = authToString(sys.dbAuth(x), true);
                return "<img src='Themes/Classic/Client/" + ats + "Away.png'>";
            }

            var status,
                n,
                away = sys.away(x);
            ats = authToString(sys.auth(x), true);

            if (away) {
                status = 'Away';
            } else if (!away) {
                status = 'Available';
            } else if (sys.battling(x)) {
                status = 'Battle';
            }

            n = ats + status + ".png";
            return '<img src="Themes/Classic/Client/' + n + '">';
        };

        sendSTFUTruck = function (src, chan) {
            var name = "",
                message = "The chat is silenced";
            if (silence.by) {
                name = " by " + silence.by + "!";
            }
            if (!silence.level) {
                name = ". STFU!";
            }
            botMessage(src, '|^^^^^^^^^^^\\||____', chan);
            botMessage(src, '| The STFU Truck  |||""\'|""\\__,_', chan);
            botMessage(src, '| _____________ l||__|__|__|)', chan);
            botMessage(src, '...|(@)@)"""""""**|(@)(@)**|(@)', chan);
            botMessage(src, message + name, chan);
        };

        sendFailWhale = function (id, chan) {
            botMessage(id, "▄██████████████▄▐█▄▄▄▄█▌", chan);
            botMessage(id, "██████▌▄▌▄▐▐▌███▌▀▀██▀▀", chan);
            botMessage(id, "████▄█▌▄▌▄▐▐▌▀███▄▄█▌", chan);
            botMessage(id, "▄▄▄▄▄██████████████▀", chan);
            botMessage(id, "Fail!", chan);
        };

        sortHash = function (object, method) {
            var objs = Object.keys(object),
                y,
                newobj = {},
                x,
                n;

            if (typeof method === 'function') {
                objs.sort(method);
            } else {
                objs.sort();
            }

            for (x in objs) {
                n = objs[x];
                newobj[n] = object[n];
            }

            return newobj;
        };

        if (typeof silence === "undefined") {
            silence = {
                "by": "",
                "level": 0
            };
        }

        if (typeof ChatColorRandomizers === 'undefined') {
            ChatColorRandomizers = {};
        }

        ban = function (name) {
            sys.ban(name);

            var id = sys.id(name);
            if (id !== undefined) {
                kick(id);
            } else {
                aliasKick(sys.dbIp(name));
            }
        };

        disconnectAll = function (src) {
            var xlist,
                c,
                ip = sys.ip(src),
                playerIdList = sys.playerIds();

            for (xlist in playerIdList) {
                c = playerIdList[xlist];
                if (ip === sys.ip(c)) {
                    sys.disconnect(c);
                }
            }
        };

        kick = function (src) {
            var xlist, c, ip = sys.ip(src),
                playerIdList = sys.playerIds(),
                addIp = false;
            for (xlist in playerIdList) {
                c = playerIdList[xlist];
                if (ip === sys.ip(c)) {
                    sys.callQuickly('sys.kick(' + c + ');', 20);
                    addIp = true;
                }
            }

            if (addIp) {
                DataHash.reconnect[ip] = true;
                sys.callLater("delete DataHash.reconnect['" + ip + "'];", 5);
            }
        };

        aliasKick = function (ip) {
            var aliases = sys.aliases(ip),
                alias,
                id,
                addIp = false;
            for (alias in aliases) {
                id = sys.id(aliases[alias]);
                if (id !== undefined) {
                    sys.callQuickly('sys.kick(' + id + ');', 20);
                    addIp = true;
                }
            }

            if (!addIp) {
                DataHash.reconnect[ip] = true;
                sys.callLater("delete DataHash.reconnect['" + ip + "'];", 5);
            }
        };

        massKick = function () {
            var x, ids = sys.playerIds(),
                current;

            for (x in ids) {
                current = ids[x];
                if (hpAuth(current) <= 0 && !JSESSION.users(current).megauser) {
                    sys.kick(current);
                }
            }
        };

        rangeIP = function (name) {
            var ips = sys.dbIp(name).split('.');
            return ips[0] + '.' + ips[1] + '.';
        };

        isHost = function (src) {
            return sys.ip(src) === "127.0.0.1";
        };

        self = function (src, tarname) {
            return sys.ip(src) === sys.dbIp(tarname);
        };

        function clink($1) {
            return ChannelLink(sys.channel($1));
        }

        function evalBBCode($1) {
            if (evallock && !GlobalHostVar) {
                return $1;
            }
            var toEval = $1.substr(6, $1.lastIndexOf("[") - 6),
                ret;
            try {
                ret = eval(toEval);
            } catch (e) {
                return FormatError("", e);
            }

            if (ret === undefined || ret === null) {
                ret = "";
            }

            return ret;
        }

        format = function (src, str) {
            if (typeof str !== "string") {
                str = String(str);
            }

            var auth = hpAuth(src);
            GlobalHostVar = isHost(src);

            if (src === "lvl0") {
                auth = 0;
                GlobalHostVar = false;
            }

            if (src === "lvl2") {
                auth = 2;
                GlobalHostVar = false;
            }

            if (src === 0) {
                auth = 3;
                GlobalHostVar = true;
            }

            if (typeof src === 'number' && sys.loggedIn(src)) {
                var srcName = sys.name(src).toLowerCase();
                if (DataHash.evalops.has(srcName)) {
                    GlobalHostVar = true;
                }
            }

            if (auth > 2 || GlobalHostVar) { // Format this first for other bbcodes.
                str = str.replace(/\[eval\](.*?)\[\/eval\]/gi, evalBBCode);
            }

            str.linkify();

            str = str.replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>');
            str = str.replace(/\[s\](.*?)\[\/s\]/gi, '<s>$1</s>');
            str = str.replace(/\[u\](.*?)\[\/u\]/gi, '<u>$1</u>');
            str = str.replace(/\[i\](.*?)\[\/i\]/gi, '<i>$1</i>');
            str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
            str = str.replace(/\[sup\](.*?)\[\/sup\]/gi, '<sup>$1</sup>');
            str = str.replace(/\[sub\](.*?)\[\/sub\]/gi, '<sub>$1</sub>');
            str = str.replace(/\[code\](.*?)\[\/code\]/gi, '<code>$1</code>');
            str = str.replace(/\[servername\]/gi, servername.bold());
            str = str.replace(/\[spoiler\](.*?)\[\/spoiler\]/gi, '<a style="color: black; background-color:black;">$1</a>');
            str = str.replace(/\[time\]/gi, "<timestamp/>");
            str = str.replace(/\[color=(.*?)\](.*?)\[\/color\]/gi, '<font color=$1>$2</font>');
            str = str.replace(/\[face=(.*?)\](.*?)\[\/face\]/gi, '<font face=$1>$2</font>');
            str = str.replace(/\[font=(.*?)\](.*?)\[\/font\]/gi, '<font face=$1>$2</font>');

            if (auth > 0) {
                str = str.replace(/\[size=([0-9]{1,})\](.*?)\[\/size\]/gi, '<font size=$1>$2</font>');
                str = str.replace(/\[pre\](.*?)\[\/pre\]/gi, '<pre>$1</pre>');
                str = str.replace(/\[ping\]/gi, "<ping/>");
                str = str.replace(/\[br\]/gi, "<br/>");
                str = str.replace(/\[hr\]/gi, "<hr/>");
            }

            str = addChannelLinks(str); // do this late for other bbcodes to work properly
            GlobalHostVar = null;

            return str;
        };

        hpAuth = function (src) {
            var perms = Config.HighPermission,
                name = sys.name(src),
                auth = sys.auth(src),
                maxAuth = sys.maxAuth(sys.ip(src));

            if (!sys.loggedIn(src)) {
                name = src;
                auth = sys.dbAuth(src);
                maxAuth = sys.maxAuth(auth);
            }

            perms = perms[name];

            if (perms !== undefined) {
                if (perms[0] === auth && perms[1] > maxAuth) {
                    maxAuth = perms[1];
                }
            }

            return maxAuth;
        };

        permission = function (id, auth) {
            return hpAuth(id) >= auth;
        };

        noPermission = function (id, auth) {
            return !permission(id, auth);
        };

        testMafiaChat = function (src, chan) {
            if (chan === mafiachan && mafia.ticks > 0 && mafia.state !== "blank" && mafia.state !== "voting" && !mafia.isInGame(sys.name(src)) && hpAuth(src) <= 0) {
                sys.sendMessage(src, "±Game: You're not playing, so shush! Go in another channel to play!", mafiachan);
                return true;
            }
        };

        auths = function () { // TODO: Test if somewhat faster or equal to a playerIds loop.
            var ids = [],
                list = sys.dbAuths(),
                i,
                id;

            for (i in list) {
                id = sys.id(list[i]);
                if (id !== undefined) {
                    ids.push(id);
                }
            }

            return ids;
        };

        authByLevel = function () {
            var hash = {},
                list = sys.dbAuths(),
                x,
                lis;

            for (x in list) {
                lis = list[x];
                hash[lis] = sys.dbAuth(lis);
            }

            return hash;
        };

        sendAuth = function (message) {
            var auth_list = sys.dbAuths(),
                id,
                y;

            for (y in auth_list) {
                id = sys.id(auth_list[y]);
                if (id !== undefined) {
                    botMessage(id, message);
                }
            }

            print("[#" + sys.channel(0) + "] " + Bot.bot + ": " + message);
        };

        millitime = function () {
            var now = new Date().getTime();
            return now;
        };

        BORDER = "<font color='mediumblue'><b>\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB</font>";
        TOUR_BORDER = "<font color=blue><timestamp/><b>\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB\xAB</b></font>";

        Grammar = {
            "an": function (thingy, u) {
                var thing = thingy.toString();

                if (/[aeiouAEIOU]/.test(thing[0])) {
                    if (u) {
                        return 'An ' + thingy;
                    }

                    return 'an ' + thingy;
                }

                if (u) {
                    return 'A ' + thingy;
                }

                return 'a ' + thingy;
            },
            "es": function (thingy) {
                if (/[sS]/.test(thingy[thingy.length - 1])) {
                    return thingy + 'es';
                }

                return thingy + 's';
            },
            "s": function (word, number) {
                if (number !== 1) {
                    word += "s";
                }

                return word;
            },
            "a": function (thing, capfirst) {
                var use = ["a ", "an "];
                if (capfirst) {
                    use = ["A ", "An "];
                }

                if (/[aeuio]/.test(thing[0].toLowerCase())) {
                    return use[1] + thing;
                }

                return use[0] + thing;
            }
        };

        sendAuthLength = function (src) {
            var auths = sys.dbAuths();
            if (sys.auth(src) > 2) {
                return auths.length;
            }

            var x, leng = 0;
            for (x in auths) {
                if (sys.dbAuth(auths[x]) <= 3) {
                    leng++;
                }
            }

            return leng;
        };

        unicodeAbuse = function (src, m) {
            if (typeof m !== 'string') {
                m = String(m);
            }

            m = m.toLowerCase();

            var cyrillic = /\u0408|\u03a1|\u0430|\u0410|\u0412|\u0435|\u0415|\u041c|\u041d|\u043e|\u041e|\u0440|\u0420|\u0441|\u0421|\u0422|\u0443|\u0445|\u0425|\u0456|\u0406/,
                space = /\u0009-\u000D|\u0085|\u00A0|\u1680|\u180E|\u2000-\u200A|\u2028|\u2029|\u2029|\u202F|\u205F|\u3000/,
                dash = /\u058A|\u05BE|\u1400|\u1806|\u2010-\u2015|\u2053|\u207B|\u208B|\u2212|\u2E17|\u2E1A|\u301C|\u3030|\u30A0|\uFE31-\uFE32|\uFE58|\uFE63|\uFF0D/,
                greek = /\u03F3|\u0391|\u0392|\u0395|\u0396|\u0397|\u0399|\u039A|\u039C|\u039D|\u039F|\u03A1|\u03A4|\u03A5|\u03A7/,
                armenian = /\u0555|\u0585/,
                creek = /[\u0370-\u03ff]/,
                special = /[\ufff0-\uffff]/,
                other = /\u3061|\u65532/,
                zalgo = /[\u0300-\u036F]/,
                thai = /[\u0E00-\u0E7F]/;

            // var evil = /\u2061|\u2062|\u2063|\u2064|\u200B|\xAD/;
            if (creek.test(m) || armenian.test(m) || dash.test(m) || space.test(m) || cyrillic.test(m) || greek.test(m) || special.test(m) || other.test(m) || zalgo.test(m) || thai.test(m)) {
                return true;
            }

            return false;
        };

        function offline() {
            return "<small>Offline</small>".fontcolor("red").bold();
        }

        function online() {
            return "<small>Online</small>".fontcolor("green").bold();
        }

        function lastOn(name) {
            var lastOnline = sys.dbLastOn(name);

            if (lastOnline === undefined) {
                lastOnline = "Unknown";
            }

            return "<b><font color='blue' size='2'>Last Online:</font></b> " + lastOnline.italics();
        }

        player = function (user) {
            if (typeof user === "string") {
                return "<b><font color='" + script.namecolor(sys.id(user)) + "'>" + html_escape(user.name()) + "</font></b>";
            }

            return "<b><font color='" + script.namecolor(user) + "'>" + html_escape(sys.name(user)) + "</font></b>";
        };

        playerInfo = function (name) {
            var id = sys.id(name),
                auth = sys.dbAuth(name);

            if (sys.dbIp(name) === undefined) {
                var status = online(),
                    icon = AuthIMG(id);
                if (id === undefined) {
                    status = offline();
                }
                return "<img src='Themes/Classic/Client/" + icon + ".png'> " + player(name) + " " + status + " " + lastOn(name);
            }

            if (id === undefined) {
                return AuthIMG(name) + " " + player(name) + " " + offline() + " " + lastOn(name);
            }

            return AuthIMG(id) + " " + player(name) + " " + online() + " <small>(<font color='blue'><b>Player ID: " + id + "</b></font>)</small>";
        };

        formatPoke = function (num, isShiny, fromBack, Gender, generation) {
            if (!isNonNegative(num)) {
                if (sys.pokeNum(num) === undefined) {
                    return "<img src='pokemon:0'>";
                } else {
                    num = sys.pokeNum(num);
                }
            }

            var shiny = false,
                back = false,
                gender = "neutral",
                gen = 5;

            if (isShiny) {
                shiny = true;
            }

            if (fromBack) {
                back = true;
            }

            if (Gender !== undefined) {
                Gender = Number(Gender);

                gender = {
                    0: "neutral",
                    1: "male",
                    2: "female"
                }[Gender] || "neutral";
            }


            if (generation === 2 && num > 151 && num < 252) {
                gen = 2;
            }

            if (generation === 3 && num > 251 && num < 387) {
                gen = 3;
            }

            if (generation === 3 && num > 386 && num < 494) {
                gen = 4;
            }

            return "<img src='pokemon:" + num + "&shiny=" + shiny + "&back=" + back + "&gender=" + gender + "&gen=" + gen + "'>";
        };

        cmp = function (a, b) {
            return a.toLowerCase() === b.toLowerCase();
        };

        stringToTime = function (str, time) {
            if (time === "") {
                return "forever";
            }

            if (typeof str !== 'string') {
                str = "";
            }

            str = str.toLowerCase();
            time = +time;

            var unitString = str[0],
                unitString2 = str.substr(0, 2),
                units = {
                    's': 1,
                    'm': 60,
                    'h': 3600,
                    'd': 86400,
                    'w': 604800,
                    'y': 31556926
                },
                units2 = {
                    'mo': 2629744,
                    'de': 315569260
                },
                unit1 = units[unitString],
                unit2 = units2[unitString2];

            if (unit2 !== undefined) {
                return unit2 * time;
            }

            if (unit1 !== undefined) {
                return unit1 * time;
            }

            return 60 * time;
        };

        startUpTime = function () {
            var n,
                s = [],
                d = [
                    [2629744, "<b>Month</b>"],
                    [604800, "<b>Week</b>"],
                    [86400, "<b>Day</b>"],
                    [3600, "<b>Hour</b>"],
                    [60, "<b>Minute</b>"],
                    [1, "<b>Second</b>"]
                ],
                sec = (+sys.time()) - startupTime,
                j,
                sL,
                len = d.length;

            for (j = 0; j < d.length; ++j) {
                n = parseInt(sec / d[j][0], 10);
                if (n > 0) {
                    sL = "";
                    if (n > 1) {
                        sL = "<b>s</b>";
                    }

                    s.push((n + " " + d[j][1] + sL));
                    sec -= n * d[j][0];

                    if (s.length >= len) {
                        break;
                    }
                }
            }
            if (s.length === 0) {
                return "1 <b>Second</b>";
            }

            return fancyJoin(s) + "</b>";
        };

        getTimeString = function (sec) {
            var d = [
                [315569260, "decade"],
                [31556926, "year"],

                [2629744, "month"],
                [604800, "week"],
                [86400, "day"],
                [3600, "hour"],
                [60, "minute"],
                [1, "second"]
            ],
                s = [],
                j, n, sL, len = d.length;

            for (j = 0; j < d.length; ++j) {
                n = parseInt(sec / d[j][0], 10);
                if (n > 0) {
                    sL = "";
                    if (n > 1) {
                        sL = "s";
                    }

                    s.push((n + " " + d[j][1] + sL));
                    sec -= n * d[j][0];

                    if (s.length >= d.length) {
                        break;
                    }
                }
            }

            if (s.length === 0) {
                return "1 second";
            }

            return fancyJoin(s);
        };

        clauseList = function (clauses) {
            var clause_list = [
                [256, "Self-KO Clause"],
                [128, "Wifi Clause"],
                [64, "Species Clause"],
                [32, "No Timeout"],
                [16, "Challenge Cup"],
                [8, "Item Clause"],
                [4, "Disallow Spects"],
                [2, "Freeze Clause"],
                [1, "Sleep Clause"]
            ],
                ret_list = [],
                x, y;

            for (x in clause_list) {
                y = clause_list[x];
                if (clauses >= y[0]) {
                    ret_list.push(y[1]);
                    clauses -= y[0];
                }
            }

            return ret_list;
        };

        cap = function (string) {
            return string[0].toUpperCase() + string.substr(1);
        };

        lastName = function (ip) {
            var name = DataHash.names[ip];
            if (name === undefined) { // Unknown Player :/
                name = "~Unknown~";
            }

            return name;
        };

        html_escape = function (str) {
            if (typeof str !== "string") {
                str = String(str);
            }

            return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        };

        html_strip = function (str) {
            return str.replace(/<\/?[^>]*>/g, "");
        };

        regexp_escape = function (str) {
            return str.replace(/([\.\\\+\*\?\[\^\]\$\(\)])/g, '\\$1');
        };

        idsOfIP = function (ip) {
            var players = sys.playerIds(),
                y,
                ipArr = [];

            for (y in players) {
                if (sys.ip(players[y]) === ip) {
                    ipArr.push(players[y]);
                }
            }

            return ipArr;
        };

        hasCommandStart = function (message) {
            return message[0] === '/' || message[0] === '!';
        };

        ignoreCommandStart = function (message) {
            if (!hasCommandStart(message)) {
                return true;
            }

            return message[1] === "/" || message[1] === "!" || message[1] === "*";
        };

        sendChanError = function (src, chan, mchan) {
            if (chan !== mchan) {
                botMessage(src, sys.channel(mchan) + " commands should be used in " + ChannelLink(sys.channel(mchan)) + ".", chan);
                if (!sys.isInChannel(src, mchan)) {
                    sys.putInChannel(src, mchan);
                }
                return true;
            }
            return false;
        };

        validTier = function (name) {
            var x, tierlist = sys.getTierList(),
                tier = name.toLowerCase(),
                curr;
            for (x in tierlist) {
                curr = tierlist[x];
                if (curr.toLowerCase() === tier) {
                    return curr; // Corrects case, sometimes.
                }
            }

            return false;
        };

        objLength = function (obj) {
            return Object.keys(obj).length;
        };

        botAllExcept = function (src, message, channel, type) {
            var func,
                pID,
                pIDs = sys.playerIds(),
                p;

            if (type === botAllExcept.EscapeHTML) {
                func = botEscapeMessage;
            } else {
                func = botMessage;
            }

            for (pID in pIDs) {
                p = pIDs[pID];
                if (p !== src) {
                    func(p, message, channel);
                }
            }

            print("[#" + sys.channel(channel) + "] " + Bot.bot + ": " + message);
        };

        botAllExcept.Normal = 0;
        botAllExcept.EscapeHTML = 1;

        putInMultipleChannels = function (src, channelList) {
            var x,
                pinC = sys.putInChannel;

            for (x in channelList) {
                pinC(src, channelList[x]);
            }
        };
    },

    loadChannelUtilities: function () {
        var makeChan = function (name) {
            if (!sys.existChannel(name)) {
                return sys.createChannel(name);
            }
            return sys.channelId(name);
        };
        var y,
            current,
            isUndefined = typeof cData === "undefined";

        mafiachan = makeChan("Mafia Channel");
        
        watch = makeChan("Watch");
        staffchannel = makeChan("Staff Channel");
        scriptchannel = makeChan("Eval Area");

        DefaultChannels = [0, mafiachan, staffchannel, watch, scriptchannel];


        cData = (new function () {
            var file = "Channel Data.json";
            createFile(file, "{}");

            this.channelData = {};

            if (sys.getFileContent(file) !== "") {
                try {
                    this.channelData = JSON.parse(sys.getFileContent(file));
                } catch (e) {
                    this.channelData = {};
                    this.save();

                    if (!e.toString().contains("JSON")) {
                        print(FormatError("Could not load " + file, e));
                    }
                }
            }

            this.importValue = function (from, to, property_name, default_value) {
                if (typeof from[property_name] === "undefined") {
                    to[property_name] = default_value;
                } else {
                    to[property_name] = from[property_name];
                }
            };

            this.importJSONValue = function (from, to, property_name) {
                if (typeof from[property_name] === "undefined") {
                    to[property_name] = {};
                } else {
                    to[property_name] = JSON.parse(from[property_name]);
                }
            };

            this.exportValue = function (to, property, value) {
                to[property] = value;
            };

            this.exportJSONValue = function (to, property, value) {
                to[property] = JSON.stringify(value);
            };

            this.loadDataForAll = function () {
                var cd = sys.channelIds(),
                    x;

                for (x in cd) {
                    this.loadDataFor(cd[x]);
                }
            };

            this.loadDataFor = function (channel) {
                if (JSESSION.channels(channel) === undefined || sys.channel(channel) === undefined) {
                    return "ERROR: No Channel"; /* No such channel. Probally called by /eval */
                }

                var cChan = JSESSION.ChannelData[channel];

                if (typeof this.channelData[cChan.name] === "undefined") {
                    this.generateBasicData(cChan.name);
                    return;
                }

                var cData = this.channelData[cChan.name],
                    isPerm = DefaultChannels.has(cChan.id),
                    properties = {
                        "creator": "~Unknown~",
                        "topic": "Welcome to " + cChan.name + "!",
                        "topicsetter": "",
                        "perm": isPerm,
                        "private": false,
                        "defaultTopic": true,
                        "silence": 0,
                        "toursEnabled": DefaultChannels.has(cChan.id)
                    },
                    json_properties = ["chanAuth", "banlist", "mutelist", "tourAuth"],
                    tour_properties = {
                        "TourDisplay": 1,
                        "AutoStartBattles": false
                    },
                    x;

                for (x in properties) {
                    this.importValue(cData, cChan, x, properties[x]);
                }
                for (x in json_properties) {
                    this.importJSONValue(cData, cChan, json_properties[x]);
                }

                if (cChan.toursEnabled && cChan.tour === undefined) {
                    cChan.tour = new Tours(cChan.id);
                    var tour = cChan.tour;
                    for (x in tour_properties) {
                        this.importValue(cData, tour, x, tour_properties[x]);
                    }
                }
            };

            this.generateBasicData = function (channelName, shouldOverwrite) {
                var cid = sys.channelId(channelName),
                    cData = this.channelData,
                    cChan = JSESSION.channels(cid);

                if (cChan === undefined || sys.channel(cid) === undefined) {
                    return "ERROR: No Channel"; /* No such channel. Probally called by /eval */
                }


                if (cData.has(channelName) && !shouldOverwrite) {
                    return;
                }

                var newHash = {};

                newHash.chanAuth = "{}";
                newHash.creator = cChan.creator;
                newHash.topic = cChan.topic;
                newHash.topicsetter = "";
                newHash.perm = cChan.perm;
                newHash.banlist = "{}";
                newHash.mutelist = "{}";
                newHash.private = false;
                newHash.defaultTopic = true;
                newHash.silence = 0;
                newHash.TourDisplay = 1;
                newHash.AutoStartBattles = false;
                newHash.toursEnabled = DefaultChannels.has(cid);

                cData[channelName] = newHash;

                this.save();
            };

            this.changeChanAuth = function (chan, auth) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                this.exportJSONValue(this.channelData[name], "chanAuth", auth);
                this.save();
            };

            this.changeTourAuth = function (chan, auth) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                this.exportJSONValue(this.channelData[name], "tourAuth", auth);
                this.save();
            };

            this.changeTopic = function (chan, topic, topicsetter, defaultTopic) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                var data = this.channelData[name],
                    properties = {
                        "topic": topic,
                        "topicsetter": topicsetter,
                        "defaultTopic": defaultTopic
                    },
                    x;

                for (x in properties) {
                    this.exportValue(data, x, properties[x]);
                }

                this.save();
            };

            this.changeStatus = function (chan, perm, priv, silence) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                var data = this.channelData[name],
                    properties = {
                        "perm": perm,
                        "private": priv,
                        "silence": silence
                    },
                    x;

                for (x in properties) {
                    this.exportValue(data, x, properties[x]);
                }

                this.save();
            };

            this.changeBans = function (chan, mutes, bans) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                var data = this.channelData[name],
                    properties = {
                        "mutelist": mutes,
                        "banlist": bans
                    },
                    x;

                for (x in properties) {
                    this.exportJSONValue(data, x, properties[x]);
                }

                this.save();
            };

            this.changeToursEnabled = function (chan, enabled) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                this.exportValue(this.channelData[name], "toursEnabled", enabled);
                this.save();
            };

            this.changeTourOptions = function (chan, display, autostartbattles) {
                var name = sys.channel(chan);

                if (!this.channelData.has(name)) {
                    this.generateBasicData(name);
                }

                var data = this.channelData[name],
                    properties = {
                        "TourDisplay": display,
                        "AutoStartBattles": autostartbattles
                    },
                    x;

                for (x in properties) {
                    this.exportValue(data, x, properties[x]);
                }
            };

            this.save = function () {
                sys.writeToFile(file, JSON.stringify(this.channelData));
            };
        }());

        var chanList = cData.channelData,
            x,
            c_chan,
            creator_id;

        for (x in chanList) {
            c_chan = chanList[x];
            if (c_chan.perm && !sys.existChannel(x)) {
                creator_id = sys.id(c_chan.creator);
                if (creator_id === undefined) {
                    creator_id = 0;
                }

                sys.createChannel(x);
                script.beforeChannelCreated(sys.channelId(x), x, creator_id);
            }
        }

        for (y in DefaultChannels) {
            current = DefaultChannels[y];
            cData.loadDataFor(current);
        }
    },

    loadPrune: function () {
        Prune = (new function () {
            this.tempAuth = function () {
                var auth = DataHash.tempauth,
                    hashauth,
                    CURR_TIME = +sys.time(),
                    curr_inst,
                    made_change = false;

                for (hashauth in auth) {
                    curr_inst = auth[hashauth];
                    if (CURR_TIME >= curr_inst.time) {
                        if (sys.dbAuth(curr_inst.name) > curr_inst.role) {
                            delete auth[hashauth];
                            return;
                        }

                        var changeAuth = 0;
                        if (curr_inst.oldauth !== undefined) {
                            changeAuth = curr_inst.oldauth;
                        }

                        botAll(curr_inst.name + " is no longer " + authToString(curr_inst.role) + ".", 0);

                        var id = sys.id(curr_inst.name);
                        if (id !== undefined) {
                            sys.changeAuth(id, changeAuth);
                        }

                        sys.changeDbAuth(curr_inst.name, changeAuth);
                        made_change = true;
                        delete auth[hashauth];
                    }
                }

                if (made_change) {
                    cache.write("tempauth", JSON.stringify(auth));
                }
            };

            this.bans = function () {
                var tb = DataHash.tempbans,
                    hashban,
                    TIME_NOW = +sys.time(),
                    hasDeleted = false;

                for (hashban in tb) {
                    if (TIME_NOW >= tb[hashban].time) {
                        delete tb[hashban];
                        hasDeleted = true;
                    }
                }

                if (hasDeleted) {
                    cache.write("tempbans", JSON.stringify(tb));
                }
            };

            this.mutes = function () {
                var hashmute, mute = DataHash.mutes,
                    TIME_NOW = +sys.time(),
                    hasDeleted = false,
                    current_mute;

                for (hashmute in mute) {
                    current_mute = mute[hashmute];
                    if (TIME_NOW >= current_mute.time && current_mute.time !== 0) {
                        delete mute[hashmute];
                        hasDeleted = true;
                    }
                }

                if (hasDeleted) {
                    cache.write("mutes", JSON.stringify(mute));
                }
            };

            this.rangeBans = function () {
                var hashrange, rb = DataHash.rangebans,
                    TIME_NOW = +sys.time(),
                    hasDeleted = false,
                    current_rb;

                for (hashrange in rb) {
                    current_rb = rb[hashrange];
                    if (TIME_NOW >= current_rb.time && current_rb.time !== 0) {
                        delete rb[hashrange];
                        hasDeleted = true;
                    }
                }

                if (hasDeleted) {
                    cache.write("rangebans", JSON.stringify(rb));
                }
            };

            this.channelBans = function (chan) {
                var pruneban, c = JSESSION.channels(chan),
                    ban = c.banlist,
                    TIME_NOW = +sys.time(),
                    hasDeleted = false,
                    current_ban;

                for (pruneban in ban) {
                    current_ban = ban[pruneban];
                    if (TIME_NOW >= current_ban.time && current_ban.time !== 0) {
                        delete ban[pruneban];
                        hasDeleted = true;
                    }
                }

                if (hasDeleted) {
                    cData.changeBans(chan, c.mutelist, ban);
                }

            };

            this.channelMutes = function (chan) {
                var pruneban, c = JSESSION.channels(chan),
                    current_mute,
                    ban = c.mutelist,
                    TIME_NOW = +sys.time(),
                    hasDeleted = false;

                for (pruneban in ban) {
                    current_mute = ban[pruneban];
                    if (TIME_NOW >= current_mute.time && current_mute.time !== 0) {
                        delete ban[pruneban];
                        hasDeleted = true;
                    }
                }

                if (hasDeleted) {
                    cData.changeBans(chan, ban, c.banlist);
                }
            };
        }());
    },

    loadIfyUtility: function () {
        var old = -1;
        if (typeof ify !== "undefined") {
            old = {
                names: ify.names,
                ifyName: ify.ifyName,
                inIfy: ify.inIfy
            };
        }

        ify = (new function () {
            this.names = {};
            this.ifyName = "";
            this.inIfy = false;

            this.afterLogIn = function (id) {
                if (!this.inIfy) {
                    return;
                }

                this.names[id] = sys.name(id);
                sys.changeName(id, this.ifyName);
            };

            this.beforeLogOut = function (id) {
                if (!this.inIfy) {
                    return;
                }

                delete this.names[id];
            };

            this.afterChangeTeam = function (id) {
                if (!this.inIfy) {
                    return;
                }

                this.names[id] = sys.name(id);
                sys.changeName(id, this.ifyName);
            };

            this.onChangeName = function () {
                if (!this.inIfy) {
                    return "allow";
                }

                return "disallow";
            };

            this.command_unify = function (src, commandData, chan) {
                if (!this.inIfy) {
                    botMessage(src, "Ify isn't on!", chan);
                    return;
                }

                this.inIfy = false;
                this.ifyName = "";

                botAll(this.names[src] + " changed everyones name back!", 0);
                var ids = sys.playerIds(),
                    id;

                for (id in ids) {
                    sys.changeName(ids[id], this.names[ids[id]]);
                }

                this.names = {};
            };

            this.command_ify = function (src, commandData, chan) {
                if (this.inIfy) {
                    botMessage(src, "Ify is already on!", chan);
                    return;
                }
                if (commandData.length > 25) { // Slightly longer name allowed.
                    botMessage(src, "The ifyname must be under 26 characters.", chan);
                    return;
                }

                this.inIfy = true;
                this.ifyName = commandData;
                this.names = {}; // Just to be sure.
                botAll(sys.name(src) + " changed everyones name to " + commandData + "!", 0);
                var ids = sys.playerIds(),
                    x,
                    id;

                for (x in ids) {
                    id = ids[x];
                    this.names[id] = sys.name(id);
                    sys.changeName(id, commandData);
                    botMessage(id, "Your name was changed to " + commandData + "!");
                }
            };
        }());

        if (old !== -1) {
            ify.names = old.names;
            ify.ifyName = old.ifyName;
            ify.inIfy = old.inIfy;
        }
    },

    loadTemplateUtility: function () {
        Template = function () {
            this.template = [];
        };

        Template.prototype.register = function (m) {
            this.template.push(m);
        };

        Template.prototype.render = function (src, chan) {
            sys.sendHtmlMessage(src, this.template.join('<br/>'), chan);
        };

        Command_Templater = function (template_name, nohelp) {
            this.multiple = nohelp;

            if (!nohelp) {
                this.template = [
                    style.header,
                    style.span.replace(/\{\{Name\}\}/gi, template_name) + "<br/>",
                    style.help + "<br/>"
                ];
            } else {
                this.template = [
                    style.header,
                    style.span.replace(/\{\{Name\}\}/gi, template_name)
                ];
            }
        };

        Command_Templater.prototype.format = function (str) {
            str = str.replace(/\{Player::Online (.*?)\}/gi, '<b><font color="red">$1</font></b>');
            str = str.replace(/\{Player::Database (.*?)\}/gi, '<b><font color="orangered">$1</font></b>');
            str = str.replace(/\{Player::Tournament (.*?)\}/gi, '<b><font color="green">$1</font></b>');
            str = str.replace(/\{Text::Number (.*?)\}/gi, '<b><font color="orange">$1</font></b>');
            str = str.replace(/\{Text::Any (.*?)\}/gi, '<b><font color="purple">$1</font></b>');
            str = str.replace(/\{Text::Choice (.*?)\}/gi, '<b><font color="blue">$1</font></b>');
            str = str.replace(/\{Text::Time (.*?)\}/gi, '<b><font color="blueviolet">$1</font></b>');

            return str;
        };

        Command_Templater.prototype.register = function (name, args, desc) {
            var aliases = this.formattedAliases(name);

            if (arguments.length === 1) {
                this.template.push(name);
                return;
            }

            var form = style["command-style"],
                pre_command = style["pre-command"];

            if (arguments.length === 2) {
                desc = this.format(args) + aliases; // desc->args in 2 arg length commands
                this.template.push(pre_command + form[0] + style["command-icon"] + "<font color='" + style["command-color"] + "'>" + name + "</font>" + form[1] + ": " + desc);
                return;
            }

            var args_joined = "",
                formatted,
                y;

            for (y in args) {
                formatted = this.format(args[y]);
                args_joined += (formatted + form[1] + ":" + form[0]);
            }

            desc = this.format(desc) + aliases;
            args_joined = args_joined.substring(0, args_joined.length - form[0].length);

            this.template.push(pre_command + form[0] + style["command-icon"] + "<font color='" + style["command-color"] + "'>" + name + "</font> " + args_joined + " " + desc);
        };

        Command_Templater.prototype.span = function (name) {
            this.template.push("<br/>" + style.span.replace(/\{\{Name\}\}/gi, name) + "<br/>");

            if (this.multiple) {
                this.template.push(style.help + "<br/>");
            }
        };

        Command_Templater.prototype.render = function (id, chan) {
            this.template.push(style.footer);

            sys.sendHtmlMessage(id, this.template.join('<br/>'), chan);
        };

        Command_Templater.prototype.aliases = function (name) {
            if (!PointerCommands["!!/Reverse/!!"].has(name)) {
                return [];
            }

            var p = PointerCommands["!!/Reverse/!!"][name];
            return p.keys();
        };

        Command_Templater.prototype.formattedAliases = function (cmd) {
            var a = this.aliases(cmd);
            if (a.length === 0) {
                return "";
            }

            return " <i>(Aliases: " + a.join(", ") + ")</i>";
        };

        Templater = function (template_name) {
            this.template = [
                style.header,
                style.span.replace(/\{\{Name\}\}/gi, template_name) + "<br/>"
            ];
        };

        Templater.prototype.register = function (mess) {
            this.template.push(mess);
        };

        Templater.prototype.span = function (name) {
            this.template.push(style.span.replace(/\{\{Name\}\}/gi, name) + "<br/>");
        };

        Templater.prototype.render = function (id, chan) {
            this.register(style.footer);
            return sys.sendHtmlMessage(id, this.template.join('<br/>'), chan);
        };

        Table_Templater = function (template_name, color, border) {
            this.template = [style.header, "<h2>" + template_name + "</h2><br/>", "<table border='" + border + "' cellpadding='5'>"];
            this.color = color;
        };

        Table_Templater.prototype.register = function (arr, bold) {
            var mess = "<tr bgcolor='" + this.color + "'>",
                l = arr.length,
                y,
                bolds = ['<th>', '</th>'];
            if (!bold) {
                bolds = ['<td>', '</td>'];
            }

            for (y = 0; y < l; y++) {
                mess += bolds[0] + arr[y] + bolds[1];
            }

            mess += "</tr>";
            this.template.push(mess);
        };

        Table_Templater.prototype.render = function (id, chan) {
            this.template.push("</table><br/>", style.footer);
            sys.sendHtmlMessage(id, this.template.join(''), chan);

            if (ChatColorRandomizers.has(chan)) { // Tables reset fix
                var index = ChatColorRandomizers[chan],
                    code = '<div style="background-color: qradialgradient(cx:0.8, cy:1, fx: 0.8, fy: 0.2, radius: 0.8,stop:0.1 ' + index.firstColor + ', stop:1 ' + index.secondColor + ');">';

                sys.sendHtmlMessage(id, code, chan);
            }
        };
    },

    loadStyles: function () {
        var Styles = [
            {
                "name": "default",
                "author": "Lutra",
                "header": "<font color=cornflowerblue><b>\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB</b></font>",
                "footer": "<br/><timestamp/><br/><font color=cornflowerblue><b>\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB\xBB</b></font>",
                "pre-command": "",
                "command-icon": "\u2022 ",
                "command-style": ["<b>", "</b>"],
                "command-color": "green",
                "help": "<b><font color='orangered'>The following commands need to be entered into a channel's main chat:</font></b>",
                "span": "<br><font size=5><B>{{Name}}</b></font>"
            },
            {
                "name": "Solid",
                "author": "TheUnknownOne",
                "header": "<hr/><br/>",
                "footer": "<br/><hr/>",
                "pre-command": "",
                "command-icon": "/",
                "command-style": ["<b>", "</b>"],
                "command-color": "midnightblue",
                "help": "Enter the following commands into a channel of choice:",
                "span": "<font size=5><b>{{Name}}</b></font>"
            },
            {
                "name": "PO",
                "author": "TheUnknownOne",
                "header": "",
                "footer": "",
                "pre-command": "<font color='mediumseagreen'><timestamp/></font>",
                "command-icon": "/",
                "command-style": ["<b>", "</b>"],
                "command-color": "mediumseagreen",
                "help": "",
                "span": "<font color=magenta><timestamp/> *** {{Name}} ***</font>"
            },
            {
                "name": "New Age",
                "author": "TheUnknownOne",
                "header": "<br/><b><font color='darkred'>/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/</font></b><br/>",
                "footer": "<br/><b><font color='darkred'>/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/</font></b><br/>",
                "pre-command": "<font color=darkred><timestamp/>",
                "command-icon": "/",
                "command-style": ["<b>", "</b></font>"],
                "command-color": "darkred",
                "help": "<",
                "span": "<font size=5 color='darkred'><b>{{Name}}</b></font>"
            }
        ];

        StyleManager = (new function () {
            this.styles = {};

            this.loadAll = function () {
                var x, curr, stylesCache = this.styles;
                for (x in Styles) {
                    curr = Styles[x];

                    curr.active = false;
                    stylesCache[curr.name.toLowerCase()] = curr; /* Correct case is stored in the style. */
                }

                var current_style = cache.get("Current_Style");

                if (!stylesCache.has(current_style)) {
                    current_style = "default";
                }

                stylesCache[current_style].active = true;
                style = stylesCache[current_style];
            };

            this.setActiveStyle = function (src, name, chan) {
                var m_styles = this.styles,
                    dataToLower = name.toLowerCase();

                if (!m_styles.has(dataToLower)) {
                    botEscapeMessage(src, "The style " + name + " doesn't exist.", chan);
                    return;
                }

                var selectedStyle = m_styles[dataToLower];
                if (selectedStyle.active) {
                    botMessage(src, "This style is already active.", chan);
                    return;
                }

                style.active = false; /* the old style */
                selectedStyle.active = true;

                cache.write("Current_Style", dataToLower);
                botEscapeAll("The style " + selectedStyle.name + " is now the active style.", 0);

                style = selectedStyle;
            };

            this.styleInfo = function (src, chan) {
                var tt = new Table_Templater("Styles", "green", "3");
                tt.register(["Name", "Author", "Active"], true);

                var m_styles = this.styles,
                    x,
                    curr,
                    isActive;
                for (x in m_styles) {
                    curr = m_styles[x];

                    if (curr.active) {
                        isActive = "yes";
                    } else {
                        isActive = "no";
                    }

                    tt.register([curr.name, curr.author, isActive]);
                }


                tt.render(src, chan);
            };

        }());

        StyleManager.loadAll();
    },

    loadRankIcons: function () {
        var RankIcons = [
            {
                "name": "default",
                "author": "Astruvis",
                "User": "@",
                "Mod": "+",
                "Admin": "~",
                "Owner": "\u2248"
            },
            {
                "name": "Pokémon Online",
                "author": "TheUnknownOne",
                "User": "",
                "Mod": "</b>+<i><b>",
                "Admin": "</b>+<i><b>",
                "Owner": "</b>+<i><b>"
            },
            {
                "name": "PO Advanced",
                "author": "TheUnknownOne",
                "User": "",
                "Mod": "</b>\xBB<i><b>",
                "Admin": "</b>\xBB<i><b>",
                "Owner": "</b>\xBB<i><b>"
            },
            {
                "name": "Pokeballs",
                "author": "TheUnknownOne",
                "User": "<img src='Themes/Classic/Client/uAvailable.png' width='15'>",
                "Mod": "<img src='Themes/Classic/Client/mAvailable.png' width='15'>",
                "Admin": "<img src='Themes/Classic/Client/aAvailable.png' width='15'>",
                "Owner": "<img src='Themes/Classic/Client/oAvailable.png' width='15'>"
            },
            {
                "name": "IRC",
                "author": "TheUnknownOne",
                "User": "",
                "Mod": "@",
                "Admin": "%",
                "Owner": "~"
            }
        ];


        IconManager = (new function () {
            this.icons = {};

            this.loadAll = function () {
                var x, curr, iconCache = this.icons;
                for (x in RankIcons) {
                    curr = RankIcons[x];

                    curr.active = false;
                    iconCache[curr.name.toLowerCase()] = curr; /* Correct case is stored in the rank icon pack. */
                }

                var current_icons = cache.get("Current_Icons");

                if (!iconCache.has(current_icons)) {
                    current_icons = "default";
                }

                iconCache[current_icons].active = true;
                Icons = iconCache[current_icons];
            };

            this.setActiveIcons = function (src, name, chan) {
                var m_icons = this.icons,
                    dataToLower = name.toLowerCase();

                if (!m_icons.has(dataToLower)) {
                    botEscapeMessage(src, "The rank icon pack " + name + " doesn't exist.", chan);
                    return;
                }

                var selectedIcons = m_icons[dataToLower];
                if (selectedIcons.active) {
                    botMessage(src, "This rank icon pack is already active.", chan);
                    return;
                }

                Icons.active = false; // the old rank icon pack
                selectedIcons.active = true;

                cache.write("Current_Icons", dataToLower);
                botEscapeAll("The rank icon pack " + selectedIcons.name + " is now the active rank pack.", 0);

                Icons = selectedIcons;
            };

            this.iconInfo = function (src, chan) {
                var tt = new Table_Templater("Rank Icons", "green", "3");
                tt.register(["Name", "Author", "Active"], true);

                var m_icons = this.icons,
                    x,
                    curr,
                    isActive;
                for (x in m_icons) {
                    curr = m_icons[x];

                    if (curr.active) {
                        isActive = "yes";
                    } else {
                        isActive = "no";
                    }

                    tt.register([curr.name, curr.author, isActive]);
                }


                tt.render(src, chan);
            };

        }());

        IconManager.loadAll();
    },

    loadPokemonStats: function () {
        try {
            if (typeof Poke_Data === 'undefined') { /* Only do this once! Takes too much time! */
                var parseFile = function (file) {
                    var res = sys.getFileContent("db/pokes/" + file + ".txt");

                    if (!res) {
                        return [];
                    }

                    return res.split("\n");
                },
                    parseMoveFile = function (file) {
                        return parseFile("5G/" + file + "_moves");
                    };

                var Files = {
                    'stats': parseFile("stats"),
                    'weight': parseFile("weight"),
                    'height': parseFile("height"),
                    'evos': parseFile("evos"),
                    'evolevels': parseFile("5G/minlevels"),
                    'genders': parseFile("gender"),
                    'cc': parseFile("level_balance"),

                    'egggroup1': parseFile("egg_group_1"),
                    'egggroup2': parseFile("egg_group_2"),

                    'moves': {
                        'dw': parseMoveFile("dw"),
                        'egg': parseMoveFile("egg"),
                        'level': parseMoveFile("level"),
                        'evo': parseMoveFile("pre_evo"),
                        'event': parseMoveFile("special"),
                        'tms': parseMoveFile("tm_and_hm"),
                        'tutor': parseMoveFile("tutor")
                    }
                };

                Poke_Data = {};

                var x, curr_stats, curr_poke_stats, poke, spl, fstats = Files.stats,
                    pMF, fweigh = Files.weight,
                    fheigh = Files.height,
                    fevol = Files.evolevels,
                    fgen = Files.genders,
                    fcc = Files.cc,
                    oldCurrStat, fegg1 = Files.egggroup1,
                    fegg2 = Files.egggroup2,
                    fmoves = Files.moves,
                    pokeId = 0,
                    hasFegg2;

                var fevo = Files.evos.map(function (pokeIds) {
                    return pokeIds.split(" ");
                });

                var moveObj = {},
                    fdw = fmoves.dw,
                    fegg = fmoves.dw,
                    fevent = fmoves.event,
                    flevel = fmoves.level,
                    fevom = fmoves.evo,
                    ftms = fmoves.tms,
                    ftutor = fmoves.tutor,
                    current_move,
                    c_m_spl,
                    c_m_space,
                    c_poke,
                    dwMoves = {},
                    eggMoves = {},
                    eventMoves = {},
                    levelMoves = {},
                    evoMoves = {},
                    tmMoves = {},
                    tutorMoves = {},
                    i = 1;

                /* Lets begin with moves. */
                var importMoves = function (moveArray, Obj) {
                    var x;
                    for (x in moveArray) {
                        current_move = moveArray[x];

                        c_m_spl = current_move.split(":");
                        c_m_space = current_move.split(" ");
                        c_poke = Number(c_m_spl[0]);

                        if (current_move === "" || current_move === " ") {
                            continue;
                        }

                        if (c_m_spl[1].charAt(0) !== "0") { // A forme.
                            continue;
                        }

                        c_m_space.splice(0, 1);
                        Obj[c_poke] = c_m_space.join(" ");
                    }
                };

                importMoves(fdw, dwMoves);
                importMoves(fegg, eggMoves);
                importMoves(fevent, eventMoves);
                importMoves(flevel, levelMoves);
                importMoves(fevom, evoMoves);
                importMoves(ftms, tmMoves);
                importMoves(ftutor, tutorMoves);

                while (i !== 650) {
                    c_poke = i;
                    current_move = "";

                    current_move += levelMoves[c_poke];

                    if (dwMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + dwMoves[c_poke];
                    }

                    if (eggMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + eggMoves[c_poke];
                    }

                    if (eventMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + eventMoves[c_poke];
                    }

                    if (evoMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + evoMoves[c_poke];
                    }

                    if (tutorMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + tutorMoves[c_poke];
                    }

                    if (tmMoves.hasOwnProperty(c_poke)) {
                        current_move += " " + tmMoves[c_poke];
                    }

                    moveObj[sys.pokemon(c_poke)] = current_move;
                    i++;
                }

                /* Double checks for multiple moves */
                var mTA, doneMoves, c_mTA;
                for (x in moveObj) {
                    doneMoves = [];
                    current_move = moveObj[x];
                    mTA = current_move.split(" ");

                    for (i in mTA) {
                        c_mTA = sys.move(Number(mTA[i]));
                        if (doneMoves.has(c_mTA)) {
                            mTA.splice(i, 3);
                            continue;
                        }

                        doneMoves.push(c_mTA);
                    }

                    moveObj[x] = mTA.join(" ");
                }


/* We check CC later, as it's a little messy.
			We also will check evos later as some pokes don't have one. */

                var fEgg2Pokes = {},
                    curr_fegg2,
                    hasFegg1;
                for (x in fegg2) {
                    curr_fegg2 = fegg2[x].split(" ");
                    if (curr_fegg2 === "0") {
                        continue;
                    }

                    fEgg2Pokes[curr_fegg2[0]] = curr_fegg2[1];
                }

                for (x in fstats) {
                    x = Number(x);
                    pokeId++;

                    /* Put stuff into an array here. */

                    curr_stats = [fstats[x].split(" ")];
                    oldCurrStat = curr_stats[0];
                    spl = fstats[x].split(":");

                    if (spl[1] === undefined) {
                        break;
                    }

                    /* First is for formes. Second is missingno check. */
                    if (spl[1][0] !== "0" || spl[0] === "0") {
                        pokeId--;
                        continue;
                    }

                    curr_stats = [oldCurrStat, fweigh[pokeId].split(" "), fheigh[pokeId].split(" "), fgen[pokeId].split(" "), fevol[pokeId].split(" ")];

                    if (fegg1[pokeId] !== undefined) {
                        hasFegg1 = true;
                        curr_stats.push(fegg1[pokeId].split(" "));
                    } else {
                        hasFegg1 = false;
                        curr_stats.push(" ");
                    }

                    if (fEgg2Pokes[pokeId] !== undefined) {
                        hasFegg2 = true;
                        curr_stats.push([pokeId, fEgg2Pokes[pokeId]]);
                    } else {
                        hasFegg2 = false;
                        curr_stats.push(" ");
                    }

                    poke = sys.pokemon(spl[0]);
                    curr_poke_stats = curr_stats[0]; /* Egg Groups */
                    if (hasFegg1) {
                        curr_stats[5][1] = cut(curr_stats[5], 1, ' ');
                    }
                    if (hasFegg2) {
                        curr_stats[6][1] = cut(curr_stats[6], 1, ' ');
                    }

                    Poke_Data[poke] = {
                        "stats": {
                            'HP': curr_poke_stats[1],
                            'ATK': curr_poke_stats[2],
                            'DEF': curr_poke_stats[3],
                            'SPATK': curr_poke_stats[4],
                            'SPDEF': curr_poke_stats[5],
                            'SPD': curr_poke_stats[6]
                        },

                        "weight": curr_stats[1][1],
                        "height": curr_stats[2][1],
                        "minlvl": Number(curr_stats[4][1].split("/")[0]),
                        "genders": curr_stats[3][1],
                        "egg": [curr_stats[5][1], curr_stats[6][1]],
                        "moves": moveObj[poke]
                    };

                    /* Done! */
                }

                /* Parsing evos */
                var pArr = Files.evos.map(function (a) {
                    return a.split(" ");
                });
                var c_entry, next_entry;

                for (x in pArr) {
                    c_entry = pArr[x];
                    next_entry = pArr[Number(x) + 1];
                    c_poke = sys.pokemon(c_entry[0]);

                    if (next_entry !== undefined && Number(c_entry[1]) === Number(next_entry[0])) {
                        Poke_Data[c_poke].evos = [c_entry[1], next_entry[1]];
                    } else if (c_entry.length === 3 && c_entry[1] === c_entry[2]) { /* Feebas evo bug. */
                        Poke_Data[c_poke].evos = [c_entry[1]];
                    } else if (c_entry.length !== 2) {
                        c_entry.splice(0, 1);
                        Poke_Data[c_poke].evos = c_entry;
                    } else if (Number(c_entry[0]) + 1 === Number(c_entry[1])) {
                        Poke_Data[c_poke].evos = [c_entry[1]];
                    }
                }

                /* Done! */

                /* Checking CC levels */
                for (x in fcc) {
                    c_entry = fcc[x];
                    spl = c_entry.split(":");
                    c_m_space = c_entry.split(" ");
                    c_poke = sys.pokemon(Number(spl[0]));

                    if (c_poke === undefined || c_poke === "Missingno" || spl[1][0] !== "0") { // Formes. Missingno.
                        continue;
                    }

                    Poke_Data[c_poke].cc = Number(c_m_space[1]);
                }
            }

            formatStat = function (poke, pstat) {
                var stat = Poke_Data[poke].stats[pstat];
                var string = stat.bold(),
                    y;
                var ranges = [30, 50, 60, 70, 80, 90, 100, 200, 300];
                var colors = ["#ff0505", "#fd5300", "#ff7c49", "#ffaf49", "#ffd749", "#b9d749", "#5ee70a", "#3093ff", "#6c92bd"];

                for (y in ranges) {
                    if (stat <= ranges[y]) {
                        return string.fontcolor(colors[y]);
                    }
                }

                return string.fontcolor(colors[colors.length - 1]);
            };

            statsOf = function (poke) {
                var stat = Poke_Data[poke].stats;
                var ret = [],
                    z;
                for (z in stat) {
                    ret.push(stat[z]);
                }
                return ret;
            };

            formatStatsOf = function (poke) {
                var stats = ["HP", "ATK", "DEF", "SPATK", "SPDEF", "SPD"];
                var ret = "",
                    z,
                    stt;
                for (z in stats) {
                    stt = stats[z];
                    if (stt !== "SPD") {
                        ret += stt + ": " + formatStat(poke, stt) + " | ";
                    } else {
                        ret += stt + ": " + formatStat(poke, stt);
                    }
                }

                return ret;
            };

            movesOf = function (poke) {
                var moves = Poke_Data[poke].moves.split(" ").map(function (move) {
                    return Number(move);
                }).sort(function (a, b) {
                    return sys.moveType(b) - sys.moveType(a);
                });

                return moves;
            };

            evosOf = function (poke) {
                var PD = Poke_Data[poke];
                if (PD.evos === undefined) {
                    return [];
                }

                return PD.evos;
            };

            var moveColours = {
                0: "#a8a878",
                1: "#c03028",
                2: "#a890f0",
                3: "#a040a0",
                4: "#e0c068",
                5: "#b8a038",
                6: "#a8b820",
                7: "#705898",
                8: "#b8b8d0",
                9: "#f08030",
                10: "#6890f0",
                11: "#78c850",
                12: "#f8d030",
                13: "#f85888",
                14: "#98d8d8",
                15: "#7038f8",
                16: "#705848"
            };

            formatEvosOf = function (poke) {
                var evos = evosOf(poke),
                    y,
                    retString = [];

                for (y in evos) {
                    retString.push(sys.pokemon(evos[y]).fontcolor(moveColours[sys.pokeType1(evos[y])]).bold());
                }

                return fancyJoin(retString);
            };

            formatMovesOf = function (poke) {
                var moves = movesOf(poke),
                    y,
                    retString = "",
                    ml = moves.length - 1;

                for (y in moves) {
                    retString += sys.move(moves[y]).fontcolor(moveColours[sys.moveType(moves[y])]).bold().fontsize(2);
                    if (ml !== y) {
                        retString += ", ";
                    }
                }

                return retString + ".";
            };

            baseStatTotal = function (bpoke) {
                var poke = Poke_Data[bpoke].stats;
                var retnum = 0,
                    y;

                for (y in poke) {
                    retnum += Number(poke[y]);
                }
                return retnum;
            };

            formatBaseStatTotal = function (poke) {
                var stat = baseStatTotal(poke);
                var string = String(stat).bold(),
                    y;
                var ranges = [180, 300, 360, 420, 480, 540, 600, 1200, 1800];
                var colors = ["#ff0505", "#fd5300", "#ff7c49", "#ffaf49", "#ffd749", "#b9d749", "#5ee70a", "#3093ff", "#6c92bd"];

                for (y in ranges) {
                    if (stat <= ranges[y]) {
                        return string.fontcolor(colors[y]);
                    }
                }
                return string;
            };

            pokeType = function (poke) {
                var poke_num = sys.pokeNum(poke);
                var type = sys.pokeType1(poke_num);
                var ret = "";
                var type2 = sys.pokeType2(poke_num);

                var type_name = sys.type(type).bold().fontcolor(moveColours[type]);

                ret += type_name;

                if (type2 !== 17) {
                    var type_name2 = sys.type(type2).bold().fontcolor(moveColours[type2]);
                    ret += " & " + type_name2;
                }

                return ret;
            };

            firstGen = function (poke) {
                poke = sys.pokeNum(poke);

                if (poke < 152) {
                    return 1;
                } else if (poke < 252) {
                    return 2;
                } else if (poke < 387) {
                    return 3;
                } else if (poke < 494) {
                    return 4;
                }

                return 5;
            };

            pokeAbilities = function (poke) {
                poke = sys.pokeNum(poke);
                var ret = "";
                var abil = [sys.pokeAbility(poke, 0), sys.pokeAbility(poke, 1), sys.pokeAbility(poke, 2)];

                ret += sys.ability(abil[0]).bold();

                if (abil[1] !== 0) {
                    ret += " | " + sys.ability(abil[1]).bold();
                }
                if (abil[2] !== 0) {
                    ret += " | " + sys.ability(abil[2]).bold() + " (<u>Dream World Ability</u>)";
                }
                return ret;
            };

            pokeGender = function (poke) {
                var pD = Number(Poke_Data[poke].genders);

                if (pD === 3) {
                    return "<img src='Themes/Classic/genders/gender1.png'> <img src='Themes/Classic/genders/gender2.png'>";
                } else if (pD === 2) {
                    return "<img src='Themes/Classic/genders/gender2.png'>";
                } else if (pD === 1) {
                    return "<img src='Themes/Classic/genders/gender1.png'>";
                }

                return "<img src='Themes/Classic/genders/gender0.png'>";
            };

            pokedex = function (src, chan, pokemon, source) {
                var t = new Templater("Pokedex - " + pokemon.fontcolor(moveColours[sys.pokeType1(sys.pokeNum(pokemon))]));

                var n = sys.pokeNum(pokemon),
                    PD = Poke_Data[pokemon],
                    s = sys.pokeType2(n) === 17 ? '' : 's',
                    s2 = sys.pokeAbility(n, 1) === 0 && sys.pokeAbility(n, 2) === 0 ? 'y' : 'ies',
                    gender = pokeGender(pokemon),
                    eggs = PD.egg,
                    eggstr = "",
                    evoS = "";

                t.register("<img src='pokemon:num=" + n + "'> <img src='pokemon:num=" + n + "&back=true'> <img src='pokemon:num=" + n + "&shiny=true'> <img src='pokemon:num=" + n + "&shiny=true&back=true'><br/>");
                t.register("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + gender);
                t.register("National Dex Number: " + String(n).bold() + ".");
                t.register("Generation " + String(firstGen(pokemon)).bold() + " Pokemon. ");

                if ((PD.evos !== undefined || (PD.minlvl !== 1 && PD.minlvl !== 100))) {
                    t.register("");
                }

                if (PD.evos !== undefined) {
                    if (PD.evos.length !== 1) {
                        evoS = "s";
                    }
                    t.register("Evolution" + evoS + ": " + formatEvosOf(pokemon));
                }

                if (PD.minlvl !== 1 && PD.minlvl !== 100) {
                    t.register("Minimum Level: <b>" + PD.minlvl + "</b>");
                }

                t.register("Level in Challenge Cup: <b>" + PD.cc + "</b><br/>");

                if (!isEmpty(PD.egg[0])) {
                    eggstr += PD.egg[0].bold();
                }

                if (!isEmpty(PD.egg[1])) {
                    eggstr += " and " + PD.egg[1].bold();
                }

                t.register("Type" + s + ": " + pokeType(pokemon));

                if (eggstr !== "") {
                    if (!eggstr.contains("and ")) {
                        t.register("Egg Group: " + eggstr);
                    } else {
                        t.register("Egg Groups: " + eggstr);
                    }
                }

                t.register("Abilit" + s2 + ": " + pokeAbilities(pokemon) + "<br/>");

                t.register("Weight: <b>" + PD.weight + " kg</b>");
                t.register("Height <b>" + PD.height + " m</b><br/>");

                t.register(formatStatsOf(pokemon));
                t.register("Base Stat Total: " + formatBaseStatTotal(pokemon));

                if (pokemon.toLowerCase() !== "smeargle") { // Smeargle crashes.
                    t.register("<br/> " + formatMovesOf(pokemon));
                } else {
                    t.register("<br/> Smeargle learns all moves except Chatter and Transform.");
                }

                if (!source) {
                    t.render(src, chan);
                    return;
                }

                sys.sendHtmlMessage(src, html_escape(t.template.join("<br/>")), chan);

            };
        } catch (e) {
            print(FormatError("", e));
        }

    },

    loadRequiredUtilities: function () {
        RECOVERY = function () {
            if (typeof script.message !== 'undefined' && typeof script.step === 'undefined') {
                botAll("Fatal Script Error detected! " + FormatError("", script));
                botAll("Recovering script functions!");

                var x, SC = RECOVERY_BACKUP,
                    pushed = 0;
                for (x in SC) {
                    try {
                        script[x] = SC[x];
                        pushed++;
                    } catch (e) {
                        botAll("Caught an exception when recovering " + x + ".", 0);
                        print("Exception: " + e + ", on line " + e.lineNumber);
                    }
                }

                botAll("Function recovery completed! Recovered " + pushed + "/" + objLength(RECOVERY_BACKUP) + " functions.", 0);
                delete script.message;
                script.beforeNewMessage("Script Check: OK");
                botAll("Recovery completed!", 0);
            }
        };

        fancyJoin = function (array) {
            var x, retstr = '',
                arrlen = array.length;

            if (arrlen === 0 || arrlen === 1) {
                return array.join("");
            }

            arrlen--;

            for (x in array) {
                if (Number(x) === arrlen) {
                    retstr = retstr.substr(0, retstr.lastIndexOf(","));
                    retstr += " and " + array[x];

                    return retstr;
                }

                retstr += array[x] + ", ";
            }

            return "";
        };

        updateProtoForJSESSION = function (Proto) {
            var p = Proto.prototype;
            var proto = '__proto__';
            if (p === undefined) {
                return;
            }

            if (Proto === POUser) {
                sys.playerIds().forEach(function (id) {
                    if (sys.loggedIn(id) && JSESSION.users(id)[proto] !== p) {
                        JSESSION.users(id)[proto] = p;
                    }
                });
            } else if (Proto === POChannel || Proto === Tours) {
                var list = sys.channelIds(),
                    PROTOTOUR = Proto === Tours,
                    channel;

                list.forEach(function (id) {
                    channel = JSESSION.channels(id);
                    if (sys.existChannel(sys.channel(id))) {
                        if (PROTOTOUR) {
                            if (channel.toursEnabled && channel.tour[proto] !== p) {
                                channel.tour[proto] = p;
                            }
                        } else {
                            if (channel[proto] !== p) {
                                channel[proto] = p;
                                cData.loadDataFor(sys.channel(id));
                            }
                        }
                    }
                });
            }
        };

        updateProto = function (func, proto) {
            var _proto = '__proto__';
            var p = proto.prototype;
            if (func[_proto] !== p) {
                func[_proto] = p;
            }
        };

        updateProtoForJSESSION(POUser);
        updateProtoForJSESSION(POChannel);
        updateProtoForJSESSION(Tours);

        isNonNegative = function (n) {
            return !isNaN(n) && n >= 0;
        };

        isEmpty = function (s) {
            var type = typeof s;
            if (type === "undefined" || s === null) {
                return true;
            }

            if (type === "string") {
                if (s === "" || s === " ") {
                    return true;
                }
            }

            if (type === "number") {
                if (!isNonNegative(s)) {
                    return true;
                }
            }

            if (type === "object") {
                if (!Array.isArray(s)) {
                    if (objLength(s) === 0) {
                        return true;
                    }
                } else {
                    if (s.length === 0) {
                        return true;
                    }
                }
            }

            return false;
        };

        createFile = function (file, replacement) {
            sys.appendToFile(file, "");
            if (sys.getFileContent(file) === "") {
                sys.writeToFile(file, replacement);
            }
        };

        on = function (str) {
            var onArray = ["yes", "true", "on"],
                x,
                strToLower = str.toLowerCase();

            for (x in onArray) {
                if (strToLower.contains(onArray[x])) {
                    return true;
                }
            }

            return false;
        };

        toOn = function (bool) {
            if (bool) {
                return "on";
            }

            return "off";
        };

        WatchPlayer = function (player, type, message, channel) {
            var chan = "";
            if (typeof channel !== "undefined") {
                chan = "[" + ChannelLink(sys.channel(channel)) + "]";
            }

            var src = "<font color=" + script.namecolor(player) + ">" + html_escape(sys.name(player)) + ":</font>";

            if (typeof watch !== "undefined") {
                sys.sendHtmlAll("<timestamp/><b>" + chan + " " + type + " -- " + src + "</b> " + html_escape(message), watch);
            }
        };

        WatchEvent = function (player, message, channel) {
            var chan = "";
            if (typeof channel !== "undefined") {
                chan = "[" + ChannelLink(sys.channel(channel)) + "]";
            }

            var src = "<font color=" + script.namecolor(player) + ">" + html_escape(sys.name(player)) + ":</font>";

            if (typeof watch !== "undefined") {
                sys.sendHtmlAll("<timestamp/><b>" + chan + " " + src + "</b> " + message, watch);
            }
        };

        WatchChannelEvent = function (channel, message) {
            if (typeof watch !== "undefined") {
                sys.sendHtmlAll("<timestamp/><b>" + sys.channel(channel) + ":</b> " + message, watch);
            }
        };
    },

    loadCache: function () {
        CacheInst = function (file) {
            this.file = file + ".json";
            this.ensures = 0;
            createFile(this.file, "{}");

            try {
                this.hash = JSON.parse(sys.getFileContent(this.file));
            } catch (e) {
                sys.writeToFile(file + "-corrupt.json", JSON.stringify(this.hash));
                this.hash = {};
                this.saveAll();
                var cacheName = file;
                if (file !== "Cache") {
                    cacheName += " cache";
                } else {
                    cacheName = "cache";
                }

                print(FormatError("Could not load " + cacheName + " from file " + this.file + ".json!", e));
                print("Old cache available in " + file + "-corrupt.json. Cache has been cleared and " + file + ".json has been cleared.");
            }
        };

        CacheInst.prototype.save = function (key, value) {
            if (typeof this.hash[key] === "undefined") {
                this.hash[key] = value;
                this.saveAll();
            }
        };

        CacheInst.prototype.write = function (key, value) {
            this.hash[key] = value;
            this.saveAll();
        };

        CacheInst.prototype.remove = function (key) {
            if (this.get(key) === "") {
                return;
            }

            delete this.hash[key];
            this.saveAll();
        };

        CacheInst.prototype.get = function (key) {
            if (this.hash[key] === undefined) {
                return "";
            }

            return this.hash[key];
        };

        CacheInst.prototype.reset = function () {
            this.hash = {};
            sys.writeToFile(this.file, "{}");
        };

        CacheInst.prototype.saveAll = function () {
            sys.writeToFile(this.file, JSON.stringify(this.hash));
        };

        CacheInst.prototype.ensure = function (key, value) {
            if (typeof this.hash[key] === "undefined") {
                this.hash[key] = value;
                this.ensures++;
            }
        };

        if (typeof cache === "undefined") {
            cache = new CacheInst("Cache");
        }
        if (typeof playerscache === "undefined") {
            playerscache = new CacheInst("Players");
        }

        cache.ensure("ClanTag", "None");
        cache.ensure("AuthLevel0Name", "User");
        cache.ensure("AuthLevel1Name", "Mod");
        cache.ensure("AuthLevel2Name", "Admin");
        cache.ensure("AuthLevel3Name", "Owner");
        cache.ensure("AuthLevel4Name", "Invisible");
        cache.ensure("ChanLevel0Name", "Chan User");
        cache.ensure("ChanLevel1Name", "Chan Mod");
        cache.ensure("ChanLevel2Name", "Chan Admin");
        cache.ensure("ChanLevel3Name", "Chan Owner");
        cache.ensure("TourLevel0Name", "Tour User");
        cache.ensure("TourLevel1Name", "Megauser");
        cache.ensure("ChanTour0Name", "Chan Tour User");
        cache.ensure("ChanTour1Name", "Chan Megauser");

        cache.ensure("MaxPlayersOnline", sys.numPlayers());
        cache.ensure('MaxMessageLength', 500);
        cache.ensure('TourDisplay', 1);
        cache.ensure("FutureLimit", 15);

        cache.ensure("MessageEditor", false);
        cache.ensure("UseIcons", false);
        cache.ensure("implock", true);
        cache.ensure("motd", false);
        cache.ensure("evallock", false);
        cache.ensure("AutoStartTours", false);
        cache.ensure("AutoKick", true);
        cache.ensure("AutoMute", true);
        cache.ensure("ChannelsAllowed", true);
        cache.ensure("BattlesAllowed", true);

        cache.ensure("mutes", "{}");
        cache.ensure("tempbans", "{}");
        cache.ensure("rangebans", "{}");
        playerscache.save("names", "{}");
        cache.ensure("money", "{}");
        cache.ensure("rankicons", "{}");
        cache.ensure("mail", "{}");
        cache.ensure("bannedAbilities", "{}");
        cache.ensure("megausers", "{}");
        cache.ensure("tempauth", "{}");
        cache.ensure("idles", "{}");
        cache.ensure("voices", "{}");
        cache.ensure("evalops", "{}");
        playerscache.save("locations", "{}");

        var BOT_JSON = {
            "bot": "~Server~",
            "botcolor": "red"
        },
            LEAGUE_JSON = {
                "Champion": "",
                "gym": {},
                "elite": {}
            },
            ENABLED_JSON = {
                "me": true,
                "_catch_": true,
                "attack": true,
                "roulette": true
            };

        cache.ensure("Bot", JSON.stringify(BOT_JSON));
        cache.ensure("CommandsEnabled", JSON.stringify(ENABLED_JSON));
        cache.ensure("league", JSON.stringify(LEAGUE_JSON));

        ClanTag = cache.get("ClanTag");
        ChanUser = cache.get("ChanLevel0Name");
        ChanMod = cache.get("ChanLevel1Name");
        ChanAdmin = cache.get("ChanLevel2Name");
        ChanOwner = cache.get("ChanLevel3Name");
        UserName = cache.get("AuthLevel0Name");
        ModName = cache.get("AuthLevel1Name");
        AdminName = cache.get("AuthLevel2Name");
        OwnerName = cache.get("AuthLevel3Name");
        InvisName = cache.get("AuthLevel4Name");
        Tour0 = cache.get("TourLevel0Name");
        Tour1 = cache.get("TourLevel1Name");
        ChanTour0 = cache.get("ChanTour0Name");
        ChanTour1 = cache.get("ChanTour1Name");

        MessageEditor = cache.get("MessageEditor");
        UseIcons = cache.get("UseIcons");
        implock = cache.get("implock");
        evallock = cache.get("evallock");
        motd = cache.get("motd");
        AutoStartTours = cache.get("AutoStartTours");
        AutoKick = cache.get("AutoKick");
        AutoMute = cache.get("AutoMute");
        ChannelsAllowed = cache.get("ChannelsAllowed");
        BattlesAllowed = cache.get("BattlesAllowed");

        MaxMessageLength = cache.get("MaxMessageLength");
        maxPlayersOnline = cache.get("MaxPlayersOnline");
        TourDisplay = cache.get('TourDisplay');
        FutureLimit = cache.get("FutureLimit");

        Bot = JSON.parse(cache.get("Bot"));

        if (cache.ensures > 0) {
            cache.saveAll();
            cache.ensures = 0;
        }


        if (typeof DataHash === "undefined") {
            DataHash = {};
        }

        var dHash = DataHash,
            defineDataProp = function (name, cacheobj) {
                if (!cacheobj) {
                    cacheobj = cache;
                }
                if (!dHash.has(name)) {
                    dHash[name] = {};
                    var query = cacheobj.get(name);
                    if (query !== "") {
                        try {
                            DataHash[name] = JSON.parse(query);
                        } catch (e) {
                            DataHash[name] = {};
                        }
                    } else {
                        DataHash[name] = {};
                    }
                }
            };

        defineDataProp("mutes");
        defineDataProp("voices");
        defineDataProp("evalops");
        defineDataProp("names", playerscache);
        defineDataProp("mail");
        defineDataProp("bannedAbilities");
        defineDataProp("rangebans");
        defineDataProp("money");
        defineDataProp("rankicons");
        defineDataProp("megausers");
        defineDataProp("tempauth");
        defineDataProp("league");
        defineDataProp("idles");
        defineDataProp("tempbans");
        defineDataProp("macros");
        defineDataProp("locations", playerscache);

        var ids = sys.playerIds(),
            x,
            n,
            l,
            names = dHash.names,
            curr;

        for (x in ids) {
            curr = ids[x];
            if (!sys.loggedIn(curr)) {
                continue;
            }

            n = sys.name(curr);
            l = n.toLowerCase();
            names[l] = n;
        }

        if (typeof CommandsEnabled === "undefined") {
            CommandsEnabled = {
                'me': true,
                '_catch_': true,
                'attack': true,
                'roulette': true
            };

            if (cache.get("CommandsEnabled") !== "") {
                try {
                    CommandsEnabled = JSON.parse(cache.get("CommandsEnabled"));
                } catch (e) {
                    cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
                }
            } else {
                cache.write("CommandsEnabled", JSON.stringify(CommandsEnabled));
            }
        }

        if (typeof PointerCommands === "undefined") {
            PointerCommands = {};
            if (cache.get("pointercommands") !== "") {
                try {
                    PointerCommands = JSON.parse(cache.get('pointercommands'));
                } catch (ex) {
                    PointerCommands = {};
                }
            }
        }

        var Required_Pointers = {
            "k": "kick",
            "auth": "authlist",
            "auths": "authlist",
            "tourauths": "tourauthlist",
            "b": "ban",
            "tauths": "tourauthlist",
            "tourauth": "tourauthlist",
            "tauth": "tourauthlist",
            "cbans": "cbanlist",
            "cmutes": "cmutelist",
            "cmute": "channelmute",
            "cunmute": "channelunmute",
            "cban": "channelban",
            "cunban": "channelunban",
            "ctauth": "ctourauthlist",
            "colorchat": "chatcolor",
            "colorchatoff": "chatcoloroff",
            "removeautoidle": "autoidleoff",
            "answer": "a",
            "cls": "clearchat",
            "spam": "randomspam",
            "bans": "banlist",
            "mutes": "mutelist",
            "m": "mute",
            "tb": "tempban",
            "rb": "rangeban",
            "tempbans": "tempbanlist",
            "rangebans": "rangebanlist",
            "say": "talk",
            "implockoff": "impunlock",
            "rankiconon": "mainicon",
            "icon": "changeicon",
            "rankicons": "icons",
            "rankiconcommands": "iconcommands",
            "sendhtmlall": "html",
            "sendall": "send",
            "announce": "wall",
            "htmlannounce": "htmlwall",
            "cwall": "channelwall",
            "chtmlwall": "channelhtmlwall",
            "channelannounce": "channelwall",
            "cannounce": "channelwall",
            "channelhtmlannounce": "channelhtmlwall",
            "chtmlannounce": "channelhtmlwall",
            "cp": "info",
            "q": "push",
            "voicelist": "voices",
            "devoice": "unvoice",
            "removevoice": "unvoice",
            "voiceoff": "unvoice",
            "bp": "battlepoints",
            "eop": "evalop",
            "eops": "evalops",
            "unevalop": "evaluser",
            "evalopoff": "evaluser",
            "tempunban": "untempban",
            "deletepointercommand": "delpointercommand",
            "removepointercommand": "delpointercommand",
            "delpointer": "delpointercommand",
            "removepointer": "delpointercommand",
            "evl": "eval",
            "evval": "eval",
            "eeval": "eval",
            "code": "eval",
            "run": "eval",
            "silenceoff": "unsilence"
        },
            c = false,
            pc = PointerCommands,
            cur, y;

        for (y in Required_Pointers) {
            if (!pc.has(y)) {
                pc[y] = Required_Pointers[y];
                c = true;
            }
        }

        if (!PointerCommands.has("!!/Reverse/!!")) {
            PointerCommands["!!/Reverse/!!"] = {};
        }

        for (y in pc) {
            if (y === "!!/Reverse/!!") {
                break;
            }

            cur = pc["!!/Reverse/!!"][pc[y]];
            if (typeof cur !== "object") {
                cur = {};
                pc["!!/Reverse/!!"][pc[y]] = {};
            }

            if (!cur.has(y)) {
                pc["!!/Reverse/!!"][pc[y]][y] = '';
                c = true;
            }
        }

        if (c) {
            cache.write("pointercommands", JSON.stringify(pc));
        }

    },

    loadCommandStatsUtility: function () {
        if (typeof CommandStats !== "undefined") {
            sys.stopTimer(CommandStats.timer);
        }

        CommandStats = (new function () {
            var file = "CommandStats.json";
            createFile(file, "{}");

            this.timer = sys.intervalCall(function () {
                CommandStats.save();
            }, 30000); /* 30 seconds */

            this.stats = {};
            try {
                this.stats = JSON.parse(sys.getFileContent(file));
            } catch (e) {
                var time = +sys.time();
                this.stats = {
                    commands: {}
                };

                this.stats.startTime = time;
                this.stats.lastCommandTime = time;
                this.save();
            }

            this.save = function () {
                sys.writeToFile(file, JSON.stringify(this.stats));
            };

            this.write = function (command, user) {
                var stats = this.stats;
                if (!stats.has("commands")) {
                    stats.commands = {};
                }

                if (!stats.commands.has(command)) {
                    stats.commands[command] = {
                        used: 0,
                        last: ""
                    };
                }

                var query = stats.commands[command];
                query.used += 1;
                query.last = user;

                if (command !== "commandstats") {
                    this.stats.lastCommandTime = +sys.time();
                }
            };

            this.display = function (src, chan, limit) {
                var statsArray = [],
                    name,
                    totalstats = 0,
                    commandStats = this.stats.commands,
                    lim = -1,
                    current,
                    at,
                    time = +sys.time(),
                    statsLen = commandStats.length();

                if (limit !== undefined && limit !== 0 && limit !== -1) {
                    lim = limit;
                }

                for (name in commandStats) {
                    current = commandStats[name];
                    if (lim !== -1 && lim < at) {
                        break;
                    }

                    at++;

                    statsArray.push([name, current.used, current.last]);
                }

                statsArray.sort(function (used_A, used_B) {
                    return used_B[1] - used_A[1];
                });

                var msg_footer = "%1 commands used in total",
                    msg_header = "Command usage statistics for " + servername + ":";
                var total = 0;

                if (lim !== -1 && lim <= statsLen) {
                    msg_footer = lim + " commands were used %1 times.";
                    msg_header = "Command usage statistics for " + lim + " commands:";
                }

                botMessage(src, msg_header, chan);

                var num = 0,
                    u;

                for (u in statsArray) {
                    num++;
                    if (num > lim) {
                        break;
                    }
                    current = statsArray[u];

                    botEscapeMessage(src, "#" + num + ". Command " + cap(current[0]) + ": " + current[1] + ", last used by " + current[2], chan);
                    total += current[1];
                }

                botEscapeMessage(src, msg_footer.format(total), chan);
                botMessage(src, "Started counting command usage " + getTimeString(time - this.stats.startTime) + " ago. Last command used " + getTimeString(time - this.stats.lastCommandTime) + " ago.", chan);
            };
        }());
    },
    

    loadMafia: function () {
        // Remember to update this if you are updating mafia
        // Otherwise mafia game won't get reloaded
        var version = "2012-08-13.1";

        createFile(Config.Mafia.stats_file, "[]");
        createFile("mafialogs.txt", "[]");

        function Mafia(mafiachan) {
            this.version = version;
            var mafia = this;

            var noPlayer = '*';
            var CurrentGame;
            var PreviousGames;
            var MAFIA_SAVE_FILE = Config.Mafia.stats_file;
            var MAFIA_LOG_FILE = "mafialogs.txt";
            var MAFIA_VILLIFIED_FILE = "mafiavillified.json";
            var stalkLogs = [];
            var currentStalk = [];
            var phaseStalk = {};

            var villifiedPlayers = [];

            var DEFAULT_BORDER = "***************************************************************************************";
            var border;

            var savePlayedGames = function () {
                sys.writeToFile(MAFIA_SAVE_FILE, JSON.stringify(PreviousGames));
            };
            var loadPlayedGames = function () {
                try {
                    PreviousGames = JSON.parse(sys.getFileContent(MAFIA_SAVE_FILE));
                } catch (e) {
                    PreviousGames = [];
                }
                try {
                    stalkLogs = sys.getFileContent(MAFIA_LOG_FILE).split("::@@::");
                } catch (e) {
                    stalkLogs = [];
                }
            };
            loadPlayedGames();

            function dump(src, mess) {
                for (var x in mess) {
                    sys.sendMessage(src, mess[x], mafiachan);
                }
            }

            function msg(src, mess) {
                botEscapeMessage(src, mess, mafiachan);
            }

            function msgAll(mess) {
                botEscapeAll(mess, mafiachan);
            }

            var sendChanAll = function (msg) {
                sys.sendAll(msg, mafiachan);
            }

            /* stolen from here: http://snippets.dzone.com/posts/show/849 */

            function shuffle(o) {
                for (var j, x, i = o.length; i; j = parseInt(Math.random() * i, 10), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
            }

            /* stolen from here: http://stackoverflow.com/questions/1026069/capitalize-first-letter-of-string-in-javascript */

            function cap(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

/* format arrays so that it looks fine to humans
* also accepts a string, in which case just returns it */

            function readable(arr, last_delim) {
                if (!Array.isArray(arr)) return arr;
                if (arr.length > 1) {
                    return arr.slice(0, arr.length - 1).join(", ") + " " + last_delim + " " + arr.slice(-1)[0];
                } else if (arr.length == 1) {
                    return arr[0];
                } else {
                    return "";
                }
            }


            var defaultTheme = {
                name: "default",
                sides: [{
                    "side": "mafia",
                    "translation": "Mafia"
                },
                {
                    "side": "mafia1",
                    "translation": "French Canadian Mafia"
                },
                {
                    "side": "mafia2",
                    "translation": "Italian Mafia"
                },
                {
                    "side": "village",
                    "translation": "Good people"
                },
                {
                    "side": "werewolf",
                    "translation": "WereWolf"
                },
                {
                    "side": "godfather",
                    "translation": "Godfather"
                }],
                roles: [{
                    "role": "villager",
                    "translation": "Villager",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day!",
                    "actions": {}
                },
                {
                    "role": "inspector",
                    "translation": "Inspector",
                    "side": "village",
                    "help": "Type /Inspect [name] to find his/her identity!",
                    "actions": {
                        "night": {
                            "inspect": {
                                "target": "AnyButSelf",
                                "common": "Self",
                                "priority": 30
                            }
                        }
                    }
                },
                {
                    "role": "bodyguard",
                    "translation": "Bodyguard",
                    "side": "village",
                    "help": "Type /Protect [name] to protect someone!",
                    "actions": {
                        "night": {
                            "protect": {
                                "target": "AnyButSelf",
                                "common": "Role",
                                "priority": 5,
                                "broadcast": "role"
                            }
                        },
                        "startup": "role-reveal"
                    }
                },
                {
                    "role": "mafia",
                    "translation": "Mafia",
                    "side": "mafia",
                    "help": "Type /Kill [name] to kill someone!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButTeam",
                                "common": "Team",
                                "priority": 11,
                                "broadcast": "team"
                            }
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "werewolf",
                    "translation": "WereWolf",
                    "side": "werewolf",
                    "help": "Type /Kill [name] to kill someone!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButSelf",
                                "common": "Self",
                                "priority": 10
                            }
                        },
                        "distract": {
                            "mode": "ChangeTarget",
                            "hookermsg": "You tried to distract the Werewolf (what an idea, srsly), you were ravishly devoured, yum!",
                            "msg": "The ~Distracter~ came to you last night! You devoured her instead!"
                        },
                        "avoidHax": ["kill"]
                    }
                },
                {
                    "role": "hooker",
                    "translation": "Pretty Lady",
                    "side": "village",
                    "help": "Type /Distract [name] to distract someone! Vote to remove people in the day!",
                    "actions": {
                        "night": {
                            "distract": {
                                "target": "AnyButSelf",
                                "common": "Self",
                                "priority": 1
                            }
                        }
                    }
                },
                {
                    "role": "mayor",
                    "translation": "Mayor",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day! (your vote counts as 2)",
                    "actions": {
                        "vote": 2
                    }
                },
                {
                    "role": "spy",
                    "translation": "Spy",
                    "side": "village",
                    "help": "You can find out who is going to get killed next!(no command for this ability) Vote to remove people in the day!",
                    "actions": {
                        "hax": {
                            "kill": {
                                "revealTeam": 0.33,
                                "revealPlayer": 0.1
                            }
                        }
                    }
                },
                {
                    "role": "godfather",
                    "translation": "Godfather",
                    "side": "godfather",
                    "help": "Type /Kill [name] to kill someone! You can kill 2 targets, Type /kill [name2] again to select your second target!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButSelf",
                                "common": "Self",
                                "priority": 20,
                                "limit": 2
                            }
                        },
                        "distract": {
                            "mode": "ChangeTarget",
                            "hookermsg": "You tried to seduce the Godfather... you were killed instead!",
                            "msg": "The ~Distracter~ came to you last night! You killed her instead!"
                        },
                        "avoidHax": ["kill"]
                    }
                },
                {
                    "role": "vigilante",
                    "translation": "Vigilante",
                    "side": "village",
                    "help": "Type /Kill [name] to kill someone!(dont kill the good people!)",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButSelf",
                                "common": "Self",
                                "priority": 19
                            }
                        }
                    }
                },
                {
                    "role": "mafia1",
                    "translation": "French Canadian Mafia",
                    "side": "mafia1",
                    "help": "Type /Kill [name] to kill someone!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButTeam",
                                "common": "Team",
                                "priority": 12,
                                "broadcast": "team"
                            }
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "mafia2",
                    "translation": "Italian Mafia",
                    "side": "mafia2",
                    "help": "Type /Kill [name] to kill someone!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButTeam",
                                "common": "Team",
                                "priority": 11,
                                "broadcast": "team"
                            }
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "conspirator1",
                    "translation": "French Canadian Conspirator",
                    "side": "mafia1",
                    "help": "You dont have any special commands during the night! You are sided French Canadian Mafia. Vote to remove people in the day!",
                    "actions": {
                        "inspect": {
                            "revealAs": "villager"
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "conspirator2",
                    "translation": "Italian Conspirator",
                    "side": "mafia2",
                    "help": "You dont have any special commands during the night! You are sided Italian Mafia. Vote to remove people in the day!",
                    "actions": {
                        "inspect": {
                            "revealAs": "villager"
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "mafiaboss1",
                    "translation": "Don French Canadian Mafia",
                    "side": "mafia1",
                    "help": "Type /Kill [name] to kill someone! You can't be distracted!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButTeam",
                                "common": "Team",
                                "priority": 12,
                                "broadcast": "team"
                            }
                        },
                        "distract": {
                            "mode": "ignore"
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "mafiaboss2",
                    "translation": "Don Italian Mafia",
                    "side": "mafia2",
                    "help": "Type /Kill [name] to kill someone! You can't be distracted!",
                    "actions": {
                        "night": {
                            "kill": {
                                "target": "AnyButTeam",
                                "common": "Team",
                                "priority": 11,
                                "broadcast": "team"
                            }
                        },
                        "distract": {
                            "mode": "ignore"
                        },
                        "startup": "team-reveal"
                    }
                },
                {
                    "role": "samurai",
                    "translation": "Samurai",
                    "side": "village",
                    "help": "Type /Kill [name] during the day phase to kill someone! You will be revealed when you kill, so make wise choices! You are allied with the Good people.",
                    "actions": {
                        "standby": {
                            "kill": {
                                "target": "AnyButSelf",
                                "msg": "You can kill now using /kill [name] :",
                                "killmsg": "~Self~ pulls out a sword and strikes it through ~Target~'s chest!"
                            }
                        }
                    }
                },
                {
                    "role": "miller",
                    "translation": "Miller",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day! Oh, and insp sees you as Mafia",
                    "actions": {
                        "inspect": {
                            "revealAs": "mafia"
                        }
                    }
                },
                {
                    "role": "truemiller",
                    "translation": "Miller",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day!",
                    "actions": {
                        "inspect": {
                            "revealAs": "mafia"
                        },
                        "lynch": {
                            "revealAs": "mafia"
                        },
                        "startup": {
                            "revealAs": "villager"
                        },
                        "onlist": "mafia"
                    }
                },
                {
                    "role": "miller1",
                    "translation": "Miller",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day!",
                    "actions": {
                        "inspect": {
                            "revealAs": "mafia1"
                        },
                        "lynch": {
                            "revealAs": "mafia1"
                        },
                        "startup": {
                            "revealAs": "villager"
                        },
                        "onlist": "mafia1"
                    }
                },
                {
                    "role": "miller2",
                    "translation": "Miller",
                    "side": "village",
                    "help": "You dont have any special commands during the night! Vote to remove people in the day!",
                    "actions": {
                        "inspect": {
                            "revealAs": "mafia2"
                        },
                        "lynch": {
                            "revealAs": "mafia2"
                        },
                        "startup": {
                            "revealAs": "villager"
                        },
                        "onlist": "mafia2"
                    }
                }],
                roles1: ["bodyguard", "mafia", "inspector", "werewolf", "hooker", "villager", "truemiller", "villager", "mafia", "villager", "mayor"],
                roles2: ["bodyguard", "mafia1", "mafia1", "inspector", "hooker", "villager", "mafia2", "mafia2", "villager", "villager", "villager", "mayor", "villager", "spy", "villager", "miller1", "miller2", "mafiaboss1", "villager", "vigilante", "villager", "godfather", "mafiaboss2", "samurai", "villager", "villager", "werewolf", "mafia1", "mafia2", "bodyguard"],
                villageCantLoseRoles: ["mayor", "vigilante", "samurai"]
            };

/* ThemeManager is a object taking care of saving and loading themes
* in mafia game */

            function ThemeManager() {
                this.themeInfo = [];
                this.themes = {};
            }
            ThemeManager.prototype.toString = function () {
                return "[object ThemeManager]";
            };

            ThemeManager.prototype.save = function (name, url, resp) {
                var fname = "theme_" + name.replace("/", "").toLowerCase();
                sys.writeToFile(fname, resp);
                var done = false;
                for (var i = 0; i < this.themeInfo.length; ++i) {
                    if (cmp(name, this.themeInfo[i][0])) {
                        done = true;
                        this.themeInfo[i] = [name, url, fname, true];
                        break;
                    }
                }
                if (!done) {
                    this.themeInfo.push([name, url, fname, true]);
                }
                sys.writeToFile("metadata.json", JSON.stringify({
                    'meta': this.themeInfo
                }));
            };

            ThemeManager.prototype.loadTheme = function (plain_theme) {
                var theme = new Theme();
                try {
                    theme.sideTranslations = {};
                    theme.sideWinMsg = {};
                    theme.roles = {};
                    theme.nightPriority = [];
                    theme.standbyRoles = [];
                    theme.haxRoles = {};
                    theme.standbyHaxRoles = {};
                    theme.randomSideRoles = {};

                    // Init from the theme
                    var i;
                    for (i in plain_theme.sides) {
                        theme.addSide(plain_theme.sides[i]);
                    }
                    for (i in plain_theme.roles) {
                        theme.addRole(plain_theme.roles[i]);
                    }
                    theme.roles1 = plain_theme.roles1;
                    i = 2;
                    while ("roles" + i in plain_theme) {
                        theme["roles" + i] = plain_theme["roles" + i];
                        ++i;
                    }
                    theme.roleLists = i - 1;
                    if (theme.roleLists === 0) throw "This theme has no roles1, it can not be played.";
                    theme.villageCantLoseRoles = plain_theme.villageCantLoseRoles;
                    theme.minplayers = plain_theme.minplayers;
                    theme.nolynch = plain_theme.nolynch;
                    theme.ticks = plain_theme.ticks;
                    theme.votesniping = plain_theme.votesniping;
                    theme.name = plain_theme.name;
                    theme.author = plain_theme.author;
                    theme.summary = plain_theme.summary;
                    theme.killmsg = plain_theme.killmsg;
                    theme.killusermsg = plain_theme.killusermsg;
                    theme.drawmsg = plain_theme.drawmsg;
                    theme.lynchmsg = plain_theme.lynchmsg;
                    theme.border = plain_theme.border;
                    theme.generateRoleInfo();
                    theme.generateSideInfo();
                    theme.enabled = true;
                    return theme;
                } catch (err) {
                    msgAll("Couldn't use theme " + plain_theme.name + ": " + err + ".");
                }
            };

            ThemeManager.prototype.loadThemes = function () {
                if (typeof sys !== "object") return;
                this.themes = {};
                this.themes["default"] = this.loadTheme(defaultTheme);
                var content = sys.getFileContent("metadata.json");
                if (!content) return;
                var parsed = JSON.parse(content);
                if (parsed.hasOwnProperty("meta")) {
                    this.themeInfo = parsed.meta;
                }
                for (var i = 0; i < this.themeInfo.length; ++i) {
                    try {
                        var theme = this.loadTheme(JSON.parse(sys.getFileContent(this.themeInfo[i][2])));
                        this.themes[theme.name.toLowerCase()] = theme;
                        if (!this.themeInfo[i][3]) theme.enabled = false;
                    } catch (err) {
                        msgAll("Error loading cached theme \"" + this.themeInfo[i][0] + "\": " + err);
                    }
                }
            };
            ThemeManager.prototype.saveToFile = function (plain_theme) {
                if (typeof sys != "object") return;
                var fname = "theme_" + plain_theme.name.toLowerCase();
                sys.writeToFile(fname, JSON.stringify(plain_theme));
                this.themeInfo.push([plain_theme.name, "", fname, true]);
                sys.writeToFile("metadata.json", JSON.stringify({
                    'meta': this.themeInfo
                }));
            };

            ThemeManager.prototype.loadWebTheme = function (url, announce, update, updatename) {
                if (typeof sys != 'object') return;
                var manager = this;
                sys.webCall(url, function (resp) {
                    try {
                        var plain_theme = JSON.parse(resp);
                        var theme = manager.loadTheme(plain_theme);
                        var lower = theme.name.toLowerCase();
                        if (manager.themes.hasOwnProperty(lower) && !update) {
                            msgAll("Won't update " + theme.name + " with /add, use /update to force an update");
                            return;
                        }
                        if (manager.themes.hasOwnProperty(lower) && update && updatename && updatename != lower) {
                            msgAll("Won't update '" + updatename + "' to '" + theme.name + "', use the old name.");
                            return;
                        }
                        manager.themes[lower] = theme;
                        manager.save(theme.name, url, resp, update);
                        if (announce) {
                            msgAll("Loaded theme " + theme.name);
                        }
                    } catch (err) {
                        msgAll("Couldn't download theme from " + url);
                        msgAll("" + err);
                        return;
                    }
                });
            };

            ThemeManager.prototype.remove = function (src, name) {
                name = name.toLowerCase();
                if (name in this.themes) {
                    delete this.themes[name];
                    for (var i = 0; i < this.themeInfo.length; ++i) {
                        if (cmp(name, this.themeInfo[i][0])) {
                            this.themeInfo.splice(i, 1);
                            break;
                        }
                    }
                    sys.writeToFile("metadata.json", JSON.stringify({
                        'meta': this.themeInfo
                    }));
                    msg(src, "theme " + name + " removed.");
                }
            };

            ThemeManager.prototype.enable = function (src, name) {
                name = name.toLowerCase();
                if (name in this.themes) {
                    this.themes[name].enabled = true;
                    for (var i = 0; i < this.themeInfo.length; ++i) {
                        if (cmp(name, this.themeInfo[i][0])) {
                            this.themeInfo[i][3] = true;
                            break;
                        }
                    }
                    sys.writeToFile("metadata.json", JSON.stringify({
                        'meta': this.themeInfo
                    }));
                    msg(src, "theme " + name + " enabled.");
                }
            };

            ThemeManager.prototype.disable = function (src, name) {
                name = name.toLowerCase();
                if (name in this.themes) {
                    this.themes[name].enabled = false;
                    for (var i = 0; i < this.themeInfo.length; ++i) {
                        if (cmp(name, this.themeInfo[i][0])) {
                            this.themeInfo[i][3] = false;
                            break;
                        }
                    }
                    sys.writeToFile("metadata.json", JSON.stringify({
                        'meta': this.themeInfo
                    }));
                    msg(src, "theme " + name + " disabled.");
                }
            };

/* Theme is a small helper to organize themes
* inside the mafia game */

            function Theme() {}
            Theme.prototype.toString = function () {
                return "[object Theme]";
            };

            Theme.prototype.addSide = function (obj) {
                this.sideTranslations[obj.side] = obj.translation;
                if ("winmsg" in obj) {
                    this.sideWinMsg[obj.side] = obj.winmsg;
                }
            };
            Theme.prototype.addRole = function (obj) {
                this.roles[obj.role] = obj;
                if (!obj.actions) {
                    obj.actions = {};
                }
                if (typeof obj.side == "object") {
                    this.randomSideRoles[obj.role] = obj.side;
                }

                var i, action;
                if ("hax" in obj.actions) {
                    for (i in obj.actions.hax) {
                        action = i;
                        if (!(action in this.haxRoles)) {
                            this.haxRoles[action] = [];
                        }
                        this.haxRoles[action].push(obj.role);
                    }
                }
                if ("standbyHax" in obj.actions) {
                    for (i in obj.actions.hax) {
                        action = i;
                        if (!(action in this.haxRoles)) {
                            this.standbyHaxRoles[action] = [];
                        }
                        this.standbyHaxRoles[action].push(obj.role);
                    }
                }
                if ("night" in obj.actions) {
                    for (i in obj.actions.night) {
                        var priority = obj.actions.night[i].priority;
                        action = i;
                        var role = obj.role;
                        this.nightPriority.push({
                            'priority': priority,
                            'action': action,
                            'role': role
                        });
                    }
                    this.nightPriority.sort(function (a, b) {
                        return a.priority - b.priority;
                    });
                }
                if ("standby" in obj.actions) {
                    this.standbyRoles.push(obj.role);
                }
            };

            function name_trrole(x) {
                return x + " (" + this.trrole(mafia.players[x].role.role) + ")";
            }
            Theme.prototype.generateRoleInfo = function () {
                var sep = "*** *********************************************************************** ***";
                var roles = [sep];
                var role;
                var role_i = null;
                var role_order = Object.keys(this.roles);
                var this_roles = this.roles;
                role_order.sort(function (a, b) {
                    var tra = this_roles[a].translation;
                    var trb = this_roles[b].translation;
                    if (tra == trb) return 0;
                    else if (tra < trb) return -1;
                    else return 1;
                });

                function trrole(s) {
                    return this.trrole(s);
                }

                function trside(s) {
                    return this.trside(s);
                }
                for (var r = 0; r < role_order.length; ++r) {
                    try {
                        role = this.roles[role_order[r]];
                        roles.push("±Role: " + role.translation);

                        // check which abilities the role has
                        var abilities = "",
                            a, ability;
                        if ("info" in role) {
                            abilities += role.info;
                        } else {
                            if (role.actions.night) {
                                for (a in role.actions.night) {
                                    ability = role.actions.night[a];
                                    abilities += "Can " + a + " " + ("limit" in ability ? ability.limit + " persons" : "one person") + " during the night. ";
                                    if ("avoidHax" in role.actions && role.actions.avoidHax.indexOf(a) != -1) {
                                        abilities += "(Can't be detected by spies.) ";
                                    }
                                }
                            }
                            if (role.actions.standby) {
                                for (a in role.actions.standby) {
                                    ability = role.actions.standby[a];
                                    abilities += "Can " + a + " " + ("limit" in ability ? ability.limit + " persons" : "one person") + " during the standby. ";
                                }
                            }
                            if ("vote" in role.actions) {
                                if (typeof role.actions.vote === "number") {
                                    abilities += "Vote counts as " + role.actions.vote + ". ";
                                } else if (Array.isArray(role.actions.vote)) {
                                    abilities += "Vote counts randomly between " + role.actions.vote[0] + " (inclusive) and " + role.actions.vote[1] + " (exclusive). ";
                                }
                            }
                            if ("voteshield" in role.actions) {
                                if (typeof role.actions.voteshield === "number") {
                                    abilities += "Receives " + role.actions.voteshield + " extra votes if voted for at all. ";
                                } else if (Array.isArray(role.actions.voteshield)) {
                                    abilities += "Receives between " + role.actions.voteshield[0] + " (inclusive) and " + role.actions.voteshield[1] + " (exclusive) extra votes randomly if voted for at all. ";
                                }
                            }
                            if ("kill" in role.actions) {
                                if (role.actions.kill.mode == "ignore") {
                                    abilities += "Can't be nightkilled. ";
                                }
                                else if (role.actions.kill.mode == "killattackerevenifprotected") {
                                    abilities += "Revenges nightkills (even when protected). ";
                                }
                                else if (role.actions.kill.mode == "killattacker") {
                                    abilities += "Revenges nightkills. ";
                                }
                                else if (role.actions.kill.mode == "poisonattacker" || role.actions.kill.mode == "poisonattackerevenifprotected") {
                                    abilities += "Poison attacker when killed. ";
                                }
                                else if (typeof role.actions.kill.mode == "object") {
                                    if ("ignore" in role.actions.kill.mode) {
                                        var ignoreRoles = role.actions.kill.mode.ignore.map(trrole, this);
                                        abilities += "Can't be nightkilled by " + readable(ignoreRoles, "and") + ". ";
                                    }
                                    if ("evadeChance" in role.actions.kill.mode && role.actions.kill.mode.evadeChance > 0) {
                                        abilities += "Has a " + Math.floor(role.actions.kill.mode.evadeChance * 100) + "% chance of evading nightkills. ";
                                    }
                                }
                            }
                            if ("daykill" in role.actions) {
                                if (role.actions.daykill == "evade") {
                                    abilities += "Can't be daykilled. ";
                                }
                                else if (role.actions.daykill == "revenge") {
                                    abilities += "Counter daykills. ";
                                }
                                else if (role.actions.daykill == "bomb") {
                                    abilities += "Revenges daykills. ";
                                }
                                else if (typeof role.actions.daykill == "object" && typeof role.actions.daykill.mode == "object" && role.actions.daykill.mode.evadeChance > 0) {
                                    abilities += "Has a " + Math.floor(role.actions.daykill.mode.evadeChance * 100) + "% chance of evading daykills. ";
                                }
                                else if (role.actions.daykill == "revealkiller") {
                                    abilities += "Reveals killer when daykilled. ";
                                }
                            }
                            if ("poison" in role.actions) {
                                if (role.actions.poison.mode == "ignore") {
                                    abilities += "Can't be poisoned. ";
                                }
                                else if (typeof role.actions.poison.mode == "object" && role.actions.poison.mode.evadeChance > 0) {
                                    abilities += "Has a " + Math.floor(role.actions.poison.mode.evadeChance * 100) + "% chance of evading poison. ";
                                }
                            }
                            if ("hax" in role.actions && Object.keys) {
                                var haxy = Object.keys(role.actions.hax);
                                abilities += "Gets hax on " + readable(haxy, "and") + ". ";
                            }
                            if ("inspect" in role.actions) {
                                if ("revealAs" in role.actions.inspect) {
                                    if (Array.isArray(role.actions.inspect.revealAs)) {
                                        var revealAs = role.actions.inspect.revealAs.map(trrole, this);
                                        abilities += "Reveals as " + readable(revealAs, "or") + " when inspected. ";
                                    } else if (role.actions.inspect.revealAs == "*") {
                                        abilities += "Reveals as a random role when inspected. ";
                                    } else {
                                        abilities += "Reveals as " + this.roles[role.actions.inspect.revealAs].translation + " when inspected. ";
                                    }
                                }
                            }
                            if ("distract" in role.actions) {
                                if (role.actions.distract.mode == "ChangeTarget") abilities += "Kills any distractors. ";
                                if (role.actions.distract.mode == "ignore") abilities += "Ignores any distractors. ";
                            }
                            if ("initialCondition" in role.actions) {
                                if ("poison" in role.actions.initialCondition) {
                                    abilities += "Dies at the end of night " + (role.actions.initialCondition.poison.count || 2) + ". ";
                                }
                            }
                            if (typeof role.side == "string") {
                                abilities += "Sided with " + this.trside(role.side) + ". ";
                            } else if (typeof role.side == "object") {
                                var plop = Object.keys(role.side.random);
                                var tran = [];
                                for (var p = 0; p < plop.length; ++p) {
                                    tran.push(this.trside(plop[p]));
                                }
                                abilities += "Sided with " + readable(tran, "or") + ". ";
                            }
                            if (role.hasOwnProperty("winningSides")) {
                                if (role.winningSides == "*") {
                                    abilities += "Wins the game in any case. ";
                                } else if (Array.isArray(role.winningSides)) {
                                    // Argh give me Function.bind already ;~;
                                    abilities += "Wins the game with " + readable(role.winningSides.map(trside, this), "or");
                                }
                            }
                        }
                        roles.push("±Ability: " + abilities);

                        // check on which player counts the role appears
                        var parts = [];
                        var end = 0;
                        for (var i = 1; i <= this.roleLists; ++i) {
                            role_i = "roles" + i;
                            var start = this[role_i].indexOf(role.role);
                            var last = end;
                            end = this[role_i].length;
                            if (start >= 0) {
                                ++start;
                                start = start > last ? start : 1 + last;
                                if (parts.length > 0 && parts[parts.length - 1][1] == start - 1) {
                                    parts[parts.length - 1][1] = end;
                                } else {
                                    parts.push([start, end]);
                                    if (parts.length > 1) {
                                        parts[parts.length - 2] = parts[parts.length - 2][0] < parts[parts.length - 2][1] ? parts[parts.length - 2].join("-") : parts[parts.length - 2][1];
                                    }
                                }
                            }
                        }
                        if (parts.length > 0) {
                            parts[parts.length - 1] = parts[parts.length - 1][0] < parts[parts.length - 1][1] ? parts[parts.length - 1].join("-") : parts[parts.length - 1][1];
                        }
                        roles.push("±Game: " + parts.join(", ") + " Players");

                        roles.push(sep);
                    } catch (err) {
                        if (role_i === null) msgAll("Error adding role " + role.translation + "(" + role.role + ") to /roles");
                        else msgAll("Error making rolelist with role id: " + role_i);
                        throw err;
                    }
                }
                this.roleInfo = roles;
            };
            Theme.prototype.generateSideInfo = function () {
                var sep = "*** *********************************************************************** ***";
                var sides = [sep];
                var side;
                var side_order = Object.keys(this.sideTranslations);
                var this_sideTranslations = this.sideTranslations;
                // sort sides by name
                side_order.sort(function (a, b) {
                    var tra = this_sideTranslations[a];
                    var trb = this_sideTranslations[b];
                    if (tra == trb) return 0;
                    else if (tra < trb) return -1;
                    else return 1;
                });
                // sort roles by name
                var role;
                var role_order = Object.keys(this.roles);
                var this_roles = this.roles;
                role_order.sort(function (a, b) {
                    var tra = this_roles[a].translation;
                    var trb = this_roles[b].translation;
                    if (tra == trb) return 0;
                    else if (tra < trb) return -1;
                    else return 1;
                });
                // check each role for its side
                var side_list = {};
                var randomSide_list = [];
                for (var r = 0; r < role_order.length; ++r) {
                    try {
                        role = this.roles[role_order[r]];
                        if (typeof role.side == "string") {
                            if (side_list[role.side] === undefined) side_list[role.side] = [];
                            side_list[role.side].push(role.translation);
                        } else if (typeof role.side == "object" && role.side.random) {
                            var plop = Object.keys(role.side.random);
                            var tran = [];
                            for (var p = 0; p < plop.length; ++p) {
                                tran.push(this.trside(plop[p]));
                            }
                            randomSide_list.push("±Role: " + role.translation + " can be sided with " + readable(tran, "or") + ". ");
                        }
                    } catch (err) {
                        msgAll("Error adding role " + role.translation + "(" + role.role + ") to /sides");
                        throw err;
                    }
                }
                // writes the list of roles for each side
                for (var s = 0; s < side_order.length; ++s) {
                    try {
                        side = side_order[s];
                        if (side_list[side] !== undefined) sides.push("±Side: The " + this.trside(side) + " consists of " + side_list[side].join(", ") + ".");
                    } catch (err) {
                        msgAll("Error adding side " + this.trside(side) + "(" + side + ") to /sides");
                        throw err;
                    }
                }
                if (randomSide_list.length > 0) sides = sides.concat(randomSide_list);
                sides.push(sep);
                this.sideInfo = sides;
            };

            /* Theme Loading and Storing */
            Theme.prototype.trside = function (side) {
                return this.sideTranslations[side];
            };
            Theme.prototype.trrole = function (role) {
                return this.roles[role].translation;
            };
            Theme.prototype.getHaxRolesFor = function (command) {
                if (command in this.haxRoles) {
                    return this.haxRoles[command];
                }
                return [];
            };
            Theme.prototype.getStandbyHaxRolesFor = function (command) {
                if (command in this.standbyHaxRoles) {
                    return this.standbyHaxRoles[command];
                }
                return [];
            };
            // End of Theme
            this.isInGame = function (player) {
                if (this.state == "entry") {
                    return this.signups.indexOf(player) != -1;
                }
                return player in this.players;
            };
            // init
            this.themeManager = new ThemeManager();

            this.hasCommand = function (name, command, state) {
                var player = this.players[name];
                return (state in player.role.actions && command in player.role.actions[state]);
            };
            this.correctCase = function (string) {
                var lstring = string.toLowerCase();
                for (var x in this.players) {
                    if (x.toLowerCase() == lstring) return this.players[x].name;
                }
                // try to trim around if there's extra whitespace
                lstring = lstring.replace(/^\s+|\s+$/g, '');
                for (var y in this.players) {
                    if (y.toLowerCase() == lstring) return this.players[y].name;
                }
                return noPlayer;
            };
            this.saveStalkLog = function () {
                if (this.state !== "blank" && this.state !== "voting" && currentStalk.length > 0) {
                    var lastLog = currentStalk.join("::**::");
                    stalkLogs.unshift(lastLog);
                    if (stalkLogs.length > 10) {
                        stalkLogs.pop();
                    }
                    sys.writeToFile(MAFIA_LOG_FILE, stalkLogs.join("::@@::"));
                }
                phaseStalk = {};
                currentStalk = [];
            };
            this.clearVariables = function () { /* hash : playername => playerstruct */
                this.saveStalkLog();
                this.players = {};
                this.signups = [];
                this.state = "blank";
                this.ticks = 0;
                this.votes = {};
                this.voteCount = 0;
                this.ips = [];
                this.numjoins = {};
                this.resetTargets();
                // Recharges shouldn't be cleared between nights
                this.teamRecharges = {};
                this.roleRecharges = {};
                this.dayRecharges = {};
                this.teamCharges = {};
                this.roleCharges = {};
                this.usersToSlay = [];
            };
            this.lastAdvertise = 0;
            this.reduceRecharges = function () {
                var o, a;
                for (o in this.teamRecharges) {
                    for (a in this.teamRecharges[o]) {
                        if (this.teamRecharges[o][a] > 0)--this.teamRecharges[o][a];
                    }
                }
                for (o in this.roleRecharges) {
                    for (a in this.roleRecharges[o]) {
                        if (this.roleRecharges[o][a] > 0)--this.roleRecharges[o][a];
                    }
                }
                for (var p in this.players) {
                    for (o in this.players[p].recharges) {
                        if (this.players[p].recharges[o] > 0)--this.players[p].recharges[o];
                    }
                    for (o in this.players[p].dayrecharges) {
                        if (this.players[p].dayrecharges[o] > 0)--this.players[p].dayrecharges[o];
                    }
                }
            };
            this.resetTargets = function () {
                this.teamTargets = {};
                this.roleTargets = {};
                this.dayRecharges = {};
                for (var p in this.players) {
                    this.players[p].targets = {};
                    this.players[p].dayKill = undefined;
                    this.players[p].revealUse = undefined;
                    this.players[p].exposeUse = undefined;
                    this.players[p].guarded = undefined;
                    this.players[p].safeguarded = undefined;
                }
            };
            this.advertiseToChannel = function (channel) {
                sendChanAll("", channel);
                sendChanAll(border, channel);
                if (this.theme.name == "default") {
                    sendChanAll("±Game: A new mafia game was started at #" + sys.channel(mafiachan) + "!", channel);
                } else {
                    sendChanAll("±Game: A new " + this.theme.name + "-themed mafia game was started at #" + sys.channel(mafiachan) + "!", channel);
                }
                sendChanAll(border, channel);
                sendChanAll("", channel);
            };
            this.clearVariables(); /* callback for /start */
            this.userVote = function (src, commandData) {
                var themeName = commandData.toLowerCase();

                if (this.state == "blank") {
                    this.state = "voting";
                    this.ticks = 20;
                    this.votes = {};
                    this.possibleThemes = {};
                    var total = 5;
                    var i;
                    if (PreviousGames.length === 0 || PreviousGames.slice(-1)[0].what != "default") {
                        this.possibleThemes["default"] = 0;
                        --total;
                    }
                    var allThemes = Object.keys(this.themeManager.themes);
                    var Check = PreviousGames.slice(-Config.Mafia.norepeat).reverse().map(function (g) {
                        return g.what;
                    });

                    if (themeName in this.themeManager.themes && this.themeManager.themes[themeName].enabled) {
                        if (Check.indexOf(themeName) == -1 && themeName != "default") {
                            if (!(themeName in this.possibleThemes)) {
                                this.possibleThemes[themeName] = 0;
                                --total;
                            }
                        }
                    }

                    while (allThemes.length > 0 && total > 0) {
                        var indx = Math.floor(allThemes.length * Math.random());
                        var name = allThemes[indx];
                        allThemes.splice(indx, 1);
                        // exclude themes played recently
                        if (name != "default" && Check.indexOf(name) != -1) {
                            continue;
                        }
                        // exclude disabled themes
                        if (this.themeManager.themes[name].enabled && !(name in this.possibleThemes)) {
                            this.possibleThemes[name] = 0;
                            --total;
                        }
                    }
                    border = DEFAULT_BORDER;
                    sendChanAll("", mafiachan);
                    sendChanAll(border, mafiachan);
                    sendChanAll("±Game: " + sys.name(src) + " started a voting for next game's theme!. You have " + this.ticks + " seconds to vote with /votetheme!", mafiachan);
                    sendChanAll("±Game: Choose from these themes: " + Object.keys(this.possibleThemes).join(", ") + " !", mafiachan);
                    sendChanAll(border, mafiachan);
                    sendChanAll("", mafiachan);
                }
                if (this.state != "voting") {
                    sys.sendMessage(src, "±Game: This command makes no sense during a game, right?!", mafiachan);
                    return;
                }
                if (this.canJoin(src) !== true) {
                    return;
                }
                if (!this.possibleThemes.hasOwnProperty(themeName)) {
                    sys.sendMessage(src, "±Game: You can not vote this theme!", mafiachan);
                    return;
                }
                var ip = sys.ip(src);
                if (this.votes.hasOwnProperty(ip)) {
                    if (this.votes[ip] != themeName) sendChanAll("±Game: " + sys.name(src) + " changed their vote to " + this.themeManager.themes[themeName].name + "!", mafiachan);
                } else {
                    sendChanAll("±Game: " + sys.name(src) + " voted for " + this.themeManager.themes[themeName].name + "!", mafiachan);
                }
                this.votes[sys.ip(src)] = {
                    theme: themeName,
                    who: sys.name(src)
                };
            }; /* callback for /realstart */
            this.startGame = function (src, commandData) {
                if (this.state != "blank") {
                    sys.sendMessage(src, "±Game: A game is going on. Wait until it's finished to start another one", mafiachan);
                    sys.sendMessage(src, "±Game: You can join the game by typing /join !", mafiachan);
                    return;
                }

                var previous = this.theme ? this.theme.name : undefined;
                var themeName = commandData == noPlayer ? "default" : commandData.toLowerCase();

                // Prevent a single player from dominating the theme selections.
                // We exclude mafia admins from this.
                var i;
                if (src) {
                    var PlayerCheck = PreviousGames.slice(-2).reverse();
                    if (!this.isMafiaAdmin(src)) {
                        for (i = 0; i < PlayerCheck.length; i++) {
                            var who = PlayerCheck[i].who;
                            var what = PlayerCheck[i].what;
                            if (who == sys.name(src)) {
                                sys.sendMessage(src, "±Game: Sorry, you have started a game " + (i + 1) + " games ago, let someone else have a chance!", mafiachan);
                                return;
                            }
                            if (themeName !== "default" && what == themeName) {
                                sys.sendMessage(src, "±Game: This theme was started " + (i + 1) + " games ago! No repeat!", mafiachan);
                                return;
                            }
                        }
                    }

                    if (themeName in this.themeManager.themes) {
                        if (!this.themeManager.themes[themeName].enabled) {
                            sys.sendMessage(src, "±Game: This theme is disabled!", mafiachan);
                            return;
                        }
                        this.theme = this.themeManager.themes[themeName];
                    } else {
                        sys.sendMessage(src, "±Game: No such theme!", mafiachan);
                        return;
                    }
                } else {
                    this.theme = this.themeManager.themes[themeName];
                }

                border = this.theme.border ? this.theme.border : DEFAULT_BORDER;
                CurrentGame = {
                    who: src !== null ? sys.name(src) : "voted",
                    what: themeName,
                    when: parseInt(sys.time(), 10),
                    playerCount: 0
                };

                if (src !== null) {
                    sendChanAll("", mafiachan);
                    sendChanAll(border, mafiachan);
                    if (this.theme.name == "default") {
                        sendChanAll("±Game: " + sys.name(src) + " started a game!", mafiachan);
                    } else {
                        sendChanAll("±Game: " + sys.name(src) + " started a game with theme " + this.theme.name + "!", mafiachan);
                    }
                    sendChanAll("±Game: Type /Join to enter the game!", mafiachan);
                    sendChanAll(border, mafiachan);
                    sendChanAll("", mafiachan);
                }

                var playerson = sys.playerIds();
                for (var x = 0; x < playerson.length; ++x) {
                    var id = playerson[x];
                    var user = JSESSION.users(id);
                    if (sys.loggedIn(id) && user && user.mafiaalertson && (user.mafiaalertsany || user.mafiathemes.indexOf(this.theme.name.toLowerCase()) != -1)) {
                        if (sys.isInChannel(id, mafiachan)) {
                            sys.sendHtmlMessage(id, "A " + (this.theme.name == "default" ? "" : this.theme.name + "-themed ") + "mafia game is starting, " + sys.name(id) + "<ping/>!", mafiachan);
                            continue;
                        } else if (sys.isInChannel(id, 0)) {
                            sys.sendHtmlMessage(id, "A " + (this.theme.name == "default" ? "" : this.theme.name + "-themed ") + "mafia game is starting, " + sys.name(id) + "<ping/>!", 0);
                            continue;
                        } else if (sys.existChannel("Project Mafia") && sys.isInChannel(id, sys.channelId("Project Mafia"))) {
                            sys.sendHtmlMessage(id, "A " + (this.theme.name == "default" ? "" : this.theme.name + "-themed ") + "mafia game is starting, " + sys.name(id) + "<ping/>!", sys.channelId("Project Mafia"));
                            continue;
                        }
                        sys.sendHtmlMessage(id, "A " + (this.theme.name == "default" ? "" : this.theme.name + "-themed ") + "mafia game is starting, " + sys.name(id) + "<ping/>!");
                    }
                }

                if (this.theme.summary === undefined) {
                    sendChanAll("±Game: Consider adding a summary field to this theme that describes the setting of the game and points out the odd quirks of the theme!", mafiachan);
                } else {
                    sendChanAll("±Game: " + this.theme.summary, mafiachan);
                }

                if (sys.playersOfChannel(mafiachan).length < 150) {
                    var time = parseInt(sys.time(), 10);
                    if (time > this.lastAdvertise + 60 * 15) {
                        this.lastAdvertise = time;
                        this.advertiseToChannel(0);
                        if (sys.existChannel("Project Mafia")) {
                            this.advertiseToChannel(sys.channelId('Project Mafia'));
                        }
                        if (sys.existChannel("Mafia Tutoring")) {
                            this.advertiseToChannel(sys.channelId('Mafia Tutoring'));
                        }
                    }
                }
                this.clearVariables();
                mafia.state = "entry";

                mafia.ticks = 60;
            }; /* callback for /end */
            this.endGame = function (src) {
                if (mafia.state == "blank") {
                    sys.sendMessage(src, "±Game: No game is going on.", mafiachan);
                    return;
                }
                sendChanAll(border, mafiachan);

                sendChanAll("±Game: " + (src ? sys.name(src) : Config.Mafia.bot) + " has stopped the game!", mafiachan);
                sendChanAll(border, mafiachan);
                sendChanAll("", mafiachan);

                mafia.clearVariables();
                sys.removeVal("mafiagameplayers");
                runUpdate();
            }; /* called every second */
            this.tickDown = function () {
                if (this.ticks <= 0) {
                    return;
                }
                this.ticks = this.ticks - 1;
                if (this.ticks === 0) {
                    this.callHandler(this.state);
                } else {
                    if (this.ticks == 30 && this.state == "entry") {
                        sendChanAll("", mafiachan);
                        sendChanAll("±Game: Hurry up, you only have " + this.ticks + " seconds more to join!", mafiachan);
                        sendChanAll("", mafiachan);
                    }
                }
            };
            this.sendPlayer = function (player, message) {
                var id = sys.id(player);
                if (id === undefined) return;
                sys.sendMessage(id, message, mafiachan);
            };
            // Grab a list of all roles belonging to a given team.
            this.getRolesForTeam = function (side) {
                var team = [];
                for (var p in this.players) {
                    var player = this.players[p];
                    if (player.role.side == side) {
                        team.push(player.role.translation);
                    }
                }
                return team.sort(); // Sort as to not give out the order.
            };
            this.getRolesForTeamS = function (side) {
                return mafia.getRolesForTeam(side).join(", ");
            };

            this.getPlayersForTeam = function (side) {
                var team = [];
                for (var p in this.players) {
                    var player = this.players[p];
                    if (player.role.side == side) {
                        team.push(player.name);
                    }
                }
                return team;
            };
            this.getPlayersForTeamS = function (side) {
                return mafia.getPlayersForTeam(side).join(", ");
            };
            this.getPlayersForRole = function (role) {
                var team = [];
                for (var p in this.players) {
                    var player = this.players[p];
                    if (player.role.role == role) {
                        team.push(player.name);
                    }
                }
                return team;
            };
            this.getPlayersForRoleS = function (role) {
                return mafia.getPlayersForRole(role).join(", ");
            };
            this.getCurrentRoles = function () {
                var list = [];
                for (var p in this.players) {
                    if (typeof this.players[p].role.actions.onlist === "string") list.push(this.theme.trrole(this.players[p].role.actions.onlist));
                    else list.push(this.players[p].role.translation);
                } /* Sorting to not give out the order of the roles per player */
                return list.sort().join(", ");
            };
            this.getCurrentPlayers = function () {
                var list = [];
                for (var p in this.players) {
                    list.push(this.players[p].name);
                }
                return list.sort().join(", ");

            };
            this.player = function (role) {
                for (var p in this.players) {
                    if (mafia.players[p].role.role == role) //Checks sequentially all roles to see if this is the good one
                    return p;
                }
                return noPlayer;
            };
            this.removePlayer = function (player) {
                //sys.sendAll("removing player " + player.name, mafiachan);
                for (var action in player.role.actions.night) {
                    var targetMode = player.role.actions.night[action].target;
                    var team = this.getPlayersForTeam(player.role.side);
                    var role = this.getPlayersForRole(player.role.role);
                    if ((targetMode == 'AnyButSelf' || targetMode == 'Any') || (targetMode == 'AnyButTeam' && team.length == 1) || (targetMode == 'AnyButRole' && role.length == 1)) {
                        this.removeTarget(player, action);
                    }
                }
                if (mafia.votes.hasOwnProperty(player.name)) delete mafia.votes[player.name];
                delete this.players[player.name];
            };
            this.actionBeforeDeath = function (player) {
                if (player.role.actions.hasOwnProperty("onDeath")) {
                    var onDeath = player.role.actions.onDeath;
                    var targetRoles, targetPlayers, r, k, target, affected, actionMessage, needSeparator = false;
                    if ("killRoles" in onDeath) {
                        targetRoles = onDeath.killRoles;
                        for (r = 0; r < targetRoles.length; ++r) {
                            targetPlayers = this.getPlayersForRole(targetRoles[r]);
                            affected = [];
                            for (k = 0; k < targetPlayers.length; ++k) {
                                if (this.players[targetPlayers[k]] != player) {
                                    affected.push(targetPlayers[k]);
                                    this.removePlayer(this.players[targetPlayers[k]]);
                                }
                            }
                            if (affected.length > 0) {
                                actionMessage = onDeath.killmsg ? onDeath.killmsg : "±Game: Because ~Self~ died, ~Target~ (~Role~) died too!";
                                sendChanAll(actionMessage.replace(/~Self~/g, player.name).replace(/~Target~/g, readable(affected, "and")).replace(/~Role~/g, mafia.theme.trrole(targetRoles[r])), mafiachan);
                                needSeparator = true;
                            }
                        }
                    }
                    if ("poisonRoles" in onDeath) {
                        targetRoles = onDeath.poisonRoles;
                        for (r in targetRoles) {
                            var count;
                            targetPlayers = this.getPlayersForRole(r);
                            affected = [];
                            for (k = 0; k < targetPlayers.length; ++k) {
                                target = this.players[targetPlayers[k]];
                                count = onDeath.poisonRoles[r];
                                if (target.poisoned === undefined || target.poisonCount - target.poisoned >= (count ? count : 2)) {
                                    target.poisoned = 1;
                                    target.poisonCount = count || 2;
                                    target.poisonDeadMessage = onDeath.poisonDeadMessage;
                                    affected.push(targetPlayers[k]);
                                }
                            }
                            if (affected.length > 0) {
                                actionMessage = onDeath.poisonmsg ? onDeath.poisonmsg : "±Game: Because ~Self~ died, the ~Role~ was poisoned!";
                                sendChanAll(actionMessage.replace(/~Self~/g, player.name).replace(/~Target~/g, readable(affected, "and")).replace(/~Role~/g, mafia.theme.trrole(r)).replace(/~Count~/, count), mafiachan);
                                needSeparator = true;
                            }
                        }
                    }
                    if ("convertRoles" in onDeath) {
                        targetRoles = onDeath.convertRoles;
                        for (r in targetRoles) {
                            var newRole = onDeath.convertRoles[r];
                            targetPlayers = this.getPlayersForRole(r);
                            for (k = 0; k < targetPlayers.length; ++k) {
                                target = this.players[targetPlayers[k]];
                                mafia.setPlayerRole(target, newRole);
                                mafia.showOwnRole(sys.id(targetPlayers[k]));
                            }
                            if (targetPlayers.length > 0) {
                                actionMessage = onDeath.convertmsg ? onDeath.convertmsg : "±Game: Because ~Self~ died, the ~Old~ became a ~New~!";
                                sendChanAll(actionMessage.replace(/~Self~/g, player.name).replace(/~Target~/g, readable(targetPlayers, "and")).replace(/~Old~/g, mafia.theme.trrole(r)).replace(/~New~/, mafia.theme.trrole(newRole)), mafiachan);
                                needSeparator = true;
                            }
                        }
                    }
                    if ("exposeRoles" in onDeath) {
                        targetRoles = onDeath.exposeRoles;
                        for (r = 0; r < targetRoles.length; ++r) {
                            targetPlayers = this.getPlayersForRole(targetRoles[r]);
                            if (targetPlayers.length > 0) {
                                actionMessage = onDeath.exposemsg ? onDeath.exposemsg : "±Game: Before dying, ~Self~ exposed ~Target~ as the ~Role~!";
                                sendChanAll(actionMessage.replace(/~Self~/g, player.name).replace(/~Target~/g, readable(targetPlayers, "and")).replace(/~Role~/g, mafia.theme.trrole(targetRoles[r])), mafiachan);
                                needSeparator = true;
                            }
                        }
                    }
                    if (this.state == "day" && needSeparator) {
                        sendChanAll(border, mafiachan);
                    }
                }
            };
            this.kill = function (player) {
                if (this.theme.killmsg) {
                    sendChanAll(this.theme.killmsg.replace(/~Player~/g, player.name).replace(/~Role~/g, player.role.translation), mafiachan);
                } else {
                    sendChanAll("±Kill: " + player.name + " (" + player.role.translation + ") died!", mafiachan);
                }
                this.actionBeforeDeath(player);
                this.removePlayer(player);
            };
            this.removeTargets = function (player) {
                for (var action in player.role.actions.night) {
                    this.removeTarget(player, action);
                }
            };
            this.removeTarget = function (player, action) {
                var targetMode = player.role.actions.night[action].common;
                if (targetMode == 'Self') {
                    player.targets[action] = [];
                } else if (targetMode == 'Team') {
                    if (!(player.role.side in this.teamTargets)) {
                        this.teamTargets[player.role.side] = {};
                    }
                    this.teamTargets[player.role.side][action] = [];
                } else if (targetMode == 'Role') {
                    if (!(player.role.role in this.roleTargets)) {
                        this.roleTargets[player.role.role] = {};
                    }
                    this.roleTargets[player.role.role][action] = [];
                }
            };
            this.setRechargeFor = function (player, phase, action, count) {
                var commonTarget = phase == 'standby' ? 'Standby' : player.role.actions[phase][action].common;
                if (commonTarget == 'Self') {
                    player.recharges[action] = count;
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamRecharges)) {
                        this.teamRecharges[player.role.side] = {};
                    }
                    this.teamRecharges[player.role.side][action] = count;
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleRecharges)) {
                        this.roleRecharges[player.role.role] = {};
                    }
                    this.roleRecharges[player.role.role][action] = count;
                } else if (commonTarget == 'Standby') {
                    player.dayrecharges[action] = count;
                }
            };
            this.getRecharge = function (player, phase, action) {
                var commonTarget = phase == 'standby' ? 'Standby' : player.role.actions[phase][action].common;
                if (commonTarget == 'Self') {
                    return player.recharges[action];
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamRecharges)) {
                        this.teamRecharges[player.role.side] = {};
                    }
                    return this.teamRecharges[player.role.side][action];
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleRecharges)) {
                        this.roleRecharges[player.role.role] = {};
                    }
                    return this.roleRecharges[player.role.role][action];
                } else if (commonTarget == 'Standby') {
                    return player.dayrecharges[action];
                }
            };
            this.setChargesFor = function (player, phase, action, count) {
                var commonTarget = phase == 'standby' ? 'Standby' : player.role.actions[phase][action].common;
                if (commonTarget == 'Self') {
                    player.charges[action] = count;
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamCharges)) {
                        this.teamCharges[player.role.side] = {};
                    }
                    this.teamCharges[player.role.side][action] = count;
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleCharges)) {
                        this.roleCharges[player.role.role] = {};
                    }
                    this.roleCharges[player.role.role][action] = count;
                }
            };
            this.getCharges = function (player, phase, action) {
                var commonTarget = phase == 'standby' ? 'Standby' : player.role.actions[phase][action].common;
                if (commonTarget == 'Self') {
                    return player.charges[action];
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamCharges)) {
                        this.teamCharges[player.role.side] = {};
                    }
                    return this.teamCharges[player.role.side][action];
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleCharges)) {
                        this.roleCharges[player.role.role] = {};
                    }
                    return this.roleCharges[player.role.role][action];
                }
            };
            this.removeCharge = function (player, phase, action) {
                var commonTarget = phase == 'standby' ? 'Standby' : player.role.actions[phase][action].common;
                if (commonTarget == 'Self') {
                    player.charges[action] = player.charges[action] - 1;
                } else if (commonTarget == 'Team') {
                    this.teamCharges[player.role.side][action] = this.teamCharges[player.role.side][action] - 1;
                } else if (commonTarget == 'Role') {
                    this.roleCharges[player.role.role][action] = this.roleCharges[player.role.role][action] - 1;
                }
            };
            this.getTargetsFor = function (player, action) {
                var commonTarget = player.role.actions.night[action].common;
                if (commonTarget == 'Self') {
                    if (!(action in player.targets)) {
                        player.targets[action] = [];
                    }
                    return player.targets[action];
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamTargets)) {
                        this.teamTargets[player.role.side] = {};
                    }
                    if (!(action in this.teamTargets[player.role.side])) {
                        this.teamTargets[player.role.side][action] = [];
                    }
                    return this.teamTargets[player.role.side][action];
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleTargets)) {
                        this.roleTargets[player.role.role] = {};
                    }
                    if (!(action in this.roleTargets[player.role.role])) {
                        this.roleTargets[player.role.role][action] = [];
                    }
                    return this.roleTargets[player.role.role][action];
                }
            };
            this.setTarget = function (player, target, action) {
                var commonTarget = player.role.actions.night[action].common;
                var limit = 1;
                if (player.role.actions.night[action].limit !== undefined) {
                    limit = player.role.actions.night[action].limit;
                }
                var charges = mafia.getCharges(player, "night", command);
                if (charges !== undefined && charges < limit) {
                    limit = charges; //this is to stop it from potentially getting around the charge limit
                }
                var list;
                if (commonTarget == 'Self') {
                    if (!(action in player.targets)) {
                        player.targets[action] = [];
                    }
                    list = player.targets[action];
                } else if (commonTarget == 'Team') {
                    if (!(player.role.side in this.teamTargets)) {
                        this.teamTargets[player.role.side] = {};
                    }
                    if (!(action in this.teamTargets[player.role.side])) {
                        this.teamTargets[player.role.side][action] = [];
                    }
                    list = this.teamTargets[player.role.side][action];
                } else if (commonTarget == 'Role') {
                    if (!(player.role.role in this.roleTargets)) {
                        this.roleTargets[player.role.role] = {};
                    }
                    if (!(action in this.roleTargets[player.role.role])) {
                        this.roleTargets[player.role.role][action] = [];
                    }
                    list = this.roleTargets[player.role.role][action];
                }
                if (list.indexOf(target.name) == -1) {
                    list.push(target.name);
                    if (list.length > limit) {
                        list.splice(0, 1);
                    }
                }
                if (this.ticks > 0 && limit > 1) this.sendPlayer(player.name, "±Game: Your target(s) are " + list.join(', ') + "!");
            };
            this.setPlayerRole = function (player, role) {
                var act;
                player.role = mafia.theme.roles[role];
                if (typeof mafia.theme.roles[role].side == "object") {
                    player.role.side = randomSample(mafia.theme.roles[role].side.random);
                }
                if ("night" in player.role.actions) {
                    for (act in player.role.actions.night) {
                        if ("initialrecharge" in player.role.actions.night[act]) {
                            mafia.setRechargeFor(player, "night", act, player.role.actions.night[act].initialrecharge);
                        }
                        if ("charges" in player.role.actions.night[act]) {
                            mafia.setChargesFor(player, "night", act, player.role.actions.night[act].charges);
                        }
                    }
                }
                if ("standby" in player.role.actions) {
                    for (act in player.role.actions.standby) {
                        if ("initialrecharge" in player.role.actions.standby[act]) {
                            mafia.setRechargeFor(player, "standby", act, player.role.actions.standby[act].initialrecharge);
                        }
                    }
                }
                if ("initialCondition" in player.role.actions) {
                    var condition = player.role.actions.initialCondition;
                    if ("poison" in condition) {
                        player.poisoned = 1;
                        player.poisonCount = condition.poison.count || 2;
                        player.poisonDeadMessage = condition.poison.poisonDeadMessage;
                    }
                    if ("clearPoison" in condition) {
                        player.poisoned = undefined;
                    }
                }
            };
            this.testWin = function () {
                if (Object.keys(mafia.players).length === 0) {
                    sendChanAll("±Game: " + (mafia.theme.drawmsg ? mafia.theme.drawmsg : "Everybody died! This is why we can't have nice things :("), mafiachan);
                    sendChanAll(border, mafiachan);
                    mafia.clearVariables();
                    sys.removeVal("mafiagameplayers");
                    runUpdate();
                    return true;

                }

                var x, ws;

                outer: for (var p in mafia.players) {
                    //Roles which win when certain roles are dead
                    var winByDeadRoles;
                    if (mafia.players[p].role.hasOwnProperty("winIfDeadRoles")) {
                        var deadRoles = mafia.players[p].role.winIfDeadRoles;
                        winByDeadRoles = true;
                        for (var t = 0; t < deadRoles.length; ++t) {
                            if (mafia.getPlayersForRoleS(deadRoles[t]) !== "") {
                                winByDeadRoles = false;
                                break;
                            }
                        }
                    }
                    var winSide = mafia.players[p].role.side;
                    var players = [];
                    var goodPeople = [];
                    if (winByDeadRoles) {
                        players = mafia.getPlayersForTeam(winSide);
                        for (x in mafia.players) {
                            if (mafia.players[x].role.hasOwnProperty("winningSides")) {
                                ws = mafia.players[x].role.winningSides;
                                if (players.indexOf(x) == -1 && (ws == "*" || (Array.isArray(ws) && ws.indexOf(winSide) >= 0))) {
                                    players.push(x);
                                }
                            }
                        }
                    } else {
                        if (winSide != 'village') {
                            for (var i in mafia.theme.villageCantLoseRoles) {
                                if (mafia.player(mafia.theme.villageCantLoseRoles[i]) != noPlayer)
                                // baddies shouldn't win if vigi, mayor or samurai is alive
                                continue outer;
                            }
                        }
                        for (x in mafia.players) {
                            // Roles which win with multiple sides
                            if (mafia.players[x].role.hasOwnProperty("winningSides")) {
                                ws = mafia.players[x].role.winningSides;
                                if (ws == "*" || (Array.isArray(ws) && ws.indexOf(winSide) >= 0)) {
                                    players.push(x);
                                    continue; // inner
                                }
                            }
                            if (mafia.players[x].role.side == winSide) {
                                players.push(x);
                            } else if (winSide == 'village') {
                                // if winSide = villy all people must be good people
                                continue outer;
                            } else if (mafia.players[x].role.side == 'village') {
                                goodPeople.push(x);
                            } else {
                                // some other baddie team alive
                                continue outer;
                            }
                        }
                    }

                    if (winByDeadRoles || players.length >= goodPeople.length) {
                        if (winSide in mafia.theme.sideWinMsg) {
                            sendChanAll(mafia.theme.sideWinMsg[winSide].replace(/~Players~/g, readable(players, "and")), mafiachan);
                        } else {
                            sendChanAll("±Game: The " + mafia.theme.trside(winSide) + " (" + readable(players, "and") + ") wins!", mafiachan);
                        }
                        if (winByDeadRoles) {
                            var losingSides = [];
                            for (var tr in mafia.theme.sideTranslations) {
                                if (tr !== winSide && mafia.getPlayersForTeamS(tr) !== "") {
                                    var lp = mafia.getPlayersForTeam(tr).filter(function (x) {
                                        if (players.indexOf(x) >= 0) return false;
                                        else return true;
                                    });
                                    if (lp.length > 0) {
                                        losingSides.push(mafia.theme.trside(tr) + " (" + readable(lp, "and") + ")");
                                    }
                                }
                            }
                            if (losingSides.length > 0) {
                                sendChanAll("±Game: The " + readable(losingSides, "and") + " lose!", mafiachan);
                            }
                        } else if (goodPeople.length > 0) {
                            sendChanAll("±Game: The " + mafia.theme.trside('village') + " (" + readable(goodPeople, "and") + ") lose!", mafiachan);
                        }
                        sendChanAll(border, mafiachan);
                        mafia.clearVariables();
                        sys.removeVal("mafiagameplayers");
                        runUpdate();
                        return true;
                    }
                }
                return false;
            };

            function randomSample(hash) {
                var cum = 0;
                var val = Math.random();
                var psum = 0.0;
                var x;
                var count = 0;
                for (x in hash) {
                    psum += hash[x];
                    count += 1;
                }
                if (psum === 0.0) {
                    var j = 0;
                    for (x in hash) {
                        cum = (++j) / count;
                        if (cum >= val) {
                            return x;
                        }
                    }
                } else {
                    for (x in hash) {
                        cum += hash[x] / psum;
                        if (cum >= val) {
                            return x;
                        }
                    }
                }
            }

            this.handlers = {
                entry: function () {
                    sendChanAll(border, mafiachan);
                    sendChanAll("Times Up! :", mafiachan);

                    // Save stats if the game was played
                    CurrentGame.playerCount = mafia.signups.length;
                    PreviousGames.push(CurrentGame);
                    savePlayedGames();

                    currentStalk.push("*** ::: ::: Log for " + mafia.theme.name + "-themed mafia game ::: ::: ***");
                    var minp;
                    if (mafia.theme.minplayers === undefined || isNaN(mafia.theme.minplayers) || mafia.theme.minplayers < 3) {
                        minp = 5;
                    } else {
                        minp = mafia.theme.minplayers;
                    }
                    if (mafia.signups.length < minp) {
                        sendChanAll("Well, Not Enough Players! :", mafiachan);
                        sendChanAll("You need at least " + minp + " players to join (Current; " + mafia.signups.length + ").", mafiachan);
                        sendChanAll(border, mafiachan);
                        mafia.clearVariables();
                        return;
                    }

                    /* Resetting the Random Sides Object */
                    for (var x in mafia.theme.randomSideRoles) {
                        mafia.theme.roles[x].side = mafia.theme.randomSideRoles[x];
                    }

                    /* Creating the roles list */
                    var i = 1;
                    while (mafia.signups.length > mafia.theme["roles" + i].length) {
                        ++i;
                    }
                    var srcArray = mafia.theme["roles" + i].slice(0, mafia.signups.length);

                    srcArray = shuffle(srcArray);

                    for (i = 0; i < srcArray.length; ++i) {
                        mafia.players[mafia.signups[i]] = {
                            'name': mafia.signups[i],
                            'role': mafia.theme.roles[srcArray[i]],
                            'targets': {},
                            'recharges': {},
                            'dayrecharges': {},
                            'charges': {}
                        };
                        var rechargeplayer = mafia.players[mafia.signups[i]];
                        var initPlayer = mafia.players[mafia.signups[i]];
                        if ("night" in initPlayer.role.actions) {
                            for (var act in initPlayer.role.actions.night) {
                                if ("initialrecharge" in initPlayer.role.actions.night[act]) {
                                    mafia.setRechargeFor(initPlayer, "night", act, initPlayer.role.actions.night[act].initialrecharge);
                                }
                                if ("charges" in initPlayer.role.actions.night[act]) {
                                    mafia.setChargesFor(initPlayer, "night", act, initPlayer.role.actions.night[act].charges);
                                }
                            }
                        }
                        if ("standby" in initPlayer.role.actions) {
                            for (act in initPlayer.role.actions.standby) {
                                if ("initialrecharge" in initPlayer.role.actions.standby[act]) {
                                    mafia.setRechargeFor(initPlayer, "standby", act, initPlayer.role.actions.standby[act].initialrecharge);
                                }
                            }
                        }
                        if ("initialCondition" in initPlayer.role.actions) {
                            var condition = initPlayer.role.actions.initialCondition;
                            if ("poison" in condition) {
                                initPlayer.poisoned = 1;
                                initPlayer.poisonCount = condition.poison.count || 2;
                                initPlayer.poisonDeadMessage = condition.poison.poisonDeadMessage;
                            }
                        }
                        if (typeof mafia.theme.roles[srcArray[i]].side == "object") {
                            if ("random" in mafia.theme.roles[srcArray[i]].side) {
                                var side = randomSample(mafia.theme.roles[srcArray[i]].side.random);
                                mafia.players[mafia.signups[i]].role.side = side;
                            }
                        }
                    }

                    currentStalk.push("Players: " + Object.keys(mafia.players).map(name_trrole, mafia.theme).join(", "));

                    sendChanAll("The Roles have been Decided! :", mafiachan);
                    var p, player;
                    for (p in mafia.players) {
                        player = mafia.players[p];
                        var role = player.role;

                        if (typeof role.actions.startup == "object" && typeof role.actions.startup.revealAs == "string") {
                            mafia.sendPlayer(player.name, "±Game: You are a " + mafia.theme.trrole(role.actions.startup.revealAs) + "!");
                        } else {
                            mafia.sendPlayer(player.name, "±Game: You are a " + role.translation + "!");
                        }
                        mafia.sendPlayer(player.name, "±Game: " + role.help);

                        if (role.actions.startup == "team-reveal") {
                            mafia.sendPlayer(player.name, "±Game: Your team is " + mafia.getPlayersForTeamS(role.side) + ".");
                        }
                        if (role.actions.startup == "team-reveal-with-roles") {
                            var playersRole = mafia.getPlayersForTeam(role.side).map(name_trrole, mafia.theme);
                            mafia.sendPlayer(player.name, "±Game: Your team is " + readable(playersRole, "and") + ".");
                        }
                        if (typeof role.actions.startup == "object" && Array.isArray(role.actions.startup["team-revealif"])) {
                            if (role.actions.startup["team-revealif"].indexOf(role.side) != -1) {
                                mafia.sendPlayer(player.name, "±Game: Your team is " + mafia.getPlayersForTeamS(role.side) + ".");
                            }
                        }
                        if (role.actions.startup == "role-reveal") {
                            mafia.sendPlayer(player.name, "±Game: People with your role are " + mafia.getPlayersForRoleS(role.role) + ".");
                        }

                        if (typeof role.actions.startup == "object" && role.actions.startup.revealRole) {
                            if (typeof role.actions.startup.revealRole == "string") {
                                if (mafia.getPlayersForRoleS(player.role.actions.startup.revealRole) !== "") mafia.sendPlayer(player.name, "±Game: The " + mafia.theme.roles[role.actions.startup.revealRole].translation + " is " + mafia.getPlayersForRoleS(player.role.actions.startup.revealRole) + "!");
                            } else if (Array.isArray(role.actions.startup.revealRole)) {
                                for (var s = 0, l = role.actions.startup.revealRole.length; s < l; ++s) {
                                    var revealrole = role.actions.startup.revealRole[s];
                                    if (mafia.getPlayersForRoleS(revealrole) !== "") mafia.sendPlayer(player.name, "±Game: The " + mafia.theme.roles[revealrole].translation + " is " + mafia.getPlayersForRoleS(revealrole) + "!");
                                }
                            }
                        }
                    }
                    sendChanAll("Current Roles: " + mafia.getCurrentRoles() + ".", mafiachan);
                    sendChanAll("Current Players: " + mafia.getCurrentPlayers() + ".", mafiachan);
                    // Send players all roles sided with them
                    for (p in mafia.players) {
                        player = mafia.players[p];
                        mafia.sendPlayer(player.name, "Current Team: " + mafia.getRolesForTeamS(player.role.side));
                    }
                    if (mafia.theme.ticks === undefined || isNaN(mafia.theme.ticks.night) || mafia.theme.ticks.night < 1 || mafia.theme.ticks.night > 60) {
                        mafia.ticks = 30;
                    } else {
                        mafia.ticks = mafia.theme.ticks.night;
                    }
                    sendChanAll("Time: Night", mafiachan);
                    sendChanAll("Make your moves, you only have " + mafia.ticks + " seconds! :", mafiachan);
                    sendChanAll(border, mafiachan);
                    mafia.state = "night";
                    mafia.resetTargets();
                    mafia.reduceRecharges();
                },
                night: function () {
                    sendChanAll(border, mafiachan);
                    sendChanAll("Times Up! :", mafiachan);

                    this.compilePhaseStalk("NIGHT");

                    var nightkill = false;
                    var getTeam = function (role, commonTarget) {
                        var team = [];
                        if (commonTarget == 'Role') {
                            team = mafia.getPlayersForRole(role.role);
                        } else if (commonTarget == 'Team') {
                            team = mafia.getPlayersForTeam(role.side);
                        }
                        return team;
                    };
                    var stalkTargets = {};
                    for (var s in mafia.players) {
                        stalkTargets[s] = {};
                        if (!("night" in mafia.players[s].role.actions)) continue;
                        var targetActions = Object.keys(mafia.players[s].role.actions.night);
                        for (var act = 0; act < targetActions.length; ++act) {
                            var foundTargets = mafia.getTargetsFor(mafia.players[s], targetActions[act]);
                            for (var f = 0; f < foundTargets.length; ++f) {
                                stalkTargets[s][foundTargets[f]] = 1;
                            }
                        }
                    }
                    var player, names, j;
                    for (var i in mafia.theme.nightPriority) {
                        var o = mafia.theme.nightPriority[i];
                        names = mafia.getPlayersForRole(o.role);
                        var command = o.action;
                        var Action = mafia.theme.roles[o.role].actions.night[o.action];
                        if ("command" in Action) {
                            command = Action.command; // translate to real command
                        }
                        var rechargeCount = 0;
                        if ("recharge" in Action) { // a command that can only be used once every X nights
                            rechargeCount = Action.recharge;
                        }
                        //Fail chance for common:Role and Team
                        if (["Role", "Team"].indexOf(Action.common) != -1 && "failChance" in Action && Action.failChance > Math.random()) {
                            for (var f in names) {
                                if (mafia.getTargetsFor(mafia.players[names[f]], o.action).length > 0) {
                                    mafia.sendPlayer(names[f], "±Game: You couldn't " + o.action + " this night!");
                                }
                            }
                            continue;
                        }
                        var rolecheck;
                        var teamcheck;
                        for (j = 0; j < names.length; ++j) {
                            if (!mafia.isInGame(names[j])) continue;
                            player = mafia.players[names[j]];
                            var targets = mafia.getTargetsFor(player, o.action);
                            var target, t; // current target
                            //Fail chance for common:Self
                            if (Action.common == "Self" && "failChance" in Action && Action.failChance > Math.random()) {
                                if (targets.length > 0) {
                                    mafia.sendPlayer(player.name, "±Game: You couldn't " + o.action + " this night!");
                                }
                                continue;
                            }
                            // Limit the use of this command for the following nights
                            if (rechargeCount > 0 && targets.length > 0) {
                                // set the recharge period
                                mafia.setRechargeFor(player, "night", o.action, rechargeCount);
                            }
                            var charges = mafia.getCharges(player, "night", o.action);

                            if (charges !== undefined && targets.length > 0 && rolecheck !== player.role.role && teamcheck !== player.role.side) {
                                mafia.removeCharge(player, "night", o.action);
                                if (Action.common == "Role" && rolecheck === undefined) {
                                    rolecheck = player.role.role;
                                }
                                if (Action.common == "Team" && teamcheck === undefined) {
                                    teamcheck = player.role.side;
                                }
                            }
                            if (mafia.getCharges(player, "night", o.action) !== undefined) {
                                var charge = mafia.getCharges(player, "night", o.action);
                                var chargetxt = "You have " + charge + " charges remaining";
                                if (Action.chargesmsg) {
                                    chargetxt = Action.chargesmsg.replace(/~Charges~/g, charge);
                                }
                                mafia.sendPlayer(player.name, "±Game: " + chargetxt);
                            }
                            for (t in targets) {
                                target = targets[t];
                                if (!mafia.isInGame(target)) {
                                    if (command != "stalk") continue;
                                } else {
                                    target = mafia.players[target];

                                    var targetMode;
                                    var revenge = false;
                                    var revengetext = "±Game: You were killed during the night!";
                                    var poisonrevenge, poisonDeadMessage;
                                    var poisonrevengetext = "±Game: Your target poisoned you!";

                                    // Action blocked by Protect or Safeguard
                                    if ((target.guarded && command == "kill") || (target.safeguarded && ["distract", "inspect", "stalk", "poison", "convert"].indexOf(command) !== -1)) {
                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") was " + (command == "kill" ? "protected" : "guarded") + "!");
                                        // Action can be countered even if target is protected/guarded
                                        if (command in target.role.actions) {
                                            targetMode = target.role.actions[command];
                                            if (targetMode.mode == "killattackerevenifprotected") {
                                                if (targetMode.msg) revengetext = targetMode.msg;
                                                mafia.sendPlayer(player.name, revengetext);
                                                mafia.kill(player);
                                                nightkill = true;
                                            } else if (targetMode.mode == "poisonattackerevenifprotected") {
                                                poisonrevenge = targetMode.count || 2;
                                                if (player.poisoned === undefined || player.poisonCount - player.poisoned >= poisonrevenge) {
                                                    if (targetMode.msg) poisonrevengetext = targetMode.msg;
                                                    mafia.sendPlayer(player.name, poisonrevengetext);
                                                    player.poisoned = 1;
                                                    player.poisonCount = poisonrevenge;
                                                    player.poisonDeadMessage = targetMode.poisonDeadMessage;
                                                }
                                            }
                                        }
                                        continue;
                                    }

                                    // Defensive Modes
                                    if (command in target.role.actions) {
                                        targetMode = target.role.actions[command];
                                        if (targetMode.mode == "ignore") {
                                            if (command == "distract") {
                                                var distractMsg = targetMode.msg || "The ~Distracter~ came to you last night, but you ignored her!";
                                                mafia.sendPlayer(target.name, "±Game: " + distractMsg.replace(/~Distracter~/g, player.role.translation));
                                            } else {
                                                if (targetMode.silent !== true) {
                                                    if (targetMode.msg) {
                                                        mafia.sendPlayer(player.name, targetMode.msg.replace(/~Self~/g, target.name));
                                                    } else {
                                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") evaded your " + o.action + "!");
                                                    }
                                                }
                                            }
                                            continue;
                                        }
                                        else if (targetMode.mode == "ChangeTarget") {
                                            if (targetMode.targetmsg) {
                                                mafia.sendPlayer(player.name, "±Game: " + targetMode.targetmsg);
                                            } else if (targetMode.hookermsg) {
                                                mafia.sendPlayer(player.name, "±Game: " + targetMode.hookermsg);
                                            }
                                            mafia.sendPlayer(target.name, "±Game: " + targetMode.msg.replace(/~Distracter~/g, player.role.translation).replace(/~User~/g, player.role.translation));
                                            mafia.kill(player);
                                            nightkill = true;
                                            mafia.removeTargets(target);
                                            stalkTargets[target.name] = {};
                                            continue;
                                        }
                                        else if (targetMode.mode == "killattacker" || targetMode.mode == "killattackerevenifprotected") {
                                            revenge = true;
                                            if (targetMode.msg) revengetext = targetMode.msg;
                                        }
                                        else if (targetMode.mode == "poisonattacker" || targetMode.mode == "poisonattackerevenifprotected") {
                                            poisonrevenge = targetMode.count || 2;
                                            poisonDeadMessage = targetMode.poisonDeadMessage;
                                            if (targetMode.msg) poisonrevengetext = targetMode.msg;
                                        }
                                        else if (typeof targetMode.mode == "object") {
                                            if ("evadeChance" in targetMode.mode && targetMode.mode.evadeChance > Math.random()) {
                                                mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") evaded your " + o.action + "!");
                                                continue;
                                            }
                                            if ("ignore" in targetMode.mode && targetMode.mode.ignore.indexOf(player.role.role) != -1) {
                                                if (command == "distract") {
                                                    var distractMsg = targetMode.msg || "The ~Distracter~ came to you last night, but you ignored her!";
                                                    mafia.sendPlayer(target.name, "±Game: " + distractMsg.replace(/~Distracter~/g, player.role.translation));
                                                } else {
                                                    if (targetMode.silent !== true) {
                                                        if (targetMode.msg) {
                                                            mafia.sendPlayer(player.name, targetMode.msg.replace(/~Self~/g, target.name));
                                                        } else {
                                                            mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") evaded your " + o.action + "!");
                                                        }
                                                    }
                                                }
                                                continue;
                                            }
                                            if ("killif" in targetMode.mode && targetMode.mode.killif.indexOf(player.role.role) != -1) {
                                                if (targetMode.targetmsg) {
                                                    mafia.sendPlayer(player.name, "±Game: " + targetMode.targetmsg);
                                                } else if (targetMode.hookermsg) {
                                                    mafia.sendPlayer(player.name, "±Game: " + targetMode.hookermsg);
                                                }
                                                mafia.sendPlayer(target.name, "±Game: " + targetMode.msg.replace(/~Distracter~/g, player.role.translation).replace(/~User~/g, player.role.translation));
                                                mafia.kill(player);
                                                nightkill = true;
                                                mafia.removeTargets(target);
                                                stalkTargets[target.name] = {};
                                                continue;
                                            }
                                        }
                                    }
                                }

                                if (command == "distract") {
                                    // enables custom distracter message
                                    var distractCustomMsg = Action.distractmsg;
                                    // "distractmsg" item under "night" { "distract" }
                                    if (typeof distractCustomMsg == "string") {
                                        mafia.sendPlayer(target.name, "±Game: " + distractCustomMsg.replace(/~Distracter~/g, player.role.translation));
                                    }
                                    else {
                                        mafia.sendPlayer(target.name, "±Game: The " + player.role.translation + " came to you last night! You were too busy being distracted!");
                                    }
                                    mafia.removeTargets(target);
                                    stalkTargets[target.name] = {};

                                    /* warn role / teammates */
                                    var teamMsg = Action.teammsg;
                                    // above defined "distract": { "teammsg": <string> }
                                    if ("night" in target.role.actions) {
                                        for (var action in target.role.actions.night) {
                                            var team = getTeam(target.role, target.role.actions.night[action].common);
                                            for (var x in team) {
                                                if (team[x] != target.name) {
                                                    // now we check if teammsg was defined for the role
                                                    if (teamMsg === undefined) {
                                                        mafia.sendPlayer(team[x], "±Game: Your teammate was too busy with the " + player.role.translation + " during the night, you decided not to " + action + " anyone during the night!");
                                                    }
                                                    else if (typeof teamMsg == "string") {
                                                        mafia.sendPlayer(team[x], "±Game: " + teamMsg.replace(/~Distracter~/g, player.role.translation).replace(/~Action~/g, action));
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                else if (command == "protect") {
                                    target.guarded = true;
                                }
                                else if (command == "safeguard") {
                                    target.safeguarded = true;
                                }
                                else if (command == "inspect") {
                                    var Sight = Action.Sight;
                                    targetMode = targetMode || {};
                                    if (targetMode.revealSide !== undefined || Sight === "Team") {
                                        mafia.sendPlayer(player.name, "±Info: " + target.name + " is sided with the " + mafia.theme.trside(target.role.side) + "!!");
                                    } else if (typeof Sight == "object") {
                                        var srole = randomSample(Sight);
                                        mafia.sendPlayer(player.name, "±Info: " + target.name + " is the " + mafia.theme.trrole((srole == "true") ? target.role.role : srole) + "!!");
                                    } else if (targetMode.revealAs !== undefined) {
                                        if (typeof targetMode.revealAs == "string") {
                                            if (targetMode.revealAs == "*") {
                                                var rr = 1;
                                                while (mafia.signups.length > mafia.theme["roles" + rr].length) {
                                                    ++rr;
                                                }
                                                var rrole = mafia.theme["roles" + rr].slice(0, mafia.signups.length);
                                                mafia.sendPlayer(player.name, "±Info: " + target.name + " is the " + mafia.theme.trrole(rrole[Math.floor(Math.random() * rrole.length)]) + "!!");
                                            } else {
                                                mafia.sendPlayer(player.name, "±Info: " + target.name + " is the " + mafia.theme.trrole(targetMode.revealAs) + "!!");
                                            }
                                        } else if (Array.isArray(targetMode.revealAs)) {
                                            mafia.sendPlayer(player.name, "±Info: " + target.name + " is the " + mafia.theme.trrole(targetMode.revealAs[Math.floor(Math.random() * targetMode.revealAs.length)]) + "!!");
                                        }
                                    } else {
                                        mafia.sendPlayer(player.name, "±Info: " + target.name + " is the " + target.role.translation + "!!");
                                    }
                                }
                                else if (command == "kill") {
                                    if (!Action.msg) {
                                        if (mafia.theme.killusermsg) {
                                            mafia.sendPlayer(target.name, mafia.theme.killusermsg);
                                        } else {
                                            mafia.sendPlayer(target.name, "±Game: You were killed during the night!");
                                        }
                                    } else {
                                        mafia.sendPlayer(target.name, Action.msg); // custom kill message for the killer
                                    }
                                    mafia.kill(target);
                                    nightkill = true;
                                }
                                else if (command == "poison") {
                                    if (target.poisoned === undefined || target.poisonCount - target.poisoned >= (Action.count ? Action.count : 2)) {
                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") was poisoned!");
                                        target.poisoned = 1;
                                        target.poisonCount = Action.count || 2;
                                        target.poisonDeadMessage = Action.poisonDeadMessage;
                                    }
                                }
                                else if (command == "stalk") {
                                    target = typeof target == "object" ? target.name : target;
                                    var visited = Object.keys(stalkTargets[target]).sort();
                                    if (visited.length > 0) {
                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target + ") visited " + readable(visited, "and") + " this night!");
                                    } else {
                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target + ") didn't visit anyone this night!");
                                    }
                                }
                                else if (command == "convert") {
                                    if ("canConvert" in Action && Action.canConvert != "*" && Action.canConvert.indexOf(target.role.role) == -1) {
                                        mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") couldn't be converted!");
                                    } else {
                                        var oldRole = target.role,
                                            newRole;
                                        if (typeof Action.newRole == "object") {
                                            if ("random" in Action.newRole && !Array.isArray(Action.newRole.random) && typeof Action.newRole.random === "object" && Action.newRole.random !== null) {
                                                newRole = randomSample(Action.newRole.random);
                                            } else {
                                                var possibleRoles = shuffle(Object.keys(Action.newRole));
                                                for (var nr in possibleRoles) {
                                                    if (Action.newRole[possibleRoles[nr]].indexOf(oldRole.role) != -1) {
                                                        newRole = possibleRoles[nr];
                                                        break;
                                                    }
                                                }
                                            }
                                        } else {
                                            newRole = Action.newRole;
                                        }
                                        if (newRole === undefined) {
                                            mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") couldn't be converted!");
                                        } else {
                                            mafia.setPlayerRole(target, newRole);
                                            if (!Action.silent) {
                                                if ("convertmsg" in Action) {
                                                    sendChanAll("±Game: " + Action.convertmsg.replace(/~Target~/g, target.name).replace(/~Old~/g, oldRole.translation).replace(/~New~/g, target.role.translation), mafiachan);
                                                } else {
                                                    sendChanAll("±Game: A " + oldRole.translation + " has been converted into a " + target.role.translation + "!", mafiachan);
                                                }
                                            }
                                            if (target !== player) {
                                                if ("usermsg" in Action) {
                                                    mafia.sendPlayer(player.name, "±Game: " + Action.usermsg.replace(/~Target~/g, target.name).replace(/~Old~/g, oldRole.translation).replace(/~New~/g, target.role.translation), mafiachan);
                                                } else {
                                                    mafia.sendPlayer(player.name, "±Game: Your target (" + target.name + ") has been converted and is now a " + target.role.translation + "!");
                                                }
                                            }
                                            mafia.sendPlayer(target.name, "±Game: You have been converted and changed roles!");
                                            mafia.showOwnRole(sys.id(target.name));
                                        }
                                    }
                                }

                                //Post-Action effects here
                                if (revenge) {
                                    mafia.sendPlayer(player.name, revengetext);
                                    mafia.kill(player);
                                    nightkill = true;
                                } else if (poisonrevenge > 0) {
                                    if (player.poisoned === undefined || player.poisonCount - player.poisoned >= poisonrevenge) {
                                        mafia.sendPlayer(player.name, poisonrevengetext);
                                        player.poisoned = 1;
                                        player.poisonCount = poisonrevenge;
                                        player.poisonDeadMessage = poisonDeadMessage;
                                    }
                                }
                            }
                        }
                    }
                    // decrease counters
                    for (var p in mafia.players) {
                        player = mafia.players[p];
                        var poisonCount = player.poisonCount;
                        if (poisonCount !== undefined) {
                            if (player.poisoned < poisonCount) {
                                mafia.sendPlayer(player.name, "±Game: You have " + (player.poisonCount - player.poisoned) + " days to live.");
                                player.poisoned++;
                            } else if (player.poisoned >= poisonCount) {
                                mafia.sendPlayer(player.name, "±Game: " + (player.poisonDeadMessage ? player.poisonDeadMessage : "You died because of Poison!"));
                                mafia.kill(player);
                                nightkill = true; // kinda night kill
                            }
                        }
                    }
                    this.reduceRecharges();

                    if (!nightkill) {
                        sendChanAll("No one died! :", mafiachan);
                    }

                    if (mafia.testWin()) {
                        return;
                    }

                    if (mafia.theme.ticks === undefined || isNaN(mafia.theme.ticks.standby) || mafia.theme.ticks.standby < 1 || mafia.theme.ticks.standby > 60) {
                        mafia.ticks = 30;
                    } else {
                        mafia.ticks = mafia.theme.ticks.standby;
                    }
                    if (mafia.players.length >= 15) {
                        mafia.ticks = parseInt(mafia.ticks * 1.33, 10);
                    } else if (mafia.players.length <= 4) {
                        mafia.ticks = parseInt(mafia.ticks * 0.5, 10);
                        if (mafia.ticks < 1) {
                            mafia.ticks = 1;
                        }
                    }

                    sendChanAll(border, mafiachan);

                    sendChanAll("Current Roles: " + mafia.getCurrentRoles() + ".", mafiachan);
                    sendChanAll("Current Players: " + mafia.getCurrentPlayers() + ".", mafiachan);
                    // Send players all roles sided with them
                    for (p in mafia.players) {
                        player = mafia.players[p];
                        var side = player.role.side;
                        mafia.sendPlayer(player.name, "Current Team: " + mafia.getRolesForTeamS(side));
                    }
                    sendChanAll("Time: Day", mafiachan);
                    sendChanAll("You have " + mafia.ticks + " seconds to debate who are the bad guys! :", mafiachan);
                    for (var role in mafia.theme.standbyRoles) {
                        names = mafia.getPlayersForRole(mafia.theme.standbyRoles[role]);
                        for (j = 0; j < names.length; ++j) {
                            for (var k in mafia.players[names[j]].role.actions.standby) {
                                if (mafia.players[names[j]].role.actions.standby[k].msg) {
                                    mafia.sendPlayer(names[j], mafia.players[names[j]].role.actions.standby[k].msg);
                                }
                            }
                        }
                    }
                    sendChanAll(border, mafiachan);

                    mafia.state = "standby";
                },
                standby: function () {
                    mafia.ticks = 30;

                    this.compilePhaseStalk("STANDBY");

                    sendChanAll(border, mafiachan);

                    sendChanAll("Current Roles: " + mafia.getCurrentRoles() + ".", mafiachan);
                    sendChanAll("Current Players: " + mafia.getCurrentPlayers() + ".", mafiachan);
                    // Send players all roles sided with them
                    for (var p in mafia.players) {
                        var player = mafia.players[p];
                        var side = player.role.side;
                        mafia.sendPlayer(player.name, "Current Team: " + mafia.getRolesForTeamS(side));
                        if (p in mafia.dayRecharges) {
                            for (var r in mafia.dayRecharges[p]) {
                                mafia.setRechargeFor(player, "standby", r, player.role.actions.standby[r].recharge);
                            }
                        }
                    }
                    var nolyn = false;
                    if (mafia.theme.nolynch !== undefined && mafia.theme.nolynch !== false) {
                        nolyn = true;
                    }
                    if (nolyn === false) {
                        sendChanAll("Time: Day", mafiachan);
                        sendChanAll("It's time to vote someone off, type /Vote [name], you only have " + mafia.ticks + " seconds! :", mafiachan);
                        sendChanAll(border, mafiachan);

                        mafia.state = "day";
                        mafia.votes = {};
                        mafia.voteCount = 0;
                    } else {
                        if (mafia.theme.ticks === undefined || isNaN(mafia.theme.ticks.night) || mafia.theme.ticks.night < 1 || mafia.theme.ticks.night > 60) {
                            mafia.ticks = 30;
                        } else {
                            mafia.ticks = mafia.theme.ticks.night;
                        }
                        sendChanAll("Time: Night", mafiachan);
                        sendChanAll("Make your moves, you only have " + mafia.ticks + " seconds! :", mafiachan);
                        sendChanAll(border, mafiachan);
                        for (var x = 0; x < mafia.usersToSlay.length; x++) {
                            var i = mafia.usersToSlay[x];
                            mafia.slayUser(Config.capsbot, i);
                        }
                        mafia.usersToSlay = [];

                        mafia.state = "night";
                        mafia.resetTargets();
                    }
                },
                day: function () {
                    sendChanAll(border, mafiachan);
                    sendChanAll("Times Up! :", mafiachan);

                    var voted = {},
                        player, vote;
                    for (var pname in mafia.votes) {
                        player = mafia.players[pname];
                        var target = mafia.votes[pname];
                        // target play have been killed meanwhile by slay
                        if (!mafia.isInGame(target)) continue;
                        if (!(target in voted)) {
                            voted[target] = 0;
                        }
                        vote = player.role.actions.vote;
                        if (vote !== undefined) {
                            if (typeof vote === "number") {
                                voted[target] += vote;
                            } else {
                                voted[target] += sys.rand(vote[0], vote[1]);
                            }
                        } else {
                            voted[target] += 1;
                        }
                    }
                    var tie = true,
                        maxi = 0,
                        downed = noPlayer,
                        voteshield;
                    for (var x in voted) {
                        player = mafia.players[x];
                        voteshield = player.role.actions.voteshield;
                        if (voteshield !== undefined) {
                            if (typeof voteshield === "number") {
                                voted[x] += voteshield;
                            } else {
                                voted[x] += sys.rand(voteshield[0], voteshield[1]);
                            }
                        }
                        if (voted[x] == maxi) {
                            tie = true;
                        } else if (voted[x] > maxi) {
                            tie = false;
                            maxi = voted[x];
                            downed = x;
                        }
                    }

                    if (tie) {
                        sendChanAll("No one was voted off! :", mafiachan);
                        sendChanAll(border, mafiachan);
                    } else {
                        var lynched = mafia.players[downed];
                        if ("lynch" in lynched.role.actions && "convertTo" in lynched.role.actions.lynch) {
                            var newRole = lynched.role.actions.lynch.convertTo;
                            if ("convertmsg" in lynched.role.actions.lynch) {
                                sendChanAll("±Game: " + lynched.role.actions.lynch.convertmsg.replace(/~Self~/g, downed).replace(/~Old~/g, lynched.role.translation).replace(/~New~/g, mafia.theme.trrole(newRole)).replace(/~Count~/g, maxi), mafiachan);
                            } else {
                                sendChanAll("±Game: " + downed + ", the " + lynched.role.translation + " survived the lynch and became a " + mafia.theme.trrole(newRole) + "!", mafiachan);
                            }
                            mafia.setPlayerRole(lynched, newRole);
                            mafia.showOwnRole(sys.id(downed));
                        } else {
                            var roleName = typeof mafia.players[downed].role.actions.lynch == "object" && typeof mafia.players[downed].role.actions.lynch.revealAs == "string" ? mafia.theme.trrole(mafia.players[downed].role.actions.lynch.revealAs) : mafia.players[downed].role.translation;
                            var lynchmsg = mafia.theme.lynchmsg ? mafia.theme.lynchmsg : "±Game: ~Player~ (~Role~) was removed from the game!";
                            sendChanAll(lynchmsg.replace(/~Player~/g, downed).replace(/~Role~/g, roleName).replace(/~Side~/g, mafia.theme.trside(mafia.players[downed].role.side)).replace(/~Count~/g, maxi), mafiachan);
                            mafia.actionBeforeDeath(lynched);
                            mafia.removePlayer(mafia.players[downed]);
                        }

                        if (mafia.testWin()) return;
                    }

                    sendChanAll("Current Roles: " + mafia.getCurrentRoles() + ".", mafiachan);
                    sendChanAll("Current Players: " + mafia.getCurrentPlayers() + ".", mafiachan);
                    // Send players all roles sided with them
                    for (var p in mafia.players) {
                        player = mafia.players[p];
                        var side = player.role.side;
                        mafia.sendPlayer(player.name, "Current Team: " + mafia.getRolesForTeamS(side));
                    }
                    if (mafia.theme.ticks === undefined || isNaN(mafia.theme.ticks.night) || mafia.theme.ticks.night < 1 || mafia.theme.ticks.night > 60) {
                        mafia.ticks = 30;
                    } else {
                        mafia.ticks = mafia.theme.ticks.night;
                    }
                    sendChanAll("Time: Night", mafiachan);
                    sendChanAll("Make your moves, you only have " + mafia.ticks + " seconds! :", mafiachan);
                    sendChanAll(border, mafiachan);
                    for (var x = 0; x < mafia.usersToSlay.length; x++) {
                        var i = mafia.usersToSlay[x];
                        mafia.slayUser(Config.capsbot, i);
                    }
                    mafia.usersToSlay = [];
                    mafia.state = "night";
                    mafia.resetTargets();
                },
                voting: function () {
                    this.state = "blank";
                    var res = {},
                        theme, players = {},
                        ips = {};
                    for (var ip in this.votes) {
                        theme = this.votes[ip].theme;
                        res[theme] = ++res[theme] || 1;
                        players[theme] = players[theme] || [];
                        players[theme].push(this.votes[ip].who);
                        ips[theme] = ips[theme] || [];
                        ips[theme].push(ip);
                    }
                    var winner = {
                        votes: -1,
                        theme: null
                    };
                    for (theme in res) {
                        if (res[theme] > winner.votes) {
                            winner.votes = res[theme];
                            winner.theme = theme;
                        }
                    }
                    if (winner.theme !== null) {
                        sendChanAll("", mafiachan);
                        sendChanAll("±Game: Theme " + winner.theme + " won with " + winner.votes + " votes!", mafiachan);
                        sendChanAll("±Game: Type /Join to enter the game!", mafiachan);
                        sendChanAll("", mafiachan);
                        this.startGame(null, winner.theme);
                        this.signups = players[winner.theme];
                        this.ips = ips[winner.theme];
                        mafia.ticks = 40;
                        sendChanAll("±Game: " + this.signups.join(", ") + " joined the game!", mafiachan);
                    } else {
                        sendChanAll("Really? No votes, so no game.", mafiachan);
                    }
                }
            };
            this.callHandler = function (state) {
                try {
                    if (state in this.handlers) this.handlers[state].call(this);
                } catch (e) {
                    sendChanAll("Error occurred in mafia while handling the end of '" + state + "' phase: " + e, mafiachan);
                }
            };
            this.showCommands = function (src) {
                sys.sendMessage(src, "", mafiachan);
                sys.sendMessage(src, "Server Commands:", mafiachan);
                for (var x in mafia.commands.user) {
                    sys.sendMessage(src, "/" + cap(x) + " - " + mafia.commands.user[x][1], mafiachan);
                }
                if (sys.auth(src) > 0 || this.isMafiaAdmin(src)) {
                    sys.sendMessage(src, "Authority Commands:", mafiachan);
                    for (x in mafia.commands.auth) {
                        sys.sendMessage(src, "/" + cap(x) + " - " + mafia.commands.auth[x][1], mafiachan);
                    }
                }
                sys.sendMessage(src, "", mafiachan);
            };
            this.showHelp = function (src) {
                var help = ["*** *********************************************************************** ***", "±Game: The objective in this game on how to win depends on the role you are given.", "*** *********************************************************************** ***", "±Role: Mafia", "±Win: Eliminate the WereWolf and the Good People!", "*** *********************************************************************** ***", "±Role: WereWolf", "±Win: Eliminate everyone else in the game!", "*** *********************************************************************** ***", "±Role: Good people (Inspector, Bodyguard, Pretty Lady, Villager, Mayor, Spy, Vigilante, Samurai)", "±Win: Eliminate the WereWolf, Mafia (French and Italian if exists) and the Godfather!", "*** *********************************************************************** ***", "±Role: French Canadian Mafia, Don French Canadian Mafia", "±Win: Eliminate the Italian Mafia, Godfather and the Good People!", "*** *********************************************************************** ***", "±Role: Italian Mafia, Don Italian Mafia", "±Win: Eliminate the French Canadian Mafia, Godfather and the Good People!", "*** *********************************************************************** ***", "±More: Type /roles for more info on the characters in the game!", "±More: Type /rules to see some rules you should follow during a game!", "*** *********************************************************************** ***", ""];
                dump(src, help);
            };
            this.showRoles = function (src, commandData) {
                var themeName = "default";
                var data = commandData.split(":");
                if (mafia.state != "blank") {
                    themeName = mafia.theme.name.toLowerCase();
                }
                if (data[0] != noPlayer && data[0] !== "") {
                    themeName = data[0].toLowerCase();
                    if (!mafia.themeManager.themes.hasOwnProperty(themeName)) {
                        sys.sendMessage(src, "±Game: No such theme!", mafiachan);
                        return;
                    }
                }
                var roles;
                if (themeName == "default2") {
                    roles = ["*** *********************************************************************** ***", "±Role: Villager", "±Ability: The Villager has no command during night time. They can only vote during the day!", "±Game: 6-30 Players", "*** *********************************************************************** ***", "±Role: Inspector", "±Ability: The Inspector can find out the identity of a player during the Night. ", "±Game: 5-30 Players", "*** *********************************************************************** ***", "±Role: Bodyguard", "±Ability: The Bodyguard can protect one person during the night from getting killed, but the bodyguard cant protect itself.", "±Game: 5-30 Players", "*** *********************************************************************** ***", "±Role: Pretty Lady", "±Ability: The Pretty Lady can distract people during the night thus cancelling their move, unless it's the WereWolf.", "±Game: 5-30 Players", "*** *********************************************************************** ***", "±Role: Samurai", "±Ability: The Samurai can kill people during the standby phase, but he will be revealed when doing so.", "±Game: 25-30 Players", "*** *********************************************************************** ***", "±Role: Mafia", "±Ability: The Mafia is a group of 2 people. They get one kill each night. They strike after the WereWolf.", "±Game: 5-12 Players", "*** *********************************************************************** ***", "±Role: WereWolf", "±Ability: The WereWolf is solo. To win it has to kill everyone else in the game. The Werewolf strikes first.", "±Game: 5-12 27-30 Players", "*** *********************************************************************** ***", "±Role: Italian Mafia", "±Ability: The Italian Mafia is a group of 2-3 people. They get one kill each night. They strike before the French Canadian Mafia.", "±Game: 12-30 Players", "*** *********************************************************************** ***", "±Role: Italian Conspirator", "±Ability: Italian Conspirator is sided with Italian Mafia, but doesn't have any special commands. Shows up as a Villager to inspector.", "±Game: -", "*** *********************************************************************** ***", "±Role: Don Italian Mafia", "±Ability: Don Italian Mafia is sided with Italian Mafia. He kills with Italian mafia each night. He can't be distracted.", "±Game: 24-30 Players", "*** *********************************************************************** ***", "±Role: French Canadian Mafia", "±Ability: The French Canadian Mafia is a group of 2-4 people. They get one kill each night. They strike after the Italian Mafia.", "±Game: 12-30 Players", "*** *********************************************************************** ***", "±Role: French Canadian Conspirator", "±Ability: French Canadian Conspirator is sided with French Canadian Mafia, but doesn't have any special commands. Shows up as a Villager to inspector.", "±Game: -", "*** *********************************************************************** ***", "±Role: Don French Canadian Mafia", "±Ability: Don French Canadian Mafia is sided with French Canadian Mafia. He kills with French Canadian mafia each night. He can't be distracted.", "±Game: 18-30 Players", "*** *********************************************************************** ***", "±Role: Mayor", "±Ability: The Mayor has no command during the night but his/her vote counts as 2.", "±Game: 10-30 Players", "*** *********************************************************************** ***", "±Role: Spy", "±Ability: The Spy has 33% chance of finding out who is going to get killed by The Italian or French Canadian Mafia during the night. And 10% chance to find out who is the killer!", "±Game: 13-30 Players", "*** *********************************************************************** ***", "±Role: Vigilante", "±Ability: The Vigilante can kill a person during the night! He/she strikes after The French Canadian and Italian Mafia.", "±Game: 20-30 Players", "*** *********************************************************************** ***", "±Role: Godfather", "±Ability: The Godfather can kill 2 people during the night! He/she strikes Last!", "±Game: 22-30 Players", "*** *********************************************************************** ***", ""];
                } else {
                    roles = mafia.themeManager.themes[themeName].roleInfo;
                }
                if (data[1]) {
                    var sep = "*** *********************************************************************** ***";
                    var filterRoles = [sep];
                    var roleTranslation = data[1].toLowerCase();
                    for (var i = 0; i < roles.length; ++i) {
                        if (roles[i].search(/±role:/i) > -1 && roles[i].toLowerCase().search(roleTranslation) > -1) {
                            filterRoles.push(roles[i]);
                            filterRoles.push(roles[i + 1]);
                            filterRoles.push(roles[i + 2]);
                            filterRoles.push(sep);
                        }
                    }
                    if (filterRoles.length == 1) {
                        filterRoles.push("±Game: No such role in this theme!");
                        filterRoles.push(sep);
                    }
                    filterRoles.push("");
                    roles = filterRoles;
                }
                dump(src, roles);
            };
            this.showSides = function (src, commandData) {
                var themeName = "default";
                if (mafia.state != "blank") {
                    themeName = mafia.theme.name.toLowerCase();
                }
                if (commandData != noPlayer) {
                    themeName = commandData.toLowerCase();
                    if (!mafia.themeManager.themes.hasOwnProperty(themeName)) {
                        sys.sendMessage(src, "±Game: No such theme!", mafiachan);
                        return;
                    }
                }
                var sides = mafia.themeManager.themes[themeName].sideInfo;
                dump(src, sides);
            };
            this.showRules = function (src) {
                var rules = ["", " Server Rules: ", "±Rule: No spamming / flooding ", "±Rule: No insulting - especially not auth. ", "±Rule: No trolling.", "±Tip: Type /rules on another channel to see the full rules.", "", " Game Rules: ", "±Rule: Do not quote any of the Bots, removing the \"bot\" part is still botquoting.", "±Rule: Do not quit the game before you are dead.", "±Rule: Ask to be slain by a mafia admin if you must leave, but do not join the next game if you do so.", "±Rule: Do not vote yourself / get yourself killed on purpose", "±Rule: Do not reveal any information about the game once you're dead or voted off. ", "±Rule: Do not repeatedly target a user, as it ruins the fun for that user", "±Rule: Do not group together to ruin the game", "±Rule: Do not reveal roles in order to harm your team's chances of winning.", "", "±Game: Disobey them and you will be banned from mafia/muted according to the MA/auth's wishes!", ""];
                dump(src, rules);
            };
            this.showThemes = function (src) {
                var l = [];
                for (var t in mafia.themeManager.themes) {
                    l.push(mafia.themeManager.themes[t].name);
                }
                msg(src, "Installed themes are: " + l.join(", "));
            };
            this.showThemeInfo = function (src, data) {
                data = data.toLowerCase();
                mafia.themeManager.themeInfo.sort(function (a, b) {
                    return a[0].localeCompare(b[0]);
                });
                var mess = [];
                mess.push("<table><tr><th>Theme</th><th>URL</th><th>Author</th><th>Enabled</th></tr>");
                for (var i = 0; i < mafia.themeManager.themeInfo.length; ++i) {
                    var info = mafia.themeManager.themeInfo[i];
                    var theme = mafia.themeManager.themes[info[0].toLowerCase()];
                    if (!theme) continue;
                    if (data == noPlayer || data.indexOf(theme.name.toLowerCase()) != -1) {
                        mess.push('<tr><td>' + theme.name + '</td><td><a href="' + info[1] + '">' + info[1] + '</a></td><td>' + (theme.author ? readable(theme.author, "and") : "unknown") + '</td><td>' + (theme.enabled ? "yes" : "no") + '</td></tr>');
                    }
                }
                mess.push("</table>");
                sys.sendHtmlMessage(src, mess.join(""), mafiachan);
            };
            this.showThemeDetails = function (src, commandData) {
                var themeName = "default";
                if (mafia.state != "blank") {
                    themeName = mafia.theme.name.toLowerCase();
                }
                if (commandData != noPlayer) {
                    themeName = commandData.toLowerCase();
                    if (!mafia.themeManager.themes.hasOwnProperty(themeName)) {
                        sys.sendMessage(src, "±Game: No such theme!", mafiachan);
                        return;
                    }
                }
                var theme = mafia.themeManager.themes[themeName];
                var link = "No link found";
                for (var i = 0; i < mafia.themeManager.themeInfo.length; ++i) {
                    if (mafia.themeManager.themeInfo[i][0].toLowerCase() == themeName) {
                        link = mafia.themeManager.themeInfo[i][1];
                        break;
                    }
                }
                var mess = [];
                mess.push("");
                mess.push("<b>Theme: </b>" + theme.name);
                mess.push("<b>Author: </b>" + (theme.author ? readable(theme.author, "and") : "Unknown"));
                mess.push("<b>Enabled: </b>" + (theme.enabled ? "Yes" : "No"));
                mess.push("<b>Number of Players: </b> Up to " + (theme["roles" + theme.roleLists].length) + " players");
                mess.push("<b>Summary: </b>" + (theme.summary ? theme.summary : "No summary available."));
                mess.push("(For more information about this theme, type <b>/roles " + theme.name + "</b>)");
                if (link == "No link found") {
                    mess.push('<b>Code: </b>' + link);
                } else {
                    mess.push('<b>Code: </b><a href="' + link + '">' + link + '</a>');
                }
                mess.push("");
                for (var x in mess) {
                    sys.sendHtmlMessage(src, mess[x], mafiachan);
                }
            };

            this.showPlayedGames = function (src) {
                var mess = [];
                mess.push("<table><tr><th>Theme</th><th>Who started</th><th>When</th><th>Players</th></tr>");
                var recentGames = PreviousGames.slice(-10);
                var t = parseInt(sys.time(), 10);
                for (var i = 0; i < recentGames.length; ++i) {
                    var game = recentGames[i];
                    mess.push('<tr><td>' + game.what + '</td><td>' + game.who + '</td><td>' + getTimeString(game.when - t) + '</td><td>' + game.playerCount + '</td></tr>');
                }
                mess.push("</table>");
                sys.sendHtmlMessage(src, mess.join(""), mafiachan);
            };

            this.showOwnRole = function (src) {
                var name = sys.name(src);
                if (mafia.state != "blank" && mafia.state != "entry") {
                    if (mafia.isInGame(name)) {
                        var player = mafia.players[name];
                        var role = player.role;

                        if (typeof role.actions.startup == "object" && typeof role.actions.startup.revealAs == "string") {
                            mafia.sendPlayer(player.name, "±Game: You are a " + mafia.theme.trrole(role.actions.startup.revealAs) + "!");
                        } else {
                            mafia.sendPlayer(player.name, "±Game: You are a " + role.translation + "!");
                        }
                        mafia.sendPlayer(player.name, "±Game: " + role.help);

                        if (role.actions.startup == "team-reveal") {
                            mafia.sendPlayer(player.name, "±Game: Your team is " + mafia.getPlayersForTeamS(role.side) + ".");
                        }
                        if (role.actions.startup == "team-reveal-with-roles") {
                            var playersRole = mafia.getPlayersForTeam(role.side).map(name_trrole, mafia.theme);
                            mafia.sendPlayer(player.name, "±Game: Your team is " + readable(playersRole, "and") + ".");
                        }
                        if (typeof role.actions.startup == "object" && Array.isArray(role.actions.startup["team-revealif"])) {
                            if (role.actions.startup["team-revealif"].indexOf(role.side) != -1) {
                                mafia.sendPlayer(player.name, "±Game: Your team is " + mafia.getPlayersForTeamS(role.side) + ".");
                            }
                        }
                        if (role.actions.startup == "role-reveal") {
                            mafia.sendPlayer(player.name, "±Game: People with your role are " + mafia.getPlayersForRoleS(role.role) + ".");
                        }

                        if (typeof role.actions.startup == "object" && role.actions.startup.revealRole) {
                            if (typeof role.actions.startup.revealRole == "string") {
                                if (mafia.getPlayersForRoleS(player.role.actions.startup.revealRole) !== "") mafia.sendPlayer(player.name, "±Game: The " + mafia.theme.roles[role.actions.startup.revealRole].translation + " is " + mafia.getPlayersForRoleS(player.role.actions.startup.revealRole) + "!");
                            } else if (Array.isArray(role.actions.startup.revealRole)) {
                                for (var s = 0, l = role.actions.startup.revealRole.length; s < l; ++s) {
                                    var revealrole = role.actions.startup.revealRole[s];
                                    if (mafia.getPlayersForRoleS(revealrole) !== "") mafia.sendPlayer(player.name, "±Game: The " + mafia.theme.roles[revealrole].translation + " is " + mafia.getPlayersForRoleS(revealrole) + "!");
                                }
                            }
                        }
                    } else {
                        sys.sendMessage(src, "±Game: You are not in the game!", mafiachan);
                    }
                } else {
                    sys.sendMessage(src, "±Game: No game running!", mafiachan);
                }
            };
            this.showPriority = function (src, commandData) {
                var themeName = "default";
                if (mafia.state != "blank") {
                    themeName = mafia.theme.name.toLowerCase();
                }
                if (commandData != noPlayer) {
                    themeName = commandData.toLowerCase();
                    if (!mafia.themeManager.themes.hasOwnProperty(themeName)) {
                        sys.sendMessage(src, "±Game: No such theme!", mafiachan);
                        return;
                    }
                }
                var theme = mafia.themeManager.themes[themeName];
                sys.sendHtmlMessage(src, "", mafiachan);
                sys.sendHtmlMessage(src, "Priority List for theme <b>" + theme.name + ":</b>", mafiachan);
                for (var p = 0; p < theme.nightPriority.length; ++p) {
                    var prio = theme.nightPriority[p];
                    sys.sendHtmlMessage(src, "[" + prio.priority + "] " + theme.roles[prio.role].translation + " (" + cap(prio.action) + ")", mafiachan);
                }
                sys.sendHtmlMessage(src, "", mafiachan);
            };

            // Auth commands
            this.isMafiaAdmin = function (src) {
                if (sys.auth(src) >= 1) return true;
                return false;
            };
            this.isMafiaSuperAdmin = function (src) {
                if (sys.auth(src) >= 2) return true;
                return false;
            };

            this.saveMafiaData = function (src) {
                var playerlist;
                var mafialist;
                var playerdata;
                if (!sys.getVal("mafia" + sys.ip(src)) && !sys.getVal("mafia" + sys.name(src))) {
/* New player
			* We save three parameters: player ip, games played, and the last played time */
                    sys.saveVal("mafia" + sys.ip(src), sys.ip(src) + "--" + 0 + "--" + sys.time());
                    sys.saveVal("mafia" + sys.name(src), sys.ip(src) + "--" + 0 + "--" + sys.time());
                    var games = 0;
                    // Update the player list
                    if (!sys.getVal("mafialist")) {
                        sys.saveVal("mafialist", sys.ip(src) + ":" + sys.name(src) + ":" + sys.time() + ":" + games);
                    }
                    else {
                        mafialist = sys.getVal("mafialist");
                        sys.saveVal("mafialist", mafialist + "--" + sys.ip(src) + ":" + sys.name(src) + ":" + sys.time() + ":" + games);
                    }
                    // Now add to the game list
                    if (sys.getVal("mafiagameplayers")) {
                        playerlist = sys.getVal("mafiagameplayers");
                        // Use a colon to separate the ip from the game count to allow for more data control.
                        sys.saveVal("mafiagameplayers", playerlist + "--" + sys.ip(src) + ":" + sys.name(src) + ":" + games);
                    }
                    else {
                        sys.saveVal("mafiagameplayers", sys.ip(src) + ":" + sys.name(src) + ":" + games);
                    }
                } // End new player
                else {
                    playerdata = sys.getVal("mafia" + sys.ip(src)).split("--");
                    var games = parseInt(playerdata[1], 10) + 1;
                    // Update Player
                    sys.saveVal("mafia" + sys.ip(src), sys.ip(src) + "--" + games + "--" + sys.time());
                    sys.saveVal("mafia" + sys.name(src), sys.ip(src) + "--" + games + "--" + sys.time());
                    if (!sys.getVal("mafialist")) {
                        sys.saveVal("mafialist", sys.ip(src) + ":" + sys.name(src) + ":" + sys.time() + ":" + games);
                    }
                    else {
                        mafialist = sys.getVal("mafialist");
                        sys.saveVal("mafialist", mafialist + "--" + sys.ip(src) + ":" + sys.name(src) + ":" + sys.time() + ":" + games);
                    }
                    if (sys.getVal("mafiagameplayers")) {
                        playerlist = sys.getVal("mafiagameplayers");
                        // Use a colon to separate the ip from the game count to allow for more data control.
                        sys.saveVal("mafiagameplayers", playerlist + "--" + sys.ip(src) + ":" + sys.name(src) + ":" + games);
                    }
                    else {
                        sys.saveVal("mafiagameplayers", sys.ip(src) + ":" + sys.name(src) + ":" + games);
                    }
                } // End updating a player
            }; // End saveMafiaData()
            this.showplayers = function (src) {
                var mafiagameplayers = sys.getVal("mafiagameplayers").split("--");
                for (var z in mafiagameplayers) {
                    var playerdata = mafiagameplayers[z].split(":");
                    sys.sendMessage(src, "Name: " + playerdata[0] + " IP: " + playerdata[1] + " Games Played: " + playerdata[2]);
                }
            }; // End showCurrentPlayers()
            this.trimplayers = function (src, cutoff) {
                if (!cutoff) {
                    sys.sendMessage(src, "You must specify how long a player hasn't played a game to be deleted.");
                    return;
                }
                var masterlist = sys.getVal("mafialist").split("--");
                var multiplier;
                if (cutoff.indexOf("m")) {
                    multiplier = 60;
                }
                if (cutoff.indexOf("h")) {
                    multiplier = 3600;
                }
                if (cutoff.indexOf("d")) {
                    multiplier = 86400;
                }
                if (cutoff.indexOf("mo")) {
                    multiplier = 86400 * 30;
                }
                var string = cutoff.replace(/m|mo|h|d/gi, "");
                var currenttime = sys.time();
                var finalcutoff = currenttime - multiplier * string;
                var newlist = "";
                var n = 1;
                var playersremoved = 0;
                for (var z in masterlist) {
                    var data = masterlist[z].split(":");
                    if (data[2] < finalcutoff) {
                        // Player goes away
                        sys.removeVal("mafia" + data[0]);
                        sys.removeVal("mafia" + data[1]);
                        playersremoved = playersremoved + 1;
                    }
                    else {
                        // Player is active
                        if (n != 1) {
                            newlist = newlist + "--" + data[0] + ":" + data[1] + ":" + data[2] + ":" + data[3];
                        }
                        else {
                            newlist = data[0] + ":" + data[1] + ":" + data[2] + ":" + data[3];
                        }
                        n = n + 1;
                    }
                }
                sys.saveVal("mafialist", newlist);
                sendChanAll(sys.name(src) + " has trimmed the mafia player database.  Players removed: " + playersremoved + ".", mafiachan);
            }; // End trimPlayers()
            this.showlist = function (src) {
                var masterlist = sys.getVal("mafialist").split("--");
                var length = masterlist.length;
                var start = 0;
                var list = "";

                if (length > 50) { // Limit to last 50 seen "new users".
                    start = length - 50;
                }
                sys.sendMessage(src, start + " " + length);
                for (var z = start; z <= length; z++) {
                    if (typeof masterlist[z] !== "undefined") {
                        var data = masterlist[z].split(":");
                        if (data[3] <= 2) { // New player
                            list = " Name: " + data[1] + " IP: " + data[0] + " Games Played: " + data[3] + " Last Visit: " + this.formatlastvisit(data[2]);
                            sys.sendMessage(src, list, mafiachan);
                        }
                    }
                }
            }; // End showlist()
            this.searchlist = function (src, conditions) {
                var masterlist = sys.getVal("mafialist").split("--");
                var conditions = conditions.split(" "); /* How many conditions do we have to satisfy? */
                var originallength = conditions.length;
                var totalconditions = conditions.length;
                var resultcount = 0;
                var list = "";
                for (var z in masterlist) { /* Split the player information in order to test conditions. */
                    var data = masterlist[z].split(":");
                    var conditionsmet = 0;
                    var length = 1;
                    var last = 0;
                    var show = 0;
                    for (var x in conditions) {
                        if (conditions[x] != "or") // Allow for an or clause
                        { /* In order to allow for multiple conditions, we must separate each condition first. */
                            var search = conditions[x].split("=");
                            var name = search[0].toLowerCase();
                            var value = search[1];
                            if (name === "games" && value == data[3]) {
                                conditionsmet += 1;
                            }
                            if (name === "name" && data[1].match(value)) {
                                conditionsmet = conditionsmet + 1;
                            }
                            if (name === "ip" && data[0].match(value)) {
                                conditionsmet += 1;
                            }
                            if (name === "lastactive" && data[2] >= sys.time() - value) {
                                conditionsmet += 1;
                            }
                        }
                        if (conditions[x] === "or") {
                            totalconditions = totalconditions - 1 - length;
                            last = last + length;
                        }
                        if (conditionsmet >= totalconditions) {
                            if (show != 1) {
                                resultcount += 1;
                            }
                            show = 1;
                        }
                        if (conditions[x] === "or") {
                            length = 1;
                            conditionsmet = 0;
                        }
                        else {
                            length += 1;
                        }
                    } // Close conditions check
                    if (show == 1) {
                        list = list + " Name: " + data[1] + " IP: " + data[0] + " Games Played: " + data[3] + " Last Visit: " + this.formatlastvisit(data[2]);
                    }
                } // Close list
                if (resultcount >= 150) { // Impose a hard limit for matches
                    sys.sendMessage(src, "Your search had too many results.  Please make your search more specific.", mafiachan);
                }
                else {
                    sys.sendMessage(src, list, mafiachan);
                    sys.sendMessage(src, "Querybot: Found " + resultcount + " matches for " + conditions + ".");
                }
            }; // End searchlist()
            this.formatlastvisit = function (time) {
                if (!time) {
                    time = sys.time();
                }
                var currenttime = sys.time();
                var difference = currenttime - time;
                var hours;
                var lastvisit;
                var months;
                var days;
                if (difference < 86400) {
                    hours = Math.floor(difference / 3600);
                    lastvisit = hours + " hours ago.";
                }
                else if (difference > 86400 && difference < 2592000) {
                    days = Math.floor(difference / 86400);
                    lastvisit = days + " days ago.";
                }
                else if (difference > 2592000 && difference < 31104000) {
                    months = Math.floor(difference / 2592000);
                    lastvisit = "More than " + months + " months ago.";
                }
                else {
                    lastvisit = "More than a year ago.";
                }
                return lastvisit;
            }; // formatLastVisit()
            this.pushUser = function (src, name) {
                if (!mafia.isMafiaSuperAdmin(src)) {
                    msg(src, "Super Admin Command.");
                    return;
                }
                if (this.state != "entry") {
                    msg(src, "Pushing makes no sense outside entry...");
                    return;
                }
                var id = sys.id(name);
                if (id) {
                    name = sys.name(id);
                    this.signups.push(name);
                    this.ips.push(sys.ip(id));
                } else {
                    this.signups.push(name);
                }
                sendChanAll("±Game: " + name + " joined the game! (pushed by " + sys.name(src) + ")", mafiachan);
            };
            this.slayUser = function (src, name) {
                var slayer = typeof src == "string" ? src : sys.name(src);
                if (this.state == "entry") {
                    for (var i = 0; i < this.signups.length; ++i) {
                        if (name.toLowerCase() == this.signups[i].toLowerCase()) {
                            msgAll(" " + this.signups[i] + " was taken out from the game by " + slayer + "!");
                            this.signups.splice(i, 1);
                            return;
                        }
                    }
                } else {
                    name = this.correctCase(name);
                    if (this.isInGame(name)) {
                        var player = this.players[name];
                        sendChanAll("±Kill: " + player.name + " (" + player.role.translation + ") was slayed by " + slayer + "!", mafiachan);
                        this.removePlayer(player);
                        return;
                    }
                }
                msg(src, "No such target.");
            };
            this.readStalkLog = function (src, data) {
                var num, outputChan = mafiachan;
                if (data.indexOf(":") >= 0) {
                    var splitData = data.split(":");
                    num = Number(splitData[0]);
                    outputChan = sys.channelId(splitData[1]);
                } else {
                    num = Number(data);
                }
                if (!num) {
                    sys.sendMessage(src, "±Info: This is not a valid number!", mafiachan);
                    return;
                }
                if (outputChan === undefined) {
                    sys.sendMessage(src, "±Info: This is not a valid channel!", mafiachan);
                    return;
                }
                if (num < 1 || num > stalkLogs.length) {
                    sys.sendMessage(src, "±Info: There's no log with this id!", mafiachan);
                    return;
                }

                sys.sendMessage(src, "", outputChan);
                var stalkLog = stalkLogs[num - 1].split("::**::");
                for (var c = 0; c < stalkLog.length; ++c) {
                    sys.sendMessage(src, stalkLog[c], outputChan);
                }
                sys.sendMessage(src, "", outputChan);
                if (outputChan != mafiachan) {
                    sys.sendMessage(src, "±Info: Game log was printed in channel " + sys.channel(outputChan), mafiachan);
                }
            };
            this.addTheme = function (src, url) {
                if (!mafia.isMafiaAdmin(src)) {
                    msg(src, "admin+ command.");
                    return;
                }
                mafia.themeManager.loadWebTheme(url, true, false);
            };
            this.updateTheme = function (src, data) {
                var url = data,
                    name = data;
                if (data.indexOf("::") >= 0) {
                    var parts = url.split("::");
                    name = parts[0];
                    url = parts[1];
                }
                var theme = mafia.themeManager.themes[name.toLowerCase()];
                // theme.author can be either string or Array of strings
                var authorMatch = theme !== undefined && (typeof theme.author == "string" && theme.author.toLowerCase() == sys.name(src).toLowerCase() || Array.isArray(theme.author) && theme.author.map(function (s) {
                    return s.toLowerCase();
                }).indexOf(sys.name(src).toLowerCase()) >= 0);

                if (!mafia.isMafiaAdmin(src) && !authorMatch) {
                    msg(src, "You need to be admin or the author of this theme.");
                    return;
                }
                var dlurl;
                if (url.substr(0, 7) != "http://") {
                    for (var i = 0; i < mafia.themeManager.themeInfo.length; ++i) {
                        if (mafia.themeManager.themeInfo[i][0].toLowerCase() == name.toLowerCase()) {
                            dlurl = mafia.themeManager.themeInfo[i][1];
                            break;
                        }
                    }
                } else {
                    dlurl = url;
                }
                msg(src, "Download url: " + dlurl);
                if (dlurl) {
                    mafia.themeManager.loadWebTheme(dlurl, true, true, authorMatch ? theme.name.toLowerCase() : null);
                }
            };
            this.removeTheme = function (src, name) {
                if (!mafia.isMafiaSuperAdmin(src)) {
                    msg(src, "admin+ command.");
                    return;
                }
                mafia.themeManager.remove(src, name);
            };
            this.disableTheme = function (src, name) {
                if (!mafia.isMafiaAdmin(src)) {
                    msg(src, "admin+ command.");
                    return;
                }
                mafia.themeManager.disable(src, name);
            };
            this.enableTheme = function (src, name) {
                if (!mafia.isMafiaAdmin(src)) {
                    msg(src, "admin+ command.");
                    return;
                }
                mafia.themeManager.enable(src, name);
            };
            this.updateAfter = function (src) {
                msg(src, "Mafia will update after the game");
                mafia.needsUpdating = true;
                if (mafia.state == "blank") {
                    runUpdate();
                }
                return;
            };

            function runUpdate() {
            }

            this.importOld = function (src, name) {
                msgAll("Importing old themes", mafiachan);
                mafia.themeManager.loadTheme(defaultTheme);
                mafia.themeManager.saveToFile(defaultTheme);
            };

            this.commands = {
                user: {
                    commands: [this.showCommands, "To see the various commands."],
                    start: [this.userVote, "Start voting for a new game theme / or vote!"],
                    votetheme: [this.userVote, "Start voting for a new game theme / or vote!"],
                    starttheme: [this.startGame, "Starts a Game of Mafia with specified theme."],
                    help: [this.showHelp, "For info on how to win in a game."],
                    roles: [this.showRoles, "For info on all the Roles in the game."],
                    sides: [this.showSides, "For info on all teams in the game."],
                    myrole: [this.showOwnRole, "To view again your role, help text and teammates."],
                    rules: [this.showRules, "To see the Rules for the Game/Server."],
                    themes: [this.showThemes, "To view installed themes."],
                    themeinfo: [this.showThemeInfo, "To view installed themes (more details)."],
                    details: [this.showThemeDetails, "To view info about a specific theme."],
                    priority: [this.showPriority, "To view the priority list of a theme. "],
                    playedgames: [this.showPlayedGames, "To view recently played games"],
                    update: [this.updateTheme, "To update a Mafia Theme!"]
                },
                auth: {
                    push: [this.pushUser, "To push users to a Mafia game."],
                    slay: [this.slayUser, "To slay users in a Mafia game."],
                    shove: [this.slayUser, "To remove users before a game starts."],
                    end: [this.endGame, "To cancel a Mafia game!"],
                    readlog: [this.readStalkLog, "To read the log of actions from a previous game"],
                    add: [this.addTheme, "To add a Mafia Theme!"],
                    remove: [this.removeTheme, "To remove a Mafia Theme!"],
                    disable: [this.disableTheme, "To disable a Mafia Theme!"],
                    enable: [this.enableTheme, "To enable a disabled Mafia Theme!"],
                    importold: [this.importOld, ""],
                    showplayers: [this.showplayers, "To show the list of current players in the game."],
                    showlist: [this.showlist, "To view the master player list."],
                    searchlist: [this.searchlist, "To search the master list."],
                    trimplayers: [this.trimplayers, "To trim the master player list."]
                }
            };
            this.canJoin = function (src) {
                if (this.isInGame(sys.name(src))) {
                    sys.sendMessage(src, "±Game: You already joined!", mafiachan);
                    return;
                }
                if (this.ips.indexOf(sys.ip(src)) != -1) {
                    sys.sendMessage(src, "±Game: This IP is already in list. You cannot register two times!", mafiachan);
                    return;
                }
                if (JSESSION.users(src).muted) {
                    sys.sendMessage(src, "±Game: You are muted!", mafiachan);
                    return;
                }
                if (!sys.dbRegistered(sys.name(src))) {
                    sys.sendMessage(src, "±Game: You need to register to play mafia here! Click on the 'Register' button below and follow the instructions!", mafiachan);
                    return;
                }
                if (this.numjoins[sys.ip(src)] >= 2) {
                    sys.sendMessage(src, "±Game: You can't join/unjoin more than 3 times!", mafiachan);
                    return;
                }
                var name = sys.name(src);
                for (var x in name) {
                    var code = name.charCodeAt(x);
                    if (name[x] != ' ' && name[x] != '.' && (code < 'a'.charCodeAt(0) || code > 'z'.charCodeAt(0)) && (code < 'A'.charCodeAt(0) || code > 'Z'.charCodeAt(0)) && name[x] != '-' && name[x] != '_' && name[x] != '<' && name[x] != '>' && (code < '0'.charCodeAt(0) || code > '9'.charCodeAt(0))) {
                        sys.sendMessage(src, "±Name: You're not allowed to have the following character in your name: " + name[x] + ".", mafiachan);
                        sys.sendMessage(src, "±Rule: You must change it if you want to join!", mafiachan);
                        return;
                    }
                }
                if (name.length > Config.Mafia.max_name_length) {
                    sys.sendMessage(src, "±Name: You're not allowed to have more than " + Config.Mafia.max_name_length + " letters in your name!", mafiachan);
                    sys.sendMessage(src, "±Rule: You must change it if you want to join!", mafiachan);
                    return;
                }
                return true;
            };
            this.addPhaseStalkAction = function (user, action, target) {
                if (!(user in phaseStalk)) phaseStalk[user] = [];
                phaseStalk[user].push("/" + action + " " + target);
            };
            this.compilePhaseStalk = function (phase) {
                currentStalk.push("*** " + phase + " ***");
                for (var u in phaseStalk) {
                    currentStalk.push(u + " used: " + phaseStalk[u].join(", "));
                }
                phaseStalk = {};
            };
            this.handleCommand = function (src, message, channel) {
                var command;
                var commandData = '*';
                var pos = message.indexOf(' ');

                if (pos != -1) {
                    command = message.substring(0, pos).toLowerCase();
                    commandData = message.substr(pos + 1);
                } else {
                    command = message.substr(0).toLowerCase();
                }
                if (command in this.commands.user) {
                    this.commands.user[command][0].call(this, src, commandData);
                    return true;
                }
                var name, x, player, target;
                if (this.state == "entry") {
                    if (command == "join") {
                        if (this.canJoin(src) !== true) {
                            return;
                        }
                        if (this.signups.length >= this.theme["roles" + this.theme.roleLists].length) {
                            sys.sendMessage(src, "±Game: There can't be more than " + this.theme["roles" + this.theme.roleLists].length + " players!", mafiachan);
                            return;
                        }
                        name = sys.name(src);
                        // This next statement allows one to view a list of players in the current game and maintain a master list.
                        this.saveMafiaData(src);

                        this.signups.push(name);
                        this.ips.push(sys.ip(src));
                        if (this.numjoins.hasOwnProperty(sys.ip(src))) {
                            this.numjoins[sys.ip(src)] += 1;
                        }
                        else {
                            this.numjoins[sys.ip(src)] = 1;
                        }
                        sendChanAll("±Game: " + name + " joined the game!", mafiachan);
                        if (this.signups.length == this.theme["roles" + this.theme.roleLists].length) {
                            this.ticks = 1;
                        }
                        return;
                    }
                    if (command == "unjoin") {
                        if (this.isInGame(sys.name(src))) {
                            name = sys.name(src);
                            delete this.ips[this.ips.indexOf(sys.ip(src))];
                            this.signups.splice(this.signups.indexOf(name), 1);
                            sendChanAll("±Game: " + name + " unjoined the game!", mafiachan);
                            return;
                        } else {
                            sys.sendMessage(src, "±Game: You haven't even joined!", mafiachan);
                            return;
                        }
                    }
                } else if (this.state == "night") {
                    name = sys.name(src);
                    if (this.isInGame(name) && this.hasCommand(name, command, "night")) {
                        commandData = this.correctCase(commandData);
                        if (!this.isInGame(commandData)) {
                            sys.sendMessage(src, "±Hint: That person is not playing!", mafiachan);
                            return;
                        }
                        player = mafia.players[name];
                        target = mafia.players[commandData];

                        this.addPhaseStalkAction(name, command, target.name);

                        if (["Any", "Self", "OnlySelf"].indexOf(player.role.actions.night[command].target) == -1 && commandData == name) {
                            sys.sendMessage(src, "±Hint: Nope, this wont work... You can't target yourself!", mafiachan);
                            return;
                        } else if (player.role.actions.night[command].target == "OnlySelf" && commandData != name) {
                            sys.sendMessage(src, "±Hint: You can only use this action on yourself!", mafiachan);
                            return;
                        } else if (player.role.actions.night[command].target == 'AnyButTeam' && player.role.side == target.role.side || player.role.actions.night[command].target == 'AnyButRole' && player.role.role == target.role.role) {
                            sys.sendMessage(src, "±Hint: Nope, this wont work... You can't target your partners!", mafiachan);
                            return;
                        }

                        var recharge = mafia.getRecharge(player, "night", command);
                        if (recharge !== undefined && recharge > 0) {
                            sys.sendMessage(src, "±Game: You cannot use this action for " + recharge + " night(s)!", mafiachan);
                            return;
                        }
                        var charges = mafia.getCharges(player, "night", command);
                        if (charges !== undefined && charges === 0) {
                            sys.sendMessage(src, "±Game: You are out of uses for this action!", mafiachan);
                            return;
                        }
                        sys.sendMessage(src, "±Game: You have chosen to " + command + " " + commandData + "!", mafiachan);
                        this.setTarget(player, target, command);
                        var team;
                        var broadcast = player.role.actions.night[command].broadcast;
                        if (broadcast !== undefined) {
                            team = [];
                            if (broadcast == "team") {
                                team = this.getPlayersForTeam(player.role.side);
                            } else if (broadcast == "role") {
                                team = this.getPlayersForRole(player.role.role);
                            } else if (Array.isArray(broadcast)) {
                                for (var z in mafia.players) {
                                    if (broadcast.indexOf(mafia.players[z].role.role) != -1) {
                                        team.push(mafia.players[z].name);
                                    }
                                }
                            }

                            var broadcastmsg = "±Game: Your partner(s) have decided to " + command + " '" + commandData + "'!";
                            if (player.role.actions.night[command].broadcastmsg) {
                                broadcastmsg = player.role.actions.night[command].broadcastmsg.replace(/~Player~/g, name).replace(/~Target~/g, commandData).replace(/~Action~/, command);
                            }
                            for (x in team) {
                                if (team[x] != name) {
                                    this.sendPlayer(team[x], broadcastmsg);
                                }
                            }
                        }

                        /* Hax-related to command */
                        // some roles can get "hax" from other people using some commands...
                        // however, roles can have avoidHax: ["kill", "distract"] in actions..
                        if ("avoidHax" in player.role.actions && player.role.actions.avoidHax.indexOf(command) != -1) {
                            return;
                        }
                        var haxRoles = mafia.theme.getHaxRolesFor(command);
                        for (var i in haxRoles) {
                            var role = haxRoles[i];
                            var haxPlayers = this.getPlayersForRole(role);
                            for (var j in haxPlayers) {
                                var haxPlayer = haxPlayers[j];
                                var r = Math.random();
                                var roleName = this.theme.trside(player.role.side);
                                team = this.getPlayersForRole(player.role.side);
                                var playerRole = this.theme.trrole(player.role.role);
                                if (r < mafia.theme.roles[role].actions.hax[command].revealTeam) {
                                    if (team.length > 1) this.sendPlayer(haxPlayer, "±Game: The " + roleName + " are going to " + command + " " + commandData + "!");
                                    else this.sendPlayer(haxPlayer, "±Game: The " + roleName + " is going to " + command + " " + commandData + "!");
                                }
                                if (r < mafia.theme.roles[role].actions.hax[command].revealPlayer) {
                                    if (team.length > 1) this.sendPlayer(haxPlayer, "±Game: " + name + " is one of The " + roleName + "!");
                                    else this.sendPlayer(haxPlayer, "±Game: " + name + " is The " + roleName + "!");
                                }
                                if (r < mafia.theme.roles[role].actions.hax[command].revealRole) {
                                    this.sendPlayer(haxPlayer, "±Game: " + name + " is " + playerRole + "!");
                                }

                            }
                        }
                        return;
                    }
                } else if (this.state == "day") {
                    if (this.isInGame(sys.name(src)) && command == "vote") {
                        commandData = this.correctCase(commandData);
                        if (!this.isInGame(commandData)) {
                            sys.sendMessage(src, "±Game: That person is not playing!", mafiachan);
                            return;
                        }
                        if (sys.name(src) in this.votes) {
                            sys.sendMessage(src, "±Rule: You already voted!", mafiachan);
                            return;
                        }
                        sendChanAll("±Game:" + sys.name(src) + " voted for " + commandData + "!", mafiachan);
                        this.votes[sys.name(src)] = commandData;
                        this.voteCount += 1;

                        if (this.voteCount == Object.keys(mafia.players).length) {
                            mafia.ticks = 1;
                        } else if (mafia.ticks < 8 && (mafia.theme.votesniping === undefined || mafia.theme.votesniping === false)) {
                            mafia.ticks = 8;
                        }
                        return;
                    }
                } else if (mafia.state == "standby") {
                    name = sys.name(src);
                    if (this.isInGame(name) && this.hasCommand(name, command, "standby")) {
                        player = mafia.players[name];
                        commandData = this.correctCase(commandData);
                        target = commandData != noPlayer ? mafia.players[commandData] : null;
                        var commandObject = player.role.actions.standby[command];
                        var commandName = command;
                        if (commandObject.hasOwnProperty("command")) command = commandObject.command;

                        if (target !== null) {
                            if ((commandObject.target === undefined || ["Self", "Any"].indexOf(commandObject.target) == -1) && player == target) {
                                sys.sendMessage(src, "±Hint: Nope, this wont work... You can't target yourself!", mafiachan);
                                return;
                            } else if (commandObject.target == 'AnyButTeam' && player.role.side == target.role.side || commandObject.target == 'AnyButRole' && player.role.role == target.role.role) {
                                sys.sendMessage(src, "±Hint: Nope, this wont work... You can't target your partners!", mafiachan);
                                return;
                            }
                            this.addPhaseStalkAction(name, command, target.name);
                        }

                        var recharge = mafia.getRecharge(player, "standby", commandName);
                        if (recharge !== undefined && recharge > 0) {
                            sys.sendMessage(src, "±Game: You cannot use this action for " + recharge + " day(s)!", mafiachan);
                            return;
                        }
                        if (command == "kill") {
                            if (player.dayKill >= (commandObject.limit || 1)) {
                                sys.sendMessage(src, "±Game: You already killed!", mafiachan);
                                return;
                            }
                            if (target === null) {
                                sys.sendMessage(src, "±Game: That person is not playing!", mafiachan);
                                return;
                            }
                            var revenge = false;
                            if (target.role.actions.hasOwnProperty("daykill")) {
                                if (target.role.actions.daykill == "evade") {
                                    sys.sendMessage(src, "±Game: That person is gone, you can't kill them!", mafiachan);
                                    return;
                                } else if (target.role.actions.daykill == "revenge" || target.role.actions.daykill == "bomb") {
                                    revenge = true;
                                } else if (typeof target.role.actions.daykill.mode == "object" && target.role.actions.daykill.mode.evadeChance > sys.rand(0, 100) / 100) {
                                    sys.sendMessage(src, "±Game: Your kill was evaded!", mafiachan);
                                    sys.sendMessage(sys.id(target.name), "±Game: You evaded a kill!", mafiachan);
                                    player.dayKill = player.dayKill + 1 || 1;
                                    if ("recharge" in commandObject) {
                                        if (!(player.name in this.dayRecharges)) {
                                            this.dayRecharges[player.name] = {};
                                        }
                                        this.dayRecharges[player.name][commandName] = 1;
                                    }
                                    return;
                                }
                            }
                            sendChanAll(border, mafiachan);
                            if (!revenge) {
                                sendChanAll("±Game: " + commandObject.killmsg.replace(/~Self~/g, name).replace(/~Target~/g, commandData), mafiachan);
                                if ("revealChance" in commandObject && commandObject.revealChance > sys.rand(0, 100) / 100) {
                                    if (commandObject.revealmsg !== undefined && typeof commandObject.revealmsg == "string") {
                                        sendChanAll("±Game: " + commandObject.revealmsg.replace(/~Self~/g, name).replace(/~Role~/g, mafia.players[name].role.translation), mafiachan);
                                    } else {
                                        sendChanAll("±Game: While attacking, " + name + " (" + mafia.players[name].role.translation + ") made a mistake and was revealed!", mafiachan);
                                    }
                                }
                                if ("daykill" in target.role.actions && target.role.actions.daykill === "revealkiller") {
                                    if ("daykillrevengemsg" in target.role.actions) {
                                        sendChanAll("±Game: " + target.role.actions.daykillrevengemsg.replace(/~Self~/g, target.name).replace(/~Target~/g, name).replace(/~Role~/g, mafia.players[name].role.translation), mafiachan);
                                    } else {
                                        sendChanAll("±Game: Before dying, " + target.name + " revealed that " + name + " is the " + mafia.players[name].role.translation + "!", mafiachan);
                                    }
                                }
                                player.dayKill = player.dayKill + 1 || 1;
                                this.kill(mafia.players[commandData]);
                            } else {
                                if (target.role.actions.daykillrevengemsg !== undefined && typeof target.role.actions.daykillrevengemsg == "string") {
                                    sendChanAll("±Game: " + target.role.actions.daykillrevengemsg.replace(/~Self~/g, commandData).replace(/~Target~/g, name), mafiachan);
                                } else {
                                    sendChanAll("±Game: ~Target~ tries to attack ~Self~, but ~Self~ fights back and kills ~Target~!".replace(/~Self~/g, commandData).replace(/~Target~/g, name), mafiachan);

                                }
                                this.kill(mafia.players[name]);
                                if (target.role.actions.daykill === "bomb") this.kill(mafia.players[commandData]);
                            }

                            if (this.testWin()) {
                                return;
                            }
                            sendChanAll(border, mafiachan);
                        } else if (command == "reveal") {
                            if (player.revealUse >= (commandObject.limit || 1)) {
                                sys.sendMessage(src, "±Game: You already used this command!", mafiachan);
                                return;
                            }
                            var revealMessage = commandObject.revealmsg ? commandObject.revealmsg : "~Self~ is revealed to be a ~Role~!";
                            sendChanAll(border, mafiachan);
                            sendChanAll("±Game: " + revealMessage.replace(/~Self~/g, name).replace(/~Role~/g, player.role.translation), mafiachan);
                            sendChanAll(border, mafiachan);
                            player.revealUse = player.revealUse + 1 || 1;
                        } else if (command == "expose") {
                            if (player.exposeUse >= (commandObject.limit || 1)) {
                                sys.sendMessage(src, "±Game: You already used this command!", mafiachan);
                                return;
                            }
                            if (target === null) {
                                sys.sendMessage(src, "±Game: That person is not playing!", mafiachan);
                                return;
                            }
                            var exposeMessage = commandObject.exposemsg ? commandObject.exposemsg : "~Self~ revealed that ~Target~ is the ~Role~!";
                            var inspectMode = target.role.actions.inspect || {};
                            var revealedRole;
                            if (inspectMode.revealAs !== undefined) {
                                if (typeof inspectMode.revealAs == "string") {
                                    if (inspectMode.revealAs == "*") {
                                        var rr = 1;
                                        while (mafia.signups.length > mafia.theme["roles" + rr].length) {
                                            ++rr;
                                        }
                                        var rrole = mafia.theme["roles" + rr].slice(0, mafia.signups.length);
                                        revealedRole = mafia.theme.trrole(rrole[Math.floor(Math.random() * rrole.length)]);
                                    } else {
                                        revealedRole = mafia.theme.trrole(inspectMode.revealAs);
                                    }
                                } else if (Array.isArray(inspectMode.revealAs)) {
                                    revealedRole = mafia.theme.trrole(inspectMode.revealAs[Math.floor(Math.random() * inspectMode.revealAs.length)]);
                                }
                            } else {
                                revealedRole = target.role.translation;
                            }
                            sendChanAll(border, mafiachan);
                            sendChanAll("±Game: " + exposeMessage.replace(/~Self~/g, name).replace(/~Target~/g, target.name).replace(/~Role~/g, revealedRole), mafiachan);
                            if ("revealChance" in commandObject && commandObject.revealChance > sys.rand(0, 100) / 100) {
                                if (commandObject.revealmsg !== undefined && typeof commandObject.revealmsg == "string") {
                                    sendChanAll("±Game: " + commandObject.revealmsg.replace(/~Self~/g, name).replace(/~Role~/g, mafia.players[name].role.translation), mafiachan);
                                } else {
                                    sendChanAll("±Game: While exposing, " + name + " (" + mafia.players[name].role.translation + ") made a mistake and was revealed!", mafiachan);
                                }
                            }
                            sendChanAll(border, mafiachan);
                            player.exposeUse = player.exposeUse + 1 || 1;
                        }
                        if ("recharge" in commandObject) {
                            if (!(player.name in this.dayRecharges)) {
                                this.dayRecharges[player.name] = {};
                            }
                            this.dayRecharges[player.name][commandName] = 1;
                        }


                        /* Hax-related to command */
                        // some roles can get "hax" from other people using some commands...
                        // however, roles can have avoidStandbyHax: ["kill", "reveal"] in actions..
                        if ("avoidStandbyHax" in player.role.actions && player.role.actions.avoidStandbyHax.indexOf(command) != -1) {
                            return;
                        }
                        var haxRoles = mafia.theme.getStandbyHaxRolesFor(command);
                        for (var i in haxRoles) {
                            var role = haxRoles[i];
                            var haxPlayers = this.getPlayersForRole(role);
                            for (var j in haxPlayers) {
                                var haxPlayer = haxPlayers[j];
                                var r = Math.random();
                                var roleName = this.theme.trside(player.role.side);
                                team = this.getPlayersForRole(player.role.side);
                                var playerRole = this.theme.trrole(player.role.role);
                                if (r < mafia.theme.roles[role].actions.standbyHax[command].revealTeam) {
                                    this.sendPlayer(haxPlayer, "±Game: The " + roleName + " used " + command + " on " + commandData + "!");
                                }
                                if (r < mafia.theme.roles[role].actions.standbyHax[command].revealPlayer) {
                                    if (team.length > 1) this.sendPlayer(haxPlayer, "±Game: " + name + " is one of The " + roleName + "!");
                                    else this.sendPlayer(haxPlayer, "±Game: " + name + " is The " + roleName + "!");
                                }
                                if (r < mafia.theme.roles[role].actions.standbyHax[command].revealRole) {
                                    this.sendPlayer(haxPlayer, "±Game: " + name + " is " + playerRole + "!");
                                }

                            }
                        }
                        return;
                    }
                }
                if (command == "join") {
                    sys.sendMessage(src, "±Game: You can't join now!", mafiachan);
                    return;
                }

                if (!this.isMafiaAdmin(src) && !this.isMafiaSuperAdmin(src)) throw ("no valid command");

                if (command in this.commands.auth) {
                    this.commands.auth[command][0].call(this, src, commandData);
                    return;
                }
                throw ("no valid command");
            };
        };

        if (typeof poGlobal == 'undefined') {
            poGlobal = JSESSION.global();
        }

        if (typeof mafia == 'undefined') {
            mafia = new Mafia(mafiachan);
            mafia.importOld();
            poGlobal.mafiaVersion = mafia.version;
        } else {
            if (Mafia.version > poGlobal.mafiaVersion) {
                poGlobal.mafiaVersion = Mafia.version;

                delete mafia;
                mafia = new Mafia(mafiachan);
                mafia.importOld();

                botAll("Mafia was updated!", mafiachan);
            }
        }
    }
})
