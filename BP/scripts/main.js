
import './utils.js'
import "./redstone_test.js";
import "./fancyResults.js"
//import "./note_block.js";
import "./entity_functions.js";
import "./chorus_carnavorus_plant.js";
//import "./effects.js";
//import "./block_functions.js";
import "./block_components.js";
import "./item_components.js";
import "./name_tag.js";
//import "./giant.js";
import "./rotator.js";
import "./advanced_hopper.js";
import "./advanced_observer.js";
import "./advanced_filter.js";
import "./cursedCampfire.js";
//
//import * as SERVER from '@minecraft/server';
//SERVER.system.afterEvents.scriptEventReceive.subscribe((data) => {
//    if (data.id === "vc:item_fix") {
//        if (!data.sourceEntity) return;
//        let player = data.sourceEntity
//        let container = player.getComponent("inventory").container;
//        for (let i = 0; i < container.size; i++) {
//            let item = container.getItem(i);
//            if (item != undefined) {
//                if (item.typeId.startsWith('vc:') && (
//                    item.typeId.endsWith('_door') ||
//                    item.typeId.endsWith('_cake') ||
//                    item.typeId.endsWith('_syrup') ||
//                    (item.typeId.startsWith('vc:zalu') && item.typeId != "vc:zalu_block") ||
//                    item.typeId == 'vc:lumerison_roots' ||
//                    item.typeId == 'vc:sea_pineapple'
//                )) {
//                    let newId = `${item.typeId}_item`;
//                    console.log(newId)
//                    container.setItem(i, new SERVER.ItemStack(newId, item.amount));
//                };
//                if (item.typeId.startsWith('no:')) {
//                    let tmpStack;
//                    try {
//                        tmpStack = new SERVER.ItemStack(item.typeId.replace('no:', 'vc:'), item.amount);
//                    } catch (error) {
//                        return
//                    }
//                    container.setItem(i, tmpStack);
//                }
//                if (item.typeId == 'vc:custom_note_block')
//                    container.setItem(i, new SERVER.ItemStack('minecraft:noteblock', item.amount));
//            }
//        }
//    }
//})
//