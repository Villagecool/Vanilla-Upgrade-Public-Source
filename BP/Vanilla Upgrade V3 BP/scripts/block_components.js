import * as SERVER from '@minecraft/server';
//import { system } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, getRandomInt, offsetLocation, setVectorFloats, decripateStack, vec3toString, lerp, getRandomBool, isBlockSolid, getRandomFloat } from './utils.js'
import { damageWithCustomMessage } from './entity_functions.js'

console.warn("Are those §6§lCreator Settings§r i smell? This add-on might come up with a few errors but most likley they shouldn't be breaking the mod so dont worry about them :3 - vlliage")
const harmList = []
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent('vc:door', {
        onUseOn: e => {
            const block = e.blockFace == 'North' ? e.block.north(1) : e.blockFace == 'East' ? e.block.east(1) : e.blockFace == 'South' ? e.block.south(1) : e.blockFace == 'West' ? e.block.west(1) : e.blockFace == 'Up' ? e.block.above(1) : e.block.below(1)
            if (!block.above(1).isAir) { block.setType('minecraft:air'); e.source.getComponent("equippable").setEquipment("Mainhand", e.itemStack); return; }
            const upperBlock = block.above(1)
            SERVER.system.runTimeout(() => {
                upperBlock.setType(block.typeId)
                setPermutation(upperBlock, 'vc:upper_bit', true)
                let face = block.permutation.getState("minecraft:cardinal_direction")
                setPermutation(upperBlock, 'minecraft:cardinal_direction', String(face))
                let connect = false;

                if (block.permutation.getState("minecraft:cardinal_direction") == 'north') connect = block.west(1).hasTag("door");
                if (block.permutation.getState("minecraft:cardinal_direction") == 'south') connect = block.east(1).hasTag("door");
                if (block.permutation.getState("minecraft:cardinal_direction") == 'west') connect = block.south(1).hasTag("door");
                if (block.permutation.getState("minecraft:cardinal_direction") == 'east') connect = block.north(1).hasTag("door");
                //console.log(`${block.west(1).hasTag("door")}, ${block.east(1).hasTag("door")}, ${block.north(1).hasTag("door")}, ${block.south(1).hasTag("door")}`)

                setPermutation(block, "vc:flipped", connect)
                setPermutation(upperBlock, "vc:flipped", connect)
            }, 1)
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:door', {
        beforeOnPlayerPlace: e => {
            if (!e.block.above(1).isAir) { e.cancel = true; return; }
            const upperBlock = e.block.above(1)
            SERVER.system.runTimeout(() => {
                upperBlock.setType(e.block.typeId)
                setPermutation(upperBlock, 'vc:upper_bit', true)
                let face = e.permutationToPlace.getState("minecraft:cardinal_direction")
                setPermutation(upperBlock, 'minecraft:cardinal_direction', String(face))
                let connect = false;

                if (e.permutationToPlace.getState("minecraft:cardinal_direction") == 'north') connect = e.block.west(1).hasTag("door");
                if (e.permutationToPlace.getState("minecraft:cardinal_direction") == 'south') connect = e.block.east(1).hasTag("door");
                if (e.permutationToPlace.getState("minecraft:cardinal_direction") == 'west') connect = e.block.south(1).hasTag("door");
                if (e.permutationToPlace.getState("minecraft:cardinal_direction") == 'east') connect = e.block.north(1).hasTag("door");
                //console.log(`${block.west(1).hasTag("door")}, ${block.east(1).hasTag("door")}, ${block.north(1).hasTag("door")}, ${block.south(1).hasTag("door")}`)

                setPermutation(e.block, "vc:flipped", connect)
                setPermutation(upperBlock, "vc:flipped", connect)
            }, 1)
        },
        onPlayerDestroy: e => {
            if (e.destroyedBlockPermutation.getState("vc:upper_bit") == true) {
                e.block.dimension.runCommand(`setblock ${vec3toString(e.block.below(1).location)} air destroy`)
            }
            else {
                e.block.dimension.runCommand(`setblock ${vec3toString(e.block.above(1).location)} air destroy`)
            }
        },
        onPlayerInteract: e => {
            if (e.block.typeId == 'vc:compressed_copper_door' && !(e.block.permutation.getState("vc:upper_bit") ?
                (e.block.permutation.getState("vc:powered") || e.block.below(1).permutation.getState("vc:powered")) :
                (e.block.permutation.getState("vc:powered") || e.block.above(1).permutation.getState("vc:powered")))) return;
            const open = e.block.permutation.getState("vc:open")
            if (e.block.permutation.getState("vc:upper_bit") == true) {
                setPermutation(e.block, 'vc:open', !open)
                setPermutation(e.block.below(1), 'vc:open', !open)
            }
            else {
                setPermutation(e.block, 'vc:open', !open)
                setPermutation(e.block.above(1), 'vc:open', !open)
            }
            var sound = (
                e.block.typeId == 'vc:compressed_copper_door' ? `${(!open == true ? 'open' : 'close')}_door.copper` :
                    e.block.typeId == 'vc:glass_door' ? `random.door_${(!open == true ? 'open' : 'close')}` :
                        `${(!open == true ? 'open' : 'close')}.wooden_door`)
            e.dimension.playSound(sound, e.block.center(), {pitch: getRandomFloat(0.9,1)})
        },
        onTick: e => {
            //console.log(e.block.getRedstonePower())
            if (e.block.typeId == 'vc:compressed_copper_door' || e.typeId == 'vc:glass_door') return;
            const wasSucessful = e.block.getRedstonePower() > 0

            if ((wasSucessful && e.block.permutation.getState('vc:powered') == false && e.block.permutation.getState('vc:open') == false) || ( !wasSucessful && e.block.permutation.getState('vc:powered') == true && e.block.permutation.getState('vc:open') == true )) {
                const open = e.block.getRedstonePower() <= 0;

                if (e.block.permutation.getState("vc:upper_bit") == true) {
                    setPermutation(e.block, 'vc:open', !open)
                    setPermutation(e.block.below(1), 'vc:open', !open)
                }
                else {
                    setPermutation(e.block, 'vc:open', !open)
                    setPermutation(e.block.above(1), 'vc:open', !open)
                }
                var sound = (
                    e.block.typeId == 'vc:compressed_copper_door' ? `${(!open == true ? 'open' : 'close')}_door.copper` :
                        e.block.typeId == 'vc:glass_door' ? `random.door_${(!open == true ? 'open' : 'close')}` :
                            `${(!open == true ? 'open' : 'close')}.wooden_door`)
                e.dimension.playSound(sound, e.block.center(), {pitch: getRandomFloat(0.9,1)})
            }
            
			setPermutation(e.block, 'vc:powered', wasSucessful)
        }
    });

    initEvent.blockComponentRegistry.registerCustomComponent('vc:trapdoor', {
        onPlayerInteract: e => {
            if (e.block.typeId == 'vc:compressed_copper_trapdoor' && !e.block.permutation.getState("vc:powered")) return;
            const open = e.block.permutation.getState("vc:open")
            setPermutation(e.block, 'vc:open', !open)
            e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.location)} run playsound ${(!open == true ? 'open' : 'close')}.wooden_trapdoor @a[r=5] ~~~ 0.4`)
        }
    });

    initEvent.blockComponentRegistry.registerCustomComponent('vc:fence_gate', {
        onPlayerInteract: e => {
            const face = e.block.permutation.getState("minecraft:cardinal_direction")
            const open = e.block.permutation.getState("vc:open")
            if (open == 'false') {
                if (face == 'north' || face == 'north')
                    setPermutation(e.block, 'vc:open', (e.face == 'North' ? 'front' : 'back'))
                else
                    setPermutation(e.block, 'vc:open', (e.face == 'East' ? 'front' : 'back'))

                e.block.dimension.runCommand(`playsound open.fence_gate @a ${vec3toString(e.block.location)} 1`)
            }
            else {
                setPermutation(e.block, 'vc:open', 'false')
                e.block.dimension.runCommand(`playsound close.fence_gate @a ${vec3toString(e.block.location)} 1`)
            }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:fence', {
        onTick: e => {
            try {
                const block = e.block
                const north = block.north(1).vcIsSolid()
                const south = block.south(1).vcIsSolid()
                const east = block.east(1).vcIsSolid()
                const west = block.west(1).vcIsSolid()
                try {
                    setPermutation(block, "vc:north", north)
                    setPermutation(block, "vc:south", south)
                    setPermutation(block, "vc:east", east)
                    setPermutation(block, "vc:west", west)
                    setPermutation(block, "vc:placed", true)
                } catch { }
                if (block.above(1).isAir && block.typeId.includes('fence')) block.above(1).setType('vc:fence_collision')
                if (block.above(1).typeId == 'vc:fence_collision') {
                    setPermutation(block.above(1), "vc:east", east)
                    setPermutation(block.above(1), "vc:west", west)
                }
            } catch (error) { }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:wall', {
        onTick: e => {
            try {
                const block = e.block
                const north = block.north(1).vcIsSolid()
                const south = block.south(1).vcIsSolid()
                const east = block.east(1).vcIsSolid()
                const west = block.west(1).vcIsSolid()
                const aboveperm = block.above(1).permutation;
                try {
                    setPermutation(block, "vc:north", north ?   (aboveperm.getState('vc:north') != undefined && aboveperm.getState('vc:north') != 'none') || block.above(1).vcIsSolid(e.block.typeId) ? 'tall' : 'short' : 'none')
                    setPermutation(block, "vc:south", south ?   (aboveperm.getState('vc:south') != undefined && aboveperm.getState('vc:south') != 'none') || block.above(1).vcIsSolid(e.block.typeId) ? 'tall' : 'short' : 'none')
                    setPermutation(block, "vc:east", east ?     (aboveperm.getState('vc:east') != undefined  && aboveperm.getState('vc:east')  != 'none') || block.above(1).vcIsSolid(e.block.typeId) ? 'tall' : 'short' : 'none')
                    setPermutation(block, "vc:west", west ?     (aboveperm.getState('vc:west') != undefined  && aboveperm.getState('vc:west')  != 'none') || block.above(1).vcIsSolid(e.block.typeId) ? 'tall' : 'short' : 'none')
                    setPermutation(block, "vc:post", !((north && south && !east && !west) || (!north && !south && east && west)) || aboveperm.getState('vc:post') == true)
                } catch { }
                //if (block.above(1).isAir) block.above(1).setType('vc:fence_collision')
                if (block.above(1).typeId == 'vc:fence_collision') {
                    setPermutation(block.above(1), "vc:east", east)
                    setPermutation(block.above(1), "vc:west", west)
                }
            } catch (error) { }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:azalea_leaves', {
        onTick: e => {
            e.block.setType(e.block.typeId.replace('vc:', 'minecraft:'))
            setPermutation(e.block, 'update_bit', false)
        }
    });
    //initEvent.blockComponentRegistry.registerCustomComponent('vc:stripper', {
        //onPlayerInteract: e => {
        //    if (!e.player.getComponent("equippable").getEquipment("Mainhand").hasTag('is_axe')) return;
        //    const dir = e.block.permutation.getState("minecraft:block_face")
        //    e.block.setType(`vc:stripped_${e.block.typeId.replace('vc:', '')}`)
        //    e.block.dimension.runCommand(`playsound use.wood @a ${vec3toString(e.block.location)} 1`)
        //    setPermutation(e.block, 'minecraft:block_face', dir)
        //}
    //});
    //initEvent.blockComponentRegistry.registerCustomComponent('vc:slab', {
        //onPlayerInteract: e => {
        //    if (e.player.getComponent("equippable").getEquipment("Mainhand").typeId != e.block.typeId) return;
        //    const dir = e.block.permutation.getState("minecraft:vertical_half")
        //    if ((dir == 'top' && e.face == 'Down') || (dir == 'bottom' && e.face == 'Up')) {
        //        e.block.setType(e.block.typeId.replace('slab', 'doubleslab'))
        //        e.block.dimension.runCommand(`playsound use.wood @a ${vec3toString(e.block.location)} 1`)
        //    }
        //}
    //});
    initEvent.blockComponentRegistry.registerCustomComponent('vc:stairs', {
        onStepOn: e => {
            if (!(e.block.above(1).isAir || e.block.above(1).typeId == 'vc:stairs_collision')) return;
            if (e.block.permutation.getState("minecraft:vertical_half") == 'top') return;
            e.block.above(1).setType('vc:stairs_collision')
            setPermutation(e.block.above(1), "minecraft:cardinal_direction", e.block.permutation.getState("minecraft:cardinal_direction"))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:stairs_collision', {
        onStepOn: e => {
            setPermutation(e.block, "minecraft:cardinal_direction", e.block.below(1).permutation.getState("minecraft:cardinal_direction"))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:sapling', {
        onRandomTick: e => {
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.location)}`)
            if (getRandomInt(0, 5) == 0) e.block.dimension.runCommand(`structure load ${e.block.typeId.replace('vc:', '').replace('sapling_', '')}_tree1 ${e.block.location.x - 3} ${e.block.location.y} ${e.block.location.z - 3}`)
        },
        onPlayerInteract: e => {
            if (e.player.getComponent("equippable").getEquipment("Mainhand").typeId != 'minecraft:bone_meal') return;
            decripateStack(e.player);
            e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.location)} 1`)
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.location)}`)
            console.log(`structure load ${e.block.typeId.replace('vc:', '').replace('sapling_', '')}_tree1 ${e.block.location.x - 3} ${e.block.location.y} ${e.block.location.z - 3}`)
            if (getRandomInt(0, 5) == 0) e.block.dimension.runCommand(`structure load ${e.block.typeId.replace('vc:', '').replace('sapling_', '')}_tree1 ${e.block.location.x - 3} ${e.block.location.y} ${e.block.location.z - 3}`)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:lumerison_mushroom', {
        onPlayerInteract: e => {
            if (e.player.getComponent("equippable").getEquipment("Mainhand").typeId != 'minecraft:bone_meal') return;
            decripateStack(e.player);
            e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.location)} 1`)
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.location)}`)
            if (getRandomInt(0, 5) == 0) e.block.dimension.runCommand(`structure load lumerison_fungus1 ${e.block.location.x - 1} ${e.block.location.y} ${e.block.location.z - 1}`)
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:falling_leaves', {
        onRandomTick: e => {
            let lastblock = e.block
            var count = 0
            while (!lastblock.below(1).isAir) {
                if (count >= 10) return;
                lastblock = lastblock.below(1)
            }
            e.dimension.spawnParticle('vc:elax_drips_particle', offsetLocation(lastblock.bottomCenter(), { x: getRandomInt(-0.6, 0.6), y: 0, z: getRandomInt(-0.6, 0.6) }))
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:particle', {
        onRandomTick: e => {
            e.dimension.spawnParticle('vc:bubble_flower_bubbles', e.block.center())
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:glowing_mushroom', {
        onPlayerInteract: e => {
            if (e.player.getComponent("equippable").getEquipment("Mainhand").typeId != 'minecraft:bone_meal') return;
            decripateStack(e.player);
            e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.location)} 1`)
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.location)}`)
            if (getRandomInt(0, 5) == 0) e.block.dimension.runCommand(`structure load glorium_mushroom1 ${e.block.location.x - 2} ${e.block.location.y} ${e.block.location.z - 2}`)
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:elax_gravity', {
        onStepOn: e => {
            if (!e.block.below(1).isAir) return;
            e.entity.runCommand(`playsound block.turtle_egg.crack @a[r=15] ~~~`)
            e.entity.runCommand(`camerashake add @s[type=player] 0.1 0.5 positional`)
        },
        onStepOff: e => {
            if (!e.block.below(1).isAir) return;
            e.entity.runCommand(`playsound block.turtle_egg.break @a[r=15] ~~~`)
            var blockType = e.block.typeId.replace('elax_', '').replace('vc:', '');
            var dir = 'north'
            var bool = false;
            if (blockType == 'log' || blockType == "wood" || blockType == "stripped_log" || blockType == "stripped_wood") dir = e.block.permutation.getState("minecraft:block_face")
            if (blockType == 'stairs') { dir = e.block.permutation.getState("minecraft:cardinal_direction"); bool = (e.block.permutation.getState("minecraft:vertical_half") == 'top') }
            if (blockType == 'slab') bool = (e.block.permutation.getState("minecraft:vertical_half") == 'top')
            e.block.setType(`vc:falling_elax_block`)
            setPermutation(e.block, 'vc:block_type', blockType)
            setPermutation(e.block, 'vc:direction', dir)
            setPermutation(e.block, 'vc:state_bool', bool)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:falling_elax_block', {
        onTick: e => {
            if (e.block.location.y == (e.block.dimension.id == 'overworld' ? -64 : 0)) {
                e.block.setType('minecraft:air')
                return;
            }

            if (e.block.below(1).isAir) {
                e.block.dimension.runCommand(`clone ${vec3toString(e.block.location)} ${vec3toString(e.block.location)} ${e.block.location.x} ${e.block.location.y - 1} ${e.block.location.z}`)
                e.block.setType('minecraft:air')
            } else {
                const blockType = e.block.permutation.getState("vc:block_type")
                const dir = e.block.permutation.getState("vc:direction")
                const bool = e.block.permutation.getState("vc:state_bool")
                switch (blockType) {
                    case 'log': case 'wood': case 'stripped_log': case 'stripped_wood':
                        if (blockType == 'stripped_log') e.block.setType('vc:stripped_elax_log')
                        else if (blockType == 'stripped_wood') e.block.setType('vc:stripped_elax_wood')
                        else e.block.setType('vc:elax_' + blockType)
                        setPermutation(e.block, 'minecraft:block_face', dir)
                        break;
                    case 'stairs':
                        e.block.setType('vc:elax_' + blockType)
                        setPermutation(e.block, 'minecraft:cardinal_direction', dir)
                        setPermutation(e.block, "minecraft:vertical_half", (bool ? 'top' : 'bottom'))
                        break;
                    case 'slab':
                        e.block.setType('vc:elax_' + blockType)
                        setPermutation(e.block, "minecraft:vertical_half", (bool ? 'top' : 'bottom'))
                        break;
                    default:
                        e.block.setType('vc:elax_' + blockType)
                        break;
                }
            }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:gloricalium_block', {
        onRandomTick: e => {
            if (getRedstonePowered(e.block)) e.block.setType(e.block.typeId.replace('gloricalium', 'discharged_gloricalium'))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:glorium_crystal_block_budding', {
        onRandomTick: e => {
            const faces = [e.block.north(1), e.block.east(1), e.block.south(1), e.block.west(1), e.block.above(1), e.block.below(1)]
            const dirfaces = ['north', 'east', 'south', 'west', 'up', 'down']
            const chosenFace = getRandomInt(0, 5)
            const victimBlock = faces[chosenFace]
            if (!victimBlock.typeId.startsWith('vc:glorium_crystals') && !victimBlock.isAir) return;
            if (victimBlock.permutation.getState("minecraft:block_face") == dirfaces[chosenFace] || victimBlock.isAir) {
                var face = victimBlock.permutation.getState("minecraft:block_face")
                var newType = (victimBlock.typeId == 'vc:glorium_crystals_tiny' ? 'vc:glorium_crystals_small' :
                    victimBlock.typeId == 'vc:glorium_crystals_small' ? 'vc:glorium_crystals_medium' :
                        victimBlock.typeId == 'vc:glorium_crystals_medium' ? 'vc:glorium_crystals' :
                            victimBlock.isAir ? 'vc:glorium_crystals_tiny' : undefined
                )
                if (newType) victimBlock.setType(newType)
                if (victimBlock) setPermutation(victimBlock, 'minecraft:block_face', dirfaces[chosenFace])
            }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:breezer', {
        onTick: e => {
            const block = e.block;
            if (!block.permutation.getState("vc:powered")) return;
            let rstrength = getrstrength(block);
            if (rstrength == 0) return;
            let strength = rstrength / 30;
            if (Math.random() > 0.5) e.block.dimension.runCommand(`playsound weather.wind @a ${vec3toString(e.block.location)} 1 ${0.5 + strength * 2}`)
            var entities = []
            const dir = block.permutation.getState("minecraft:facing_direction")
            var coffset = { x: 0, y: 0, z: 1 }
            if (dir == "north") coffset = { x: 0, y: 0, z: 1 }
            else if (dir == "east") coffset = { x: 1, y: 0, z: 0 }
            else if (dir == "south") coffset = { x: 0, y: 0, z: -1 }
            else if (dir == "west") coffset = { x: -1, y: 0, z: 0 }
            else if (dir == "up") coffset = { x: 0, y: 1, z: 0 }
            else if (dir == "down") coffset = { x: 0, y: -1, z: 0 }
            for (let i = 1; i < 5 + (Math.round(rstrength / 3)); i++) {
                var offsetblock = block.north(coffset.z * -i).east(coffset.x * -i).above(coffset.y * -i) //idk why .offset() isnt working (i fogrot to include i lmao)
                if (offsetblock.vcIsSolid()) break;
                entities = entities.concat(block.dimension.getEntitiesAtBlockLocation(offsetblock.center()))
                //console.log(vec3toString(offsetblock.location))
                //if (Math.random() > 0.00000001) block.dimension.spawnParticle('vc:blue_shell_trail', offsetblock.center())
            }
            //console.log(entities.length)
            const command = `scriptevent vc:knockback ${dir == "east" ? -0.1 : dir == "west" ? 0.1 : 0} ${dir == "south" ? -0.1 : dir == "north" ? 0.1 : 0} ${dir == "up" || dir == "down" ? 0 : strength} ${dir == "up" ? -strength : dir == "down" ? strength : 0}`
            for (const entity of entities) {
                entity.runCommand(command)
            }
            const molang = new SERVER.MolangVariableMap();
            molang.setFloat('variable.visible', (Math.floor(Math.random(0, 15 - strength * 10)) == 0 ? 1 : 0))
            molang.setFloat('variable.strength', rstrength - 4)
            molang.setFloat('variable.life', strength / 1.5)
            block.dimension.spawnParticle("vc:breezer_blow_particle",
                block.center(),
                setVectorFloats(molang, "variable.sped",
                    dir == "east" ? -1 : dir == "west" ? 1 : 0,
                    dir == "up" ? -1 : dir == "down" ? 1 : 0,
                    dir == "south" ? -1 : dir == "north" ? 1 : 0
                ))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:blazer', {
        onTick: e => {
            const block = e.block;
            if (!block.permutation.getState("vc:powered")) return;
            let rstrength = getrstrength(block);
            if (rstrength == 0) return;
            let strength = rstrength / 30;
            if (Math.random() > 0.5) e.block.dimension.runCommand(`playsound weather.fire_wind @a ${vec3toString(e.block.location)} 1 ${0.5 + strength * 2}`)
            var entities = []
            const dir = block.permutation.getState("minecraft:facing_direction")
            var coffset = { x: 0, y: 0, z: 1 }
            if (dir == "north") coffset = { x: 0, y: 0, z: 1 }
            else if (dir == "east") coffset = { x: 1, y: 0, z: 0 }
            else if (dir == "south") coffset = { x: 0, y: 0, z: -1 }
            else if (dir == "west") coffset = { x: -1, y: 0, z: 0 }
            else if (dir == "up") coffset = { x: 0, y: 1, z: 0 }
            else if (dir == "down") coffset = { x: 0, y: -1, z: 0 }
            for (let i = 1; i < 5 + (Math.round(rstrength / 3)); i++) {
                var offsetblock = block.north(coffset.z * -i).east(coffset.x * -i).above(coffset.y * -i) //idk why .offset() isnt working (i fogrot to include i lmao)
                if (offsetblock.vcIsSolid()) break;
                entities = entities.concat(block.dimension.getEntitiesAtBlockLocation(offsetblock.center()))
                //console.log(vec3toString(offsetblock.location))
                //if (Math.random() > 0.00000001) block.dimension.spawnParticle('vc:blue_shell_trail', offsetblock.center())
            }
            //console.log(entities.length)
            for (const entity of entities) {
                entity.setOnFire(rstrength, true)
            }
            const molang = new SERVER.MolangVariableMap();
            molang.setFloat('variable.visible', (Math.floor(Math.random(0, 15 - strength * 10)) == 0 ? 1 : 0))
            molang.setFloat('variable.strength', rstrength - 4)
            molang.setFloat('variable.life', strength / 1.5)
            block.dimension.spawnParticle("vc:blazer_blow_particle",
                block.center(),
                setVectorFloats(molang, "variable.sped",
                    dir == "east" ? -1 : dir == "west" ? 1 : 0,
                    dir == "up" ? -1 : dir == "down" ? 1 : 0,
                    dir == "south" ? -1 : dir == "north" ? 1 : 0
                ))

            //old system laggy asf
            /*const block = e.block;
            if (!block.permutation.getState("vc:powered")) return;
            let rstrength = getrstrength(block);
            let strength = rstrength / 30;
            if (Math.random() > 0.5) e.block.dimension.runCommand(`playsound weather.fire_wind @a ${vec3toString(e.block.location)} 1 ${0.5 + strength * 2}`)
            for (let i = 1; i < 5 + (Math.round(rstrength / 3)); i++) {
                const molang = new SERVER.MolangVariableMap();
                molang.setFloat('variable.visible', (Math.floor(Math.random(0, 15 - strength * 10)) == 0 ? 1 : 0))
                molang.setFloat('variable.strength', rstrength - 6)
                molang.setFloat('variable.life', strength / 1.5)
                let offset = { x: 0.5, y: 0.5, z: 0.5 }
                if (block.permutation.getState("minecraft:facing_direction") == "north") { if (!block.north(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.north(-i).center().x},y=${block.north(-i).center().y},z=${block.north(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, 1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "east") { if (!block.east(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.east(-i).center().x},y=${block.east(-i).center().y},z=${block.east(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", -1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "south") { if (!block.south(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.south(-i).center().x},y=${block.south(-i).center().y},z=${block.south(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 0, -1)); }
                if (block.permutation.getState("minecraft:facing_direction") == "west") { if (!block.west(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.west(-i).center().x},y=${block.west(-i).center().y},z=${block.west(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 1, 0, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "up") { if (!block.above(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.above(-i).center().x},y=${block.above(-i).center().y},z=${block.above(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, -1, 0)); }
                if (block.permutation.getState("minecraft:facing_direction") == "down") { if (!block.below(-i).isAir) break; block.dimension.runCommand(`execute as @e[x=${block.below(-i).center().x},y=${block.below(-i).center().y},z=${block.below(-i).center().z},r=0.8] run scriptevent vc:setOnFire`); block.dimension.spawnParticle("vc:blazer_blow_particle", offsetLocation(block.location, offset), setVectorFloats(molang, "variable.sped", 0, 1, 0)); }
            }*/
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:glorium_vines', {
        onUseOn: e => {
            const block = e.blockFace == 'North' ? e.block.north(1) : e.blockFace == 'East' ? e.block.east(1) : e.blockFace == 'South' ? e.block.south(1) : e.blockFace == 'West' ? e.block.west(1) : e.blockFace == 'Up' ? e.block.above(1) : e.block.below(1)

            var placement = (block.permutation.getState("minecraft:vertical_half") == "bottom" ? 1 : -1)
            SERVER.system.runTimeout(() => {
                if (block.below(placement).typeId == block.typeId && block.below(placement).permutation.getState("minecraft:vertical_half") == block.permutation.getState("minecraft:vertical_half"))
                    setPermutation(block.below(placement), 'vc:blockshape', 'default')
                setPermutation(block, 'vc:blockshape', (block.above(placement).typeId == block.typeId ? 'default' : 'tip'))
            }, 1)
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:vines', {
        beforeOnPlayerPlace: e => {
            var placement = (e.permutationToPlace.getState("minecraft:vertical_half") == "bottom" ? 1 : -1)
            if (e.block.below(placement).typeId == e.block.typeId) setPermutation(e.block.below(placement), 'vc:blockshape', 'default')
            SERVER.system.runTimeout(() => {
                setPermutation(e.block, 'vc:blockshape', (e.block.above(placement).typeId == e.block.typeId ? 'default' : 'tip'))
            }, 1)
        },
        onPlayerInteract: e => {
            if (e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId != 'minecraft:bone_meal') return;
            var placement = (e.block.permutation.getState("minecraft:vertical_half") == "bottom" ? 1 : -1)
            if (passItOn(e.block) == true) {
                e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.center())}`)
                e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.center())}`)
                decripateStack(e.player)
            }
            function passItOn(block) {
                if (block.above(placement).typeId == e.block.typeId) return passItOn(block.above(placement))
                else if (block.above(placement).isAir) {
                    block.above(placement).setType(e.block.typeId)
                    setPermutation(block.above(placement), "minecraft:vertical_half", e.block.permutation.getState("minecraft:vertical_half"))
                    setPermutation(block.above(placement), 'vc:blockshape', 'tip')
                    setPermutation(block, 'vc:blockshape', 'default')
                    return true;
                }
                else return false;
            }
        }
    });
    function vineBreak(flavor, e) {
        var placement = (e.destroyedBlockPermutation.getState("minecraft:vertical_half") == "bottom" ? 1 : -1)
        if (e.block.below(placement).typeId == flavor) setPermutation(e.block.below(placement), 'vc:blockshape', 'tip')
        breakChain(e.block.above(placement));
        function breakChain(block) {
            if (block.typeId != flavor) return;
            block.dimension.runCommand(`setblock ${vec3toString(block.location)} air destroy`)
            if (e.block.below(placement).typeId == flavor) setPermutation(e.block.below(placement), 'vc:blockshape', 'tip')
            breakChain(block.above(placement))
        }
    }
    initEvent.blockComponentRegistry.registerCustomComponent('vc:glorium_vines', {
        onPlayerDestroy: e => { vineBreak('vc:glorium_vines', e) }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:elax_syrup', {
        onPlayerDestroy: e => { vineBreak('vc:elax_syrup', e) }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:chorus_spew', {
        onTick: e => {
            let offset = { x: 0, y: 0, z: 0 }
            var particle = 'vc:chorus_spew_particle'
            switch (e.block.permutation.getState("minecraft:block_face")) {
                case 'north':
                    offset.z = 0.3;
                    break;
                case 'west':
                    offset.x = 0.3;
                    break;
                case 'south':
                    offset.z = -0.3;
                    break;
                case 'east':
                    offset.x = -0.3;
                    break;
                case 'down':
                    offset.y = 0.3;
                    break;
                case 'up':
                    offset.y = -0.3;
                    particle = 'vc:chorus_spew_up_particle'
                    break;
            }
            e.block.dimension.runCommand(`particle ${particle} ${e.block.center().x + offset.x} ${e.block.center().y + offset.y} ${e.block.center().z + offset.z}`)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:crop', {
        onRandomTick: e => {
            var maxGrowth = (e.block.typeId == 'vc:blue_berries' || e.block.typeId == 'vc:warped_wart' ? 3 : e.block.typeId == 'vc:aloe_vera' ? 2 : 6)
            setPermutation(e.block, 'vc:growth', (e.block.permutation.getState("vc:growth") + 1).clamp(0, maxGrowth))
        },
        onPlayerInteract: e => {
            var maxGrowth = (e.block.typeId == 'vc:blue_berries' || e.block.typeId == 'vc:warped_wart' ? 3 : e.block.typeId == 'vc:aloe_vera' ? 2 : 6)
            if (e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId != (e.block.typeId == 'vc:warped_wart' ? 'vc:wither_bone_meal' : 'minecraft:bone_meal')) return;
            if (e.block.permutation.getState("vc:growth") >= maxGrowth) return;
            setPermutation(e.block, 'vc:growth', (e.block.permutation.getState("vc:growth") + 1).clamp(0, maxGrowth))
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.center())}`)
            e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.center())}`)
            decripateStack(e.player)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:blue_berry_bush', {
        onPlayerInteract: e => {
            if (e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId == 'minecraft:bone_meal') return;
            if (e.block.permutation.getState("vc:growth") < 2) return;
            setPermutation(e.block, 'vc:growth', 1)
            e.block.dimension.runCommand(`playsound block.sweet_berry_bush.pick @a ${vec3toString(e.block.center())}`)
            e.block.dimension.runCommand(`loot spawn ${vec3toString(e.block.center())} loot "blocks/blue_berry_bush2"`)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:cake', {
        onPlayerInteract: e => {
            if (e.block.permutation.getState("vc:eat") < 7) setPermutation(e.block, 'vc:eat', (e.block.permutation.getState("vc:eat") + 1))
            else e.block.setType('minecraft:air')
            e.player.runCommand(`playsound random.burp @a ~~~ 0.8 1 0.3`)
            e.player.eatItem(new SERVER.ItemStack(`vc:${e.block.typeId.includes('lava') ? 'lava_' : ''}cake_food_stats`, 1))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:pumice', {
        beforeOnPlayerPlace: e => {
            let sucess = 0;
            for (let i = -3; i < 3; i++) {

                for (let j = -3; j < 3; j++) {

                    for (let k = -3; k < 3; k++) {
                        const lava = e.block.dimension.getBlock({ x: e.block.location.x + i, y: e.block.location.y + j, z: e.block.location.z + k })
                        if (lava != undefined && (lava.typeId == 'minecraft:lava' || lava.typeId == 'minecraft:flowing_lava')) {
                            sucess += 1;
                            lava.setType('air')
                        }
                    }
                }
            }
            //console.warn(sucess)
            if (sucess > 0) SERVER.system.runTimeout(() => { e.block.setType('vc:saturated_pumice') }, 1)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:saturated_pumice', {
        onPlayerInteract: e => {
            if (e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId != 'minecraft:bucket') return;
            decripateStack(e.player);
            e.block.setType('vc:pumice');
            e.player.getComponent('minecraft:inventory').container.addItem(new SERVER.ItemStack('minecraft:lava_bucket', 1));
            e.block.dimension.runCommand(`particle minecraft:water_evaporation_bucket_emitter ${vec3toString(e.block.center())}`)
            e.block.dimension.runCommand(`playsound random.fizz @a ${vec3toString(e.block.center())}`)
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:cattail', {
        onUseOn: e => {
            const block = e.blockFace == 'North' ? e.block.north(1) : e.blockFace == 'East' ? e.block.east(1) : e.blockFace == 'South' ? e.block.south(1) : e.blockFace == 'West' ? e.block.west(1) : e.blockFace == 'Up' ? e.block.above(1) : e.block.below(1)

            SERVER.system.runTimeout(() => {
                if (block.below(1).typeId == 'vc:cattail') setPermutation(block.below(1), 'vc:state', (block.below(2).typeId == 'vc:cattail' ? 1 : 2))
                setPermutation(block, 'vc:state', (block.above(1).typeId == 'vc:cattail' ? (block.below(1).typeId == 'vc:cattail' ? 1 : 2) : 0))
            }, 1)
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:cattail', {

        beforeOnPlayerPlace: e => {
            if (e.block.below(1).typeId == 'vc:cattail') setPermutation(e.block.below(1), 'vc:state', (e.block.below(2).typeId == 'vc:cattail' ? 1 : 2))
            SERVER.system.runTimeout(() => {
                setPermutation(e.block, 'vc:state', (e.block.above(1).typeId == 'vc:cattail' ? (e.block.below(1).typeId == 'vc:cattail' ? 1 : 2) : 0))
            }, 1)
        },
        onPlayerDestroy: e => {
            if (e.block.below(1).typeId == 'vc:cattail') setPermutation(e.block.below(1), 'vc:state', 0)
            breakChain(e.block.above(1));
            function breakChain(block) {
                if (block.typeId == 'vc:cattail') block.dimension.runCommand(`setblock ${vec3toString(block.location)} air destroy`)
                else return;
                breakChain(block.above(1))
            }
        },
        onPlayerInteract: e => {
            if (e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId != 'minecraft:bone_meal') return;
            if (passItOn(e.block) == true) {
                e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.center())}`)
                e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.center())}`)
                decripateStack(e.player)
            }
            function passItOn(block) {
                if (block.above(1).typeId == 'vc:cattail') return passItOn(block.above(1))
                else if (block.above(1).isAir) {
                    block.above(1).setType('vc:cattail')
                    setPermutation(block.above(1), 'vc:state', 0)
                    setPermutation(block, 'vc:state', (block.below(1).typeId == 'vc:cattail' ? 1 : 2))
                    return true;
                }
                else return false;
            }
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:lavender', {
        onUseOn: e => {
            const block = e.blockFace == 'North' ? e.block.north(1) : e.blockFace == 'East' ? e.block.east(1) : e.blockFace == 'South' ? e.block.south(1) : e.blockFace == 'West' ? e.block.west(1) : e.blockFace == 'Up' ? e.block.above(1) : e.block.below(1)

            if (!block.above().isAir) { block.setType('minecraft:air'); e.source.getComponent("equippable").setEquipment("Mainhand", e.itemStack); return }
            block.above(1).setType('vc:lavender')
            setPermutation(block.above(1), 'vc:upper_bit', true)
            block.setType('vc:lavender')
            setPermutation(block, 'vc:upper_bit', false)
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:lavender', {
        beforeOnPlayerPlace: e => {
            if (!e.block.above().isAir) { e.cancel = true; return }
            e.block.above().setType('vc:lavender')
            setPermutation(e.block.above(1), 'vc:upper_bit', true)
            e.block.setType('vc:lavender')
            setPermutation(e.block, 'vc:upper_bit', false)
        },
        onPlayerDestroy: e => {
            if (e.destroyedBlockPermutation.getState('vc:upper_bit') && e.block.below(1).permutation.getState('vc:upper_bit') == false) e.block.dimension.runCommand(`setblock ${vec3toString(e.block.below(1).location)} air destroy`)
            else if (e.destroyedBlockPermutation.getState('vc:upper_bit') == false && e.block.above(1).permutation.getState('vc:upper_bit')) e.block.dimension.runCommand(`setblock ${vec3toString(e.block.above(1).location)} air destroy`)
        }
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:campfire', {
        onTick: e => {
            if (e.block.permutation.getState("vc:lit") == false) return;
            e.block.dimension.runCommand(`particle minecraft:campfire${e.block.permutation.getState("vc:active_bit") ? '_tall' : ''}_smoke_particle ${vec3toString(e.block.center())}`)
            if (getRandomBool(5)) e.block.dimension.runCommand(`particle vc:cursed_campfire_lava_particle ${vec3toString(e.block.center())}`)
            e.block.dimension.runCommand(`playsound block.campfire.crackle @a ${vec3toString(e.block.center())}`)
        },
        onPlayerInteract: e => {
            if (e.block.permutation.getState("vc:lit")) {
                if (!e.player.getComponent("equippable").getEquipment("Mainhand").hasTag('is_shovel')) return;
                setPermutation(e.block, 'vc:lit', false)
                e.block.dimension.runCommand(`playsound random.fizz @a ${vec3toString(e.block.center())}`)
            } else {
                const item = e.player.getComponent("equippable").getEquipment("Mainhand");
                if (!(item.typeId == 'minecraft:flint_and_steel' || item.typeId == 'minecraft:fire_charge' || item.getComponent('minecraft:enchantable').hasEnchantment('fire_aspect'))) return;
                setPermutation(e.block, 'vc:lit', true)
                e.block.dimension.runCommand(`playsound fire.ignite @a ${vec3toString(e.block.center())}`)
            }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:coconut', {
        onPlayerDestroy: e => {
            if (e.player.getComponent("equippable").getEquipment("Mainhand")?.getComponent('minecraft:enchantable')?.hasEnchantment('silk_touch')) return;
            e.dimension.playSound('fall.nether_wart', e.block.location)
            e.block.setType('minecraft:air')
            e.block.dimension.spawnEntity('vc:coconut', e.block.center())
        },
        onPlayerInteract: e => {
            if (getRandomInt(0, 3) > 0) {
                e.dimension.playSound('dig.wood', e.block.location)
                SERVER.system.runTimeout(() => { setPermutation(e.block, 'vc:shake', 1) }, 1)
                SERVER.system.runTimeout(() => { setPermutation(e.block, 'vc:shake', 0) }, 2)
                SERVER.system.runTimeout(() => { setPermutation(e.block, 'vc:shake', 1) }, 3)
                SERVER.system.runTimeout(() => { setPermutation(e.block, 'vc:shake', 0) }, 4)
            } else {
                e.dimension.playSound('fall.nether_wart', e.block.location)
                e.block.setType('minecraft:air')
                e.block.dimension.spawnEntity('vc:coconut', e.block.center())
            }
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:melon_golem_spawn', {
        beforeOnPlayerPlace: e => {
            if (e.block.below(1).typeId == 'minecraft:snow' && e.block.below(2).typeId == 'minecraft:snow') {
                e.block.below(1).setType('minecraft:air')
                e.block.below(2).setType('minecraft:air')
                const newguy = e.dimension.spawnEntity('vc:melon_golem', e.block.below(2).center())
                SERVER.system.runTimeout(() => { if (e.block.typeId == 'vc:carved_mellon_speckled') newguy.runCommand(`replaceitem entity @s slot.armor.head 0 vc:carved_mellon_speckled`) }, 1)
                SERVER.system.runTimeout(() => { e.block.setType('minecraft:air') }, 2)
            }
        }
    });
    //initEvent.blockComponentRegistry.registerCustomComponent('vc:flower_cactus', {
    //    onTick: e => {
    //        e.block.dimension.getEntitiesAtBlockLocation(e.block.center()).forEach(mf => {
    //            damageWithCustomMessage(mf, 1, `%s was pricked to death, but pretty`)
    //        })
    //    },
    //    onPlace: e => {
    //        if (e.block.below(1).typeId == 'vc:flowering_cactus') {
    //            setPermutation(e.block.below(1), 'vc:has_flower', false)
    //        }
    //        if (e.block.below(-1).typeId == 'vc:flowering_cactus') {
    //            setPermutation(e.block, 'vc:has_flower', false)
    //        }
    //    },
    //    onPlayerDestroy: e => {
    //        if (e.block.below(1).typeId == 'vc:flowering_cactus') {
    //            setPermutation(e.block.below(1), 'vc:has_flower', true)
    //        }
    //    }
    //});
    initEvent.blockComponentRegistry.registerCustomComponent('vc:gyser_sand', {
        onRandomTick: e => {
            if (e.block.permutation.getState('vc:active_bit')) return;
            if (e.block.above(1).typeId == 'vc:water_blast') {
                gyserRetract(e)
            } else {
                gyserShoot(e)
            }
        },
        onEntityFallOn: e => {
            gyserShoot(e)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:water_blast', {
        onTick: e => {
            if (e.block.above(1).isAir) {
                if (getRandomInt(0, 5) == 0) e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run playsound random.waterfall @a[r=20] ~~~ 0.1 3.5`)
                e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run particle vc:gyser_particle ~~0.5~`)
                e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run particle vc:gyser_particle_top ~~0.5~`)
            }
            e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run execute as @e[r=0.6,type=!item,family=!inanimate] at @s run scriptevent vc:knockback 0 0 0 0.5`)
            e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run execute at @e[r=0.6,family=inanimate] as @e[r=0.6,family=inanimate] run tp @s ~~0.5~`)
            e.block.dimension.runCommand(`execute positioned ${vec3toString(e.block.center())} run execute at @e[r=0.6,type=item] as @e[r=0.6,type=item] run tp @s ~~0.5~`)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:rope', {
        onPlayerInteract: e => {
            const pitem = e.player.getComponent('minecraft:inventory').container.getItem(e.player.selectedSlotIndex)?.typeId
            if (pitem == 'vc:rope') {
                let blockdown = e.block
                while (blockdown.below(1).typeId == 'vc:rope') {
                    blockdown = blockdown.below(1)
                }
                blockdown = blockdown.below(1)
                if (!blockdown.isAir) return
                blockdown.setType('vc:rope')
                e.dimension.playSound('dig.cloth', blockdown.location);
                decripateStack(e.player);
            } else {
                const rope = (e.player.getComponent('minecraft:riding')?.entityRidingOn?.typeId == 'vc:climb_rope') ? e.player.getComponent('minecraft:riding')?.entityRidingOn : spawnRopeThingy(e.player)
                if (!rope || rope.nameTag == 'no') return;
                //console.log(rope.location)
                var ropeLoc = rope.dimension.getBlock(rope.location).center()
                //rope.applyKnockback(0,0,0,(e.block.location.y - ropeLoc.y)*0.01)
                const theRopeDist = e.block.center().y - ropeLoc.y - 1
                rope.nameTag = 'no'
                for (let i = 0; i <= Math.abs(theRopeDist) * 10; i++) {
                    SERVER.system.runTimeout(() => {
                        //rope.teleport({
                        //    x: lerp(ropeLoc.x, e.block.location.x, i*0.1),
                        //    y: lerp(ropeLoc.y, e.block.location.y, i*0.1),
                        //    z: lerp(ropeLoc.z, e.block.location.z, i*0.1)
                        //})
                        if (!rope) return;
                        if (!e.player) return;
                        if (i % 4 == 0) e.dimension.playSound('hit.cloth', e.player.location)
                        rope.runCommand(`tp @s ~~${(theRopeDist) < 0 ? -0.1 : 0.1}~`)
                        if (i >= Math.abs(theRopeDist) * 10) rope.nameTag = '';
                    }, i)
                }
                function spawnRopeThingy(entity) {
                    var theDude = e.dimension.spawnEntity('vc:climb_rope', { x: e.block.center().x, y: entity.getHeadLocation().y, z: e.block.center().z })
                    theDude.getComponent('minecraft:rideable').addRider(entity)
                    return theDude;
                }
                //rope.applyImpulse({
                //    x: 0,
                //    y: 0.1,
                //    z: 0
                //})
                //console.warn(`${ropeLoc.x - e.block.location.x}`)
                //console.warn(`${ropeLoc.y - e.block.location.y}`)
                //console.warn(`${ropeLoc.z - e.block.location.z}`)
            }
        },
        onPlayerDestroy: e => {
            e.block.setType('vc:rope')
            let bottomBlock = e.block;
            try { while (bottomBlock.below(1).typeId == 'vc:rope') {
                bottomBlock = bottomBlock.below(1)
            } } catch {}
            bottomBlock.setType('minecraft:air')
            //e.player.getComponent('minecraft:inventory').container.addItem(new SERVER.ItemStack('vc:rope_item', 1))
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:egg', {
        onRandomTick: e => {
            if (getRandomInt(0, 10) == 1) return;
            e.block.dimension.playSound(`block.turtle_egg.drop`, e.block.location)
            e.block.dimension.playSound(`mob.turtle_baby.born`, e.block.location)
            e.block.dimension.runCommand(`summon ${e.block.typeId.replace('_egg', '')} ${vec3toString(e.block.location)} 0 0 from_egg`)
            e.block.dimension.runCommand(`setblock ${vec3toString(e.block.location)} air destroy`)
        },
        onEntityFallOn: e => {
            e.block.dimension.playSound(`block.turtle_egg.break`, e.block.location)
            e.block.dimension.runCommand(`setblock ${vec3toString(e.block.location)} air destroy`)
        }
    });
    const checkOpaque = e => {
        if (e.block.north(1).typeId == e.block.typeId) setPermutation(e.block.north(1), 'vc:opaque', blockOpaques(e.block.north(1)))
        if (e.block.east(1).typeId == e.block.typeId) setPermutation(e.block.east(1), 'vc:opaque', blockOpaques(e.block.east(1)))
        if (e.block.west(1).typeId == e.block.typeId) setPermutation(e.block.west(1), 'vc:opaque', blockOpaques(e.block.west(1)))
        if (e.block.south(1).typeId == e.block.typeId) setPermutation(e.block.south(1), 'vc:opaque', blockOpaques(e.block.south(1)))
        if (e.block.above(1).typeId == e.block.typeId) setPermutation(e.block.above(1), 'vc:opaque', blockOpaques(e.block.above(1)))
        if (e.block.below(1).typeId == e.block.typeId) setPermutation(e.block.below(1), 'vc:opaque', blockOpaques(e.block.below(1)))
        function blockOpaques(block) {
            return (
                block.north(1).isSolid &&
                block.north(-1).isSolid &&
                block.east(1).isSolid &&
                block.east(-1).isSolid &&
                block.above(1).isSolid &&
                block.above(-1).isSolid)
        }
    }
    initEvent.blockComponentRegistry.registerCustomComponent('vc:opaques', {
        onPlace: checkOpaque
        //onPlayerDestroy: checkOpaque,
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:spew', {
        onTick: e => {
            e.dimension.spawnParticle('minecraft:campfire_smoke_particle', e.block.center())
            if (getRandomBool(2)) {
                e.dimension.playSound('block.campfire.crackle', e.block.center())
            }
            if (getRandomBool(5)) {
                for (let i = 1; i < 10; i++) {
                    e.dimension.spawnParticle('minecraft:lava_particle', e.block.center())
                }
            }
            harmList.forEach(mf => {
                //if (mf.dimension.getBlock(mf.location) == e.block) {
                damageWithCustomMessage(mf, getRandomInt(1, 2), '%s\'s bidet was too hot')
                //}
            })
        },
        onStepOn: e => {
            harmList.push(e.entity)
        },
        onFallOn: e => {
            harmList.push(e.entity)
        },
        onStepOff: e => {
            harmList.splice(harmList.indexOf(e.entity), 1)
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:termite_mound', {
        onPlace: e => {
            e.dimension.spawnEntity('vc:termite_mound', e.block.center())
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:gunpowder', {
        onTick: e => {
            fuse(e.block.north(1));
            fuse(e.block.north(-1));
            fuse(e.block.east(1));
            fuse(e.block.east(-1));
            fuse(e.block.below(1));
            e.block.setType('minecraft:air')
            e.dimension.playSound('firework.blast', e.block.center())
            e.dimension.spawnParticle('minecraft:lava_particle', { x: e.block.center().x, y: e.block.location.y + 0.2, z: e.block.center() }.z)
            e.dimension.spawnParticle('minecraft:lava_particle', { x: e.block.center().x, y: e.block.location.y + 0.2, z: e.block.center() }.z)
            e.dimension.spawnParticle('minecraft:gunpowder_smoke_particle', { x: e.block.center().x, y: e.block.location.y + 0.2, z: e.block.center() }.z)
            function fuse(block) {
                if (block.typeId == 'vc:gunpowder_line') {
                    setPermutation(block, 'vc:lit', true)
                }
                else if (block.below(1).typeId == 'vc:gunpowder_line') {
                    setPermutation(block.below(1), 'vc:lit', true)
                } else if (block.typeId == 'minecraft:tnt') {
                    block.setType('minecraft:air')
                    e.dimension.spawnEntity('minecraft:tnt', block.center())
                    e.dimension.playSound('random.fuse', block.center())
                }
            }
        },
        onPlayerInteract: e => {
            const item = e.player.getComponent("equippable").getEquipment("Mainhand");
            if (!(item.typeId == 'minecraft:flint_and_steel' || item.typeId == 'minecraft:fire_charge' || item.getComponent('minecraft:enchantable').hasEnchantment('fire_aspect'))) return;
            setPermutation(e.block, 'vc:lit', true)
            e.dimension.playSound('fire.ignite', e.block.center())
        }
    });
    const spawnentities = e => {

        let spawnee = e.block.dimension.spawnEntity(e.block.permutation.getState("vc:entity"), e.block.location);
        if (block.permutation.getState("vc:entity") == "vc:termite_mound") e.block.setType('vc:termite_mound')
        else e.block.setType('minecraft:air')
    }
    initEvent.blockComponentRegistry.registerCustomComponent('vc:spawner', {
        onPlace: spawnentities,
        onTick: spawnentities
    })
    initEvent.blockComponentRegistry.registerCustomComponent('vc:rail_conjunction', {
        onTick: e => {
            //console.log('test')
            for (const cart of e.dimension.getEntitiesAtBlockLocation(e.block.center())) {
                if (cart.typeId.includes('minecart')) {
                    const veloc = cart.getVelocity()
                    //cart.teleport({x: cart.location.x + veloc.x*4, y: cart.location.y + veloc.y*3, z: cart.location.z + veloc.z*4})
                    cart.applyImpulse(veloc)
                }
            };
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('vc:rooted_end_stone', {
        onStepOn: e => {
            e.dimension.spawnEntity('vc:chorus_chomper', e.entity.location)
        }
    });
    /*
    initEvent.blockComponentRegistry.registerCustomComponent('vc:', {});
    */
})
SERVER.world.afterEvents.playerPlaceBlock.subscribe(e => {
    //if (e.block.typeId == 'minecraft:lightning_rod' && e.block.below(1).typeId == 'vc:compressed_copper_block') {
    //    e.block.setType('air')
    //    e.block.below(1).setType('air')
    //    e.dimension.spawnEntity('vc:copper_golem', e.block.below(1).bottomCenter())
    //}
    if (e.block.typeId == 'vc:waterlily_lotus') {
        e.block.setType('water')
        e.block.above(1).setType('vc:waterlily_lotus')
    }
})
SERVER.world.beforeEvents.itemUseOn.subscribe(e => {
    if (e.block.hasTag('vc:stripper')) {
        SERVER.system.run(() => {
            if (!e.source.getComponent("equippable").getEquipment("Mainhand").hasTag('is_axe')) return;
            const dir = e.block.permutation.getState("minecraft:block_face")
            e.block.setType(`vc:stripped_${e.block.typeId.replace('vc:', '')}`)
            e.block.dimension.runCommand(`playsound use.wood @a ${vec3toString(e.block.location)} 1`)
            setPermutation(e.block, 'minecraft:block_face', dir)
        })

    } else if (e.block.typeId.includes('slab') && e.block.typeId.startsWith('vc:')) {
        if (e.source.getComponent("equippable").getEquipment("Mainhand").typeId != e.block.typeId) return;
        const dir = e.block.permutation.getState("minecraft:vertical_half")
        if ((dir == 'top' && e.blockFace == 'Down') || (dir == 'bottom' && e.blockFace == 'Up')) {
            e.cancel = true;
            SERVER.system.run(() => {
                e.block.setType(e.block.typeId.replace('slab', 'doubleslab'))
                e.block.dimension.runCommand(`playsound use.wood @a ${vec3toString(e.block.location)} 1`)
                decripateStack(e.source, 'Mainhand')
            })
        }
    }
})

export function getRedstonePowered(block) {
    if (block.getRedstonePower() != undefined) return block.getRedstonePower() > 0
    let wasSucessful = false
    if (block.north(1) != undefined) if (block.north(1).getRedstonePower() > 0 || block.north(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    if (block.east(1) != undefined) if (block.east(1).getRedstonePower() > 0 || block.east(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    if (block.south(1) != undefined) if (block.south(1).getRedstonePower() > 0 || block.south(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    if (block.west(1) != undefined) if (block.west(1).getRedstonePower() > 0 || block.west(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    if (block.above(1) != undefined) if (block.above(1).getRedstonePower() > 0 || block.above(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    if (block.below(1) != undefined) if (block.below(1).getRedstonePower() > 0 || block.below(1).permutation.getState("vc:lit_bit")) wasSucessful = true;
    return wasSucessful;
}

function getrstrength(block) {
    if (block.getRedstonePower() != undefined && block.getRedstonePower() != 0) return block.getRedstonePower()
    let rstrengh = [];
    rstrengh.push((block.north(1)?.getRedstonePower() || 0));
    rstrengh.push((block.east(1)?.getRedstonePower() || 0));
    rstrengh.push((block.south(1)?.getRedstonePower() || 0));
    rstrengh.push((block.west(1)?.getRedstonePower() || 0));
    rstrengh.push((block.above(1)?.getRedstonePower() || 0));
    rstrengh.push((block.below(1)?.getRedstonePower() || 0));
    return Math.max(...rstrengh)
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
export function gyserShoot(e) {
    let height = e.block.permutation.getState('vc:height')
    if (height == 0) height = getRandomInt(1, 7)
    for (let i = 1; i < height; i++) {
        if (e.block.above(i).isAir) e.block.above(i).setType('vc:water_blast')
        else break;
    }
}
export function gyserRetract(e) {
    setPermutation(e.block, 'vc:active_bit', false)
    if (e.block.above(1).typeId == 'vc:water_blast') breakChain(e.block.above(1));
    function breakChain(block) {
        if (block.typeId == 'vc:water_blast') block.dimension.runCommand(`setblock ${vec3toString(block.location)} air destroy`)
        else return;
        breakChain(block.above(1))
    }
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function (min, max) {
    return Math.min(Math.max(this, min), max);
};
SERVER.Block.prototype.vcIsSolid = function (allowSelf = '') {
    return (this.typeId != allowSelf) && !this.hasTag('non_solid') && (this.isSolid ||
        this.hasTag("minecraft:solid") ||
        this.hasTag("solid") ||
        this.typeId.includes('fence') ||
        this.typeId.includes('bars') ||
        (
            !this.typeId.startsWith('minecraft:') &&
            !this.hasTag('non_solid') &&
            !this.hasTag('plant')
        )
        || isBlockSolid(this))
};