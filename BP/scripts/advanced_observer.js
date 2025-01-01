import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, decripateStack } from './utils.js'

// Subscribe to events to run code when specific in game actions occur
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
	initEvent.blockComponentRegistry.registerCustomComponent('vc:advanced_observer', {
		beforeOnPlayerPlace: e => {
			e.block.dimension.spawnEntity('vc:advanced_observer', e.block.center())
		},
		onPlayerInteract: e => {
			const player = e.player; //the player
			const block = e.block; //the hopper
			let blockentity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]; //the hopper entity
			if (!blockentity) blockentity = e.block.dimension.spawnEntity('vc:advanced_observer', e.block.center())
			let item = player.getComponent("equippable").getEquipment("Mainhand"); //the new filter
			if (!item) item = new SERVER.ItemStack('minecraft:air', 1)
			if (block.typeId == "vc:advanced_observer") {
				if (block.permutation.getState("vc:changeable") == false) {
					setPermutation(block, "vc:changeable", true)
					SERVER.system.runTimeout(() => { setPermutation(block, "vc:changeable", false) }, 40)
					player.runCommand(`title @s actionbar §7Block filter is §f§l${(blockentity.nameTag == '' ? 'No Filter' : blockentity.nameTag)}`);
				} else {
					if (item.typeId == 'vc:advanced_filter' && item.getLore()[0] != undefined) {
						if (item.getLore()[0] == '§r§7§lGreater than§r' || item.getLore()[0] == '§r§7§lLess Than§r' || item.getLore()[0] == '§r§7§lIs Equal to§r') {
							player.runCommand(`title @s actionbar §cCannot use §r${item.getLore()[0]}§c here!`);
							blockentity.runCommand(`playsound close_door.copper @a[r=15] ~~~`)
							return;
						}
						blockentity.nameTag = item.getLore().join('\n');
						decripateStack(player)
						player.runCommand(`title @s actionbar §7Set item filter to §f§l${blockentity.nameTag} §r${item.getLore()[0].includes('Name') ? '\n§i§oNote that it will reference the block id and not the name tag': ''}`);
						blockentity.runCommand(`playsound advanced_hopper.change @a[r=15] ~~~`)
						return;
					}
					if (blockentity.nameTag.startsWith('specfilt-')) blockentity.dimension.spawnItem(new SERVER.ItemStack('vc:advanced_filter', 1), blockentity.location);
					setPermutation(block, "vc:changeable", false)
					blockentity.nameTag = `${item.typeId}`;
					player.runCommand(`title @s actionbar §7Set block filter to §f§l${item.typeId}`);
					blockentity.runCommand(`playsound advanced_hopper.change @a[r=15] ~~~`)
				}
			}
		},
		onTick: e => {
			let block = e.block; //the hopper
			if (block.permutation.getState("vc:toggle_bit")) return;
			let entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0];; //the hopper entity
			if (!entity) return;
			let filter = entity.nameTag;
			let detection = block.below(1);
			if (block.permutation.getState("minecraft:facing_direction") == "north") detection = block.north(1)
			if (block.permutation.getState("minecraft:facing_direction") == "east") detection = block.east(1)
			if (block.permutation.getState("minecraft:facing_direction") == "south") detection = block.south(1)
			if (block.permutation.getState("minecraft:facing_direction") == "west") detection = block.west(1)
			if (block.permutation.getState("minecraft:facing_direction") == "up") detection = block.above(1)
			if (!detection) return;

			let sucess = (entity.nameTag.includes('§r') ? advancedFilterAllowed(detection, entity.nameTag.split('\n')) : detection.typeId == entity.nameTag);
			setPermutation(block, 'vc:lit_bit', sucess)
			if (sucess) {
				if (block.permutation.getState("minecraft:facing_direction") == "north") turnOnRedstone(block.north(-1), "north", block.north(-1).permutation.getState("repeater_delay"))
				if (block.permutation.getState("minecraft:facing_direction") == "east") turnOnRedstone(block.east(-1), "east", block.east(-1).permutation.getState("repeater_delay"))
				if (block.permutation.getState("minecraft:facing_direction") == "south") turnOnRedstone(block.south(-1), "south", block.south(-1).permutation.getState("repeater_delay"))
				if (block.permutation.getState("minecraft:facing_direction") == "west") turnOnRedstone(block.west(-1), "west", block.west(-1).permutation.getState("repeater_delay"))
			}
		}
	})
});

