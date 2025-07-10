import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, getRandomInt } from "./utils.js";

SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('vc:chorus_check_players', {
        onTick: e => {
            let block = e.block;
            if (block.permutation.getState("vc:upper_bit") == true) return;

            const playersNearby = (block.dimension.getEntities({ maxDistance: 5, location: block.location })?.length > 0);
            const alreadyActive = (block.above(1)?.permutation.getState("vc:upper_bit") == true)
            if (playersNearby)
                grow(block);
            else
                shrink(block);

        },
        beforeOnPlayerPlace: e => {
            SERVER.system.runTimeout(() => {
                if (e.block.below(1) == 'vc:chorus_carnavorus_plant')
                    setPermutation(e.block, 'vc:upper_bit', true)
            }, 1)
        },
        onPlayerDestroy: e => {
            shrink(e.block)
        }
    })
});
function grow(block) {
    const possibleHeight = getRandomInt(2, 5);
    const loc = block.location;
    for (let i = 1; i < possibleHeight+1; i++) {
        if (!block.above(i).isAir) break;
        else {
            SERVER.system.runTimeout(()=>{
                if (!block.dimension.getEntities({ maxDistance: 5, location: block.location })?.length > 0) return;
                block.dimension.runCommand(`setblock ${loc.x} ${loc.y + i} ${loc.z} vc:chorus_carnavorus_plant["vc:upper_bit"=true]`)
                block.dimension.runCommand(`particle vc:chorus_plant_burst ${loc.x} ${loc.y + i} ${loc.z}`)
                if (i==1) block.dimension.runCommand(`playsound chorus.extend @a ${loc.x} ${loc.y} ${loc.z}`)
            },3*i)
            if (possibleHeight >= 3 && i == possibleHeight) {
                SERVER.system.runTimeout(() => { //inspired by a book i read, cool huh
                    block.dimension.runCommand(`particle vc:chorus_plant_pollen ${loc.x} ${loc.y + i} ${loc.z}`)
                    block.dimension.runCommand(`playsound chorus.puff @a ${loc.x} ${loc.y + i} ${loc.z}`)
                    var effect = `execute positioned ${loc.x} ${loc.y} ${loc.z} run effect @e[r=5] waa 10 5`
                    SERVER.system.runTimeout(()=>{block.dimension.runCommand(effect.replace('waa',`weakness`))},10)
                    SERVER.system.runTimeout(()=>{block.dimension.runCommand(effect.replace('waa',`slowness`).replace('ss 10 5','ss 10 1'))},20) //i gotta have that weird replace so I dont mess with the coords
                    SERVER.system.runTimeout(()=>{block.dimension.runCommand(effect.replace('waa',`nausea`))},30)
                },(3*i)+10) 
            }
        }
    }
}
function brokengrow(block) {
    let possibleHeight = 1;
    for (let i = 1; i < 10; i++) {
        let sucess = true;
        for (let j = 0; j < i; j++) {
            if (!block.above(j).isAir) { sucess = false; break; }
        }
        if (sucess) {
            possibleHeight = i;
        }
    }
    const loc = block.location;
    block.dimension.runCommand(`fill ${loc.x} ${loc.y} ${loc.z} ${loc.x} ${loc.y + getRandomInt(1, possibleHeight)} ${loc.z} vc:chorus_carnavorus_plant`)
}
function shrink(block) {
    for (let i = 1; i < 10; i++) {
        let blockToBreak = block.above(i);
        const loc = blockToBreak.location;

        if (blockToBreak.permutation.getState("vc:upper_bit") == true && blockToBreak.typeId == 'vc:chorus_carnavorus_plant') {
                block.dimension.runCommand(`setblock ${loc.x} ${loc.y} ${loc.z} air`)
                block.dimension.runCommand(`particle vc:chorus_plant_burst ${loc.x} ${loc.y+i} ${loc.z}`)
            if (i==1) block.dimension.runCommand(`playsound chorus.shrink @a ${loc.x} ${loc.y} ${loc.z}`)
        }
        else
            break;
    }
}