import React from 'react';
import type { Step } from '../../types/step.types';

interface LearningPanelProps {
  step: Step;
}

export const LearningPanel: React.FC<LearningPanelProps> = ({ step }) => {
  const { explanation, algorithm } = step;
  
  if (!explanation) return null;

  let actionText = '';
  let reasonText = '';
  let conceptTitle: string | null = null;
  let conceptText: string | null = null;

  const { operationType, variables, conceptNoteType } = explanation;

  // 1. Determine Current Action & Reason
  if (algorithm === 'fibonacci') {
    const k = variables.k ?? variables.i;
    
    switch (operationType) {
      case 'initialize':
        actionText = `Set base case dp[${k}] = ${variables.value}.`;
        reasonText = `Dynamic programming relies on known trivial cases to build larger solutions.`;
        break;
      case 'compute':
        actionText = `Compute dp[${k}] using previously solved states dp[${Number(k)-1}] and dp[${Number(k)-2}].`;
        reasonText = `We reuse previously computed states instead of recalculating them, reducing redundant work.`;
        break;
      case 'cache_hit':
        actionText = `Retrieve dp[${k}] = ${variables.cachedValue ?? variables.value} from cache.`;
        reasonText = `This state was previously solved. We reuse the cached value to avoid exponential recursion.`;
        break;
      case 'recurse':
        actionText = `Request value for fib(${k}).`;
        reasonText = `We need this value to solve a larger problem, but it hasn't been computed yet. We must pause and recursively solve it.`;
        break;
      case 'read':
        actionText = `Read value for dp[${k}] from memory.`;
        reasonText = `This value acts as a building block for the current computation.`;
        break;
      default:
        actionText = `Operation: ${operationType} on index ${k}.`;
        reasonText = `Progressing the algorithm state.`;
    }
  } else if (algorithm === 'knapsack') {
    const { w, i, weight, value, isIncluded, label } = variables;
    
    switch (operationType) {
      case 'initialize':
        actionText = `Initialize base case for row ${i} or capacity ${w} to 0.`;
        reasonText = `A knapsack with 0 capacity or 0 items always yields 0 value.`;
        break;
      case 'compute':
        if (isIncluded !== undefined) {
          if (isIncluded) {
            actionText = `Compute max value for capacity ${w} by choosing to INCLUDE item "${label}".`;
            reasonText = `Including the item increases value, and we add it to the best value found for the remaining capacity (${w} - ${weight}).`;
          } else {
            actionText = `Compute max value for capacity ${w} by EXCLUDING item "${label}".`;
            reasonText = `Item "${label}" either exceeds capacity (${weight} > ${w}) or excluding it yields a better overall value. We carry forward the previous best.`;
          }
        } else {
          actionText = `Evaluate item "${label}" (Weight: ${weight}, Value: ${value}) at capacity ${w}.`;
          reasonText = `We compare including vs excluding the current item and choose the maximum achievable value within the remaining capacity.`;
        }
        break;
      case 'read':
        actionText = `Read previously computed value for item ${i} at capacity ${w}.`;
        reasonText = `We look back at smaller subproblems to decide whether including the current item is optimal.`;
        break;
      case 'cache_hit':
        actionText = `Retrieve state for item ${i}, capacity ${w} from cache.`;
        reasonText = `This subproblem was already solved in a previous recursive branch. We reuse it to save time.`;
        break;
      case 'recurse':
        actionText = `Evaluate item ${i} at capacity ${w}.`;
        reasonText = `We must recursively explore the decision tree for this state to find the optimal choice.`;
        break;
      default:
        actionText = `Operation: ${operationType} at state [${i}][${w}].`;
        reasonText = `Progressing the knapsack decision matrix.`;
    }
  } else if (algorithm === 'lcs') {
    const { char1, char2, i, j } = variables;
    
    switch (operationType) {
      case 'initialize':
        actionText = `Initialize base case for row ${i} or column ${j} to 0.`;
        reasonText = `An empty string compared with any string has an LCS of length 0.`;
        break;
      case 'compare':
        actionText = `Compare character '${char1}' (text1[${Number(i)-1}]) with '${char2}' (text2[${Number(j)-1}]).`;
        reasonText = `We must determine if the current characters match to decide the next state transition.`;
        break;
      case 'match':
        actionText = `Characters '${char1}' and '${char2}' match!`;
        reasonText = `Since they match, we extend the longest common subsequence by 1 and move diagonally to dp[${Number(i)-1}][${Number(j)-1}].`;
        break;
      case 'mismatch':
        actionText = `Characters '${char1}' and '${char2}' do NOT match.`;
        reasonText = `Since they do not match, we must choose the longer subsequence from neighboring states.`;
        break;
      case 'choose_top':
        actionText = `Choose value from top cell (dp[${Number(i)-1}][${j}]).`;
        reasonText = `Excluding '${char1}' yields a longer subsequence than excluding '${char2}'.`;
        break;
      case 'choose_left':
        actionText = `Choose value from left cell (dp[${i}][${Number(j)-1}]).`;
        reasonText = `Excluding '${char2}' yields a longer subsequence than excluding '${char1}'.`;
        break;
      case 'backtrack_match':
        actionText = `Characters match again ('${char1}'), so this character belongs to the final subsequence.`;
        reasonText = `We successfully traced back a match, meaning we move diagonally up-left.`;
        break;
      case 'backtrack_move_top':
        actionText = `Move TOP to dp[${Number(i)-1}][${j}] during backtracking.`;
        reasonText = `We move upward because it preserves the optimal subsequence length.`;
        break;
      case 'backtrack_move_left':
        actionText = `Move LEFT to dp[${i}][${Number(j)-1}] during backtracking.`;
        reasonText = `We move leftward because it preserves the optimal subsequence length.`;
        break;
      case 'cache_hit':
        actionText = `Retrieve state for indices [${i}][${j}] from cache.`;
        reasonText = `This subproblem was already solved in a previous recursive branch. We reuse it to save time.`;
        break;
      case 'recurse':
        actionText = `Evaluate LCS state [${i}][${j}].`;
        reasonText = `We must recursively explore the tree for this state to find the optimal choice.`;
        break;
      default:
        actionText = `Operation: ${operationType} at state [${i}][${j}].`;
        reasonText = `Progressing the LCS matrix.`;
    }
  } else {
    // Generic fallback for other algorithms
    actionText = `Executing ${operationType} operation.`;
    reasonText = `Advancing the dynamic programming state.`;
  }

  // 2. Determine DP Concept (Learning Concept Integration)
  if (conceptNoteType === 'cache_benefit' || operationType === 'cache_hit') {
    conceptTitle = 'Overlapping Subproblems';
    conceptText = `Notice that this state was requested again! Instead of traversing the entire recursion tree to recompute it, we simply retrieved it from memory. This transforms an exponential time algorithm into a linear one.`;
  } else if (conceptNoteType === 'base_case' || operationType === 'initialize') {
    conceptTitle = 'Base Case Initialization';
    conceptText = `Dynamic programming relies on trivial base cases. We know immediately what the answer is without any complex computation. We store this to build larger answers.`;
  } else if (operationType === 'compute' || operationType === 'match' || operationType === 'mismatch' || operationType === 'choose_top' || operationType === 'choose_left') {
    if (algorithm === 'knapsack') {
      conceptTitle = 'Decision Making (Optimal Substructure)';
      conceptText = `Each cell represents a subproblem. We branch our decision: either exclude the item or include it (adding its value to the optimal sub-solution for the remaining capacity). We take the max of both branches!`;
    } else if (algorithm === 'lcs') {
      conceptTitle = 'State Transition (Optimal Substructure)';
      if (operationType === 'match') {
        conceptText = `When characters match, the LCS length is 1 plus the LCS of the remaining prefixes. This is our optimal substructure.`;
      } else {
        conceptText = `When characters mismatch, the optimal solution is the maximum of ignoring the current character from text1 or ignoring the current character from text2.`;
      }
    } else {
      conceptTitle = 'State Transition (Optimal Substructure)';
      conceptText = `To solve for the current state, we don't need to recalculate from scratch. The optimal solution is built purely from the optimal solutions of its immediate subproblems.`;
    }
  } else if (operationType?.toString().startsWith('backtrack')) {
    conceptTitle = 'Reconstruction Path';
    conceptText = `The DP table stores the length of the optimal solution. To find the actual subsequence, we trace the path of choices backwards from the final cell.`;
  }

  // Hide generic non-learning steps if no clear action/reason was generated
  // But since we mapped them comprehensively above, we can just show the panel.
  
  return (
    <div style={{
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      {/* Current Action */}
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'var(--color-bg-secondary)',
        borderLeft: '4px solid var(--color-accent-primary)',
        borderRadius: '6px',
        color: 'var(--color-text-primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Current Action
        </h4>
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: '1.05rem', fontWeight: 500 }}>
          {actionText}
        </p>
      </div>

      {/* Why This Happens */}
      <div style={{
        padding: '1.25rem',
        backgroundColor: 'rgba(34, 197, 94, 0.05)',
        borderLeft: '4px solid var(--color-success)',
        borderRadius: '6px',
        color: 'var(--color-text-primary)'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Why
        </h4>
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: '1rem', color: 'var(--color-text-secondary)' }}>
          {reasonText}
        </p>
      </div>

      {/* DP Concept (Optional) */}
      {conceptTitle && conceptText && (
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'rgba(168, 85, 247, 0.05)',
          borderLeft: '4px solid #a855f7',
          borderRadius: '6px',
          color: 'var(--color-text-primary)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            <span>💡</span> Concept: {conceptTitle}
          </h4>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.95rem', color: 'var(--color-text-secondary)' }}>
            {conceptText}
          </p>
        </div>
      )}
    </div>
  );
};
