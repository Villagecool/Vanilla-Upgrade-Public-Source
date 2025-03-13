import * as SERVER from '@minecraft/server';
//import { system } from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { setPermutation, getRandomInt, offsetLocation, setVectorFloats, decripateStack, vec3toString, lerp, getRandomBool, damage_item, getRandomFloat } from './utils.js'
import { damageWithCustomMessage } from './entity_functions.js'

const effectsList = [
    {item: 'vc:aloe_vera_golden',       effect: 'resistance',       duration: 1,    amplifier: 1},
    {item: 'vc:aloe_vera',              effect: 'fire_resistance',  duration: 1,    amplifier: 255},
    {item: 'vc:chocolate_milk_bucket',  effect: 'clear' },
    {item: 'vc:hot_chocolate_bucket',   effect: 'clear' },
    {item: 'vc:milk_bottle',            effect: 'clear' },
    {item: 'vc:potion_of_blindness_ii', effect: 'blindness',        duration: 240,  amplifier: 4},
    {item: 'vc:potion_of_blindness',    effect: 'blindness',        duration: 90,   amplifier: 4},
    {item: 'vc:potion_of_levitation_ii',effect: 'levitation',       duration: 240,  amplifier: 4},
    {item: 'vc:potion_of_levitation',   effect: 'levitation',       duration: 90,   amplifier: 4}
    /*
    {item: '', effect: '', duration: 10, amplifier: 1},
    */
]
function soYeahTheSplashPotionsHitAndEverythingVeryCoolIndeed(e) {
    if (e.projectile.typeId != 'vc:custom_splash_potion' && e.projectile.typeId != 'vc:custom_lingering_potion') return;
    const variant = e.projectile.getComponent('minecraft:variant').value 
    const markvariant = e.projectile.getComponent('minecraft:mark_variant').value 
    e.projectile.runCommand(`function potion_break`)
    e.projectile.runCommand(`particle vc:splash_particle_${variant == 0 ? 'blindness' : 'levitation'} ~~0.3~`)
    e.projectile.runCommand(`effect @e[r=2.5] ${markvariant == 2 ? 'clear' : markvariant == 0 || markvariant == 1 ? 'blindness' : 'levitation'} ${markvariant == 0 || markvariant == 3 ? '60' : markvariant == 1 || markvariant == 4 ? '240' : ''}`)
    if (e.projectile.typeId == 'vc:custom_lingering_potion') {
        //https://wiki.bedrock.dev/entities/introduction-to-aec
        e.projectile.runCommand(`structure load ${markvariant == 2 ? 'milk' : markvariant == 0 || markvariant == 1 ? 'blineness' : 'levi'}${markvariant == 1 || markvariant == 4 ? 'II' : ''}aoe ~~0.3~`)
        //console.log(`structure load ${markvariant == 2 ? 'clear' : markvariant == 0 || markvariant == 1 ? 'blineness' : 'levi'}${markvariant == 1 || markvariant == 4 ? 'II' : ''}aoe ~~0.3~`)
    }
    e.projectile.remove()
    
}
SERVER.world.afterEvents.projectileHitBlock.subscribe(e => soYeahTheSplashPotionsHitAndEverythingVeryCoolIndeed(e))
SERVER.world.afterEvents.projectileHitEntity.subscribe(e => soYeahTheSplashPotionsHitAndEverythingVeryCoolIndeed(e))
SERVER.world.afterEvents.itemCompleteUse.subscribe(e => {
    //console.log('item finished being used') I added a whole bunch of logs cus I couldnt figure out why the potions werent working (I wasnt suppose to capitalize the "_ii")
    if (e.itemStack.hasTag('vc:gives_effect')) {
        //console.log('it has the give effect thing')
        effectsList.forEach((alrightyThen) => {
            //console.log(`its is not a ${alrightyThen.item}, but a ${e.itemStack.typeId}`)
            if (alrightyThen.item == e.itemStack.typeId) {
                //console.log(`its a ${e.itemStack.typeId}`)
                if (alrightyThen.effect == 'clear') {e.source.runCommand('effect @s clear'); return;}
                e.source.addEffect(alrightyThen.effect, alrightyThen.duration*20, {amplifier: alrightyThen.amplifier});
                //console.log('added the effect')
                return;
            }
        })
    }
})
SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent('vc:gives_effect', {
        onConsume: e => {
            console.log('its the custom component')
            effectsList.forEach((alrightyThen) => {
                if (alrightyThen.item == e.itemStack.typeId) {
                    if (alrightyThen.effect == 'clear') {e.source.runCommand('effect @s clear'); return;}
                    e.source.addEffect(alrightyThen.amplifier, alrightyThen.duration, {amplifier: alrightyThen.amplifier});
                    return;
                }
            })
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:projectile', {
        onUse: e=> {
            const type = e.itemStack.typeId.includes('splash_potion') ? 'vc:custom_splash_potion' : e.itemStack.typeId;
            player.dimension.spawnEntity(type, {
                x: player.getHeadLocation().x + player.getViewDirection().x,
                y: player.getHeadLocation().y + player.getViewDirection().y,
                z: player.getHeadLocation().z + player.getViewDirection().z
            }).getComponent('minecraft:projectile')?.shoot(player.getViewDirection());
            decripateStack(player);
            e.source.dimension.playSound('random.bow', e.source.location, {pitch: 0.5})
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:cocojuice', {
        onConsume: e => {
            const item = e.itemStack;
            const entity = e.source;
            let lore = item.getLore()[0];
            if (!lore || lore.length < 1) return;
            switch (Number(lore.replace('§9Spiked', '').replace('§', ''))) {
                case 0: //apple
                    console.warn('apple')
                    const prevHealth = entity.getComponent('health').currentValue;
                    entity.getComponent('health').resetToMaxValue();
                    const maxHealth = entity.getComponent('health').currentValue;
                    for (let i = 0; i < maxHealth - (prevHealth * Math.random()); i++) {
                        SERVER.system.runTimeout(() => {
                            entity.applyDamage(1);
                        }, i * 50)
                    }
                    break;
                case 1: //banana lookin thing
                    console.warn('banana lookin thing')
                    entity.addEffect('speed', 100, { amplifier: 4 })
                    SERVER.system.runTimeout(() => { entity.addEffect('slowness', 100, { amplifier: Math.random() * 10 }) }, 100)
                    break;
                case 2: //mudfruit
                    console.warn('mudfruit')
                    entity.addEffect('haste', 1000, { amplifier: 4 })
                    entity.addEffect('hunger', 1000, { amplifier: 10 * Math.random() })
                    //entity.addExperience(-1);
                    //if (entity.getTotalXp() > 0) entity.dimension.spawnItem(new SERVER.ItemStack('vc:crystalized_experience', 1), {
                    //    x: entity.getHeadLocation().x + entity.getViewDirection().x,
                    //    y: entity.getHeadLocation().y + entity.getViewDirection().y,
                    //    z: entity.getHeadLocation().z + entity.getViewDirection().z
                    //});
                    entity.addEffect('oozing', 1000)
                    break;
                case 3: //maganset
                    var theGamble = Math.random();
                    console.warn('MAGANSET')
                    entity.addEffect('strength', (50 * theGamble) * 20, { amplifier: 20 })
    
                    SERVER.system.runTimeout(() => {
                        entity.addEffect('blindness', (50 * (1 - theGamble)) * 20)
                        entity.addEffect('slowness', (50 * (1 - theGamble)) * 20)
                    }, (50 * theGamble) * 20)
                    break;
                case 4: //melon
                    console.warn('melon')
                    let melonSeed = entity.dimension.spawnEntity('vc:melon_seed', {
                        x: entity.getHeadLocation().x + entity.getViewDirection().x,
                        y: entity.getHeadLocation().y + entity.getViewDirection().y,
                        z: entity.getHeadLocation().z + entity.getViewDirection().z
                    });
                    const projectileComp = melonSeed.getComponent('minecraft:projectile');
                    projectileComp?.shoot(entity.getViewDirection());
                    break;
                case 5: //spaticus
                    console.warn('spaticus')
                    entity.addEffect('slow_falling', 1000, { amplifier: 4 })
                    entity.addEffect('weakness', 1000, { amplifier: 10 * Math.random() })
                    break;
                case 6: //charhood
                    console.warn('charhood')
                    entity.addEffect('jump_boost', 1000, { amplifier: 4 })
                    entity.addEffect('slowness', 1000, { amplifier: 10 * Math.random() })
                    break;
                case 7: //tomato
                    console.warn('TOMATO')
                    entity.addEffect('regeneration', 60 * 20, { amplifier: Math.round(2 + Math.random()) })
                    entity.setOnFire(60);
                    break;
                case 8: //pineapple
                    console.warn('pineapple')
                    entity.addEffect('water_breathing', 1000)
                    entity.addEffect('nausea', 1000)
                    break;
                case 9: //chorus fruit
                    console.warn('chorus')
                    entity.tryTeleport({
                        x: entity.location.x + getRandomInt(10) - 5,
                        y: entity.location.y + 3,
                        z: entity.location.z + getRandomInt(10) - 5
                    })
                    break;
    
            }
        }
    })
    initEvent.itemComponentRegistry.registerCustomComponent('vc:copper_wrench', {
        onUseOn: e => {
            const coolioBeans = SERVER.world.structureManager.createFromWorld(
                'vc:huhzers', 
                e.block.dimension, 
                e.block.location,
                e.block.location
            )
            SERVER.world.structureManager.place(coolioBeans, e.block.dimension, e.block.location, {rotation: 'Rotate270'})
            SERVER.world.structureManager.delete(coolioBeans)
            e.source.playSound('random.wrench')
        },
        onHitEntity: e => {
            e.hitEntity.dimension.playSound('random.clang', e.hitEntity.location, {pitch: getRandomFloat(0.8,1.2)})
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:rotten_saddle', {
        onUse: e => {
            e.source.playAnimation('animation.player.use_saddle')
            e.source.getComponent("equippable").setEquipment('Mainhand', damage_item(e.itemStack))
            e.source.dimension.playSound('mob.horse.leather', e.source.getHeadLocation())
            SERVER.system.runTimeout(() => {
            e.source.dimension.spawnParticle('vc:horse_spawn_ray', e.source.getHeadLocation())
            e.source.dimension.playSound('random.explode_big', e.source.getHeadLocation())
            e.source.runCommand(`ride @s summon_ride zombie_horse reassign_rides vc:summon`)
            e.source.runCommand(`inputpermission set @s movement enabled`)
            e.source.runCommand(`camerashake add @a[r=10] 0.6 0.75`) }, 0.63*20)
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:xp_scroll', {
        onUse: e => {
            e.source.addLevels(1)
            e.source.playSound(`item.book.page_turn`)
            decripateStack(e.source)
        }
    });
    
    initEvent.itemComponentRegistry.registerCustomComponent('vc:goat_horn', {
        onUse: e => {
            //e.source.dimension.playSound('horn.call.roll', e.source.location)
        }
    });
    initEvent.itemComponentRegistry.registerCustomComponent('vc:wither_bone_meal', {
        onUseOn: e => {
            if (e.block.typeId != 'minecraft:nether_wart') return;
            if (e.block.permutation.getState('age') >= 3) return;
            setPermutation(e.block, 'age', e.block.permutation.getState('age') + 1) 
            e.block.dimension.runCommand(`playsound item.bone_meal.use @a ${vec3toString(e.block.location)} 1`)
            e.block.dimension.runCommand(`particle minecraft:crop_growth_emitter ${vec3toString(e.block.location)}`)
            decripateStack(e.source)
        }
    });
    /*
    initEvent.itemComponentRegistry.registerCustomComponent('vc:', {});
    */
})
SERVER.world.afterEvents.itemStartUse.subscribe(e => {
    if (e.itemStack.typeId == 'vc:goat_horn_roll') {
        e.source.dimension.playSound('horn.call.roll', e.source.location)
        e.source.runCommandAsync(`playanimation @s animation.weapons.bow_and_arrow root 204 "!query.is_using_item"`)
    }
})
SERVER.world.afterEvents.itemStopUse.subscribe(e => {
    if (e.itemStack.typeId == 'vc:goat_horn_roll') {
        e.source.runCommand(`stopsound @a horn.call.roll`)
    }
})
SERVER.world.afterEvents.itemUseOn.subscribe(e => {
    if (e.block.typeId != 'minecraft:jukebox') return
    if (e.itemStack.typeId == 'vc:music_disc_subhour') e.source.runCommand("title @a[r=15] actionbar §dNow Playing: Clorate 21 - Subhour")
    if (e.itemStack.typeId == 'vc:music_disc_mist') e.source.runCommand("title @a[r=15] actionbar §dNow Playing: For_Builds - Mist")
})
SERVER.world.afterEvents.entityHurt.subscribe(e => {
    if (e.hurtEntity.typeId == 'minecraft:player' && e.damageSource.damagingEntity != undefined) {
        if (e.hurtEntity.getComponent("equippable").getEquipment('Mainhand')?.typeId == 'vc:totem_of_illusion' || e.hurtEntity.getComponent("equippable").getEquipment('Offhand')?.typeId == 'vc:totem_of_illusion') {
            const slots = ["Mainhand", "Offhand", "Head", "Legs", "Chest", "Feet"]
            e.hurtEntity.dimension.spawnParticle(`vc:illusion_totem_pop`, e.hurtEntity.location)
            e.hurtEntity.dimension.spawnParticle(`vc:totem_2_animation`, e.hurtEntity.location)
            e.hurtEntity.dimension.playSound(`random.totem2`, e.hurtEntity.location)
            decripateStack(e.hurtEntity, e.hurtEntity.getComponent("equippable").getEquipment('Offhand')?.typeId == 'vc:totem_of_illusion' ? 'Offhand' : 'Mainhand');
            for (let i = 0; i < 5; i++) {

                SERVER.system.runTimeout(() => {
                    const spawnee = e.hurtEntity.dimension.spawnEntity('vc:playerclone', {
                        x: e.hurtEntity.location.x + getRandomInt(-5, 5),
                        y: e.hurtEntity.location.y,
                        z: e.hurtEntity.location.z + getRandomInt(-5, 5),
                    });
                    spawnee.getComponent(SERVER.EntityComponentTypes.Tameable).tame(e.hurtEntity);
                    spawnee.runCommand(` particle vc:clone_spawn ~~~`)
                    spawnee.runCommand(`particle vc:clone_spawn_box ~~~`)
                    spawnee.runCommand(`particle vc:clone_spawn_pyramid ~~~`)
                    SERVER.system.runTimeout(() => {
                        for (let j = 0; j < slots.length - 1; j++) {
                        spawnee.runCommand(`replaceitem entity @s slot.${slots[j].endsWith('hand') ? 'weapon' : 'armor'}.${slots[j].toLowerCase()} 0 ${e.hurtEntity.getComponent("equippable").getEquipment(slots[j])?.typeId || 'air'}`)
                        //SERVER.world.sendMessage(`replaceitem entity @s slot.${slots[j] == 'Mainhand' ? 'weapon' : 'armor'}.${slots[j].toLowerCase()} 0 ${e.hurtEntity.getComponent("equippable").getEquipment(slots[j])?.typeId || 'air'}`)
                    }}, 20)
                }, i * 3)
            }
        }
    }
})