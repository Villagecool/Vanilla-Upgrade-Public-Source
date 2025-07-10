import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

SERVER.system.afterEvents.scriptEventReceive.subscribe((e) => {
    const block = (e.sourceEntity != undefined ? e.sourceEntity.dimension.getBlock(e.sourceEntity.location) : e.sourceBlock)
    if (!block) return;

    if (e.id === "vc:fenceConnect") {
        let loc = block.location;

        try {
            const north = fenceApproved(block.north(1))
            const south = fenceApproved(block.south(1))
            const east = fenceApproved(block.east(1))
            const west = fenceApproved(block.west(1))
            setPermutation(block, "vc:north", north)
            setPermutation(block, "vc:south", south)
            setPermutation(block, "vc:east", east)
            setPermutation(block, "vc:west", west)
            setPermutation(block.above(1), "vc:east", east)
            setPermutation(block.above(1), "vc:west", west)
        } catch (error) { }
    };
    if (e.id === "vc:doorConnect") {
        let connect = false;
        let loc = block.location;

        if (block.permutation.getState("vc:face") == 2) connect = block.west(1).hasTag("door");
        if (block.permutation.getState("vc:face") == 3) connect = block.east(1).hasTag("door");
        if (block.permutation.getState("vc:face") == 4) connect = block.south(1).hasTag("door");
        if (block.permutation.getState("vc:face") == 5) connect = block.north(1).hasTag("door");
        //console.log(`${block.west(1).hasTag("door")}, ${block.east(1).hasTag("door")}, ${block.north(1).hasTag("door")}, ${block.south(1).hasTag("door")}`)
        setPermutation(block, "vc:flipped", connect)
    };
    if (e.id === "vc:doorUpper") {
        let blockabove = block.above(1);
        let loc = block.location;
        if (blockabove.isAir) {
            blockabove.setType(block.typeId);
            setPermutation(blockabove, "vc:upper_bit", true);
        }
        if (!blockabove.hasTag("door")) return;
        let face = block.permutation.getState("vc:face");
        let open = block.permutation.getState("vc:open");
        let inv = block.permutation.getState("vc:flipped");
        try {
            setPermutation(blockabove, "vc:face", face);
            setPermutation(blockabove, "vc:open", open);
            setPermutation(blockabove, "vc:flipped", inv);
        } catch (error) { }
        if (blockabove.permutation.getState("vc:upper_open") == true) {
            setPermutation(block, "vc:open", !open);
            setPermutation(blockabove, "vc:upper_open", false);
            if (e.message === "random_door") block.dimension.runCommand(`execute positioned ${loc.x} ${loc.y} ${loc.z} run playsound random.door_${(open == true ? 'open' : 'close')} @a[r=5] ~~~ 0.4`)
            else block.dimension.runCommand(`execute positioned ${loc.x} ${loc.y} ${loc.z} run playsound ${(open == true ? 'open' : 'close')}.${e.message} @a[r=5] ~~~ 0.4`)
        }

    };
    if (e.id === "vc:breakBlock") {
        let blockToBreak = block
        if (block.permutation.getState("minecraft:facing_direction") == "north") blockToBreak = block.north(-1)
        if (block.permutation.getState("minecraft:facing_direction") == "east") blockToBreak = block.east(-1)
        if (block.permutation.getState("minecraft:facing_direction") == "south") blockToBreak = block.south(-1)
        if (block.permutation.getState("minecraft:facing_direction") == "west") blockToBreak = block.west(-1)
        if (block.permutation.getState("minecraft:facing_direction") == "up") blockToBreak = block.above(-1)
        if (block.permutation.getState("minecraft:facing_direction") == "down") blockToBreak = block.below(-1)
        if (blockToBreak.typeId == undefined || blockToBreak.typeId == 'minecraft:bedrock' || blockToBreak.typeId == 'minecraft:obsidian') return;
        blockToBreak.dimension.runCommand(`setblock ${blockToBreak.location.x} ${blockToBreak.location.y} ${blockToBreak.location.z} air destroy`)
        //console.log(`broke block at ${blockToBreak.location.x}, ${blockToBreak.location.y}, ${blockToBreak.location.z}`)
    }
    if (e.id === "vc:spawn_entity") {
        let spawnee = block.dimension.spawnEntity(block.permutation.getState("vc:entity"), block.location);
        if (block.permutation.getState("vc:entity") == "vc:termite_mound") block.setType('vc:termite_mound')
        else block.setType('minecraft:air')
    }
    if (e.id === "vc:asorb_lava") {
        let sucess = 0;
        for (let i = -3; i < 3; i++) {

            for (let j = -3; j < 3; j++) {

                for (let k = -3; k < 3; k++) {
                    let lava = block.dimension.getBlock({ x: block.location.x + i, y: block.location.y + j, z: block.location.z + k })
                    if (lava != undefined && (lava.typeId == 'minecraft:lava' || lava.typeId == 'minecraft:flowing_lava')) {
                        sucess += 1;
                        lava.setType('air')
                    }
                }
            }
        }
        console.log(sucess)
        if (sucess > 0) block.setType('vc:saturated_pumice')
        //console.log(`broke block at ${blockToBreak.location.x}, ${blockToBreak.location.y}, ${blockToBreak.location.z}`)
    }
    try {
        if (e.id === "vc:breezer") {
            let rstrength = getrstrength(block);
            let strength = rstrength / 30;
            for (let i = 1; i < 5 + (Math.round(rstrength / 3)); i++) {
                const molang = new SERVER.MolangVariableMap();
                molang.setFloat('variable.visible', (Math.floor(Math.random(0, 15 - strength * 10)) == 0 ? 1 : 0))
                molang.setFloat('variable.strength', rstrength - 6)
                molang.setFloat('variable.life', strength / 1.5)
                let offset = { x: 0.5, y: 0.5, z: 0.5 }
                if (block.permutation.getState("minecraft:facing_direction") == "north") { if (!block.north(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.north(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback 0 0.1 ${strength} 0`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, 1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "east") { if (!block.east(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.east(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback -0.1 0 ${strength} 0`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", -1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "south") { if (!block.south(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.south(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback 0 -0.1 ${strength} 0`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, -1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "west") { if (!block.west(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.west(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback 0.1 0 ${strength} 0`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "up") { if (!block.above(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.above(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback 0 0 0 ${strength}`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, -1, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "down") { if (!block.below(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.below(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:knockback 0 0 0 ${strength}`) }); block.dimension.spawnParticle("vc:breezer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 1, 0)); }
            }
        }
        if (e.id === "vc:blazer") {
            let rstrength = getrstrength(block);
            let strength = rstrength / 30;
            for (let i = 1; i < 5 + (Math.round(rstrength / 3)); i++) {
                const molang = new SERVER.MolangVariableMap();
                molang.setFloat('variable.visible', (Math.floor(Math.random(0, 15 - strength * 10)) == 0 ? 1 : 0))
                molang.setFloat('variable.strength', rstrength - 6)
                molang.setFloat('variable.life', strength / 1.5)
                let offset = { x: 0.5, y: 0.5, z: 0.5 }
                if (block.permutation.getState("minecraft:facing_direction") == "north") { if (!block.north(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.north(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, 1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "east") { if (!block.east(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.east(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", -1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "south") { if (!block.south(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.south(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, -1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "west") { if (!block.west(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.west(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "up") { if (!block.above(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.above(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, -1, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "down") { if (!block.below(-i).isAir) break; block.dimension.getEntities({ location: offsetLocation(block.below(-i).location, offset), maxDistance: 0.8 }).forEach(bro => { bro.runCommand(`scriptevent vc:setOnFire`) }); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 1, 0)); }
            }
        }
    } catch (error) { } //i dont give a shit, block is basically out of bounds
    if (e.id === "vc:trigger_button") {
        let state = e.message;
        let curState = block.permutation.getState(state);
        console.log(`alright we triggerd the ${block.typeId} press from ${curState} to ${!curState}`)
        if (curState == false || curState == true) setPermutation(block, state, !curState);
        //console.log(`broke block at ${blockToBreak.location.x}, ${blockToBreak.location.y}, ${blockToBreak.location.z}`)
    }
});
SERVER.world.beforeEvents.playerBreakBlock.subscribe((e) => {
    let player = e.player;
    let block = e.player.dimension.getBlock(e.block);
    SERVER.system.run(() => {
        if (block.below(1).permutation.getState("vc:upper_bit") == false && block.below(1).typeId != "vc:chorus_carnavorus_plant") {
            let blockToBreak = block.below(1);
            blockToBreak.dimension.runCommand(`setblock ${blockToBreak.location.x} ${blockToBreak.location.y} ${blockToBreak.location.z} air destroy`)
        }

        if (block.typeId == "vc:glorium_vines") {
            updateGlorium(block.above(1))
            updateGlorium(block.below(1))
        }
    })
});
SERVER.world.beforeEvents.playerPlaceBlock.subscribe((e) => {
    e.cancel = blockAboveCheck(e);
    SERVER.system.run(() => {
        const block = e.player.dimension.getBlock(e.block)
        if (block.typeId == "vc:glorium_vines") {
            updateGlorium(block)
            updateGlorium(block.above(1))
            updateGlorium(block.below(1))
        }
    })
});
function updateGlorium(block) {
    if (block.typeId != "vc:glorium_vines") return;
    if (block.permutation.getState("vc:face") == 0) {
        setPermutation(block, 'vc:blockshape', (block.below(1).typeId != "vc:glorium_vines" ? 1 : 0))
    } else if (block.permutation.getState("vc:face") == 1) {
        setPermutation(block, 'vc:blockshape', (block.above(1).typeId != "vc:glorium_vines" ? 1 : 0))
    }
}
function blockAboveCheck(e) {
    if (!e.player.getComponent("equippable").getEquipment("Mainhand").typeId.endsWith('_door_item')) return false;
    return !e.player.dimension.getBlock(e.block).above(1).isAir;
}
function setPermutation(block, stateAdd, stateValue) { //stole this from someone :evil:
    const result = block.permutation.getAllStates();
    result[stateAdd] = stateValue;
    block.setPermutation(SERVER.BlockPermutation.resolve(block.typeId, result));
}
function offsetLocation(location, offset) {
    return { x: location.x + offset.x, y: location.y + offset.y, z: location.z + offset.z }
}
function getrstrength(block) {
    let rstrengh = [];
    rstrengh.push((block.north(1).getRedstonePower() == undefined ? 0 : block.north(1).getRedstonePower()));
    rstrengh.push((block.east(1).getRedstonePower() == undefined ? 0 : block.east(1).getRedstonePower()));
    rstrengh.push((block.south(1).getRedstonePower() == undefined ? 0 : block.south(1).getRedstonePower()));
    rstrengh.push((block.west(1).getRedstonePower() == undefined ? 0 : block.west(1).getRedstonePower()));
    rstrengh.push((block.above(1).getRedstonePower() == undefined ? 0 : block.above(1).getRedstonePower()));
    rstrengh.push((block.below(1).getRedstonePower() == undefined ? 0 : block.below(1).getRedstonePower()));
    return Math.max(...rstrengh)
}
function setVectorFloats(molang, varable, x, y, z) {
    molang.setFloat(varable + 'x', x)
    molang.setFloat(varable + 'y', y)
    molang.setFloat(varable + 'z', z)
    return molang;
}
function fenceApproved(block) {
    return block.isSolid ||
        block.typeId.includes('fence') ||
        block.typeId.includes('bars') ||
        (
            !block.typeId.startsWith('minecraft:') &&
            !block.hasTag('non_solid') &&
            !block.hasTag('plant')
        )
}