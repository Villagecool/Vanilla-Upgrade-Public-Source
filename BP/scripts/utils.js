import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

export function setPermutation(block, stateAdd, stateValue) { //stole this from someone :evil:
    const result = block.permutation.getAllStates();
    result[stateAdd] = stateValue;
    block.setPermutation(SERVER.BlockPermutation.resolve(block.typeId, result));
}
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min; // The maximum is exclusive and the minimum is inclusive
}
export function offsetLocation(location, offset) {
    return { x: location.x + offset.x, y: location.y + offset.y, z: location.z + offset.z }
}
export function setVectorFloats(molang, varable, x, y, z) {
    molang.setFloat(varable + 'x', x)
    molang.setFloat(varable + 'y', y)
    molang.setFloat(varable + 'z', z)
    return molang;
}
export function decripateStack(player, slot) {
    if (!slot) slot = 'Mainhand'
    let item = player.getComponent("equippable").getEquipment(slot);
    if (!item) return;
    if (player.getGameMode() == 'creative') return;
    if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
    item.amount -= 1;
    player.getComponent("equippable").setEquipment(slot, item);
}
export function lerp(a, b, alpha) {
    return a + alpha * (b - a)
}

export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function distanceVector(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
export function toTime(secs) {
    var num = Math.abs(secs)
    var hours = Math.floor(num / 60);
    var minutes = Math.round(num % 60);
    var negative = num != secs;
    return (negative ? '-' : '') + (hours < 10 ? '0' : '') + hours + ":" + (minutes < 10 ? '0' : '') + minutes;
}

/**
 * Returns a true or false based off a random chance
 *
 * Example: weight of 5 has a 1/5 chance of returning true
 *
 * @param {Number} weight 1 out of _ chance of returning true (defualt 2)
 * @returns True or False
 * @type Bool
 */
export function getRandomBool(weight) {
    if (!weight) weight = 2;
    return getRandomInt(1, weight) == 1;
};
export function damage_item(item) {
    // Get durability
    const durabilityComponent = item.getComponent("durability")
    if (!durabilityComponent) return;
    var unbreaking = 0
    // Get unbreaking level
    if (item.hasComponent("enchantments")) {
        unbreaking = item.getComponent("enchantments").enchantments.getEnchantment("unbreaking")
        if (!unbreaking) {
            unbreaking = 0
        } else {
            unbreaking = unbreaking.level
        }
    }
    // Apply damage
    if (durabilityComponent.damage == durabilityComponent.maxDurability) {

        return
    }
    durabilityComponent.damage += Number(Math.round(Math.random() * 100) <= durabilityComponent.getDamageChance(unbreaking))
    return item
}
export function vec3toString(vec) {
    return `${vec.x} ${vec.y} ${vec.z}`
}