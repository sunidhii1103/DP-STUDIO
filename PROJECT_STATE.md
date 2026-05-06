# DP Studio Current State

## Completed Features
- Fibonacci visualization
- Knapsack visualization
- Playback controls
- Comparison Mode
- Learning Mode
- Dependency Highlighting
- Code Highlighting Panel
- Contextual explanations

## Architecture
- Step-engine driven visualization
- Reusable DPGrid component
- Learning Mode generated from Step objects
- Shared visualization engine for multiple algorithms

## Current Bug
- LCS algorithm switch uses stale Knapsack state
- Grid/code/metadata not resetting correctly

## Current Algorithms
1. Fibonacci
2. 0/1 Knapsack
3. LCS (in progress)

## Next Goals
- Fix centralized algorithm registry
- LCS backtracking visualization
- Path highlighting
- Better learning explanations

## Important Constraints
- Preserve Step Engine
- Avoid breaking existing algorithms
- Keep architecture modular
- Reuse components