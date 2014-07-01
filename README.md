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
- Multiplayer via node.js and socket.io

Aims:
-----

### Pluggable
VoidJS should be extendable by modules without having to change the core.

### Basic game mechanics
VoidJS should include basic game mechanics and leave more advanced mechanics to modules.


Todo list (Note these points include Void [WT]):
-----

* User (login / player) system
The user system should be top priority. It is needed to store player information such as levels completed, items collected, research startet and completed, track inventory and more.
* Progression
* Tantalise (Story / progression)
* Inventory system
* Event hook system
* Items ++
* Level selection and progression system
* Macromanagement and Progression
* * Economy / Strategy / Overall objective
* * Research?
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



# Copied from voidplan.md:

## Level design

### Generator

#### Improve workflow
The levels should be overwritten automatically.
**Steps to accomplish:**

* Set up a webhost for the generator
* Create a jsonp endpoint
* Hard code a jsonp request to the enpoint from the game

#### Spawn zones

The levels should have designated spawnpoints where enemies can spawn.
Purpose of these points:

* Know distance from safe-zones
* incremental difficulty towards end
* Know if the area is part of the main tunnel or a branch
* Predictable spawning
* Adjustable spawning based on the number of players


### Teaching

Super meatboy has some levels meant to teach the player how the game works.
I think the levels should intrinsically teach the players how the game works.
As Edmund stated, the players feels smarter when they think they figured it out by themselves.

An intresting aspect of Void [WT] is that the levels themselves have scaleable difficulty.
This means that if things are too easy it goes quickly from easy to hard if the players should so choose.

From a game design perspective this state of undecisiveness is incredibly difficult to create.
The problem isn't making the difficulty itself scaleable. It's the risk / reward problem which is the issue.

If the game becomes more difficult it should also be more rewarding, but that conflicts with the premise that new players should be able to keep pace with skilled players.
If skilled players are more rewarded they will be able to outplay the new players, which is not what I aim for.

### Progression

The final verdict is in. The game should not be continous, but rather be split into levels.
I've long planned the game this way, but now I have solid reason for it.
The end of level helps fortify the sense of progression and it also gives safe have to choose skills (items) and other things. It also makes travel between levels easier.

It also allows the menu to be crafted in such a way that levels can be reused. Think of the yeti from PvZ2 where you have to go back to prevoius levels to fight the yeti for a reward.
The rewards from PvZ2 are kinda lousy (coins usually), so here Void [WT] can excell by giving unique items perhaps?

### Unlockable content

After completing several levels and perhaps a boss fight new content should be unlocked for previous levels.

## Debris
Two methods to collect valuables from debris.

One way is to shatter it and collect the contents. (easy)

Another way should be to charge the debris somehow and the charge will attract enemies which would make the game harder. The charged debris turns into a more valuable drop. (harder)

## Resource ideas:
* Rift tokens - Used to unlock new areas (20 per area?) 1 gained every objective completion.
* Electricity / Mana - Starting capacity at 30, regenerates 1 every 2 seconds.
* Minerals - Found or scavenged. Mainly used as a cost for abilities. Converted to coins at the end of every level.

## Item ideas:
* Items that give boosts to other players (skilled player carry to safeguard new player)
* Items that give boosts to all players (the more the merrier)
* Items that give boosts to self the more other players take damage
* Activateable item to swap place with other player (within range) under attack (most aggro) + giving duration damage + health bonus.
* ++damage / health / movement when near other player
* Damage dealt is given to nearest other player as health / shield
* Activate to give other player bonus health / regen
* Siphon - extract 1 mana per second from enemy and deal 1 damage per second while doing so. Movement speed slowed.
* Fragment - (casting, 5s + 30s cd) Become invurnerable and deal 5 damage + splash when crashing into enemies. Invurnerability wears off after crashing and the enemies become stunned for 3 seconds.
* Marker - (passive) Spawn 10% more and usually tougher enemies.
* VoidPhase - (activated, 20s cd) become etheral. Your body is left behind in a quantum state and your etheral self can move around in a radius around your body. Upon return from the ether unleash (AOE) 5 damage to nearby enemies and stun them.
* Bullet time - (activated, cd 20s) Enemies and projectiles are paused and will slowly sync back to normal speed.
* Greed - (passive) Upon level completion, gain one additional rift token
* Transistors - (passive) Your electricity capacity is increased by 30.
* Double strike - (passive) Attacks are performed twice in quick succession.
* Cloak - (passive) Most enemies can not detect you unless they get very close or they observe you using a revealing ability.
* Tesla - (activated, 5s cd) Deals 20 damage divided equally among enemies in range. Consumes 10 Electricity.
* Charger - (passive_ Regenerates 1 electricty every time you deal damage.
* Enhancer - (passive) Every 10 Minerals gives you +1 / +1. (non-consuming)
* Inverter - (casting, 5s) Consume 3 minerals to activate. Once activated any recieved damage will deactive this ability and reflect the damage back to the attacking entity.
* Soulcapture - (passive) Every 2 enemies that dies give you +1 / 0 until the end of the round or until you die.
* Soulcage - (passive) At death you enter a static state where you take no damage and after 3 seconds a blast emits from your position stunning nearby enemies dealing 5 damage and the blast destroys any projectiles in the blast radius.
* To Be Named - All players deal +5 damage to purple enemies.
* To Be Named - All players deal +5 damage to pink enemies.
* To Be Named - All players deal +5 damage to blue enemies.
* To Be Named - All players deal +5 damage to yellow enemies.
* To Be Named - Yellow enemies are slowed by 10%.
* To Be Named - Yellow enemies have their cast time increased by 100%.
* Tracking missile - (casting, 0.5-2s) Consume 1 mineral. Cast a missile that automatically tracks nearby enemies and deals 15 damage.

## Monster / Enemy ideas
* Levithan - Huge monster ( half the screen ). Can not be killed and extremely dangerous. (Rare)
* Ziz - Small monster. Can not be killed and extremely dangerous. (Rare)

## Monster spells / abilities
* Fireball -
* Harden - (activated) 3s cast time.
## Spawners
Make late level spawns based on actions during play? Doing such and such triggers more spawns?

## Diodes
Prevent players from backtracking.
Maybe turn background blocks into solid wall?



# True enjoyment from a game comes when:

## The player is given an objective and..
* Is not given instructions on how to complete the objective (beyond hints and directives)
* There are several routes or options on how to complete the objective without telling the player what the options are.
* The challenges involved in completing the objective can be achieved in several different ways..
    * Slow / methodical
    * Fast and ruthless
    * Easy / hard
    * Avoidable
