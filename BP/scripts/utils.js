import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';
/**
 * Utility function to update a block's state.
 * @param {SERVER.Block} block - The block to update.
 * @param {string} stateAdd - The state key to update.
 * @param {*} stateValue - The new value for the state key.
 * @throws This function can throw errors
 * - if the block no longer is loaded in the world
 * - the block does not have the desired state
 * - the desired state cannot apply the value
 */
export function setPermutation(block, stateAdd, stateValue) {
    const result = block.permutation.getAllStates();
    result[stateAdd] = stateValue;
    block.setPermutation(SERVER.BlockPermutation.resolve(block.typeId, result));
}
/**
 * @param {Number} min minimum value allowed
 * @param {Number} max minimum value allowed
 * @returns {Int} A random Integer within the set range
 */
export function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
/**
 * @param {Number} min minimum value allowed
 * @param {Number} max minimum value allowed
 * @returns {Float} A random Float within the set range
 */
export function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min; // The maximum is exclusive and the minimum is inclusive
}
/**
 * adds a set offset to a Vec3

 * Example: an offset of 
```javascript
{x: 0, y: 1, z: 0}
``` 
would move the orignal location up by 1 block
 *  

 * @param {SERVER.Vector3} location the orignal location
 * @param {SERVER.Vector3} offset a Vec3 with the values to adjust the location
 * @returns {SERVER.Vector3} the offset Vec3
 */
export function offsetLocation(location, offset) {
    return { x: location.x + offset.x, y: location.y + offset.y, z: location.z + offset.z }
}
/**
 * weird function I had to make

 * @param {SERVER.MolangVariableMap} molang
 * @param {String} varable
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @returns {SERVER.MolangVariableMap} molang map with new set varaibles
 */
export function setVectorFloats(molang, varable, x, y, z) {
    molang.setFloat(varable + 'x', x)
    molang.setFloat(varable + 'y', y)
    molang.setFloat(varable + 'z', z)
    return molang;
}
/**
 * Removes 1 item from a players armor slot

 * @param {SERVER.Player} player the desired player
 * @param {String} slot Optional value for to set the effected equiptment slot (Defualt: Mainhand)
 */
export function decripateStack(player, slot) {
    if (!slot) slot = 'Mainhand'
    let item = player.getComponent("equippable").getEquipment(slot);
    if (!item) return;
    if (player.getGameMode() == 'creative') return;
    if (item.amount == 1) item = new SERVER.ItemStack("minecraft:air", 2)
    item.amount -= 1;
    player.getComponent("equippable").setEquipment(slot, item);
}
/**
 * Gets a value within a precent between a range

 * @param {number} a the minimul value (when `alpha` is `0`)
 * @param {number} b the maximum value (when `alpha` is `1`)
 * @param {Float} alpha a float between 1-0 representing the precent between the range
 * @returns {number} the value within the range
 */
export function lerp(a, b, alpha) {
    return a + alpha * (b - a)
}
/**
 * converts a hex to an rgb

 * @param {String} hex the hexadecimal value to be converted
 * @returns {SERVER.RGB} a 0-1 based object with `r`, `g`, and `b` values
 */
export function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
/**
 * returns the distance bewtween point a and point b

 * @param {SERVER.Vector3} v1 point a
 * @param {SERVER.Vector3} v2 point b
 * @returns {Float} the distance between the vectors in blocks
 */
export function distanceVector(v1, v2) {
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
/**
 * converts seconds to time format
 * - Example: `20` seconds becomes `'0:20'`, `75` becomes `'1:15'`

 * @param {Number} secs the number of seconds
 * @returns {String} the number in time format
 */
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
/**
 * removes 1 durability point on an item
 * - if the item does not have durability nothing will happen
 * - if all durability is completely removed then it will return nothing
 * - the unbreaking enchantment is accounted for

 * @param {SERVER.ItemStack} item the set item
 * @returns {SERVER.ItemStack} the same itemStack with 1 durability point removed
 */
export function damage_item(item) {
    // Get durability
    const durabilityComponent = item.getComponent("durability")
    if (!durabilityComponent) return item;
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
/**
 * converts a vector3 to string format, useful for commands
 * - Example: {x: 5, y: 1, z: 10} will be converted to `'5 1 10'`

 * @param {SERVER.Vector3} vec the desired `Vector3`
 * @returns {String} the vector in string format
 */
export function vec3toString(vec) {
    return `${vec.x} ${vec.y} ${vec.z}`
}