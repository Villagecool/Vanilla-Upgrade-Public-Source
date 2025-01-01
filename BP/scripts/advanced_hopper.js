import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { decripateStack, setPermutation } from './utils.js'

// Subscribe to events to run code when specific in game actions occur
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
	initEvent.blockComponentRegistry.registerCustomComponent('vc:advanced_hopper', {
		beforeOnPlayerPlace: e => {
			e.block.dimension.spawnEntity('vc:advanced_hopper', e.block.center())
		},
		onPlayerInteract: e => {
			const player = e.player; //the player
			const block = e.block; //the hopper
			let blockentity = block.dimension.getEntitiesAtBlockLocation(block.location)[0]; //the hopper entity
			if (!blockentity) blockentity = e.block.dimension.spawnEntity('vc:advanced_hopper', e.block.center())
			let item = player.getComponent("equippable").getEquipment("Mainhand"); //the new filter
			if (block.permutation.getState("vc:changeable") == false) {
				setPermutation(block, "vc:changeable", true)
				SERVER.system.runTimeout(() => { setPermutation(block, "vc:changeable", false) }, 40)
				player.runCommand(`title @s actionbar §7Item filter is §f§l${(blockentity.nameTag == '' ? 'No Filter' : blockentity.nameTag)}`);
			} else {
				var theFilter
				if (!item) theFilter = ''
				else theFilter = item.typeId
				if (theFilter == 'vc:advanced_filter' && item.getLore()[0] != undefined) {
					if (item.getLore()[0] == '§r§7§lBlock States: §r') {
						player.runCommand(`title @s actionbar §cCannot use §r${item.getLore()[0]}§c here!`);
						blockentity.runCommand(`playsound close_door.copper @a[r=15] ~~~`)
						return;
					}
					blockentity.nameTag = item.getLore().join('\n');
					decripateStack(player)
					player.runCommand(`title @s actionbar §7Set item filter to §f§l${blockentity.nameTag}`);
					blockentity.runCommand(`playsound advanced_hopper.change @a[r=15] ~~~`)
					return;
				}
				if (blockentity.nameTag.includes('§r')) {
					const afilter = new SERVER.ItemStack('vc:advanced_filter', 1)
					afilter.setLore(blockentity.nameTag.split('\n'))
					blockentity.dimension.spawnItem(afilter, blockentity.location);
				}
				setPermutation(block, "vc:changeable", false)
				//blockentity.runCommand(`replaceitem entity @s slot.armor.head 0 ${item.typeId}`);
				blockentity.nameTag = `${theFilter}`;
				player.runCommand(`title @s actionbar §7Set item filter to §f§l${(theFilter == '' ? 'No Filter' : theFilter)}`);
				blockentity.runCommand(`playsound advanced_hopper.change @a[r=15] ~~~`)
			}

		},
		onTick: e => {
			let block = e.block; //the hopper
			if (block.permutation.getState("vc:toggle_bit")) return;
			let entity = block.dimension.getEntitiesAtBlockLocation(block.location)[0];; //the hopper entity
			if (!entity) return;
			let filter = entity.nameTag;
			let uppercontainer = block.above(1).getComponent("inventory");
			let lowercontainer = block.below(1);
			if (block.permutation.getState("minecraft:block_face") == "north") lowercontainer = block.north(-1)
			if (block.permutation.getState("minecraft:block_face") == "east") lowercontainer = block.east(-1)
			if (block.permutation.getState("minecraft:block_face") == "south") lowercontainer = block.south(-1)
			if (block.permutation.getState("minecraft:block_face") == "west") lowercontainer = block.west(-1)
			if (lowercontainer.getComponent("inventory")) {
				for (let i = 0; i < entity.getComponent("inventory").container.size; i++) {
					if (entity.getComponent("inventory").container.getItem(i)) {
						transferOneItem(entity.getComponent("inventory").container, i, lowercontainer.getComponent("inventory").container);
						break;
					}
				}
				//addItemToContainer(lowercontainer.container, item, entity)
			}
			if (e.block.above(1).isAir || e.block.above(1).typeId == 'vc:advanced_hopper') {
				let entityAbove = entity.dimension.getEntities({ location: { x: block.location.x, y: block.location.y + 1, z: block.location.z }, maxDistance: 1.5, minDistance: 0, })[0]
				let itemEntity = entity.dimension.getEntities({ type: "minecraft:item", location: { x: block.location.x, y: block.location.y + 1, z: block.location.z }, maxDistance: 1.5, minDistance: 0, })[0];
				let entityWithContainer = entityAbove.getComponent("inventory");
				if (entityWithContainer && entityAbove.typeId != 'minecraft:player') {
					if (entityAbove.id != entity.id) pullItemFromContainer(entityWithContainer.container, filter, entity)
				}
				if (itemEntity) {
					stealItemEntity(itemEntity, filter, entity)
				}
			}
			if (e.block.below(1).isAir || e.block.below(1).typeId == 'vc:advanced_hopper') {
				let entityBelow = entity.dimension.getEntitiesAtBlockLocation(lowercontainer.location).filter(bruh => { return bruh.id != entity.id })[0]
				if (entityBelow != undefined && entityBelow.getComponent("inventory") && entityBelow.typeId != 'minecraft:player') {
					for (let i = 0; i < entity.getComponent("inventory").container.size; i++) {
						if (entity.getComponent("inventory").container.getItem(i)) {
							//console.log(`${entity.id} transfered an item to ${entityBelow.id}`)
							transferOneItem(entity.getComponent("inventory").container, i, entityBelow.getComponent("inventory").container);
							break;
						}
					}
				}
			}
			if (uppercontainer) {
				//transferOneItem(uppercontainer.container, 0, entity.getComponent("inventory").container);
				pullItemFromContainer(uppercontainer.container, filter, entity)
			}
			if (block.east(1).permutation.getState("facing_direction") == 4/*&& block.permutation.getState("minecraft:block_face") != "east"*/) {
				pullItemFromContainer(block.east(1).getComponent("inventory").container, filter, entity)
			}
			if (block.west(1).permutation.getState("facing_direction") == 5 /*&& block.permutation.getState("minecraft:block_face") != "west"*/) {
				pullItemFromContainer(block.west(1).getComponent("inventory").container, filter, entity)
			}
			if (block.north(-1).permutation.getState("facing_direction") == 2 /*&& block.permutation.getState("minecraft:block_face") != "north"*/) {
				pullItemFromContainer(block.north(-1).getComponent("inventory").container, filter, entity)
			}
			if (block.south(-1).permutation.getState("facing_direction") == 3 /*&& block.permutation.getState("minecraft:block_face") != "south"*/) {
				pullItemFromContainer(block.south(-1).getComponent("inventory").container, filter, entity)
			}
		}
	})
});
SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
	if (data.id === "vc:hopper.checkDrop") {
		let blockentity = data.sourceEntity
		if (blockentity.nameTag.startsWith('specfilt-')) blockentity.dimension.spawnItem(new SERVER.ItemStack('vc:advanced_filter', 1), blockentity.location);
	}
});
function transferOneItem(fromContainer, slot, toContainer) {
	let item = fromContainer.getItem(slot);
	let newAmount = item.amount - 1
	item.amount = 1;
	fromContainer.setItem(slot, item)
	let overflow = fromContainer.transferItem(slot, toContainer);
	if (newAmount == 0) fromContainer.setItem(slot, new SERVER.ItemStack('minecraft:air', 2));
	else {
		item.amount = newAmount;
		fromContainer.setItem(slot, item)
	}
	if (overflow != undefined) fromContainer.addItem(overflow)
}
function addItemToContainer(container, newitem, entity) {
	for (let i = 0; i < container.size; i++) {
		let item = container.getItem(i);
		if (item) {
			if (item != undefined && container.getItem(i).typeId == newitem.typeId && container.getItem(i).amount != container.getItem(i).maxAmount) {
				item.amount = item.amount + 1;
				container.setItem(i, item);
				console.log("added the item")
				if (newitem.amount <= 1)
					entity.runCommand(`replaceitem entity @s slot.inventory 0 air`)
				else
					entity.runCommand(`replaceitem entity @s slot.inventory 0 ${newitem.typeId} ${newitem.amount - 1}`)
				return;
			} else {
				if (item == undefined || item.typeId == "minecraft:air") {
					container.setItem(i, new SERVER.ItemStack(newitem.typeId, 1));
					console.log("added the item")
					if (newitem.amount <= 1)
						entity.runCommand(`replaceitem entity @s slot.inventory 0 air`)
					else
						entity.runCommand(`replaceitem entity @s slot.inventory 0 ${newitem.typeId} ${newitem.amount - 2}`)
					return;
				}
			}
		} else {
			if (item == undefined || item.typeId == "minecraft:air") {
				container.setItem(i, new SERVER.ItemStack(newitem.typeId, 1));
				console.log("added the item")
				if (newitem.amount <= 1)
					entity.runCommand(`replaceitem entity @s slot.inventory 0 air`)
				else
					entity.runCommand(`replaceitem entity @s slot.inventory 0 ${newitem.typeId} ${newitem.amount - 2}`)
				return;
			}
		}
		//console.log(`compared ${item.typeId} with ${container.getItem(i).typeId}`)
	}
	console.log("addItemToContainer failed (inventory most likley full)")
}
function pullItemFromContainer(container, pullitem, entity) {
	for (let i = 0; i < container.size; i++) {
		let item = container.getItem(i);
		if (item != undefined) {
			let entityContainer = entity.getComponent("inventory").container;
			let canTake = (pullitem.includes('§r') ? advancedFilterAllowed(container.getItem(i), pullitem.split('\n')) : container.getItem(i).typeId == pullitem)
			if (pullitem == '') canTake = true;
			if (canTake) {
				if (container.isValid()) transferOneItem(container, i, entityContainer);
				//console.log(`transfered ${container.getItem(i).typeId} from slot ${i}`)
				return
			}
		}
	}
}
function pullItemFromContainerOld(container, pullitem, entity) {
	for (let i = 0; i < container.size; i++) {
		let item = container.getItem(i);
		if (item) {
			let entityContainer = entity.getComponent("inventory").container;
			let entityitem = entityContainer.getItem(0);
			let canTake = false
			if (pullitem.startsWith('specfilt-')) {
				if (pullitem.startsWith('specfilt-equal')) canTake = (container.getItem(i).typeId == pullitem.replace('specfilt-equal', ''))
				if (pullitem.startsWith('specfilt-startWith')) canTake = (container.getItem(i).typeId.startsWith(pullitem.replace('specfilt-startWith', '')))
				if (pullitem.startsWith('specfilt-endWith')) canTake = (container.getItem(i).typeId.endsWith(pullitem.replace('specfilt-endWith', '')))
				if (pullitem.startsWith('specfilt-amount>')) canTake = (container.getItem(i).amount > Number(pullitem.replace('specfilt-amount>', '')))
				if (pullitem.startsWith('specfilt-amount<')) canTake = (container.getItem(i).amount < Number(pullitem.replace('specfilt-amount<', '')))
				if (pullitem.startsWith('specfilt-amount=')) canTake = (container.getItem(i).amount = Number(pullitem.replace('specfilt-amount=', '')))
			} else canTake = container.getItem(i).typeId == pullitem;
			if (!entityitem) {
				if (canTake) {
					if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
					item.amount = item.amount - 1;
					container.setItem(i, item);
					entity.runCommand(`replaceitem entity @s slot.inventory 0 ${pullitem}`)
					console.log(`pulled ${pullitem}`)
					return;
				}
				continue;
			} else {
				if (canTake) {
					if (entityitem.amount >= entityitem.maxAmount || entityitem.typeId != pullitem) { }
					else {
						if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
						item.amount = item.amount - 1;
						container.setItem(i, item);
						entity.runCommand(`replaceitem entity @s slot.inventory 0 ${pullitem} ${entityitem.amount + 1}`)
						console.log(`pulled ${pullitem} ${entityitem.amount + 1}`)
						return;
					}
				}
				continue;
			}
		}
	}
}

