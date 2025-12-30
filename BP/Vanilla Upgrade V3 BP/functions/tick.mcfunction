################execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 vc:fletching_table_custom replace fletching_table
#execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:entity_spawn["vc:entity"="vc:bandager","vc:actually_spawn"=true] replace no:entity_spawn["vc:entity"="vc:bandager","vc:actually_spawn"=false]
#execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:entity_spawn["vc:entity"="vc:termite","vc:actually_spawn"=true] replace no:entity_spawn["vc:entity"="vc:termite","vc:actually_spawn"=false]
#execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:entity_spawn["vc:entity"="vc:termite_mound","vc:actually_spawn"=true] replace no:entity_spawn["vc:entity"="vc:termite_mound","vc:actually_spawn"=false]
#execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:entity_spawn["vc:entity"="vc:penguin","vc:actually_spawn"=true] replace no:entity_spawn["vc:entity"="vc:penguin","vc:actually_spawn"=false]
#execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:entity_spawn["vc:entity"="vc:illusioner","vc:actually_spawn"=true] replace no:entity_spawn["vc:entity"="vc:illusioner","vc:actually_spawn"=false]
execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 azalea_leaves["persistent_bit"=true] replace vc:azalea_leaves
execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 azalea_leaves_flowered["persistent_bit"=true] replace vc:azalea_leaves_flowered
##execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 vc:mellon 0 replace melon_block
##execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:generate_villager 0 replace no:block_villager
##execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 no:generate_termite 0 replace no:block_termite
##execute as @a at @a run fill ~10~5~10 ~-10~-3~-10 vc:cattail 0 replace vc:cattail_gen
#
#
execute as @a[hasitem={item=vc:xp}] at @a[hasitem={item=vc:xp}] run summon xp_orb
execute as @a[hasitem={item=vc:xp}] at @a[hasitem={item=vc:xp}] run clear @s vc:xp 0 1
#
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] if entity @s[lm=1] run xp -1L @s
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] if entity @s[lm=1] run give @s vc:xp_scroll
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] if entity @s[lm=1] run playsound note.bell @s
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] unless entity @s[lm=1] run give @s paper
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] unless entity @s[lm=1] run playsound note.bass @s
execute as @a[hasitem={item=vc:unwritten_scroll}] at @a[hasitem={item=vc:unwritten_scroll}] run clear @s vc:unwritten_scroll 0 1
#
execute as @a at @a if block ~ 253 ~ biome_indicate:elax run particle vc:elax_ambiant ~~~
execute as @a at @a if block ~ 253 ~ biome_indicate:lumerison run particle vc:acid_rain ~~~
#execute as @a at @a run function slimeball

#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ flowing_water run structure load mystructure:spawn_crystal ~~~
#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ flowing_water run playsound block.sniffer_egg.crack @a ~~~
#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ flowing_water run kill @s
#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ water run structure load mystructure:spawn_crystal ~~~
#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ water run playsound block.sniffer_egg.crack @a ~~~
#execute as @e[type=xp_orb] at @e[type=xp_orb] if block ~~~ water run kill @s

#execute as @a at @a run fill ~13 40 ~13 ~-13 80 ~-13 no:generate_chorus_spew replace no:generate_chorus_spew_inactive
#execute as @a at @a run execute unless entity @e[type=vc:particle_emitter,r=1] run summon vc:particle_emitter
#execute as @a at @a run execute unless entity @e[type=vc:particle_emitter,r=1] run tp @e[type=vc:particle_emitter,r=1] ~~~
#execute as @a at @a run scriptevent vc:effect_countdown
#execute as @a at @a run scriptevent vc:item_fix
#execute at @e[tag=timerFor-giant_omen] run particle vc:giant_omen_effect_particle ~~.5~
#
#
execute as @e at @e run execute if block ~~~ stonecutter_block run damage @s[r=0.8] 1 contact

execute as @a[hasitem={location=slot.weapon.mainhand,item=vc:glareizer}] run scriptevent vc:get_light
execute as @a[hasitem={location=slot.weapon.mainhand,item=vc:cursed_campfire}] run scriptevent vc:trackCampfire
#
execute as @e[name=delete:curse_campfire,type=item] at @e[name=delete:curse_campfire,type=item] run execute as @s positioned ~~~ if block ~~~ campfire run scriptevent vc:curse_this_campfire
execute as @e[name=delete:curse_campfire,type=item] at @e[name=delete:curse_campfire,type=item] run execute as @s positioned ~~~ if block ~~~ soul_campfire run scriptevent vc:curse_this_campfire