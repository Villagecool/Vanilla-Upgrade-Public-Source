import * as SERVER from '@minecraft/server';
import * as UI from '@minecraft/server-ui';

SERVER.world.beforeEvents.itemUse.subscribe((e) => {
    SERVER.system.run(()=>{
    if (e.itemStack.typeId == 'vc:advanced_filter' && !e.source.getDynamicProperty('vc:gatherData')) {
        e.source.playSound('random.pop', {pitch: 0.5})
        SERVER.system.runTimeout(()=>{ e.source.playSound('random.pop', {pitch: 0.75})}, 5)
        SERVER.system.runTimeout(()=>{ e.source.playSound('random.pop', {pitch: 1})}, 10)
	    var huhzers = new UI.ActionFormData()
        .title('Set Filter')
        .body('Choose Filter Type')
        .button('Gather List of Items')
        .button('Item Name Tag')
        .button('Block States')
        .button('Item Amount')
        .button('§cClear filter data')
        var showTimeBaby = (ee) => {
            if (ee.canceled) return;
            switch (ee.selection) {
                case 0:
                    e.source.setDynamicProperty('vc:gatherData', 'gatherItems')
                    e.source.runCommand(`title @s actionbar §lUse the items in your inventory to add to the list!`)
                    e.itemStack.setLore(['§kGatherer'])
                    e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
                    break;
                case 1:
                    const filtlist = ['Name is equal to', 'Name starts with', 'Name ends with']
                    new UI.ModalFormData()
                    .title('Set Filter')
                    .dropdown('If filter', filtlist)
                    .textField("Value ", "Value")
                    .show(e.source).then((a) => {
                        e.itemStack.setLore([
                            `§r§7§l${filtlist[a.formValues[0]]}§r`,
                            a.formValues[1]
                        ])
                        e.source.playSound('block.cartography_table.use')
                        e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
                        e.source.runCommand(`title @s actionbar §lItem §r${e.itemStack.getLore().join(' §l§f')}`)
                    })
                    break;
                case 2:
                    e.source.setDynamicProperty('vc:gatherData', 'getBlockState')
                    e.source.runCommand(`title @s actionbar §lUse the filter on a block to copy it's states!`)
                    break;
                case 3:
                    
                    const filtlist2 = ['Greater than', 'Less Than', 'Is Equal to']
                    let huhs = new UI.ModalFormData()
                    .title('Set Filter')
                    .dropdown('is...', filtlist2)
                    .textField("Value ", "Value");
                    showTheForm(huhs)
                    function showTheForm(form) {
                        form.show(e.source).then((a) => {
                            if (`${Number(a.formValues[1])}` == 'NaN') showTheForm(form) 
                        e.itemStack.setLore([
                            `§r§7§l${filtlist2[a.formValues[0]]}§r`,
                            `${Number(a.formValues[1])}`
                        ])
                        e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
                        e.source.playSound('block.cartography_table.use')
                        e.source.runCommand(`title @s actionbar §lItem amound is §r${e.itemStack.getLore().join(' §l§f')}`)
                    })}
                    break;
                case 4:
                    e.itemStack.setLore([])
                    e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
                    e.source.playSound('item.book.page_turn')
                    e.source.runCommand(`title @s actionbar §l§cCleared filter`)
                    break;
                case 5:
                    e.source.setDynamicProperty('vc:gatherData', `cloneing::${e.itemStack.getLore().join(',,,')}`)
                    e.source.runCommand(`title @s actionbar §lUse another filter to copy the contents!`)
                    break;

            }
        };
        if (e.itemStack.getLore() != undefined && e.itemStack.getLore()[0] != undefined) {
            new UI.MessageFormData()
            .title('Wait!')
            .body('Are you sure you want to overwrite the existing data on this filter?\n\nYou can also copy this data to a seprate filter')
            .button1('Yes I do!')
            .button2('No I don\'t!')
            .show(e.source).then((eashorts) => {
                huhzers.button('Copy to another fitler')
                if (eashorts.selection == 0) huhzers.show(e.source).then(showTimeBaby)
            })
        } else huhzers.show(e.source).then(showTimeBaby)
    } else if (e.source.getDynamicProperty('vc:gatherData')?.split('::')[0] == 'gatherItems') {
        const theItems = e.source.getDynamicProperty('vc:gatherData')?.split('::')
        if (e.itemStack.typeId == 'vc:advanced_filter' && e.itemStack.getLore()[0] == '§kGatherer') {
            theItems[0] = '§r§7§lItems: §r';
            e.itemStack.setLore(theItems)
            e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
            e.source.setDynamicProperty('vc:gatherData', null)
            e.source.runCommand(`title @s actionbar §lItems: §r\n§q${theItems.join('\n').replace('§r§7§lItems: §r\n', '')}`)
            e.source.playSound('block.cartography_table.use')
            return;
        }
        if (theItems.indexOf(e.itemStack.typeId) >= 0) {e.cancel = true; return};
        e.cancel = true;
        theItems.push(e.itemStack.typeId);
        //SERVER.world.sendMessage(theItems.join('\n'))
        e.source.setDynamicProperty('vc:gatherData', theItems.join('::'))
        e.source.playSound('random.pop')
        e.source.runCommand(`title @s actionbar §lItems: §r\n§7${theItems.join('\n').replace('gatherItems\n', '')}`)
    } else if (e.source.getDynamicProperty('vc:gatherData')?.startsWith('cloneing')) {
        const lore = e.source.getDynamicProperty('vc:gatherData').split('::')[1].split(',,,')
        if (e.itemStack.getLore()[0] != undefined) {
            e.source.playSound('random.pop', {pitch: 0.5})
            new UI.MessageFormData()
            .title('Wait!')
            .body('Are you sure you want to overwrite the existing data on this filter?')
            .button1('Yes I do!')
            .button2('No I don\'t!')
            .show(e.source).then((eashorts) => {
                if (eashorts.selection == 0) {
                    e.source.runCommand(`title @s actionbar §lCopied: §r\n${lore.join('\n')}`)
                    e.source.playSound('block.cartography_table.use')
                    e.itemStack.setLore(lore)
                    e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
                    e.source.setDynamicProperty('vc:gatherData', null)
                }
            })
        } else {
            e.source.runCommand(`title @s actionbar §lCopied: §r\n${lore.join('\n')}`)
            e.source.playSound('block.cartography_table.use')
            e.itemStack.setLore(lore)
            e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
            e.source.setDynamicProperty('vc:gatherData', null)
        }
    }
})})
SERVER.world.beforeEvents.itemUseOn.subscribe(e => {
    SERVER.system.run(()=>{
    if (e.source.getDynamicProperty('vc:gatherData')?.split('::')[0] == 'gatherItems'){ e.cancel = true; return};
    if (e.source.getDynamicProperty('vc:gatherData') != 'getBlockState' || e.itemStack.typeId != 'vc:advanced_filter') { return;}
    const states = Object.keys(e.block.permutation.getAllStates());
    
    if (states.length === 0) { e.source.runCommand(`title @s actionbar §cThis block has no states!`); return; }
    let values = []
    const theForm = new UI.ModalFormData().title('Set Filter');
    states.forEach(state => {
        values.push(`${state} = ${e.block.permutation.getState(state)}`)
        theForm.toggle(`${state} = ${e.block.permutation.getState(state)}`, true)
    })
    let lore = ['§r§7§lBlock States: §r']
    e.source.playSound('random.pop', {pitch: 0.5})
    theForm.show(e.source).then((ee) => {
        if (ee.canceled) return;
        for (let i = 0; i < values.length; i++) {
            if (ee.formValues[i]) lore.push(values[i])
            //console.log(`${i}, ${ee.formValues[i]}, ${values[i]}: ${lore.join(',, ')}`)
        }
        e.itemStack.setLore(lore)
        e.source.playSound('block.cartography_table.use')
        e.source.getComponent('minecraft:inventory').container.setItem(e.source.selectedSlotIndex, e.itemStack)
        e.source.setDynamicProperty('vc:gatherData', null)
        e.source.runCommand(`title @s actionbar §lChecks for states: §r§7\n${lore.join('\n').replace('§r§7§lBlock States: §r\n', '')}`)
    })
})})
//SERVER.system.afterEvents.scriptEventReceive.subscribe(e => {
//    if (e.id == 'vc:test') {SERVER.world.sendMessage(`${e.sourceEntity.getDynamicProperty('vc:gatherData')}`)
//        e.sourceEntity.setDynamicProperty('vc:gatherData', null)}
//    
//})