**Command**: {{command}}

**Aliases**: {{aliases}}

**Usage**: `{{usage}}`


Purges up to 2500 messages in a channel, with options to filter certain messages for deletion such as: from bots, has an image attachment, has a file attachment, has an embed, has a link, from specific user(s), includes text, matches a regex with the option to invert the filter.

**NOTE**: Messages over 2 weeks old _will not_ be deleted. This is a limitation by Discord.

The number of messages that you enter for the `limit` is the amount of messages that to _search_ not the amount that it deletes.


**Examples**:

* `purge 500` - deletes the most recent 500 messages

* `purge 20 -b` - deletes up to 20 messages from bots

* `purge 20 --im` - deletes up to 20 messages containing images

* `purge 20 --fi` - deletes up to 20 messages containing files

* `purge 20 -e` - deletes up to 20 messages containing embeds

* `purge 20 -l` - deletes up to 20 messages containing links

* `purge 20 -f minemidnight#0001 -f="oxyl beta"` - deletes up to 20 messages from users `minemidnight#0001` or `oxyl beta`

* `purge 20 --in="no u"` - deletes up to 20 messages containing "no u" in it



Inverse Examples:

* `purge 20 -b --inv` - deletes up to 20 messages which are NOT from bots

* `purge 20 -e --im -f minemidnight#0001 --inv` - deletes up to 20 messages which do not contain embeds, images, or are not from `minemidnight#0001`
