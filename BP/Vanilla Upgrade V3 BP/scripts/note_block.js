import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, hexToRgb } from "./utils.js";


SERVER.system.beforeEvents.startup.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('vc:noteblock', {
        onPlayerInteract: e => {
            playNote(e.block, true)
        }
    })
})
/**
 * 
 * @param {SERVER.Block} block The Block
 * @param {Bool} add if it should incrament the pitch
 * @returns 
 */
export function playNote(block, add) {
    const colors = ["#77D700", "#95C000", "#B2A500", "#CC8600", "#E26500", "#F34100", "#FC1E00", "#FE000F", "#F70033", "#E8005A", "#CF0083", "#AE00A9", "#8600CC", "#8600CC", "#5B00E7", "#2D00F9", "#020AFE", "#0037F6", "#0068E0", "#009ABC", "#00C68D", "#00E958", "#00FC21", "#1FFC00", "#59E800", "#94C100"]
    // the colors are in hex because i ripped them from the minecraft wiki, and im going to use hexToRgb() instead of manually converting them n stuff
    let loc = block.location;
    if (!block.below(1).typeId.includes('gloricalium')) {
        block.setType('minecraft:noteblock')
        return;
    }
    let note = block.permutation.getState("vc:note") + block.permutation.getState("vc:note2");
    if (add) {
        if (note >= 12)
            setPermutation(block, "vc:note2", Number((note % 12) + 1))
        else
            setPermutation(block, "vc:note", Number((note % 12) + 1))
        if (note >= 24) {
            setPermutation(block, "vc:note", 0)
            setPermutation(block, "vc:note2", 0)
        }
        note = block.permutation.getState("vc:note") + block.permutation.getState("vc:note2");
    }
    //SERVER.world.sendMessage(`${2 ** (((note) - 12) / 12)}`)
    block.dimension.runCommand(`playsound note.electric_gutiar @a ${loc.x} ${loc.y} ${loc.z} 1 ${2 ** (((note) - 12) / 12)}`)
    const molang = new SERVER.MolangVariableMap();

    molang.setColorRGB('variable.note_color', {
        red: hexToRgb(colors[note]).r,
        green: hexToRgb(colors[note]).g,
        blue: hexToRgb(colors[note]).b
    });
    block.dimension.spawnParticle('minecraft:note_particle', { x: loc.x + 0.5, y: loc.y + 1.2, z: loc.z + 0.5 }, molang);

}


SERVER.world.beforeEvents.playerBreakBlock.subscribe((data) => {
    let block = data.player.dimension.getBlock(data.block);
    SERVER.system.run(() => {
        if (block.typeId.includes('gloricalium')) {
            if (block.above(1).typeId == 'vc:custom_note_block') {
                block.above(1).setType('minecraft:noteblock')
            }
        }
    })
});
SERVER.world.afterEvents.playerPlaceBlock.subscribe((data) => {
    SERVER.system.run(() => {
        const block = data.player.dimension.getBlock(data.block)
        if (block.typeId.includes('gloricalium')) {
            if (block.above(1).typeId == 'minecraft:noteblock') {
                block.above(1).setType('vc:custom_note_block')
            }
        }
        if (block.typeId == 'minecraft:noteblock') {
            if (block.below(1).typeId.includes('gloricalium')) {
                block.setType('vc:custom_note_block')
            }
        }
    })
});