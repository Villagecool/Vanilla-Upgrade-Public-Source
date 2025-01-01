import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

let score = 0;
let stars = 0
let misses = 0
let newRecord;
SERVER.system.afterEvents.scriptEventReceive.subscribe((e) => {
    if (e.id != 'vc:resultTest') return;
    stars = 0
    misses = 0
    const scoreToGive = e.message.split(' ')[0]
    newRecord = scoreToGive > Number(score.replace('§a', '').replace(`\n§eNEW RECORD`, ''));
    score = 0;
    const missesToGive = e.message.split(' ')[1]
    const starsToGive = e.message.split(' ')[2]
    const myTextBoi = e.sourceEntity.dimension.spawnEntity('armor_stand', {
        x: e.sourceEntity.location.x + e.sourceEntity.getViewDirection().x*2,
        y: e.sourceEntity.location.y,
        z: e.sourceEntity.location.z + e.sourceEntity.getViewDirection().z*2
    })
    var runs = 0
    for (let i = 0; i < 30; i++) {
        SERVER.system.runTimeout(_ => {
            score = Math.round(lerp(0, scoreToGive, i/29))
            if (i >= 29) {
                score = `§a${scoreToGive}`
                myTextBoi.dimension.playSound('note.bell', myTextBoi.location)
                if (newRecord != undefined) SERVER.system.runTimeout(huire => {myTextBoi.dimension.playSound('random.levelup', myTextBoi.location); score += `\n§eNEW RECORD`}, 5)
                updateText(myTextBoi)
            } else if (updateText(myTextBoi)) myTextBoi.dimension.playSound('note.bass', myTextBoi.location, {pitch: 2 + i/29})
        }, i)
        SERVER.system.runTimeout(_ => {
            misses = Math.round(lerp(0, missesToGive, i/29))
            if (i >= 29) {
                misses = `§c${missesToGive}`
                updateText(myTextBoi)
                myTextBoi.dimension.playSound('note.bell', myTextBoi.location)
                if (starsToGive > 0) SERVER.system.runTimeout(huh => { stars = 1; updateText(myTextBoi); myTextBoi.dimension.playSound('random.orb', myTextBoi.location, {pitch: 0.5}) }, 10)
                if (starsToGive > 1) SERVER.system.runTimeout(huh => { stars = 2; updateText(myTextBoi); myTextBoi.dimension.playSound('random.orb', myTextBoi.location, {pitch: 0.75}) }, 20)
                if (starsToGive > 2) SERVER.system.runTimeout(huh => { stars = 3; updateText(myTextBoi); myTextBoi.dimension.playSound('random.orb', myTextBoi.location, {pitch: 1}) }, 30)
                SERVER.system.runTimeout(huh => {myTextBoi.dimension.playSound('random.levelup', myTextBoi.location, {pitch: 0.75}) }, 40)
            } else if (updateText(myTextBoi)) myTextBoi.dimension.playSound('note.bass', myTextBoi.location, {pitch: 2 + i/29})
        }, i/2+35)
    }
})
function updateText(myTextBoi) {
   var newTHing = `Score: ${score}\nMisses: ${misses}\n${stars > 0 ? '': ''} ${stars > 1 ? '': ''} ${stars > 2 ? '': ''}`
   var huh = myTextBoi.nameTag != newTHing
   myTextBoi.nameTag = newTHing;
   return huh
}
function lerp(a, b, alpha) {
    return a + alpha * (b - a)
}