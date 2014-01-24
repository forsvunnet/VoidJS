VoidJS
======

This is the repository for Void, a JavaScript/Canvas game engine/template.

It features:
------------
- Box2dweb
- Canvas drawing system
- Vector graphics
- Basic player controls
- Collectibles
- Zones (Starting point | Checkpoints | Exit)
- Level system
- Menu system

To be implemented:
------------------
- Sounds
- Scene graph for the canvas drawing system
- Multiplayer via node.js and socket.io

Aims:
-----

### Pluggable
VoidJS should be extendable by modules instead of having to change the core.

### Basic game mechanics
VoidJS should include the most basic game mechanics and leave more advanced mechanics to modules.


Todo list:
-----

* -Challenge-
* -Mastery-
* Progression
* Tantalise (Story / progression)
* Micromanagement (Mastery)
* * Items
* * Inventory
* Macromanagement (Progression)
* * Items
* * Economy / Strategy / Overall objective
* * Research
* * Quests - objectives - tasks
* * * Collect N collectibles
* * * Kill all X
* * * Survive for T
* * * etc...


Systems:
--------
* Inventory
* User
* Progression
* Missions / Quests
* Scripts
* * Items
* * Missions
* * NPC

```
level: {
	level_id: #id,
	placement: {x:#, y:#, c:#},
	locked_by : [level_id or function],
	biome: #biome_type
}

biomes: {
	#biome_name:{
		spawns: [description_names..],
		colour_scheme: {}
	}
}
```