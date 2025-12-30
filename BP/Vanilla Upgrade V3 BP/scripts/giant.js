import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
import { getRandomInt } from "./utils.js";

SERVER.world.beforeEvents.playerBreakBlock.subscribe((data) => {
    const player = data.player;
    let block = player.dimension.getBlock(data.block);
    if (block.typeId != 'minecraft:mob_spawner') return;
    let badOmen = player.getEffect('bad_omen');
    if (badOmen != undefined) {
        SERVER.system.run(() => {
            //player.addEffect('giantOmen', 900, { amplifier: 1 });
            player.removeEffect('bad_omen');
            //player.runCommand(`scriptevent vc:addtimer giant_omen ${getRandomInt(600, 2400)}`);
            player.runCommand(`particle vc:giant_omen_particle ${block.location.x} ${block.location.y} ${block.location.z}`)
            player.runCommand(`playsound effects.giant_omen @s ${block.location.x} ${block.location.y}.5 ${block.location.z}`)
            const time = Date.now()+getRandomInt(60000, 240000)

            player.setDynamicProperty('giantOmenTimer', `${Date.now()}//${time}`)
            const timer = SERVER.system.runInterval(()=>{
                if (!player.getDynamicProperty('giantOmenTimer')) SERVER.system.clearRun(timer)
                //player.runCommand('title @s actionbar ' + Math.round((Date.now()/time)*100) + '%')
                //console.log(Date.now() + '/' + time)
                if (SERVER.system.currentTick % 200 == 1) player.runCommand(`title @s actionbar ${msToTime(time-Date.now())}`)
                player.runCommand(`particle vc:giant_omen_effect_particle ~~0.5~`)
                player.setDynamicProperty('giantOmenTimer', `${Date.now()}//${time}`)
                if (Date.now() >= time) {
                    player.setDynamicProperty('giantOmenTimer', null)
                    SERVER.system.clearRun(timer)
                    player.runCommand('scriptevent vc:effectCallback giant_omen')
                }
            },2)
        })
    }
});
SERVER.world.afterEvents.playerSpawn.subscribe(e=>{
    if (!e.initialSpawn) return
    if (e.player.getDynamicProperty('giantOmenTimer')) {
        const timesplit = e.player.getDynamicProperty('giantOmenTimer').split('//')
        const time = Date.now() + Number(timesplit[1]-timesplit[0])
        const timer = SERVER.system.runInterval(()=>{
            if (!e.player.getDynamicProperty('giantOmenTimer')) SERVER.system.clearRun(timer)
            e.player.runCommand(`particle vc:giant_omen_effect_particle ~~0.5~`)
            if (SERVER.system.currentTick % 200 == 1) e.player.runCommand(`title @s actionbar ${msToTime(time-Date.now())}`)
            e.player.setDynamicProperty('giantOmenTimer', `${Date.now()}//${time}`)
            if (Date.now() >= time) {
                e.player.setDynamicProperty('giantOmenTimer', null)
                SERVER.system.clearRun(timer)
                e.player.runCommand('scriptevent vc:effectCallback giant_omen')
            }
        },2)
    }
})
SERVER.world.afterEvents.itemCompleteUse.subscribe(e=>{
    if (e.itemStack.typeId.includes('milk') && e.source.getDynamicProperty('giantOmenTimer')) e.source.setDynamicProperty('giantOmenTimer', null)
})
function msToTime(duration) {
  // Calculate milliseconds, seconds, minutes, and hours
  const milliseconds = parseInt((duration % 1000));
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  // Pad single-digit values with a leading zero for consistent formatting
  const formattedHours = (hours < 10) ? "0" + hours : hours;
  const formattedMinutes = (minutes < 10) ? "0" + minutes : minutes;
  const formattedSeconds = (seconds < 10) ? "0" + seconds : seconds;
  const formattedMilliseconds = (milliseconds < 10) ? "00" + milliseconds : (milliseconds < 100) ? "0" + milliseconds : milliseconds;

  //return `${formattedHours}:${formattedMinutes}:${formattedSeconds}.${formattedMilliseconds}`;
  return `${formattedMinutes}:${formattedSeconds}`;
}

SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (data.id === "vc:shockwave") {
        if (!data.sourceEntity) return;
        let entity = data.sourceEntity;
        try {
            if (!entity.isSneaking) entity.applyKnockback({x: Math.random() - 0.5, z: Math.random() - 0.5}, Number(data.message));
            else entity.applyKnockback(0, 0, 0, Number(data.message) * 0.2);
        } catch {}
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
    if (data.id == "giant:accidentaldeathprevention") {
        const dummy = data.sourceEntity.dimension.spawnEntity('minecraft:armor_stand', data.sourceEntity.location)
        dummy.addEffect('invisibility', 2000, {showParticles: false})
        SERVER.system.runTimeout(()=>{
            dummy.runCommand("scriptevent vc:xp_bomb")
            SERVER.system.runTimeout(()=>{ dummy.remove() }, 2)
        },20*7)
    }
    if (data.id === "vc:addtimer") {
    //    if (!data.sourceEntity) return;
    //    let entity = data.sourceEntity;
    //    let reason = data.message.split(' ')[0]
    //    let time = data.message.split(' ')[1] * 20
    //    entity.runCommand(`tag @s add timer-${time}`);
    //    entity.runCommand(`tag @s add timerFor-${reason}`);
    //    //xp.applyKnockback(Math.random() - 0.5, Math.random() - 0.5, 0, 0);
    }
    if (data.id === "vc:effectCallback" && data.message === 'giant_omen') {
        const entity = data.sourceEntity;
        entity.runCommand(`tag @s remove giant_omen`);
        const BIGBOI = entity.dimension.spawnEntity('vc:giant', { x: entity.location.x, y: entity.location.y, z: entity.location.z, });
        BIGBOI.runCommand(`/spreadplayers ~~ 20 100 @s`)
        BIGBOI.runCommand(`/tp @s ~~~ facing @p`)
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