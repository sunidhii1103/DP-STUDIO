import React from 'react';
import type { Step } from '../../types/step.types';

interface LearningPanelProps {
  step: Step;
}

const safeText = (value: unknown, fallback = '-'): string => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  const text = String(value);
  return text === 'NaN' || text === 'undefined' ? fallback : text;
};

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
  } else if (algorithm === 'edit-distance') {
    const { char1, char2, i, j } = variables;
    
    switch (operationType) {
      case 'initialize':
        actionText = `Initialize base case for row ${i} or column ${j}.`;
        reasonText = `To transform an empty string to a string of length N requires N insertions/deletions.`;
        break;
      case 'compare':
        actionText = `Compare character '${char1}' with '${char2}'.`;
        reasonText = `We must determine if the characters match to see if a substitution operation is required.`;
        break;
      case 'edit_match':
        actionText = `Characters '${char1}' and '${char2}' match!`;
        reasonText = `No operation is needed. We inherit the cost from the diagonal state dp[${Number(i)-1}][${Number(j)-1}].`;
        break;
      case 'compute':
        actionText = `Evaluate minimum cost among Insert, Delete, and Replace.`;
        reasonText = `Since characters differ, we find the cheapest operation path that led to this state.`;
        break;
      case 'edit_replace':
        actionText = variables.transformedStr !== undefined ? `Apply transformation: Replace '${char1}' with '${char2}'.` : `We chose to REPLACE '${char1}' with '${char2}'.`;
        reasonText = variables.transformedStr !== undefined ? `Transforming the string forward.` : `Replacement was the optimal choice compared to inserting or deleting. Cost increases by 1 from the diagonal.`;
        break;
      case 'edit_delete':
        actionText = variables.transformedStr !== undefined ? `Apply transformation: Delete '${char1}'.` : `We chose to DELETE '${char1}' from the source string.`;
        reasonText = variables.transformedStr !== undefined ? `Transforming the string forward.` : `Deletion was the optimal choice. Cost increases by 1 from the top cell.`;
        break;
      case 'edit_insert':
        actionText = variables.transformedStr !== undefined ? `Apply transformation: Insert '${char2}'.` : `We chose to INSERT '${char2}' into the source string.`;
        reasonText = variables.transformedStr !== undefined ? `Transforming the string forward.` : `Insertion was the optimal choice. Cost increases by 1 from the left cell.`;
        break;
      case 'backtrack_edit_match':
        actionText = `Tracing path: Characters matched ('${char1}').`;
        reasonText = `We successfully traced back a free match, meaning we move diagonally up-left without adding an operation.`;
        break;
      case 'backtrack_edit_replace':
        actionText = `Tracing path: Replace '${char1}' with '${char2}'.`;
        reasonText = `This operation was chosen as part of the optimal edit path. We move diagonally.`;
        break;
      case 'backtrack_edit_delete':
        actionText = `Tracing path: Delete '${char1}'.`;
        reasonText = `We move upward along the optimal sequence of operations.`;
        break;
      case 'backtrack_edit_insert':
        actionText = `Tracing path: Insert '${char2}'.`;
        reasonText = `We move leftward along the optimal sequence of operations.`;
        break;
      case 'cache_hit':
        actionText = `Retrieve state for indices [${i}][${j}] from cache.`;
        reasonText = `This subproblem was already solved in a previous recursive branch. We reuse it to save time.`;
        break;
      case 'recurse':
        actionText = `Evaluate Edit Distance state [${i}][${j}].`;
        reasonText = `We must recursively explore the tree for this state to find the optimal choice.`;
        break;
      default:
        actionText = `Operation: ${operationType} at state [${i}][${j}].`;
        reasonText = `Progressing the Edit Distance matrix.`;
    }
  } else if (algorithm === 'lis') {
    const { i, j, current, candidate, previous, result, parentIndex, value } = variables;

    switch (operationType) {
      case 'initialize':
        actionText = `Initialize dp[${safeText(i)}] = 1 for value ${safeText(value)}.`;
        reasonText = `Every single element is an increasing subsequence of length 1, so this is the base state for each index.`;
        break;
      case 'read':
        if (step.metadata?.phase === 'reconstruction') {
          actionText = `Reconstruct LIS by visiting index ${safeText(i)} with value ${safeText(value)}.`;
          reasonText = parentIndex === -1
            ? `This index has no predecessor, so it starts the subsequence.`
            : `The parent array points to index ${safeText(parentIndex)}, which was the predecessor that produced this optimal length.`;
        } else {
          actionText = `Focus nums[${safeText(i)}] = ${safeText(value)}.`;
          reasonText = `dp[${safeText(i)}] must mean the best increasing subsequence ending exactly at this index, so we inspect earlier indices.`;
        }
        break;
      case 'compare':
        actionText = `Compare candidate nums[${safeText(j)}] = ${safeText(candidate)} with current nums[${safeText(i)}] = ${safeText(current)}.`;
        reasonText = Number(variables.canExtend) === 1
          ? `${safeText(current)} can extend a subsequence ending at ${safeText(candidate)} because it is larger and appears later.`
          : `${safeText(current)} cannot extend ${safeText(candidate)} because an increasing subsequence needs the next value to be larger.`;
        break;
      case 'compute':
        actionText = `Update dp[${safeText(i)}] from ${safeText(previous)} to ${safeText(result)}.`;
        reasonText = `We found a better predecessor at index ${safeText(parentIndex)}, so parent[${safeText(i)}] records how to reconstruct this chain later.`;
        break;
      case 'result':
        actionText = `Final LIS is [${safeText(variables.sequence)}] with length ${safeText(result)}.`;
        reasonText = `The length came from the dp array; the actual subsequence came from following parent pointers backward and reversing the path.`;
        break;
      default:
        actionText = `Operation: ${operationType} at LIS index ${safeText(i)}.`;
        reasonText = `Progressing the sequence DP state.`;
    }
  } else if (algorithm === 'mcm') {
    const { i, j, k, interval, leftInterval, rightInterval, formula, parenthesization } = variables;

    switch (operationType) {
      case 'initialize':
        actionText = `Set dp[${safeText(i)}][${safeText(j)}] = 0 for a single matrix.`;
        reasonText = `Multiplying one matrix needs no scalar multiplications, so the diagonal is the base case.`;
        break;
      case 'chain_length':
        actionText = `Begin filling the diagonal for chain length ${safeText(variables.chainLength)}.`;
        reasonText = `Interval DP solves shorter chains before longer chains so every subproblem dependency is already available.`;
        break;
      case 'select_interval':
        actionText = `Select interval ${safeText(interval, 'the current interval')}.`;
        reasonText = `This cell asks: what is the cheapest way to multiply this contiguous chain of matrices?`;
        break;
      case 'try_split':
        actionText = `Trying split at k = ${safeText(k)}.`;
        reasonText = `The final multiplication could happen after any matrix in the interval, so we test each partition.`;
        break;
      case 'calculate_cost':
        actionText = `Calculate candidate cost: ${safeText(formula, 'left + right + multiplication cost')}.`;
        reasonText = `Total cost = left subproblem + right subproblem + multiplication cost.`;
        break;
      case 'update_min':
        actionText = `Update the current best split to k = ${safeText(k)}.`;
        reasonText = `We keep the smallest candidate because the goal is minimum scalar multiplication cost.`;
        break;
      case 'final_decision':
        actionText = `Finalize ${safeText(interval, 'this interval')} with cost ${safeText(variables.best)}.`;
        reasonText = `After trying every split, this cell stores the minimum among all partitions.`;
        break;
      case 'backtrack_split':
        actionText = k === '' ? `Reached base matrix ${safeText(interval, 'A?')}.` : `Trace chosen split k = ${safeText(k)}.`;
        reasonText = k === ''
          ? `No further split is needed for a single matrix, so this reconstruction branch is complete.`
          : `The split table tells us to reconstruct ${safeText(leftInterval, 'the left interval')} and ${safeText(rightInterval, 'the right interval')} recursively.`;
        break;
      case 'result':
        actionText = `Optimal parenthesization: ${safeText(parenthesization, 'not available')}.`;
        reasonText = `The final cell stores the optimal cost, and the split table reconstructs the multiplication order.`;
        break;
      default:
        actionText = `Operation: ${operationType} at interval [${safeText(i)}][${safeText(j)}].`;
        reasonText = `Progressing the interval DP table.`;
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
  } else if (algorithm === 'mcm' && operationType === 'chain_length') {
    conceptTitle = 'Diagonal Interval Traversal';
    conceptText = `Intervals are solved diagonally because every longer chain depends on shorter chains that must already be available.`;
  } else if (algorithm === 'lis' && operationType === 'compare') {
    conceptTitle = 'Subsequence Order';
    conceptText = `A subsequence may skip elements, but it cannot reorder them. We only look left of i, and we only extend from smaller values.`;
  } else if (algorithm === 'lis' && operationType === 'compute') {
    conceptTitle = 'Predecessor Reuse';
    conceptText = `dp[i] stores the best LIS ending specifically at i. When nums[j] can precede nums[i], dp[j] + 1 becomes a reusable candidate, and parent[i] remembers the chosen j.`;
  } else if (algorithm === 'lis' && step.metadata?.phase === 'reconstruction') {
    conceptTitle = 'Reconstruction Path';
    conceptText = `The dp array gives the length. The parent array gives the actual subsequence by tracing chosen predecessors backward.`;
  } else if (operationType === 'compute' || operationType === 'match' || operationType === 'mismatch' || operationType === 'choose_top' || operationType === 'choose_left' || operationType === 'edit_match' || operationType === 'try_split' || operationType === 'calculate_cost' || operationType === 'update_min' || operationType === 'final_decision') {
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
    } else if (algorithm === 'edit-distance') {
      conceptTitle = 'State Transition (Optimal Substructure)';
      if (operationType === 'edit_match') {
        conceptText = `When characters match, the edit distance is identical to the prefixes without these characters.`;
      } else {
        conceptText = `When characters mismatch, the optimal solution is exactly 1 operation plus the minimum of Replacing (diagonal), Deleting (top), or Inserting (left).`;
      }
    } else if (algorithm === 'mcm') {
      conceptTitle = 'Interval DP (Optimal Substructure)';
      conceptText = `The best way to multiply an interval is built from the best way to multiply its left and right subintervals, plus the scalar cost of merging those two results.`;
    } else {
      conceptTitle = 'State Transition (Optimal Substructure)';
      conceptText = `To solve for the current state, we don't need to recalculate from scratch. The optimal solution is built purely from the optimal solutions of its immediate subproblems.`;
    }
  } else if (operationType?.toString().startsWith('backtrack')) {
    if (algorithm === 'mcm') {
      conceptTitle = 'Parenthesization Tree';
      conceptText = `The tree represents recursive grouping of matrix multiplications. Each chosen split partitions the chain into optimal left and right subchains.`;
    } else {
      conceptTitle = 'Reconstruction Path';
      conceptText = `The DP table stores the optimal cost. To find the actual sequence of decisions, we trace the path of choices backwards from the final cell.`;
    }
  } else if (['edit_replace', 'edit_delete', 'edit_insert'].includes(operationType?.toString() ?? '') && variables.transformedStr !== undefined) {
    conceptTitle = 'Sequence Transformation';
    conceptText = `We are now applying the reconstructed operations in forward chronological order to visually transform the source string into the target string.`;
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
