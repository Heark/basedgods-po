(function() {
    var gradient = "qlineargradient(spread:pad, x1:0.432, y1:0.692955, x2:0.145, y2:1, stop:0 rgba(139, 191, 228, 255), stop:1 rgba(189, 221, 246, 255))";
    var tourtier = "",
        roundnumber = 0,
        isFinals = false,
        prize = "",
        tournumber = 0,
        tourmembers = [],
        tourips = [],
        tourbattlers = [],
        tourplayers = [],
        battlesStarted = [],
        battlesLost = [];
        var steam_name;
		var steam_score;
	var this__ = '{"score":{"one":21,"two":35,"three":24,"four":2,"five":18},"meta":{"title":"Happy with the service"}}'
    function tourbox(msg) {
        sys.sendHtmlAll("<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/>" + msg + "<br/></td></tr></table></center><br/>", 0);
    }

    function tourboxSelf(src, msg, chan) {
        if (!sys.loggedIn(src) || !sys.isInChannel(src, chan)) {
            return;
        }

        sys.sendHtmlMessage(src, "<br/><center><table width=50% bgcolor=gray><tr style='background-color:" + gradient + "'><td align=center><br/>" + msg + "<br/></td></tr></table></center><br/>", chan);
    }

    function addCommands() {
        var commands = require('commands');
        var addListCommand = commands.addListCommand,
            addCommand     = commands.addCommand,
            addPlusPlusCommand = commands.addPlusPlusCommand;

        addListCommand(0, "tourusercommands", "Tour");

        addCommand(0, "join", function (src, commandData, chan) {
            if (tourmode !== 1) {
                bot.sendMessage(src, "Sorry, you are unable to join because a tournament is not currently running or has passed the signups phase.", chan);
                return;
            }
            var name = sys.name(src).toLowerCase();
            if (tourips.indexOf(sys.ip(src)) !== -1) {
                bot.sendMessage(src, "Sorry, you are already in the tournament. You are not able to join more than once.", chan);
                return;
            }
            var srctier = sys.hasTier(src, tourtier);
            if (!srctier) {
                bot.sendMessage(src, "You are currently not battling in the " + tourtier + " tier. Change your tier to " + tourtier + " to be able to join.", chan);
                return;
            }
            if (tourSpots() > 0) {
                tourmembers.push(name);
                tourips.push(sys.ip(src));
                tourplayers[name] = sys.name(src);
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(sys.name(src)) + " joined the tournament! " + tourSpots() + " more spot(s) left!</b></font>", 0);
                if (tourSpots() === 0) {
                    tourmode = 2;
                    roundnumber = 0;
                    roundPairing();
                }
            }
        });

        addCommand(0, "viewround", function (src, commandData, chan) {
            if (tourmode !== 2) {
                bot.sendMessage(src, "Sorry, you are unable to view the round because a tournament is not currently running or is in signing up phase.", chan);
                return;
            }
            var myStr;
            var finals = isFinals;
            var i;

            if (finals) {
                myStr = "<font style='font-size:20px; font-weight:bold;'>Finals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament:</font><hr width=300/>";
            } else {
                myStr = "<font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/>";
            }

            if (battlesLost.length > 0) {
                myStr += "<br><b><u>Battles Finished:</u></b><br>";
                for (i = 0; i < battlesLost.length; i += 2) {
                    myStr += battlesLost[i] + " won against " + battlesLost[i + 1] + "<br>";
                }
                myStr += "<br>";
            }
            if (tourbattlers.length > 0) {
                if (battlesStarted.indexOf(true) !== -1) {
                    myStr += "<br><b><u>Ongoing battles:</u></b><br>";
                    for (i = 0; i < tourbattlers.length; i += 2) {
                        if (battlesStarted[i / 2] === true) {
                            myStr += tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>";
                        }
                    }
                    myStr += "<br>";
                }
                if (battlesStarted.indexOf(false) !== -1) {
                    myStr += "<br><b><u>Yet to start battles:</u></b><br>";
                    for (i = 0; i < tourbattlers.length; i += 2) {
                        if (battlesStarted[i / 2] === false) {
                            myStr += tourplayers[tourbattlers[i]] + " VS " + tourplayers[tourbattlers[i + 1]] + "<br>";
                        }
                    }
                }
            }
            if (tourmembers.length > 0) {
                myStr += "<br><b><u>Members to the next round:</u></b><br>";
                var str = "",
                    x;

                for (x in tourmembers) {
                    myStr += (str.length === 0 ? "" : ", ") + tourplayers[tourmembers[x]] + "<br>";
                }
            }

            tourboxSelf(src, myStr, chan);
        });

        addCommand(0, "unjoin", function (src, commandData, chan) {
            if (tourmode === 0) {
                bot.sendMessage(src, "Wait till the tournament has started.", chan);
                return;
            }
            var name2 = sys.name(src).toLowerCase();
            if (tourmembers.indexOf(name2) !== -1) {
                tourmembers.splice(tourmembers.indexOf(name2), 1);
                tourips.splice(tourips.indexOf(sys.ip(src)), 1);
                delete tourplayers[name2];
                sys.sendHtmlAll("<font color=red><timestamp/><b>" + this.originalName + " left the tournament!</b></font>", 0);
                return;
            }
            if (tourbattlers.indexOf(name2) !== -1) {
                battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
                sys.sendHtmlAll("<font color=red><timestamp/><b>" + this.originalName + " left the tournament!</b></font>", 0);
                tourBattleEnd(tourOpponent(name2), name2);
            }
        });

        addCommand(0, "tourtier", function (src, commandData, chan) {
            if (tourmode === 0) {
                bot.sendMessage(src, "Wait till the tournament has started.", chan);
                return;
            }
            bot.sendMessage(src, 'The tier of the current tournament is ' + tourtier + '!', chan);
        });

        addPlusPlusCommand("sub", function (src, commandData, chan) {
            if (tourmode !== 2) {
                bot.sendMessage(src, "Wait until a tournament starts", chan);
                return;
            }
            var players = commandData.split(':');
            if (!isInTourney(players[0]) && !isInTourney(players[1])) {
                bot.sendMessage(src, "Neither are in the tourney.", chan);
                return;
            }
            sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(players[0]) + " and " + Utils.escapeHtml(players[1]) + " were exchanged places in the ongoing tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0);
            var p1 = players[0].toLowerCase();
            var p2 = players[1].toLowerCase(),
                x;

            for (x in tourmembers) {
                if (tourmembers[x] === p1) {
                    tourmembers[x] = p2;
                } else if (tourmembers[x] === p2) {
                    tourmembers[x] = p1;
                }
            }
            for (x in tourbattlers) {
                if (tourbattlers[x] === p1) {
                    tourbattlers[x] = p2;
                    battlesStarted[Math.floor(x / 2)] = false;
                } else if (tourbattlers[x] === p2) {
                    tourbattlers[x] = p1;
                    battlesStarted[Math.floor(x / 2)] = false;
                }
            }
            if (!isInTourney(p1)) {
                tourplayers[p1] = players[0];
                delete tourplayers[p2];
            } else if (!isInTourney(p2)) {
                tourplayers[p2] = players[1];
                delete tourplayers[p1];
            }
        });

        addPlusPlusCommand("restart", function (src, commandData, chan) {
            if (tourmode !== 2) {
                bot.sendMessage(src, "Wait until a tournament starts", chan);
                return;
            }
            var name = commandData.toLowerCase();
            if (tourbattlers.indexOf(name) !== -1) {
                battlesStarted[Math.floor(tourbattlers.indexOf(name) / 2)] = false;
                sys.sendHtmlAll("<font color=green><timestamp/><b>" + Utils.escapeHtml(sys.name(this.target)) + "'s match was restarted by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0);
            }
        });

        addPlusPlusCommand("tour", function (src, commandData, chan) {
            if (typeof tourmode !== "undefined" && tourmode > 0) {
                bot.sendMessage(src, "Sorry, you are unable to start a tournament because one is still currently running.", chan);
                return;
            }

            var commandpart;
            if (commandData.indexOf(':') === -1) {
                commandpart = commandData.split(' ');
            } else {
                commandpart = commandData.split(':');
            }

            tournumber = parseInt(commandpart[1], 10);
            prize = commandpart[2];
            if (isNaN(tournumber) || tournumber <= 2) {
                bot.sendMessage(src, "You must specify a tournament size of 3 or more.", chan);
                return;
            }

            tourtier = commandpart[0];
            if (!(tourtier = Utils.isTier(tourtier))) {
                bot.sendMessage(src, "Sorry, the server does not recognise the " + tourtier + " tier.", chan);
                tourtier = "";
                return;
            }

            tourmode = 1;
            tourmembers = [];
            tourips = [];
            tourbattlers = [];
            tourplayers = [];
            battlesStarted = [];
            battlesLost = [];
            isFinals = false;

            prize = prize || "No prize.";

            tourbox("<font style='font-size:20px; font-weight:bold;'>Tournament Started by <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "!</i></font><hr width=300/><table cellspacing=2 cellpadding=2><tr><td><b>Tier: <font style='color:red; font-weight:bold;'>" + tourtier + "</i></td></tr><tr><td><b>Players: <font style='color:red; font-weight:bold;'>" + tournumber + "</i></td></tr><tr><td><b>Prize: <font style='color:red; font-weight:bold;'>" + Utils.escapeHtml(prize) + "</i></td></tr></table><hr width=300/><center style='margin-right: 7px;'><b>Type <font color=red>/join</font> to join!");
        });

        addPlusPlusCommand("dq", function (src, commandData, chan) {
            if (tourmode === 0) {
                bot.sendMessage(src, "Wait till the tournament has started.", chan);
                return;
            }
            var name2 = commandData.toLowerCase();
            if (tourmembers.indexOf(name2) !== -1) {
                tourmembers.splice(tourmembers.indexOf(name2), 1);
                tourips.splice(tourips.indexOf(sys.dbIp(name2)), 1);
                delete tourplayers[name2];
                sys.sendHtmlAll("<font color=red><timestamp/><b>" + Utils.escapeHtml(commandData) + " was disqualified by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0);
                return;
            }
            if (tourbattlers.indexOf(name2) !== -1) {
                battlesStarted[Math.floor(tourbattlers.indexOf(name2) / 2)] = true;
                sys.sendHtmlAll("<font color=red><timestamp/><b>" + Utils.escapeHtml(commandData) + " was disqualified by " + Utils.escapeHtml(sys.name(src)) + "!</b></font>", 0);
                tourBattleEnd(tourOpponent(name2), name2);
            }
        });

        addPlusPlusCommand("push", function (src, commandData, chan) {
            if (tourmode === 0) {
                bot.sendMessage(src, "Wait until the tournament has started.", chan);
                return;
            }
            if (!sys.id(commandData) && commandData.toLowerCase() !== 'sub') {
                bot.sendMessage(src, "You may only add real people or a sub!", chan);
                return;
            }
            if (isInTourney(commandData.toLowerCase())) {
                bot.sendMessage(src, commandData + " is already in the tournament.", chan);
                return;
            }

            if (tourmode === 2) {
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was added to the tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0);

                tourmembers.push(commandData.toLowerCase());
                tourips.push(sys.dbIp(commandData));
                tourplayers[commandData.toLowerCase()] = commandData;
            } else if (tourmode === 1) {
                tourmembers.push(commandData.toLowerCase());
                tourips.push(sys.dbIp(commandData));
                tourplayers[commandData.toLowerCase()] = commandData;
                sys.sendHtmlAll("<font color=blue><timestamp/><b>" + Utils.escapeHtml(commandData) + " was added to the tournament by " + Utils.escapeHtml(sys.name(src)) + ".</b></font>", 0);
            }

            if (tourmode === 1 && tourSpots() === 0) {
                tourmode = 2;
                roundnumber = 0;
                roundPairing();
            }
        });

        addPlusPlusCommand("changecount", function (src, commandData, chan) {
            if (tourmode !== 1) {
                bot.sendMessage(src, "Sorry, you are unable to join because the tournament has passed the sign-up phase.", chan);
                return;
            }
            var count = parseInt(commandData, 10);
            if (isNaN(count) || count < 3) {
                bot.sendMessage(src, "Minimum amount of players is 3!", chan);
                return;
            }
            if (count < tourmembers.length) {
                bot.sendMessage(src, "There are more than that people registered", chan);
                return;
            }
            tournumber = count;
            tourbox("<font style='font-size:20px; font-weight:bold;'><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "</i> changed the number of entrants to <i style='color:red; font-weight:bold;'>" + count + "!</i></font><hr width=300/><br><b><i style='color:red; font-weight:bold;'>" + tourSpots() + "</i> more spot(s) left!</b>");
            if (tourSpots() === 0) {
                tourmode = 2;
                roundnumber = 0;
                roundPairing();
            }
        });

        addPlusPlusCommand("endtour", function (src, commandData, chan) {
            if (tourmode !== 0) {
                tourmode = 0;
                tourbox("<font style='font-size:20px; font-weight:bold;'>The tour was ended by <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(sys.name(src)) + "!</i></font><hr width=300/><br><b>Sorry! A new tournament may be starting soon!</b>");
            } else {
                bot.sendMessage(src, "Sorry, you are unable to end a tournament because one is not currently running.", chan);
            }
        });
    }

    function tourSpots() {
        return tournumber - tourmembers.length;
    }

    function isInTourney(name) {
        return tourplayers.hasOwnProperty(name.toLowerCase());
    }

    function tourOpponent(nam) {
        var name = nam.toLowerCase();
        var x = tourbattlers.indexOf(name);
        if (x !== -1) {
            if (x % 2 === 0) {
                return tourbattlers[x + 1];
            } else {
                return tourbattlers[x - 1];
            }
        }
        return "";
    }

    function areOpponentsForTourBattle(src, dest) {
        return isInTourney(sys.name(src)) && isInTourney(sys.name(dest)) && tourOpponent(sys.name(src)) === sys.name(dest).toLowerCase();
    }

    function areOpponentsForTourBattle2(src, dest) {
        return isInTourney(src) && isInTourney(dest) && tourOpponent(src) === dest.toLowerCase();
    }

    function ongoingTourneyBattle(name) {
        return tourbattlers.indexOf(name.toLowerCase()) !== -1 && battlesStarted[Math.floor(tourbattlers.indexOf(name.toLowerCase()) / 2)] === true;
    }

    function tourBattleEnd(src, dest) {
        if (!areOpponentsForTourBattle2(src, dest) || !ongoingTourneyBattle(src)) {
            return;
        }

        battlesLost.push(src);
        battlesLost.push(dest);
        var srcL = src.toLowerCase();
        var destL = dest.toLowerCase();
        battlesStarted.splice(Math.floor(tourbattlers.indexOf(srcL) / 2), 1);
        tourbattlers.splice(tourbattlers.indexOf(srcL), 1);
        tourbattlers.splice(tourbattlers.indexOf(destL), 1);
        tourmembers.push(srcL);
        delete tourplayers[destL];
        var str = "";

        if (tourbattlers.length !== 0 || tourmembers.length > 1) {
            str = "<font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>B</font>attle <font style='font-size:25px;'>C</font>ompleted!</font><hr width=300/><br><b><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(src)) + "</i> won their battle and moves on to the next round.<br><br><i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(Utils.toCorrectCase(dest)) + "</i> lost their battle and is out of the tournament.</b>";
            if (tourbattlers.length > 0) {
                str += "<br><hr width=300/><br><i style='color:red; font-weight:bold;'>" + tourbattlers.length / 2 + "</i>  battle(s) remaining!";
                tourbox(str);
                return;
            }
        }

        if (str.length > 0) {
            tourbox(str);
        }

        roundPairing();
    }

    function roundPairing() {
        roundnumber += 1;
        battlesStarted = [];
        tourbattlers = [];
        battlesLost = [];
        if (tourmembers.length === 1) {

		    steam_name = tourplayers[tourmembers[0]]
		if(steam_name == tourplayers[tourmembers[0]]){
			steam_score += 1;
			sys.writeToFile("name.txt", steam_name);
			sys.writeToFile("score.txt", steam_score);
			} else {
			steam_score = 1;
			if(steam_name == undefined || " "){
				steam_score = "None"
				steam_name = "None"
			}
			sys.writeToFile("plugins/name.txt", steam_roller.name);
			sys.writeToFile("plugins/score.txt", steam_roller.score);
			};
            tourbox("<font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>C</font>ongratulations, <i style='color:red; font-weight:bold;'>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + "!</i></font><hr width=300/><br><b>You won the tournament! You win " + prize + "!</b>");

			
			tourmode = 0;
            isFinals = false;
            return;
        }
        var str;
        var finals = tourmembers.length === 2;
        if (!finals) {
            str = "<font style='font-size:20px; font-weight:bold;'>Round <i>" + roundnumber + "</i> of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Current Matchups</i><br/><b>";
        } else {
            isFinals = true;
            str = "<font style='font-size:20px; font-weight:bold;'><font style='font-size:25px;'>F</font>inals of <i style='color:red; font-weight:bold;'>" + tourtier + "</i> tournament!</font><hr width=300/><i>Matchup</i><br/><b>";
        }
        var players = sys.playerIds(),
            i = 0,
            inTour, player, j, len;
        while (tourmembers.length >= 2) {
            i += 1;
            var x1 = sys.rand(0, tourmembers.length);
            tourbattlers.push(tourmembers[x1]);
            var name1 = tourplayers[tourmembers[x1]];
            tourmembers.splice(x1, 1);
            x1 = sys.rand(0, tourmembers.length);
            tourbattlers.push(tourmembers[x1]);
            var name2 = tourplayers[tourmembers[x1]];
            tourmembers.splice(x1, 1);
            battlesStarted.push(false);

            str += Utils.escapeHtml(name1) + " vs " + Utils.escapeHtml(name2) + "<br/>";
        }
        if (tourmembers.length > 0) {
            str += "</b><br/><i>" + Utils.escapeHtml(tourplayers[tourmembers[0]]) + " is randomly selected to go next round!<br/>";
        }

        for (j = 0, len = players.length; j < len; j += 1) {
            player = players[j];
            if (!sys.loggedIn(player)) {
                continue;
            }

            inTour = tourplayers.indexOf(sys.name(player)) > -1;

            if (inTour) {
                sys.changeAway(player, false);
                bot.sendMessage(player, "You have been unidled for the tournament.", 0);
            }

            tourboxSelf(player, str + (inTour ? "<ping/>" : ""), 0);
        }
    }

    var events = {
        beforeChallengeIssued: function (src, dest) {
            if (tourmode === 2) {
                var name1 = sys.name(src);
                var name2 = sys.name(dest);
                if (isInTourney(name1)) {
                    if (isInTourney(name2)) {
                        if (tourOpponent(name1) !== name2.toLowerCase()) {
                            bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
                            sys.stopEvent();
                            return;
                        }
                    } else {
                        bot.sendMessage(src, "This guy isn't your opponent in the tourney.");
                        sys.stopEvent();
                        return;
                    }
                    if (!sys.hasTier(src, tourtier) || !sys.hasTier(sys.id(name2), tourtier)) {
                        bot.sendMessage(src, "You must be both in the tier " + tourtier + " to battle in the tourney.");
                        sys.stopEvent();
                        return;
                    }
                } else {
                    if (isInTourney(name2)) {
                        bot.sendMessage(src, "This guy is in the tournament and you are not, so you can't battle him/her.");
                        sys.stopEvent();
                        return;
                    }
                }
            }
        },

        beforeBattleMatchup: function (src, dest/*, clauses, rated, mode, team1, team2*/) {
            if (tourmode === 2 && (isInTourney(sys.name(src)) || isInTourney(sys.name(dest)))) {
                sys.stopEvent();
                return;
            }
        },

        afterBattleStarted: function(src, dest/*, info, id, t1, t2*/) {
            if (tourmode === 2) {
                if (areOpponentsForTourBattle(src, dest)) {
                    if (sys.hasTier(src, tourtier) && sys.hasTier(dest, tourtier)) {
                        battlesStarted[Math.floor(tourbattlers.indexOf(sys.name(src).toLowerCase()) / 2)] = true;
                    }
                }
            }
        },

        afterBattleEnded: function(src, dest, desc) {
            if (tourmode !== 2 || desc === "tie") {
                return;
            }

            tourBattleEnd(sys.name(src), sys.name(dest));
        }
    };

    module.reload = function() {
        addCommands();
        return true;
    };

    module.exports = events;
    exports.addCommands = addCommands;
    exports.spots = tourSpots;
    exports.tier = tourtier;
    exports.ips = tourips;
    exports.members = tourmembers;
    if (typeof tourmode !== "undefined" && tourmode > 0) {
        exports.tourSpots = tourSpots;
        exports.tourtier = tourtier;
    }
}());