function stealItemEntity(itemEntity, pullitem, entity) {
	let item = itemEntity.getComponent("item").itemStack;
	if (item) {
		let container = entity.getComponent("inventory").container;
		let canTake = (pullitem == '' ? true : advancedFilterAllowed(item, pullitem.split('\n')))
		if (canTake) {
			if (item.amount != 1) {
				item.amount = item.amount - 1;
				itemEntity.dimension.spawnItem(item, {
					x: entity.location.x,
					y: entity.location.y,
					z: entity.location.z,
				});
			}
			itemEntity.remove();
			item.amount = 1;
			container.addItem(item)
		}
	}
}
function advancedFilterAllowed(theItem, lore) {
	if (!lore[0]) lore[0] = 'nah'
	switch (lore[0]) {
		case '§r§7§lItems: §r':
			return (lore.indexOf(theItem.typeId) >= 0)
			break;
		case '§r§7§lName is equal to§r':
			return (theItem.nameTag == lore[1])
			break;
		case '§r§7§lName starts with§r':
			return (theItem.nameTag.startsWith(lore[1]))
			break;
		case '§r§7§lName ends with§r':
			return (theItem.nameTag.endsWith(lore[1]))
			break;
		case '§r§7§lGreater than§r':
			return (theItem.amount > Number(lore[1]))
			break;
		case '§r§7§lLess Than§r':
			return (theItem.amount < Number(lore[1]))
			break;
		case '§r§7§lIs Equal to§r':
			return (theItem.amount == Number(lore[1]))
			break;
		default:
			return false
	}
}
function advancedFilterConfig(player, blockentity, getDefs) {
	const pullitem = blockentity.nameTag
	let defSelect = 0;
	let defText = '';
	if (getDefs) {
		if (pullitem.startsWith('specfilt-equal')) { defSelect = 0; defText = pullitem.replace('specfilt-equal', '') }
		if (pullitem.startsWith('specfilt-startWith')) { defSelect = 1; defText = pullitem.replace('specfilt-startWith', '') }
		if (pullitem.startsWith('specfilt-endWith')) { defSelect = 2; defText = pullitem.replace('specfilt-endWith', '') }
		if (pullitem.startsWith('specfilt-amount>')) { defSelect = 3; defText = pullitem.replace('specfilt-amount>', '') }
		if (pullitem.startsWith('specfilt-amount<')) { defSelect = 4; defText = pullitem.replace('specfilt-amount<', '') }
		if (pullitem.startsWith('specfilt-amount=')) { defSelect = 5; defText = pullitem.replace('specfilt-amount=', '') }
		if (pullitem.startsWith('specfilt-anyOf')) { defSelect = 6; defText = pullitem.replace('specfilt-anyOf', '') }
	}
	let item = player.getComponent("equippable").getEquipment("Mainhand");
	let popUp = new UI.ModalFormData();
	popUp.title("Set Filter");
	const filtlist = ['name is equal to', 'name starts with', 'name ends with', 'amount is greater than', 'amount is less than', 'amount is equal to', 'in list (seperate by \',\')']
	popUp.dropdown('If filter', filtlist, defSelect)
	popUp.textField("Value ", "Value", defText);
	if (item != undefined) popUp.toggle(`Set the filter to §l${item.typeId}`, false)

	popUp.show(player).then((r) => {
		if (r.canceled) return;
		if (r.formValues[0] == 0) blockentity.nameTag = `specfilt-equal${r.formValues[1]}`
		if (r.formValues[0] == 1) blockentity.nameTag = `specfilt-startWith${r.formValues[1]}`
		if (r.formValues[0] == 2) blockentity.nameTag = `specfilt-endWith${r.formValues[1]}`
		if (r.formValues[0] == 3) blockentity.nameTag = `specfilt-amount>${r.formValues[1]}`
		if (r.formValues[0] == 4) blockentity.nameTag = `specfilt-amount<${r.formValues[1]}`
		if (r.formValues[0] == 5) blockentity.nameTag = `specfilt-amount=${r.formValues[1]}`
		if (r.formValues[0] == 6) blockentity.nameTag = `specfilt-anyOf${r.formValues[1]}`
		if (r.formValues[2] == true) blockentity.nameTag = item.typeId

		if (r.formValues[2] == false) player.runCommand(`title @s actionbar §7Set item filter to §f${filtlist[r.formValues[0]]} §l${r.formValues[1]}`);
		else player.runCommand(`title @s actionbar §7Set item filter to §f§l${item.typeId}`);
		if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
		item.amount += -1
		if (r.formValues[2] == false) player.getComponent("equippable").setEquipment("Mainhand", item);
	}).catch((e) => {
		console.error(e, e.stack);
	})
}
// See more at https://wiki.bedrock.dev/scripting/script-server.html
