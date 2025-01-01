import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, vec3toString } from "./utils.js";

// Subscribe to events to run code when specific in game actions occur

//enables or disables console messages to debug
const DEBUG = false

let daList = []
const cantMove = [
    'minecraft:barrier',
    'minecraft:beacon',
    'minecraft:bedrock',
    'minecraft:calibrated_sculk_sensor',
    'minecraft:command_block',
    'minecraft:crying_obsidian',
    'minecraft:enchanting_table',
    'minecraft:end_portal',
    'minecraft:end_portal_frame',
    'minecraft:ender_chest',
    'minecraft:grindstone',
    'minecraft:jigsaw',
    'minecraft:jukebox',
    'minecraft:light_block',
    'minecraft:lodestone',
    'minecraft:mob_spawner',
    'minecraft:moving_piston',
    'minecraft:portal',
    'minecraft:obsidian',
    'minecraft:piston_arm_collision',
    'minecraft:sticky_piston_arm_collision',
    'minecraft:reinforced_deepslate',
    'minecraft:respawn_anchor',
    'minecraft:sculk_catalyst',
    'minecraft:sculk_sensor',
    'minecraft:sculk_shrieker',
    'minecraft:structure_block',
    'minecraft:structure_void',
    'minecraft:trial_spawner',
    'minecraft:vault',
    'minecraft:allow',
    'minecraft:deny',
    'minecraft:border',
    'minecraft:water',
    'minecraft:flowing_water',
    'minecraft:lava',
    'minecraft:flowing_lava'
]
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('vc:rotator', { //fancy block display stuff
        onPlayerInteract: e => { //change directions
            if (e.face == 'Up' || e.face == 'Down') return;
            setPermutation(e.block, "vc:direction", (e.block.permutation.getState("vc:direction") == 'clockwise' ? 'counterclockwise' : 'clockwise'))
            e.player.runCommand(`playsound random.wrench @a[r=15] ~~~`)
        },
        onTick: e => { //plays the rotation animation
            const frame = e.block.permutation.getState("vc:anm")
            switch (frame) {
                case 0:
                    if (e.block.permutation.getState("vc:powered") == false) return;
                    setPermutation(e.block, 'vc:anm', frame + 1)
                    e.block.dimension.runCommand(`playsound tile.rotator.spin @a ${e.block.location.x} ${e.block.location.y} ${e.block.location.z} 1 ${(e.block.permutation.getState("vc:direction") == 'clockwise' ? 1.1 : 0.9)}`)
                    startTheCollection(e.block) //this is where all the fun begins
                    break;
                case 1:
                case 2:
                case 3:
                    setPermutation(e.block, 'vc:anm', frame + 1)
                    break;
                default:
                    if (e.block.permutation.getState("vc:powered") == false)
                        setPermutation(e.block, 'vc:anm', 0);
                    break;
            }
        }
    });
})
let runs = 0
function startTheCollection(orblock) {
    runs = 0
    daList = []
    addBlockToRotate(orblock.above(1), orblock.above(1).typeId, "below")

    if (DEBUG) console.error('Running...')
    for (const block of daList) {
        rotatebutithastobeafunction(block, orblock) //had to make it a function otherwise the varaibles would overlap
    }
}
function addBlockToRotate(block, source, last) {
    if (runs > 100 || daList.length >= 24) {if (DEBUG) console.warn('Too many blocks or stack overflow!'); return};
    runs ++; //limits the number of times blocks can be checked to prevent crashes
    if (!daList.hasobj(block)) if (!block.isAir && !cantMove.includes(block.typeId)) daList.push(block) //only adds to the list if the block is not already collencted and is moveable
    else return;
    if ((block.typeId == 'minecraft:slime' || block.typeId == 'minecraft:honey_block') && block.typeId == source) { //adjacent block collection
        if (last != "above" && !daList.hasobj(block.above(1))) addBlockToRotate(block.above(1), source, "below")
        if (last != "below" && !daList.hasobj(block.below(1))) addBlockToRotate(block.below(1), source, "above")
        if (last != "north" && !daList.hasobj(block.north(1))) addBlockToRotate(block.north(1), source, "south")
        if (last != "east" && !daList.hasobj(block.east(1))) addBlockToRotate(block.east(1), source, "west")
        if (last != "south" && !daList.hasobj(block.south(1))) addBlockToRotate(block.south(1), source, "north")
        if (last != "west" && !daList.hasobj(block.west(1))) addBlockToRotate(block.west(1), source, "east")
    }
}
function rotatebutithastobeafunction(block, orblock) {
    const oldCoords = block.location
    const origin = orblock.location;
    var newCoords
    const angle = (orblock.permutation.getState("vc:direction") == "counterclockwise" ? 270 : 90) //angle in degrees for rotation (used for placing the block down)
    //rotated coords

    if (orblock.permutation.getState("vc:direction") == "counterclockwise") newCoords = { x: origin.x + (oldCoords.z - origin.z), y: oldCoords.y, z: origin.z - (oldCoords.x - origin.x) }
    else newCoords = { x: origin.x - (oldCoords.z - origin.z), y: oldCoords.y, z: origin.z + (oldCoords.x - origin.x) }
    var newBlock = block.dimension.getBlock(newCoords);

    const id = generateUniqueId(); //a unique structure id for every block

    if (oldCoords.x == newCoords.x && oldCoords.z == newCoords.z) { //if the block is at the origin
        block.dimension.runCommand(`structure save §k${id} ${vec3toString(oldCoords)} ${vec3toString(oldCoords)} false`)
        block.dimension.runCommand(`structure load §k${id} ${vec3toString(newCoords)} ${angle}_degrees`)
        block.dimension.runCommand(`structure delete §k${id}`)
    } else {
        if (DEBUG) console.log(`${id}: ${vec3toString(newCoords)}`)
        block.dimension.runCommand(`structure save §k${id} ${vec3toString(oldCoords)} ${vec3toString(oldCoords)} false`)
        block.dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} air`)
        block.setType('minecraft:air') //temporarily removes the blocks, this helps with a weird quirk where the blocks dont rotate if a bunch of blocks on the same row are trying to move (I cant put it into words)

        SERVER.system.runTimeout(() => {
            if (DEBUG) console.log(`${id}: ${vec3toString(newCoords)}`)
            if (newBlock.isAir) {
                block.dimension.runCommand(`structure load §k${id} ${vec3toString(newCoords)} ${angle}_degrees`)
            } else { //if there is already a block there it just breaks the block
                //block.dimension.runCommand(`structure load §k${id} ${vec3toString(oldCoords)} 270_degrees`)
                block.dimension.runCommand(`structure save §k${id}cuh ${vec3toString(newCoords)} ${vec3toString(newCoords)} false`)
                block.dimension.runCommand(`structure load §k${id} ${vec3toString(newCoords)} ${angle}_degrees`)
                block.dimension.runCommand(`setblock ${vec3toString(newCoords)} air destroy`)
                block.dimension.runCommand(`structure load §k${id}cuh ${vec3toString(newCoords)}`)
            }
            block.dimension.runCommand(`structure delete §k${id}`)
        },1)
    }
}
/**
 * Detects if an Array includes a specified object
 *
 * @param {Object} obj The object to detect for
 * @returns True or False
 * @type Bool
 */
Array.prototype.hasobj = function (obj) {
    const stringObj = JSON.stringify(obj)
    for (const item of this) {
        if (JSON.stringify(item) == stringObj) return true
    }
    return false
};
function generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }