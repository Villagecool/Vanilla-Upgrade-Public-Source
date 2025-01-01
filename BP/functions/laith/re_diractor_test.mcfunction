#bridge-file-version: #25
scoreboard objectives add onof dummy
execute if block ~1~~ powered_repeater["minecraft:cardinal_direction"="east","repeater_delay"=0] run scoreboard players set @s onof 1
execute if block ~-1~~ powered_repeater["minecraft:cardinal_direction"="west","repeater_delay"=0] run scoreboard players set @s onof 1
execute if block ~~~-1 powered_repeater["minecraft:cardinal_direction"="north","repeater_delay"=0] run scoreboard players set @s onof 1
execute if block ~~~1 powered_repeater["minecraft:cardinal_direction"="south","repeater_delay"=0] run scoreboard players set @s onof 1

execute if block ~1~~ powered_repeater["minecraft:cardinal_direction"="east","repeater_delay"=1] run scoreboard players set @s onof 1
execute if block ~-1~~ powered_repeater["minecraft:cardinal_direction"="west","repeater_delay"=1] run scoreboard players set @s onof 1
execute if block ~~~-1 powered_repeater["minecraft:cardinal_direction"="north","repeater_delay"=1] run scoreboard players set @s onof 1
execute if block ~~~1 powered_repeater["minecraft:cardinal_direction"="south","repeater_delay"=1] run scoreboard players set @s onof 1

execute if block ~1~~ powered_repeater["minecraft:cardinal_direction"="east","repeater_delay"=2] run scoreboard players set @s onof 1
execute if block ~-1~~ powered_repeater["minecraft:cardinal_direction"="west","repeater_delay"=2] run scoreboard players set @s onof 1
execute if block ~~~-1 powered_repeater["minecraft:cardinal_direction"="north","repeater_delay"=2] run scoreboard players set @s onof 1
execute if block ~~~1 powered_repeater["minecraft:cardinal_direction"="south","repeater_delay"=2] run scoreboard players set @s onof 1

execute if block ~1~~ powered_repeater["minecraft:cardinal_direction"="east","repeater_delay"=3] run scoreboard players set @s onof 1
execute if block ~-1~~ powered_repeater["minecraft:cardinal_direction"="west","repeater_delay"=3] run scoreboard players set @s onof 1
execute if block ~~~-1 powered_repeater["minecraft:cardinal_direction"="north","repeater_delay"=3] run scoreboard players set @s onof 1
execute if block ~~~1 powered_repeater["minecraft:cardinal_direction"="south","repeater_delay"=3] run scoreboard players set @s onof 1


execute if block ~1~~ redstone_torch run scoreboard players set @s onof 1
execute if block ~-1~~ redstone_torch run scoreboard players set @s onof 1
execute if block ~~~-1 redstone_torch run scoreboard players set @s onof 1
execute if block ~~~1 redstone_torch run scoreboard players set @s onof 1
execute if block ~~-1~ redstone_torch run scoreboard players set @s onof 1
execute if block ~~1~ redstone_torch run scoreboard players set @s onof 1
execute if block ~~-2~ redstone_torch unless block ~~-1~ air run scoreboard players set @s onof 1


execute if block ~1~~ redstone_block run scoreboard players set @s onof 1
execute if block ~-1~~ redstone_block run scoreboard players set @s onof 1
execute if block ~~~-1 redstone_block run scoreboard players set @s onof 1
execute if block ~~~1 redstone_block run scoreboard players set @s onof 1
execute if block ~~-1~ redstone_block run scoreboard players set @s onof 1
execute if block ~~1~ redstone_block run scoreboard players set @s onof 1


execute if block ~1~~ redstone_wire unless block ~1~~ redstone_wire["redstone_signal"=0] run scoreboard players set @s onof 1
execute if block ~-1~~ redstone_wire unless block ~-1~~ redstone_wire["redstone_signal"=0] run scoreboard players set @s onof 1
execute if block ~~~1 redstone_wire unless block ~~~1 redstone_wire["redstone_signal"=0] run scoreboard players set @s onof 1
execute if block ~~~-1 redstone_wire unless block ~~~-1 redstone_wire["redstone_signal"=0] run scoreboard players set @s onof 1
execute if block ~~1~ redstone_wire unless block ~~1~ redstone_wire["redstone_signal"=0] run scoreboard players set @s onof 1