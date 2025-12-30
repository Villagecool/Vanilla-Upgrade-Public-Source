import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, getRandomInt, lerp, hexToRgb, distanceVector, vec3toString } from './utils.js'

// Subscribe to events to run code when specific in game actions occur
SERVER.system.beforeEvents.startup.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent('vc:cursed_campfire', {
        onUseOn: e => {
            /*const block = e.blockFace == 'North' ? e.block.north(1) : e.blockFace == 'East' ? e.block.east(1) : e.blockFace == 'South' ? e.block.south(1) : e.blockFace == 'West' ? e.block.west(1) : e.blockFace == 'Up' ? e.block.above(1) : e.block.below(1)
            
            e.source.startItemCooldown('cursedcampfire', 5)
            if (!e.source.getDynamicProperty('is_linking_campfires')) {
                e.source.setDynamicProperty('is_linking_campfires', JSON.stringify(block.location))
                e.source.runCommand(`title @s actionbar Place down another campfire to link them!`)
                return;
            } else {
                let links
                const dynamicProp = SERVER.world.getDynamicProperty('vc:linked_campfires')
                if (!dynamicProp || dynamicProp == undefined) links = [[], []];
                else links = JSON.parse(dynamicProp)

                const otherCampfire = JSON.parse(e.source.getDynamicProperty('is_linking_campfires'))
                if (JSON.stringify(block.location) == JSON.stringify(otherCampfire)) return;
                if (e.source.dimension.getBlock(otherCampfire).typeId != 'vc:cursed_campfire') return;
                if (distanceVector(otherCampfire, block.location) > 20 && e.source.getGameMode() != 'creative') {
                    block.setType('minecraft:air'); e.source.getComponent("equippable").setEquipment("Mainhand", e.itemStack);
                    e.source.runCommand(`title @s actionbar §cToo far from the other campfire!`)
                    return;
                }
                //SERVER.world.sendMessage(`${distanceVector(otherCampfire, e.block.location)}`)
                links[0].push(otherCampfire)
                links[1].push(block.location)
                console.error('hey there')
                SERVER.world.setDynamicProperty('vc:linked_campfires', JSON.stringify(links))
                e.source.setDynamicProperty('is_linking_campfires', null)
                e.source.runCommand(`title @s actionbar Campfire at §l${block.location.x} ${block.location.y} ${block.location.y} §rlinked to §l${otherCampfire.x} ${otherCampfire.y} ${otherCampfire.z}`)
            }*/
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:cursed_campfire', {
        beforeOnPlayerPlace: e => {
            SERVER.system.runTimeout(() => {
            console.log('waaa')
            if (!e.player.getDynamicProperty('is_linking_campfires')) {
                e.player.setDynamicProperty('is_linking_campfires', JSON.stringify(e.block.location))
                e.player.runCommand(`title @s actionbar Place down another campfire to link them!`)
            } else {
                let links
                const dynamicProp = SERVER.world.getDynamicProperty('vc:linked_campfires')
                if (!dynamicProp || dynamicProp == undefined) links = [[], []];
                else links = JSON.parse(dynamicProp)

                const otherCampfire = JSON.parse(e.player.getDynamicProperty('is_linking_campfires'))
                if (distanceVector(otherCampfire, e.block.location) > 10 && e.player.getGameMode() != 'Creative') {
                    e.cancel = true;
                    e.player.runCommand(`title @s actionbar §cToo far from the other campfire!`)
                    return;
                }
                //SERVER.world.sendMessage(`${distanceVector(otherCampfire, e.block.location)}`)
                links[0].push(otherCampfire)
                links[1].push(e.block.location)
                SERVER.world.setDynamicProperty('vc:linked_campfires', JSON.stringify(links))
                e.player.setDynamicProperty('is_linking_campfires', null)
                e.player.runCommand(`title @s actionbar Campfire at §l${e.block.location.x} ${e.block.location.y} ${e.block.location.y} §rlinked to §l${otherCampfire.x} ${otherCampfire.y} ${otherCampfire.z}`)
            }
        }, 2)},
        onEntityFallOn: e => {
            console.log('waaa')
            if (e.block.permutation.getState('vc:lit') == false) return;
            let links
            const dynamicProp = SERVER.world.getDynamicProperty('vc:linked_campfires')
            if (!dynamicProp || dynamicProp == undefined) return;
            else links = JSON.parse(dynamicProp)
            //SERVER.world.sendMessage(`${dynamicProp}`)
            const location = findVec3(links[0], e.block.location)
            if (location < 0) {
                const otherLocation = findVec3(links[1], e.block.location)
                if (otherLocation < 0) return;
                else {
                    doTheTeleport(e.entity, e.block.center(), e.dimension.getBlock(links[0][otherLocation]).center())
                }

            } else doTheTeleport(e.entity, e.block.center(), e.dimension.getBlock(links[1][location]).center()) /*{
                console.warn(JSON.stringify(links[1][0]))
                SERVER.world.sendMessage(`${findVec3(links[0], e.block.location)} \n ${JSON.stringify(links[0])}\n${JSON.stringify(e.block.location)}`)
            }*/
            function doTheTeleport(entity, fromLoc, toLoc) {
                if (e.dimension.getBlock(toLoc).permutation.getState('vc:lit') == false) return;
                entity.dimension.runCommand(`particle vc:clone_spawn ${fromLoc.x} ${fromLoc.y} ${fromLoc.z}`)
                entity.dimension.runCommand(`particle vc:clone_spawn_box ${fromLoc.x} ${fromLoc.y} ${fromLoc.z}`)
                entity.dimension.runCommand(`particle vc:clone_spawn_pyramid ${fromLoc.x} ${fromLoc.y} ${fromLoc.z}`)
                entity.dimension.runCommand(`particle vc:clone_spawn ${toLoc.x} ${toLoc.y} ${toLoc.z}`)
                entity.dimension.runCommand(`particle vc:clone_spawn_box ${toLoc.x} ${toLoc.y} ${toLoc.z}`)
                entity.dimension.runCommand(`particle vc:clone_spawn_pyramid ${toLoc.x} ${toLoc.y} ${toLoc.z}`)
                entity.dimension.runCommand(`playsound block.campfire.magic @a ${fromLoc.x} ${fromLoc.y} ${fromLoc.z}`)
                entity.dimension.runCommand(`playsound block.campfire.magic @a ${toLoc.x} ${toLoc.y} ${toLoc.z}`)
                e.entity.teleport(toLoc)
            }

        },
        onPlayerBreak: e => {
            e.player.setDynamicProperty('is_linking_campfires', null)
            let links
            const dynamicProp = SERVER.world.getDynamicProperty('vc:linked_campfires')
            if (!dynamicProp || dynamicProp == undefined) return;
            else links = JSON.parse(dynamicProp)
            const location = findVec3(links[0], e.block.location)
            if (location < 0) {
                const otherLocation = findVec3(links[1], e.block.location)
                if (otherLocation < 0) return;
                else {
                    e.player.runCommand(`setblock ${vec3toString(links[0][otherLocation])} air destroy`)
                    e.player.runCommand(`setblock ${vec3toString(links[1][otherLocation])} air destroy`)
                    links[0].splice(otherLocation, 1)
                    links[1].splice(otherLocation, 1)
                }

            } else {
                e.player.runCommand(`setblock ${vec3toString(links[0][location])} air destroy`)
                e.player.runCommand(`setblock ${vec3toString(links[1][location])} air destroy`)
                links[0].splice(location, 1)
                links[1].splice(location, 1)
            }
            SERVER.world.setDynamicProperty('vc:linked_campfires', JSON.stringify(links))
        }
    });
});
SERVER.system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id == 'vc:resetCampfires') {
        e.sourceEntity.setDynamicProperty('is_linking_campfires', null)
        SERVER.world.setDynamicProperty('vc:linked_campfires', null)
    }
    if (e.id == 'vc:trackCampfire') {
        if (!e.sourceEntity.getDynamicProperty('is_linking_campfires')) return;
        var viewBlock = e.sourceEntity.getBlockFromViewDirection({ maxDistance: 8 })
        if (!viewBlock) return;

        const molang = new SERVER.MolangVariableMap();
        var playerLocation = {
            x: viewBlock.block.location.x + viewBlock.faceLocation.x,
            y: viewBlock.block.location.y + viewBlock.faceLocation.y,
            z: viewBlock.block.location.z + viewBlock.faceLocation.z
        }
        const otherCampfire = e.sourceEntity.dimension.getBlock(JSON.parse(e.sourceEntity.getDynamicProperty('is_linking_campfires'))).center()

        var legal = (distanceVector(otherCampfire, playerLocation) < (e.sourceEntity.getGameMode() == 'Creative' ? 100 : 10))
        molang.setColorRGB('variable.color', {
            red: (legal ? 85 : 255) / 255,
            green: (legal ? 255 : 85) / 255,
            blue: 85 / 255
        });
        for (let i = 0; i < 11; i++) {
            let location = lerpVec3(otherCampfire, playerLocation, i * 0.1)
            e.sourceEntity.dimension.spawnParticle('vc:colored_dot', location, molang);
        }
    }
})

function findVec3(array, findme) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].x == findme.x && array[i].y == findme.y && array[i].z == findme.z) return i
    }
    return -1
    // Expect
}

function lerpVec3(va, vb, alpha) {
    return {
        x: lerp(va.x, vb.x, alpha),
        y: lerp(va.y, vb.y, alpha),
        z: lerp(va.z, vb.z, alpha)
    }
}