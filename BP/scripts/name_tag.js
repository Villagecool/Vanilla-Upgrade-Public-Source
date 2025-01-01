import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { damage_item, decripateStack } from './utils.js'
SERVER.world.afterEvents.itemUse.subscribe(event => {
    if (event.itemStack.typeId === "minecraft:name_tag") {

        //console.warn('rightClicked ' + event.itemStack.typeId)
        const item = event.itemStack;

        let popUp = new UI.ModalFormData();
        popUp.title("vcNameTagUi");
        popUp.textField("Set Name: ", "Name");

        popUp.show(event.source).then((r) => {
            if (r.canceled) return;
            item.nameTag = r.formValues[0].replace('\\n', '\n');
            event.source.getComponent('minecraft:inventory').container.setItem(event.source.selectedSlotIndex, item);

        }).catch((e) => {
            console.error(e, e.stack);
        })
    }
    if (event.itemStack.typeId === "minecraft:slime_ball") {

        //console.warn('rightClicked ' + event.itemStack.typeId)
        let item = event.itemStack;
        const player = event.source;
        //player.runCommand(`execute anchored eyes run summon vc:slime_ball ^^^2`)
        let slimeball = player.dimension.spawnEntity('vc:slime_ball', {
            x: player.getHeadLocation().x + player.getViewDirection().x,
            y: player.getHeadLocation().y + player.getViewDirection().y,
            z: player.getHeadLocation().z + player.getViewDirection().z
        });
        decripateStack(player)
        //console.warn(`${player.getViewDirection().x},${player.getViewDirection().y},${player.getViewDirection().z}`);
        if (!slimeball) {
            console.warn("no slimeball found")
            return
        }
        const projectileComp = slimeball.getComponent('minecraft:projectile');
        projectileComp?.shoot(player.getViewDirection());
    }
    if (event.itemStack.typeId === "minecraft:paper") {
        let item = event.itemStack;
        const player = event.source;
        let offitem = player.getComponent("equippable").getEquipment("Offhand");
        if (!offitem || offitem.typeId != 'vc:frozen_feather') return;
        if (player.getItemCooldown('frozenFeather') > 0) return;
        player.getComponent("equippable").setEquipment("Offhand", damage_item(offitem));
        player.startItemCooldown('frozenFeather', 200)
        player.playAnimation('animation.player.write')
        player.playSound('block.cartography_table.use')
        for (let i = 0; i < 5; i++) {
            SERVER.system.runTimeout(() => {
                player.playSound('block.cartography_table.use')
                if (i == 3) player.playSound('random.crystalize_xp')
            }, i * 10)
        }
        SERVER.system.runTimeout(() => {
            player.addExperience(-1);
            if (player.getTotalXp() > 0) player.dimension.spawnItem(new SERVER.ItemStack('vc:crystalized_experience', 1), {
                x: player.getHeadLocation().x + player.getViewDirection().x,
                y: player.getHeadLocation().y + player.getViewDirection().y,
                z: player.getHeadLocation().z + player.getViewDirection().z
            });
        }, 5 * 10)
    }
})


SERVER.world.afterEvents.itemUseOn.subscribe(e => {
    if (e.itemStack.typeId === "minecraft:gunpowder") {
        if (e.blockFace == "Up") {
            if (!e.block.above(1).isAir) return;
            e.block.above(1).setType('vc:gunpowder_line')
            decripateStack(e.source)
        }
    }
})