function advancedFilterAllowed(theBlock, lore) {
	if (!lore[0]) lore[0] = 'nah'
	switch (lore[0]) {
		case '§r§7§lItems: §r':
			return (lore.indexOf(theBlock.typeId) >= 0)
			break;
		case '§r§7§lName is equal to§r':
			return (theBlock.typeId == lore[1])
			break;
		case '§r§7§lName starts with§r':
			return (theBlock.typeId.startsWith(lore[1]))
			break;
		case '§r§7§lName ends with§r':
			return (theBlock.typeId.endsWith(lore[1]))
			break;
		case '§r§7§lBlock States: §r':
			var is;
			try {is = JSON.parse(lore[1].split(' = ')[1])} catch (e) { is = lore[1].split(' = ')[1] }
			return (theBlock.permutation.getState(lore[1].split(' = ')[0]) == is)
			break;
		default:
			return false
	}
}
function advancedFilterConfig(player, blockentity, getDefs) {
	const pullitem = blockentity.nameTag
	let defSelect = 0;
	let defText = '';
	let defState = '';
	if (getDefs) {
		if (pullitem.startsWith('specfilt-equal')) { defSelect = 0; defText = pullitem.replace('specfilt-equal', '') }
		if (pullitem.startsWith('specfilt-startWith')) { defSelect = 1; defText = pullitem.replace('specfilt-startWith', '') }
		if (pullitem.startsWith('specfilt-endWith')) { defSelect = 2; defText = pullitem.replace('specfilt-endWith', '') }
		if (pullitem.startsWith('specfilt-anyOf')) { defText = pullitem.replace('specfilt-anyOf', '') }
		if (pullitem.startsWith('specfilt-blockstate')) {
			var results = pullitem.replace('specfilt-blockstate', '').split('||')
			defSelect = (results[1] == '>' ? 1 : results[1] == '<' ? 2 : '=')
			defText = results[2]
			defState = results[0]
		}
	}


	const main = new UI.ActionFormData()
		.title('Set Filter')
		.body('Check if...')
		.button('Block Name...')
		.button('Block State...')
		.button('Multible Blocks...');
	main.show(player).then((ee) => {
		if (ee.selection == 0) {
			const oplist = ['Equals', 'Starts with', 'Ends with']
			let popUp = new UI.ModalFormData()
				.title("Set Filter")
				.dropdown('Block name...', oplist, defSelect)
				.textField("", "Value", defText);

			popUp.show(player).then((r) => {
				if (r.canceled) return;
				if (r.formValues[0] == 0) blockentity.nameTag = `specfilt-equal${r.formValues[1]}`
				if (r.formValues[0] == 1) blockentity.nameTag = `specfilt-startWith${r.formValues[1]}`
				if (r.formValues[0] == 2) blockentity.nameTag = `specfilt-endWith${r.formValues[1]}`
				player.runCommand(`title @s actionbar §7Set block filter to §fName ${(r.formValues[0] == 1 ? 'starts with' : r.formValues[0] == 2 ? 'ends with' : 'equals')} §l${r.formValues[1]}`);
				if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
				item.amount += -1
				player.getComponent("equippable").setEquipment("Mainhand", item);
			}).catch((e) => {
				console.error(e, e.stack);
			})
		}
		else if (ee.selection == 1) {
			const oplist = ['Equals', 'Greater Than', 'Less Than']
			let popUp = new UI.ModalFormData()
				.title("Set Filter")
				.textField("", "Block State", defState)
				.dropdown('is...', oplist, defSelect)
				.textField("", "Value", defText);

			popUp.show(player).then((r) => {
				if (r.canceled) return;
				blockentity.nameTag = `specfilt-blockstate${r.formValues[0]}||${(r.formValues[1] == 1 ? '>' : r.formValues[1] == 2 ? '<' : '=')}||${r.formValues[2]}`
				player.runCommand(`title @s actionbar §7Set block filter to §fBlock State: §l${r.formValues[0]} is ${(r.formValues[1] == 1 ? '>' : r.formValues[1] == 2 ? '<' : '=')} ${r.formValues[2]}`);
				if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
				item.amount += -1
				player.getComponent("equippable").setEquipment("Mainhand", item);
			}).catch((e) => {
				console.error(e, e.stack);
			})
		}
		else {
			let popUp = new UI.ModalFormData()
				.title("Set Filter")
				.textField("Blocks to detect for (seperate by ',')", "minecraft:air,vc:glowing_mushroom", defText)

			popUp.show(player).then((r) => {
				if (r.canceled) return;
				blockentity.nameTag = `specfilt-anyOf${r.formValues[0]}`
				player.runCommand(`title @s actionbar §7Set block filter to §fAny Of: §l${r.formValues[0]}`);
				if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
				item.amount += -1
				player.getComponent("equippable").setEquipment("Mainhand", item);
			}).catch((e) => {
				console.error(e, e.stack);
			})
		}
	})
}
// See more at https://wiki.bedrock.dev/scripting/script-server.html

function turnOnRedstone(block, direction, delay) {
	if (block.typeId == 'minecraft:unpowered_repeater' && block.permutation.getState("minecraft:cardinal_direction") == direction) {
		block.setType('minecraft:powered_repeater')
		setPermutation(block, 'minecraft:cardinal_direction', direction)
		setPermutation(block, 'repeater_delay', delay)
	}
	else if (block.typeId == 'minecraft:redstone_wire') {
		setPermutation(block, 'redstone_signal', 15)
	}
	else if (block.typeId == 'minecraft:redstone_torch' && block.permutation.getState("torch_facing_direction") == direction) {
		block.setType('minecraft:unlit_redstone_torch')
		setPermutation(block, 'torch_facing_direction', direction)
	}
}