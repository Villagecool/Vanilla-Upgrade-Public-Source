import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { playNote } from "./note_block.js";
import { getRedstonePowered, gyserShoot, gyserRetract } from "./block_components.js";
import { vec3toString } from './utils.js';

let stressTest = false
let fillstress = []
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
	initEvent.blockComponentRegistry.registerCustomComponent('vc:redstone', {
		onTick: e => {
			if (stressTest == true) fillstress.push(`${e.block.typeId} checked ${e.block.getRedstonePower() > 0 ? '§11§r' : '§b6§r'} at ${vec3toString(e.block.location)}`)

			const wasSucessful = e.block.getRedstonePower() > 0 ? true : checkRedstone(e.block);
			//const wasSucessful = false;

			if (e.block.typeId == 'vc:custom_note_block') { // i split it up cus i think it optimizes the script a bit
				if (wasSucessful && e.block.permutation.getState("vc:powered") == false) {
					playNote(e.block, false);
					//if (e.block.dimension.getEntitiesAtBlockLocation(e.block.center())[0]?.typeId == 'vc:charge_block') e.block.dimension.getEntitiesAtBlockLocation(e.block.center())[0].remove();
					//else e.block.dimension.spawnEntity('vc:charge_block', e.block.bottomCenter())
				}
			} else if (e.block.typeId == 'vc:gyser_sand') {
				if (wasSucessful && e.block.permutation.getState("vc:active_bit") == false) {
					gyserShoot(e);
					setPermutation(e.block, 'vc:active_bit', true)
				}
				else if (wasSucessful == false && e.block.permutation.getState("vc:active_bit") == true) {
					gyserRetract(e)
					setPermutation(e.block, 'vc:active_bit', false)
				}
			}
			else if (e.block.typeId == 'vc:gyser_sand') {
				if (!wasSucessful && e.block.permutation.getState("vc:active_bit") == true) gyserRetract(e)
			}

			try {
				setPermutation(e.block, 'vc:powered', wasSucessful)
			} catch (e) { }

			/*
			const block = e.block;
			const wasSucessful = getRedstonePowered(e.block)
			if (block.typeId == 'vc:custom_note_block' && wasSucessful && block.permutation.getState("vc:powered") == false) playNote(block, false)
			if (block.typeId == 'vc:gyser_sand' && wasSucessful && block.permutation.getState("vc:active_bit") == false) {
				gyserShoot(e);
				setPermutation(e.block, 'vc:active_bit', true)
			}
			if (block.typeId == 'vc:gyser_sand' && !wasSucessful && block.permutation.getState("vc:active_bit") == true) gyserRetract(e)
			//switch (block.typeId) {
			//	default:
			//		setPermutation(block, 'vc:powered', wasSucessful)
			//		break;
			//	case 'vc:azalea_door':
			//	case 'vc:elax_door':
			//		if (wasSucessful != block.permutation.getState("vc:open")) {
			//			setPermutation(block, 'vc:open', wasSucessful)
			//			setPermutation((block.permutation.getState("vc:upper_bit") ? e.block.below(1) : e.block.above(1)), 'vc:open', wasSucessful)
			//			block.dimension.runCommand(`execute positioned ${e.block.location.x} ${e.block.location.y} ${e.block.location.z} run playsound ${(!wasSucessful == true ? 'open' : 'close')}.wooden_door @a[r=5] ~~~ 0.4`)
			//		}
			//		break;
			//	case 'vc:cut_gloricalium_block':
			//	case 'vc:gloricalium_block':
			//		if (wasSucessful) {
			//			block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} vc:${block.typeId.startsWith('vc:cut_') ? 'cut_' : ''}discharged_gloricalium_block`);
			//		}
			//		break;
			//	//case 'vc:rotator':
			//	//	if (wasSucessful) {
			//	//		if (block.permutation.getState("vc:direction") == "clockwise") block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} vc:rotator_powered[\"vc:direction\"=\"clockwise\"]`);
			//	//		if (block.permutation.getState("vc:direction") == "counterclockwise") block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} vc:rotator_powered[\"vc:direction\"=\"counterclockwise\"]`);
			//	//	}
			//	//	break;
			//	//case 'vc:rotator_powered':
			//	//	if (!wasSucessful) {
			//	//		if (block.permutation.getState("vc:direction") == "clockwise") block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} vc:rotator[\"vc:direction\"=\"clockwise\"]`);
			//	//		if (block.permutation.getState("vc:direction") == "counterclockwise") block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} vc:rotator[\"vc:direction\"=\"counterclockwise\"]`);
			//	//	}
			//	//	break;
			//	case 'vc:custom_note_block':
			//		if (wasSucessful && block.permutation.getState("vc:powered") == false) {
			//
			//			playNote(block, false)
			//		}
			//		break;
			//}
			try {
				setPermutation(e.block, 'vc:powered', wasSucessful)
				setPermutation(e.block, 'vc:powered', wasSucessful)
			} catch (e) { }
		*/}
	});
});
SERVER.system.afterEvents.scriptEventReceive.subscribe(e => {
	if (e.id == 'vc:stress') {
		fillstress = ['§l§cREDSTONE STRESS TEST§r']
		stressTest = true
		SERVER.system.runTimeout(_ => {
			stressTest = false
			SERVER.world.sendMessage(fillstress.join('\n'))
			var total = 0
			for (const aaa of fillstress) {
				if (aaa.includes('§b6§r')) total += 6;
				else if (aaa == '§l§cREDSTONE STRESS TEST§r') total += 0;
				else total += 1;
			}
			SERVER.world.sendMessage(`§eoverall §l${fillstress.length - 1}§r§e test were ran within one tick\nchecking a total of §l${total}§r§e blocks`)

		}, 1)
	}
})

/**
 * 
 * @param {SERVER.Block} block 
 * @returns {Boolean}
 */
function checkRedstone(block) {
	if (block.getRedstonePower() > 0) return true; //thanks chatgpt for optimising this ig? (it did not help in the slightest)
	const directions = [block.north(1), block.north(-1), block.east(1), block.east(-1), block.above(1), block.above(-1)];
	return directions.some(adjBlock => adjBlock?.getRedstonePower() > 0);
}

function setPermutation(block, stateAdd, stateValue) { //stole this function from Ramcor14_Player thanks to him
	try {
		const result = block.permutation.getAllStates();
		result[stateAdd] = stateValue;
		block.setPermutation(SERVER.BlockPermutation.resolve(block.typeId, result));

	}
	catch (error) { }
}
// See more at https://wiki.bedrock.dev/scripting/script-server.html
