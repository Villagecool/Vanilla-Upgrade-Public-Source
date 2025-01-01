import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

SERVER.world.beforeEvents.playerBreakBlock.subscribe((data) => {
    let player = data.player;
    let block = player.dimension.getBlock(data.block);
    if (block.typeId != 'minecraft:mob_spawner') return;
    let badOmen = player.getEffect('bad_omen');
    if (badOmen != undefined) {
        SERVER.system.run(() => {
            //player.addEffect('giantOmen', 900, { amplifier: 1 });
            player.runCommand('effect @s bad_omen 0 0');
            player.runCommand('scriptevent vc:addtimer giant_omen 5');
            player.runCommand(`particle vc:giant_omen_particle ${block.location.x} ${block.location.y} ${block.location.z}`)
            player.runCommand(`playsound effects.giant_omen @s ${block.location.x} ${block.location.y}.5 ${block.location.z}`)
        })
    }
});
SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (data.id === "vc:shockwave") {
        if (!data.sourceEntity) return;
        let entity = data.sourceEntity;
        if (!entity.isSneaking) entity.applyKnockback(Math.random() - 0.5, Math.random() - 0.5, 0, Number(data.message));
        else entity.applyKnockback(0, 0, 0, Number(data.message) * 0.2);
    };
    if (data.id === "vc:xp_bomb") {
        if (!data.sourceEntity) return;
        let entity = data.sourceEntity;
        entity.runCommand('playsound firework.blast @a ~~8~')
        entity.runCommand('particle vc:giant_explode ~~8~')
        let saddle = entity.dimension.spawnItem(new SERVER.ItemStack('vc:rotten_saddle', 1), { x: entity.location.x, y: entity.location.y + 8, z: entity.location.z, });
        for (let i = 0; i < 200; i++) {
            let xp = entity.dimension.spawnEntity('minecraft:xp_orb', { x: entity.location.x, y: entity.location.y + 8, z: entity.location.z, });
            if (i % 16 != 0) continue;
            let flesh = entity.dimension.spawnItem(new SERVER.ItemStack('minecraft:rotten_flesh', 1), { x: entity.location.x, y: entity.location.y + 8, z: entity.location.z, });
            //xp.applyKnockback(Math.random() - 0.5, Math.random() - 0.5, 0, 0);
        }
    };
    if (data.id === "vc:addtimer") {
        if (!data.sourceEntity) return;
        let entity = data.sourceEntity;
        let reason = data.message.split(' ')[0]
        let time = data.message.split(' ')[1] * 20
        entity.runCommand(`tag @s add timer-${time}`);
        entity.runCommand(`tag @s add timerFor-${reason}`);
        //xp.applyKnockback(Math.random() - 0.5, Math.random() - 0.5, 0, 0);
    }
    if (data.id === "vc:effectCallback" && data.message === 'giant_omen') {
        let entity = data.sourceEntity;
        entity.runCommand(`tag @s remove giant_omen`);
        let BIGBOI = entity.dimension.spawnEntity('vc:giant', { x: entity.location.x, y: entity.location.y, z: entity.location.z, });
        BIGBOI.runCommand(`/spreadplayers ~~ 20 100 @s`)
    }
    if (data.id === "vc:effect_countdown") {
        if (!data.sourceEntity) return;
        let entity = data.sourceEntity;
        const tags = entity.getTags();
        let curTag = 'cancel'
        let reason = 'cancel'
        for (let i = 0; i < tags.length; i++) {
            if (tags[i].startsWith('timer-')) curTag = tags[i];
            if (tags[i].startsWith('timerFor-')) reason = tags[i];
            //xp.applyKnockback(Math.random() - 0.5, Math.random() - 0.5, 0, 0);
        }
        if (curTag == undefined || reason == undefined) return;
        let ticksLeft = Number(curTag.replace('timer-', ''))
        reason = reason.replace('timerFor-', '')
        //console.log(`${curTag}, ${ticksLeft}`)
        entity.runCommand(`tag @s remove timer-${ticksLeft}`);
        if (ticksLeft != 1) entity.runCommand(`tag @s add timer-${ticksLeft - 1}`);
        else {
            entity.runCommand(`tag @s remove timerFor-${reason}`);
            if (reason == 'giant_omen') {
                entity.runCommand(`tag @s remove giant_omen`);
                let BIGBOI = entity.dimension.spawnEntity('vc:giant', { x: entity.location.x, y: entity.location.y, z: entity.location.z, });
                BIGBOI.runCommand(`/spreadplayers ~~ 20 100 @s`)
            }
            console.warn(tags['giant_omen'])
            console.log('countdown sucessful')
        }
        //entity.runCommand(`title @s actionbar ${reason.replace('_', ' ')}\n${ticksToTime(ticksLeft)}`)
    };
});
function ticksToTime(ticks) {
    var num = ticks / 20
    var hours = Math.floor(num / 60);
    var minutes = Math.round(num % 60);
    console.log(hours + ":" + minutes)
    return hours + ":" + minutes;
}