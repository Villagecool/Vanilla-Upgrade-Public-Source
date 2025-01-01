import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

// Subscribe to events to run code when specific in game actions occur
SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
	if (data.id === "vc:trader.setfilter") {
		let player = data.sourceEntity; //the player
		let block = player.getBlockFromViewDirection().block; //the block
		let blockentity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]; //the block entity
		let item = player.getComponent("equippable").getEquipment("Mainhand"); //the mainhand item
		let purchaceItem = blockentity.nameTag.split('::')
		if (block.typeId == "vc:trader") {
			if (player.nameTag != purchaceItem[2]) {
                if (item == undefined || player.isSneaking == false) player.runCommand(`title @s actionbar §7Recieve for: §f${purchaceItem[1]} §l${purchaceItem[0]}`);
            }else{
                if (item == undefined || player.isSneaking == false) player.runCommand(`title @s actionbar §7Recieve for: §f${purchaceItem[1]} §l${purchaceItem[0]}`);
                else {
                    blockentity.nameTag = `${item.typeId}::${item.amount}::${player.nameTag}`;
                    player.runCommand(`title @s actionbar §7You can now purchace item for §f${purchaceItem[1]} §l${purchaceItem[0]}`);
                }
            }
		}
	};
})