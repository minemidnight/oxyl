const Discord = require("discord.js"),
      Oxyl = require("../oxyl.js");

Oxyl.registerCommand("config", "dm", (message) => {
  var args = message.content.split(" ");
  var guild = bot.guilds.get(args[0]);
  if (!guild) {
    return "Guild with id `" + args[0] + "` not found.";
  } else if (guild.owner.id != message.author.id) {
    return "You are not the owner of `" + guild + "` **(**" + guild.id + "**)**";
  } else {
    var path = "./oxylfiles/" + guild.id + ".yml";
    var data = yaml.safeLoad(fs.readFileSync(path));
    if (args[1] == "get") {
      var configMsg = "", cNumb = 1;
      configMsg += "Config for `" + guild + "` **(**" + guild.id + "**)**";
      configMsg += "\n```";

      if (data["channels"]["ignored"].length > 0) {
        var channelNames = [];
        for (var i = 0; i < data["channels"]["ignored"].length; i++) {
          channelNames.push(bot.channels.get(data["channels"]["ignored"][i]).name);
        }
        configMsg += "\n[" + cNumb + "] Ignored Channels: " + channelNames.sort();
      } else {
        configMsg += "\n[" + cNumb + "] Ignored Channels: None";
      } cNumb++;

      if (data["roles"]["mod"].length > 0) {
        var modRoles = [];
        for (var i = 0; i < data["roles"]["mod"].length; i++) {
          modRoles.push(guild.roles.get(data["roles"]["mod"][i]).name);
        }
        configMsg += "\n\n[" + cNumb + "] Moderator Roles: " + modRoles.sort();
      } else {
        configMsg += "\n\n[" + cNumb + "] Moderator Roles: None";
       cNumb++;

      if (data["roles"]["whitelist"].length > 0) {
        var whitelistedRoles = [];
        for (var i = 0; i < data["roles"]["whitelist"].length; i++) {
          whitelistedRoles.push(guild.roles.get(data["roles"]["whitelist"][i]).name);
        }
        configMsg += "\n[" + cNumb + "] Whitelisted Roles: " + whitelistedRoles.sort();
      } else {
        configMsg += "\n[" + cNumb + "] Whitelisted Roles: None";
      } cNumb++;

      if (data["filters"]["swear"].length > 0) {
        configMsg += "\n\n[" + cNumb + "] Swear Filter: " + data["filters"]["swear"][i].sort();
      } else {
        configMsg += "\n\n[" + cNumb + "] Swear Filter: Disabled";
      } cNumb++;

      if (data["filters"]["link"]) {
        configMsg += "\n[" + cNumb + "] Link Filter: Enabled";
      } else {
        configMsg += "\n[" + cNumb + "] Link Filter: Disabled";
      } cNumb++;

      if (data["filters"]["spam"]) {
        configMsg += "\n[" + cNumb + "] Spam Filter: Enabled";
      } else {
        configMsg += "\n[" + cNumb + "] Spam Filter: Disabled";
      } cNumb++;

      configMsg += "\n```\nTo change a value, type these arguments: `<guild id> set <number shown> <new value/reset>`";
      configMsg += "\n\n**Accepted Values for Different Types:**";
      configMsg += "\nChannels: ID or Name (not including #)";
      configMsg += "\nRoles: ID or Name";
      configMsg += "\nSwear Filter: word";
      configMsg += "\nOther Filters: on/enable/true/yes or off/disable/false/no";

      return configMsg;
    }
  } else if (args[1] == "set" || args[1] == "edit") {
    try { args[3].toLowerCase() } catch (e) { return; }
    if (args[2]) {
      var cNumb = parseInt(args[2])
      if (isNaN(cNumb)) {
        return "Invalid config ID " + cNumb + ". (Use `<guild id> get` as arguments to get the current settings and config numbers)";

      } else if (cNumb == 1) {
        var value = args[3], channel, type;
        if (!value) {
          return "Please provide a channel ID or a channel name to add to the Ignored Channels, or provide `reset` to reset it.";
        } else if (value == "reset" || value == "clear") {
          changeConfig(guild.id,
            function() {
              data["channels"]["ignored"] = [];
            });
          return "Reset the Ignored Channels"
        } else if (!isNaN(parseInt(value))) {
          type = "id";
        } else {
          type = "name";
        }

        channel = guild.channels.filter(c => c.type == "text").find(c => c[type].toLowerCase() == value);
        if (!channel) {
          return "Invalid Input Value, please provide a channel ID or a channel name."
        } else {
          changeConfig(guild.id,
            function() {
              data["channels"]["ignored"].push(channel.id);
            });
          return "Added " + channel + " to Ignored Channels of `" + guild + "` **(**" + guild.id + "**)**"
        }

      } else if (cNumb == 2) {
        var value = args[3], role, type;
        if (!value) {
          return "Please provide a role ID or a role name to add to the Moderator Roles, or provide `reset` to reset it.";
        } else if (value == "reset" || value == "clear") {
          changeConfig(guild.id,
            function() {
              data["roles"]["mod"] = [];
            });
          return "Reset the Moderator Roles"
        } else if (!isNaN(parseInt(value))) {
          type = "id";
        } else {
          type = "name";
        }

        role = guild.roles.find(r => r[type].toLowerCase() == value);
        if (!channel) {
          return "Invalid Input Value, please provide a role ID or a role name."
        } else {
          changeConfig(guild.id,
            function() {
              data["roles"]["mod"].push(role.id);
            });
          return "Added " + role.name + " to Moderator Roles of `" + guild + "` **(**" + guild.id + "**)**"
        }

      } else if (cNumb == 3) {
        var value = args[3], role, type;
        if (!value) {
          return "Please provide a role ID or a role name to add to the Whitelisted Roles, or provide `reset` to reset it.";
        } else if (value == "reset" || value == "clear") {
          changeConfig(guild.id,
            function() {
              data["roles"]["whitelist"] = [];
            });
          return "Reset the Whitelisted Roles"
        } else if (!isNaN(parseInt(value))) {
          type = "id";
        } else {
          type = "name";
        }

        role = guild.roles.find(r => r[type].toLowerCase() == value);
        if (!channel) {
          return "Invalid Input Value, please provide a role ID or a role name."
        } else {
          changeConfig(guild.id,
            function() {
              data["roles"]["whitelist"].push(role.id);
            });
          return "Added " + role.name + " to Whitelisted Roles of `" + guild + "` **(**" + guild.id + "**)**"
        }

      } else if (cNumb == 4) {
        var value = args[3];
        if (!value) {
          return "Please provide a word to add to the Swear Filter, or provide `reset` to reset it.";
        } else if (value == "reset" || value == "clear") {
          changeConfig(guild.id,
            function() {
              data["filters"]["swear"] = [];
            });
          return "Reset the Swear Filter"
        }

        changeConfig(guild.id,
          function() {
            data["filters"]["swear"].push(value);
          });
        return "Added `" + value + "` to Swear Filter of `" + guild + "` **(**" + guild.id + "**)**"

      } else if (cNumb == 5) {
        var value = args[3];
        if (!value) {
          return "Please provide a value for the Link Filter.";
        } else if (value == "enable" || value == "true" || value == "yes") {
          value = true;
        } else if (value == "disable" || value == "false" || value == "no") {
          value = false;
        }

        changeConfig(guild.id,
          function() {
            data["filters"]["swear"] = (value);
          });
        return "Set Link Filter to `" + value + "` in `" + guild + "` **(**" + guild.id + "**)**"

      } else if (cNumb == 6) {
        var value = args[3];
        if (!value) {
          return "Please provide a value for the Spam Filter.";
        } else if (value == "enable" || value == "true" || value == "yes") {
          value = true;
        } else if (value == "disable" || value == "false" || value == "no") {
          value = false;
        }

        changeConfig(guild.id,
          function() {
            data["filters"]["swear"] = (value);
          });
        return "Set Spam Filter to `" + value + "` in `" + guild + "` **(**" + guild.id + "**)**"

        } else {
          return "Provide a config ID to change. (Use `<guild id> get` as arguments to get the current settings and config numbers)";
        }
      } else {
        return "Provide a config ID to change. (Use `<guild id> get` as arguments to get the current settings and config numbers)";
      }
    } else {
      return "Argument Missing: `get` or `set`"
    }
  }
}, ["setup"], "Configurate Oxyl and his settings per guild", "<guild id> <get/set> [options]");
