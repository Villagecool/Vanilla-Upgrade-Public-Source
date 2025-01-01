import * as SERVER from '@minecraft/server';
class ReplaceableComponent implements SERVER.BlockCustomComponent {
    constructor() {
        this.onStepOn = this.onStepOn.bind(this);
    }

    onStepOn(e: SERVER.BlockComponentStepOnEvent): void {
        let block = e.player.getComponent("equippable").getEquipment("Mainhand");
        e.block.setPermutation(SERVER.BlockPermutation.resolve(SERVER.MinecraftBlockTypes.Air));
    }
}

SERVER.world.beforeEvents.worldInitialize.subscribe(initEvent => {
    //initEvent.blockTypeRegistry.registerCustomComponent('vc:replaceable', new ReplaceableComponent()); //had to scrap it cus i realized it wouldnt work 😅
});