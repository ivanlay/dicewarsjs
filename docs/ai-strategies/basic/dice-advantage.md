# Dice Advantage Analysis

One of the most fundamental strategies in DiceWars is to attack only when you have a numerical dice advantage over your opponent.

## Core Concept

The basic principle is simple: only initiate attacks where your territory has more dice than the target territory. This increases your probability of winning the battle.

## Implementation

```javascript
// Only consider attacks where attacker has more dice than defender
if (defending_area.dice >= attacking_area.dice) continue;
```

## Probability Analysis

The probability of winning a battle depends on the difference in dice:

| Attacker Dice | Defender Dice | Win Probability |
|---------------|---------------|-----------------|
| 2             | 1             | ~75%            |
| 3             | 2             | ~66%            |
| 4             | 3             | ~62%            |
| 5             | 4             | ~60%            |
| 6             | 5             | ~59%            |
| 7             | 6             | ~58%            |
| 8             | 7             | ~57%            |

These are approximate values and assume fair dice.

## Example from ai_example.js

```javascript
// Iterate through all territories to find potential attackers
for (let i = 1; i < game.AREA_MAX; i++) {
    const attacking_area = game.adat[i];

    if (attacking_area.size == 0) continue;  // Skip empty territories
    if (attacking_area.arm != current_player) continue;  // Skip enemy territories
    if (attacking_area.dice <= 1) continue;  // Skip territories with 1 or fewer dice

    // For each potential attacker, look for valid targets
    for (let j = 1; j < game.AREA_MAX; j++) {
        const defending_area = game.adat[j];

        if (defending_area.size == 0) continue;  // Skip empty territories
        if (defending_area.arm == current_player) continue;  // Skip own territories
        if (attacking_area.join[j] == 0) continue;  // Skip non-adjacent territories

        // Skip if defender has equal or more dice (considered a bad move)
        if (defending_area.dice >= game.adat[i].dice) continue;

        // Add valid move to the list
        list_moves[number_of_moves] = {
            "attacker": i,  // Index of the attacking territory
            "defender": j   // Index of the defending territory
        };
        number_of_moves++;
    }
}
```

## Enhancements

While basic dice advantage is a good starting point, consider these enhancements:

1. **Weighted advantage** - Prefer attacks with greater dice differences
2. **Equal dice consideration** - Sometimes attacking with equal dice can be strategic
3. **Maximum dice utilization** - Prioritize using territories with 8 dice (the maximum)

## When to Use

This strategy should be a foundational element of any AI implementation, but it's rarely sufficient on its own. Combine it with other strategies for more sophisticated behavior.