import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { getRandomInt, getRandomFloat, setPermutation } from './utils';

SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
    //console.log(data.id)
    if (!data.sourceEntity) return;
    const entity = data.sourceEntity;
    if (data.id === "vc:knockback") {
        const dirX = Number(data.message.split(" ")[0]);
        const dirZ = Number(data.message.split(" ")[1]);
        let xzSpeed = Number(data.message.split(" ")[2])*10;
        let ySpeed = Number(data.message.split(" ")[3]);
        let loc = entity.location;
        try {
            if (!entity.isSneaking) entity.applyKnockback({x: dirX * xzSpeed, z: dirZ * xzSpeed}, ySpeed);
            else entity.applyKnockback({x: dirX * (xzSpeed * 0.25), z: dirZ * (xzSpeed * 0.25)}, ySpeed * 0.25);
            if (entity.typeId == 'minecraft:armor_stand') {
                xzSpeed *= 3.5;
                entity.runCommand(`tp @s ${loc.x + xzSpeed * 0.1 * dirX} ${loc.y + ySpeed} ${loc.z + xzSpeed * 0.1 * dirZ} ~~ true`)
            }
        } catch (error) {
            //console.error(error)
            xzSpeed *= 3.5;
            entity.runCommand(`tp @s ${loc.x + xzSpeed * 0.1 * dirX} ${loc.y + ySpeed} ${loc.z + xzSpeed * 0.1 * dirZ} ~~ true`)
        }
    };
    if (data.id === "vc:setOnFire") {
        entity.setOnFire(5);
    };
    if (data.id === "vc:nomnom") {
        entity.runCommand('playsound chorus.bite @a ~~~ 0.5')
        entity.runCommand('playsound dig.gravel @a ~~~')
        SERVER.system.runTimeout(() => {
            for (const owie of entity.dimension.getEntitiesAtBlockLocation(entity.location)) {
                damageWithCustomMessage(owie, 3, '%s became one with nature')
            }
        }, 0.33 * 20)
    };
    if (data.id === "vc:get_light") {
        const coolGuy = entity.dimension.spawnEntity("vc:get_light_level", entity.location);
        coolGuy.triggerEvent('minecraft:entity_spawned')
        const strength = 3 - Math.round((Number(coolGuy.getComponent('minecraft:variant')?.value) / 15) * 3);
        //SERVER.world.sendMessage(`${strength}, ${coolGuy.getComponent('minecraft:variant')?.value}`)
        entity.startItemCooldown('glareizer', strength * 20)
        coolGuy.remove()
    };
    if (data.id === "vc:callback_light") {
        const player = entity.dimension.getPlayers({ location: entity.location, maxDistance: 0.8 })[0];
        const strength = 3 - Math.round((Number(data.message) / 15) * 3);
        //SERVER.world.sendMessage(`${strength}`)
        player.startItemCooldown('glareizer', strength * 20)
    };
    if (data.id === "vc:random_block_test") {
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "_"]
        var result = 'minecraft:'
        var runs = 0
        tryBlock()
        function tryBlock() {
            runs++
            if (runs >= 90) { SERVER.system.runTimeout(_ => { entity.runCommand(`scriptevent vc:random_block_test`) }, 1); return };
            result = 'minecraft:'
            for (let i = 0; i < getRandomInt(5, 10); i++) {
                result += letters[getRandomInt(0, letters.length - 1)]
            }
            const block = data.sourceEntity.dimension.getBlock(data.sourceEntity.location)
            try { block.setType(result) } catch { tryBlock() }
        }
    };
    if (data.id === "vc:camera") {
        if (data.message == 'break')
            entity.runCommand(`camera @s clear`)
        else
            entity.runCommand(`camera @s set minecraft:free pos ${entity.getHeadLocation().x} ${entity.getHeadLocation().y} ${entity.getHeadLocation().z} rot ${entity.getRotation().x} ${entity.getRotation().y}`)
    }
    if (data.id === "vc:curse_this_campfire") {
        const block = data.sourceEntity.dimension.getBlock(data.sourceEntity.location)
        if (!block.typeId.includes('campfire')) return;
        entity.runCommand('playsound block.campfire.magic @a[r=15]')
        entity.runCommand('particle vc:magic_boom')
        const dir = block.permutation.getState('minecraft:cardinal_direction')
        block.setType('vc:cursed_campfire')
        setPermutation(block, 'minecraft:cardinal_direction', dir)
        entity.remove()
    }
    if (data.id === "vc:cocojuice") {
        let item = entity.getComponent("equippable").getEquipment("Mainhand");
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
    if (data.id === "vc:lore") {
        let item = entity.getComponent("equippable").getEquipment("Mainhand");
        item.setLore(data.message.split('\\n'))
        entity.getComponent("equippable").setEquipment("Mainhand", item)
    }
    if (data.id === "vc:eat_block") {
        const block = entity.dimension.getBlock(entity.location);
        let blockToBreak
        if (block.below(1).hasTag("wood")) blockToBreak = block.below(1);
        else if (block.north(1).hasTag("wood")) blockToBreak = block.north(1);
        else if (block.east(1).hasTag("wood")) blockToBreak = block.east(1);
        else if (block.south(1).hasTag("wood")) blockToBreak = block.south(1);
        else if (block.west(1).hasTag("wood")) blockToBreak = block.west(1);
        else if (block.above(1).hasTag("wood")) blockToBreak = block.above(1);
        if (!blockToBreak) return;
        let item = blockToBreak.getItemStack(1)
        entity.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 ${item.typeId}`)
        if (entity.nameTag.toLocaleLowerCase() == 'toymite') {
            entity.getComponent("inventory").container.addItem(item)
        }
        else entity.runCommand(`replaceitem entity @s slot.inventory 0 ${item.typeId}`)
        if (entity.nameTag.toLowerCase() != 'toymite') entity.runCommand(`event entity @s find_nest`)
        entity.runCommand(`playsound dig.wood @a ~~~`)
        blockToBreak.setType('minecraft:air')
        //blockToBreak.dimension.runCommand(`setblock ${blockToBreak.location.x} ${blockToBreak.location.y} ${blockToBreak.location.z} air destroy`)
    }
    if (data.id === "vc:termite_mound") {
        entity.getComponent('rideable').getRiders().forEach((mite) => {
            const miteContainer = mite.getComponent("inventory").container;
            const entityContainer = entity.getComponent("inventory").container;
            if (!entityContainer) return;
            for (let i = 0; i < 1; i++) {
                let item = miteContainer.getItem(i);
                if (!item) continue;
                entityContainer.addItem(item)
                miteContainer.setItem(i, new SERVER.ItemStack("minecraft:air", 1))
                mite.runCommand(`replaceitem entity @s slot.weapon.mainhand 0 air`)
            }
        });
    }
    if (data.id == 'vc:charge_block') {
        entity.dimension.spawnEntity('vc:charge_block', entity.getBlockFromViewDirection().block.bottomCenter())
    }
    if (data.id === "vc:drop_item") {
        let entityContainer = entity.getComponent("inventory").container;
        if (!entityContainer) return;
        entity.runCommand(`playsound random.click @a ~~~ 1 1.2`)
        for (let i = 0; i < entityContainer.size; i++) {
            let item = entityContainer.getItem(i);
            console.warn(`checked slot ${i}`)
            if (item != undefined) {
                let spawnItem = item;
                if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
                item.amount = item.amount - 1;
                entityContainer.setItem(i, item);
                spawnItem.amount = 1;
                entity.dimension.spawnItem(spawnItem, {
                    x: entity.location.x,
                    y: entity.location.y + 0.5,
                    z: entity.location.z,
                });
                entity.runCommand(`playsound random.click @a ~~~ 1 1`)
                return
            }
        }
    };
    if (data.id === "vc:dispense_item") {
        let entityContainer = entity.getComponent("inventory").container;
        if (!entityContainer) return;
        entity.runCommand(`playsound random.click @a ~~~ 1 1.2`)
        for (let i = 0; i < entityContainer.size; i++) {
            let item = entityContainer.getItem(i);
            //console.warn(`checked slot ${i}`)
            if (item != undefined) {
                let spawnItem = item;
                //entity.lookAtBlock(entity.dimension.getBlock({ x: entity.location.x, y: entity.location.y + 1, z: entity.location.z }))
                //entity.useItemInSlot(i)
                if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
                item.amount = item.amount - 1;
                entityContainer.setItem(i, item);
                spawnItem.amount = 1;
                entity.runCommand(`playsound random.click @a ~~~ 1 1`)
                dispenseItem(spawnItem, entity, i)
                return
            }
        }
    };
});
function dispenseItem(item, entity, slot) {
    if (item.typeId.endsWith('_spawn_egg')) {
        entity.runCommand(`summon ${item.typeId.replace('_spawn_egg', '')}`)
    }
    else if (item.typeId.endsWith('minecart')) {
        entity.runCommand(`summon ${item.typeId}`)
    }
    else if (item.typeId == 'minecraft:arrow' || item.typeId == 'minecraft:snowball' || item.typeId == 'minecraft:slime_ball' || item.typeId == 'minecraft:egg' || item.typeId == 'minecraft:wind_charge' || item.typeId == 'vc:rotten_tomato' || item.typeId == 'minecraft:experience_bottle' || item.typeId == 'minecraft:splash_potion' || item.typeId == 'minecraft:lingering_potion' || item.typeId == 'minecraft:fire_charge') {
        let itemName = item.typeId
        if (item.typeId == 'minecraft:experience_bottle') itemName = 'xp_bottle'
        if (item.typeId == 'minecraft:lingering_potion') itemName = 'minecraft:splash_potion'
        if (item.typeId == 'minecraft:fire_charge') itemName = 'minecraft:fireball'
        if (item.typeId == 'minecraft:slime_ball') itemName = 'vc:slime_ball'
        if (item.typeId == 'minecraft:wind_charge') itemName = 'minecraft:wind_charge_projectile'
        if (item.typeId == 'minecraft:trident') itemName = 'minecraft:thrown_trident'
        const spawnEntity = entity.dimension.spawnEntity(itemName, {
            x: entity.location.x,
            y: entity.location.y + 2,
            z: entity.location.z,
        });
        spawnEntity.addEffect('speed', 100, { amplifier: 4 })
        const projectileComp = spawnEntity.getComponent('minecraft:projectile');
        projectileComp?.shoot({ x: 0, y: 1, z: 0 });
    }
    else if (item.typeId.endsWith('_bucket')) {
        if (!entity.dimension.getBlock(entity.location).above(1).isAir) return;
        let liquid = ''
        let nentity = ''
        if (item.typeId == 'minecraft:lava_bucket') liquid = 'minecraft:flowing_lava'
        if (item.typeId == 'minecraft:water_bucket') liquid = 'minecraft:flowing_water'
        if (item.typeId == 'minecraft:axolotl_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:axolotl' }
        if (item.typeId == 'minecraft:cod_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:cod' }
        if (item.typeId == 'minecraft:powder_snow_bucket') liquid = 'minecraft:powder_snow'
        if (item.typeId == 'minecraft:pufferfish_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:pufferfish' }
        if (item.typeId == 'minecraft:salmon_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:salmon' }
        if (item.typeId == 'minecraft:tadpole_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:tadpole' }
        if (item.typeId == 'minecraft:tropical_fish_bucket') { liquid = 'minecraft:flowing_water'; nentity = 'minecraft:tropical_fish' }
        if (liquid != '') {
            const block = entity.dimension.getBlock(entity.location).above(1);
            block.setType(liquid)
        }
        if (nentity != '') {
            const spawnEntity = entity.dimension.spawnEntity(nentity, {
                x: entity.location.x,
                y: entity.location.y + 2,
                z: entity.location.z,
            });
        }
        if (liquid != '' || nentity != '') entity.getComponent("inventory").container.setItem(slot, new SERVER.ItemStack('minecraft:bucket', 1));
        else entity.dimension.spawnItem(item, { x: entity.location.x, y: entity.location.y + 0.5, z: entity.location.z, });
    }
    else if (item.typeId == 'minecraft:bucket') {
        const block = entity.dimension.getBlock(entity.location).above(1);
        if (block.typeId == 'minecraft:flowing_water' || block.typeId == 'minecraft:water')
            entity.getComponent("inventory").container.setItem(slot, new SERVER.ItemStack('minecraft:water_bucket', 1));
        if (block.typeId == 'minecraft:flowing_lava' || block.typeId == 'minecraft:lava')
            entity.getComponent("inventory").container.setItem(slot, new SERVER.ItemStack('minecraft:lava_bucket', 1));
        if (block.typeId == 'minecraft:powder_snow')
            entity.getComponent("inventory").container.setItem(slot, new SERVER.ItemStack('minecraft:powder_snow_bucket', 1));
        block.setType('minecraft:air')
    }
    else {
        entity.dimension.spawnItem(item, {
            x: entity.location.x,
            y: entity.location.y + 0.5,
            z: entity.location.z,
        });
    }
}
export function damageWithCustomMessage(entity, amount, message) {
    if (entity.getComponent('health').currentValue <= 0) return;
    entity.applyDamage(amount)
    const died = entity.getComponent('health').currentValue <= 0;
    if (died && entity.typeId == 'minecraft:player') {
        SERVER.world.sendMessage(message.replace('%s', entity.nameTag))
    }
}
SERVER.world.afterEvents.projectileHitBlock.subscribe(e => {
    const blockHit = e.getBlockHit();
    const particleLoc = {
        x: blockHit.block.location.x + blockHit.faceLocation.x,
        y: blockHit.block.location.y + blockHit.faceLocation.y,
        z: blockHit.block.location.z + blockHit.faceLocation.z
    }

    if (e.projectile.typeId == 'vc:rotten_tomato') {
        const molang = new SERVER.MolangVariableMap();
        molang.setFloat('variable.dir', (
            blockHit.face == 'North' ? 2 :
                blockHit.face == 'East' ? 1 :
                    blockHit.face == 'South' ? 0 :
                        blockHit.face == 'West' ? 3 :
                            blockHit.face == 'Down' ? 5 : 4
        ))
        e.dimension.spawnParticle('vc:tomatosplat', particleLoc, molang)
        e.dimension.spawnParticle('vc:tomatosplash', particleLoc)
        e.dimension.playSound('random.splat', particleLoc, { pitch: getRandomFloat(0.7, 1.3) })
    } else if (e.projectile.typeId == 'vc:tomato_golden') {
        e.dimension.spawnParticle('vc:goldtomatosplat', particleLoc)
        e.dimension.playSound('random.splat_gold', particleLoc, { pitch: getRandomFloat(0.7, 1.3) })
        e.dimension.spawnItem(new SERVER.ItemStack("minecraft:gold_nugget", getRandomInt(2, 8)), particleLoc)
    }
})
SERVER.world.afterEvents.projectileHitEntity.subscribe(e=>{
    const blockHit = e.getEntityHit();
    if (e.projectile.typeId == 'vc:tomato_golden') {
        e.dimension.spawnParticle('vc:goldtomatosplat', e.location)
        e.dimension.playSound('random.splat_gold', e.location, { pitch: getRandomFloat(0.7, 1.3) })
        e.dimension.spawnItem(new SERVER.ItemStack("minecraft:gold_nugget", getRandomInt(2, 8)), e.location)
    }
})
SERVER.system.runTimeout(() => {
    if (SERVER.world.getTimeOfDay() >= 167 && SERVER.world.getTimeOfDay() <= 12542) return;
    if (SERVER.world.getDay() % 4 != 0) return;
    let players = SERVER.world.getDimension("overworld").getPlayers();
    for (const bro of players) {
        bro.dimension.spawnParticle('vc:firefly', bro.location)
    }
}, 2);
//SERVER.system.runInterval(() => {
//    let players = SERVER.world.getDimension("overworld").getPlayers();
//    players.forEach(bro => {
//        let item = bro.getComponent("equippable").getEquipment("Mainhand");
//        if (item != undefined && item.typeId == 'vc:glareizer')
//            bro.runCommand('scriptevent vc:get_light')
//    })
//}, 1);
//function getRandomInt(max) {
//    return Math.floor(Math.random() * max);
//}

//SERVER.world.afterEvents.itemCompleteUse.subscribe((data) => {
//    if (data.itemStack.typeId == 'vc:cocojuice') {
//        data.source.runCommand('scriptevent vc:cocojuice')
//    }
//    if (data.itemStack.typeId == 'vc:aloe_vera') {
//        data.source.addEffect('fire_resistance', 20)
//    }
//    if (data.itemStack.typeId == 'vc:aloe_vera_golden') {
//        data.source.addEffect('resistance', 20, { amplifier: 255 })
//    }
//})