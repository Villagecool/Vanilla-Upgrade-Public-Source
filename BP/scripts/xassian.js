import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

console.warn("§aCustom Enscribing Table Script Initialized - §bYourName");

SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('xassassin:enscribing_table', {
        onPlayerInteract: e => {
            const item = e.player.getComponent("equippable").getEquipment("Mainhand")
            if (item.typeId == 'minecraft:book') {
                setPermutation(e.block, 'xassassin:withBook', true);
                decripateStack(e.player) //removes an item
                e.player.runCommand(`title @s actionbar §lBook placed on the enscribing table`);
                e.block.dimension.playSound('block.itemframe.add_item', e.block.center());

            } else if (item.typeId == 'minecraft:written_book' || item.typeId == 'minecraft:book_and_quill' || item.typeId == 'minecraft:enchanted_book') { //interacts with a book
                if (!e.block.permutation.getState('xassassin:withBook')) return; //makes sure there is a empty book on thable

                const form = new UI.ActionFormData() //opens a form
                const cost = Math.round(Math.random()); //you will put the actual math here lol
                form.body(`§0Do you want to copy ${item.nameTag ? item.nameTag : 'this book'}?\n\nThis will const §a${cost}xp`)
                form.button(`Confirm`)
                form.title('copy_book') //KEEP THIS THE SAME THIS WILL SHOW THE CUSTOM UI

                form.show(e.player).then(r => { //events that will happen once a button is clicked
                  if (r.canceled) return;
                  setPermutation(e.block, 'xassassin:withBook', false); //remove book
                
                  e.block.dimension.spawnItem(item, e.block.above(1).bottomCenter()); //spawns the item
                  e.block.dimension.playSound('ui.cartography_table.take_result', e.block.center());
                })

            } else {
                e.block.dimension.spawnItem(new SERVER.ItemStack('minecraft:book', 1), e.block.above(1).bottomCenter());
                e.block.dimension.playSound('block.itemframe.remove_item', e.block.center());
            }

        }
    });
})

//util functions

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