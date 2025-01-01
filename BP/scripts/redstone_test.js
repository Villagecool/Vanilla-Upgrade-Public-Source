import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { playNote } from "./note_block.js";
import { getRedstonePowered, gyserShoot, gyserRetract } from "./block_components.js";

SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
	initEvent.blockComponentRegistry.registerCustomComponent('vc:redstone', {
		onTick: e => {
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
				setPermutation(e.block, 'vc:toggle_bit', wasSucessful)
			} catch (e) { }
		}
	});
});
function setPermutation(block, stateAdd, stateValue) { //stole this function from Ramcor14_Player thanks to him
	try {
		const result = block.permutation.getAllStates();
		result[stateAdd] = stateValue;
		block.setPermutation(SERVER.BlockPermutation.resolve(block.typeId, result));

	}
	catch (error) { }
}
// See more at https://wiki.bedrock.dev/scripting/script-server.html
