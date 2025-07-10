import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { toTime } from './utils.js'

// Subscribe to events to run code when specific in game actions occur
SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
	if (data.id != 'vc:effect') return;
	let victim = data.sourceEntity;
	if (!victim) return;
	const effectName = data.message.split(' ')[0]
	const effectLength = data.message.split(' ')[1]
	let effectsArray = []
	if (victim.getDynamicProperty('effects') != undefined) effectsArray = victim.getDynamicProperty('effects').split(':::'); // get active effects
	effectsArray.push(effectName)
	victim.setDynamicProperty('effects', effectsArray.join(':::'));
	SERVER.world.sendMessage(`Added effect ${effectName} to ${victim.typeId} for ${effectLength} seconds`);
	var secondsLeft = Number(effectLength)
	secondsLeft += (secondsLeft < 0 ? 1 : -1)
	const tickDown = SERVER.system.runInterval(() => {
		victim.runCommand(`title @s actionbar ${effectName} for ${toTime(secondsLeft)}`);
		if (secondsLeft < 0) secondsLeft += 1; else secondsLeft += -1;
	}, 20);
	SERVER.system.runTimeout(() => {
		SERVER.system.clearRun(tickDown);
		effectsArray.splice(effectsArray.indexOf(effectName), 1)
		victim.setDynamicProperty('effects', effectsArray.join(':::'));
		SERVER.world.sendMessage(`Cleared effect ${effectName}`);
		victim.runCommand(`scriptevent vc:effectCallback ${effectName}`)
	}, Math.abs(Number(effectLength)) * 20);

});


// See more at https://wiki.bedrock.dev/scripting/script-server.html