import os

def fix_visualizer_page():
    path = r'src\pages\VisualizerPage.tsx'
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the start of renderExplanationContent
    start_line = -1
    for i, line in enumerate(lines):
        if 'const renderExplanationContent = (step: Step) => {' in line:
            start_line = i
            break
            
    if start_line == -1:
        print("Could not find renderExplanationContent")
        return

    # Find where the next function or component starts
    end_line = -1
    for i in range(start_line + 1, len(lines)):
        if 'const validationError = useMemo(() => {' in line or 'if (validationError) {' in lines[i]:
            end_line = i
            break
            
    if end_line == -1:
        # Try finding the useMemo for validationError
        for i in range(start_line + 1, len(lines)):
            if 'const validationError =' in lines[i]:
                end_line = i
                break

    if start_line != -1 and end_line != -1:
        new_content = """  const VarBadge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color }) => (
    <code style={{ 
      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
      padding: '2px 8px', 
      borderRadius: '6px', 
      color: color || 'var(--color-accent-secondary)',
      fontSize: '0.9em',
      fontWeight: 700,
      border: '1px solid rgba(255, 255, 255, 0.08)',
      margin: '0 2px'
    }}>
      {children}
    </code>
  );

  const renderExplanationContent = (step: Step) => {
    const { operationType, variables } = step.explanation!;
    
    if (step.algorithm === 'mcm') {
      if (operationType === 'initialize') {
        return <p className="explanation-text">{safeText(variables.desc, `dp[${safeText(variables.i)}][${safeText(variables.j)}] = 0`)}</p>;
      }
      if (operationType === 'chain_length') {
        return <p className="explanation-text">Starting diagonal traversal for chain length <VarBadge>{safeText(variables.chainLength)}</VarBadge>.</p>;
      }
      if (operationType === 'select_interval') {
        return <p className="explanation-text">Current interval: <VarBadge>{safeText(variables.interval, 'selected interval')}</VarBadge>. We will try every split inside it.</p>;
      }
      if (operationType === 'try_split') {
        return (
          <div className="explanation-stack">
            <p className="explanation-text">Trying split at <VarBadge>k = {safeText(variables.k)}</VarBadge>: <VarBadge>{safeText(variables.leftInterval, 'left interval')}</VarBadge> + <VarBadge>{safeText(variables.rightInterval, 'right interval')}</VarBadge>.</p>
            <MCMCostPanel variables={variables} />
          </div>
        );
      }
      if (operationType === 'calculate_cost') {
        return (
          <div className="explanation-stack">
            <p className="explanation-text">Total cost = left subproblem + right subproblem + multiplication cost</p>
            <MCMCostPanel variables={variables} />
          </div>
        );
      }
      if (operationType === 'update_min') {
        return <p className="explanation-text success">New minimum found: <VarBadge color="var(--color-success)">{safeText(variables.best)}</VarBadge> using split <VarBadge>k = {safeText(variables.k)}</VarBadge>.</p>;
      }
      if (operationType === 'final_decision') {
        return <p className="explanation-text">Choosing minimum among all partitions for <VarBadge>{safeText(variables.interval, 'this interval')}</VarBadge>: <VarBadge color="var(--color-success)">{safeText(variables.best)}</VarBadge>.</p>;
      }
      if (operationType === 'backtrack_split') {
        return (
          <p className="explanation-text info">
            <strong>Reconstruction:</strong> {safeText(variables.desc, 'Following the stored split for this interval.')}
            <br />
            <span className="explanation-subtext">Parenthesization: <VarBadge>{safeText(variables.parenthesization, 'not available')}</VarBadge></span>
          </p>
        );
      }
      if (operationType === 'result') {
        return (
          <p className="explanation-text result">
            Minimum scalar multiplication cost: <VarBadge color="var(--color-success)">{safeText(variables.result)}</VarBadge>
            <br />
            <span className="explanation-subtext">Optimal parenthesization: <VarBadge>{safeText(variables.parenthesization, 'not available')}</VarBadge></span>
          </p>
        );
      }
      return null;
    }

    if (step.algorithm === 'lis') {
      if (operationType === 'initialize') {
        return <p className="explanation-text">Initialize <VarBadge>dp[{safeText(variables.i)}] = 1</VarBadge>. A single value, <VarBadge>{safeText(variables.value)}</VarBadge>, is already an increasing subsequence of length 1.</p>;
      }
      if (operationType === 'read') {
        if (step.metadata?.phase === 'reconstruction') {
          return (
            <p className="explanation-text info">
              <strong>Backtracking Phase:</strong> {safeText(variables.desc, 'Follow predecessor pointers.')}
              <br />
              <span className="explanation-subtext">Subsequence so far: <VarBadge>[{safeText(variables.partialSequence, '')}]</VarBadge></span>
            </p>
          );
        }
        return <p className="explanation-text">Focus index <VarBadge>{safeText(variables.i)}</VarBadge> with value <VarBadge>{safeText(variables.value)}</VarBadge>. We scan earlier values as possible predecessors.</p>;
      }
      if (operationType === 'compare') {
        const canExtend = Number(variables.canExtend) === 1;
        return <p className={`explanation-text ${canExtend ? 'success' : 'warning'}`}>{safeText(variables.desc)}<br /><span className="explanation-subtext">Candidate transition: <VarBadge>dp[{safeText(variables.j)}] + 1 = {Number(variables.candidateDp) + 1}</VarBadge></span></p>;
      }
      if (operationType === 'compute') {
        return <p className="explanation-text success">Updating <VarBadge>dp[{safeText(variables.i)}]</VarBadge> from <VarBadge>{safeText(variables.previous)}</VarBadge> to <VarBadge color="var(--color-success)">{safeText(variables.result)}</VarBadge> and setting <VarBadge>parent[{safeText(variables.i)}] = {safeText(variables.parentIndex)}</VarBadge>.</p>;
      }
      if (operationType === 'result') {
        return <p className="explanation-text result">Final LIS length: <VarBadge color="var(--color-success)">{safeText(variables.result)}</VarBadge><br /><span className="explanation-subtext">Actual subsequence: <VarBadge>[{safeText(variables.sequence)}]</VarBadge></span></p>;
      }
      return null;
    }
    
    if (step.algorithm === 'knapsack') {
      if (operationType === 'initialize') {
        return <p className="explanation-text">{variables.desc || `Base case: index ${variables.i}, capacity ${variables.w}`}</p>;
      }
      if (operationType === 'compute') {
        return (
          <div className="explanation-stack">
            <p className="explanation-text">We compare excluding item <VarBadge>{variables.label}</VarBadge> vs including it:</p>
            <ul className="explanation-list">
              <li><strong>Exclude:</strong> dp[i-1][w] = <VarBadge>{variables.valExclude}</VarBadge></li>
              {variables.isIncluded ? (
                <li><strong>Include:</strong> value + dp[i-1][w-weight] = {variables.value} + {Number(variables.valInclude) - Number(variables.value)} = <VarBadge>{variables.valInclude}</VarBadge></li>
              ) : (
                <li><strong>Include:</strong> <em className="error-text">Not possible (weight &gt; capacity)</em></li>
              )}
            </ul>
            <p className="explanation-text">Result: Choose max value = <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>
          </div>
        );
      }
      if (operationType === 'cache_hit') {
        return <p className="explanation-text info">Cache Hit: <VarBadge color="var(--color-accent-secondary)">memo[{variables.i}][{variables.w}] = {variables.cachedValue}</VarBadge></p>;
      }
      if (operationType === 'recurse') {
        return <p className="explanation-text warning">Recurse: <VarBadge color="var(--color-warning)">knapsack({variables.i}, {variables.w})</VarBadge></p>;
      }
      if (operationType === 'result') {
        return <p className="explanation-text result">Algorithm complete! Max value is: <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>;
      }
      return null;
    }

    if (step.algorithm === 'lcs') {
      if (operationType === 'initialize') {
        return <p className="explanation-text">Initialize Base Case: <VarBadge>dp[{variables.i}][{variables.j}] = 0</VarBadge></p>;
      }
      if (operationType === 'compare') {
        return (
          <div className="explanation-stack">
            <p className="explanation-text">Compare characters: <VarBadge>'{variables.char1}' == '{variables.char2}'</VarBadge></p>
            {variables.partialLCS !== undefined && (
               <p className="explanation-text success">Current LCS: <VarBadge color="var(--color-success)">{variables.partialLCS || '""'}</VarBadge></p>
            )}
          </div>
        );
      }
      if (operationType === 'match') {
        return <p className="explanation-text success">Characters Match! <br/><span className="explanation-subtext">Extend LCS by 1.</span></p>;
      }
      if (operationType === 'mismatch' || operationType === 'choose_top' || operationType === 'choose_left') {
        return <p className="explanation-text warning">Mismatch.<br/><span className="explanation-subtext">Evaluating max of top ({variables.valTop}) and left ({variables.valLeft}).</span></p>;
      }
      if (operationType?.startsWith('backtrack')) {
        let text = "";
        if (operationType === 'backtrack_match') {
          text = `Characters match ('${variables.char1}'), so we include it and move diagonally ↖`;
        } else if (operationType === 'backtrack_move_top') {
          text = `Mismatch. We follow the larger neighboring state to preserve optimal subsequence length. Moving top ↑ (${variables.valTop} >= ${variables.valLeft})`;
        } else if (operationType === 'backtrack_move_left') {
          text = `Mismatch. We follow the larger neighboring state to preserve optimal subsequence length. Moving left ← (${variables.valTop} < ${variables.valLeft})`;
        }
        
        return (
          <div className="explanation-stack">
             <p className="explanation-text info"><strong>Backtracking Phase:</strong> {text}</p>
             {variables.partialLCS !== undefined && (
               <p className="explanation-text success">Current LCS: <VarBadge color="var(--color-success)">{variables.partialLCS || '""'}</VarBadge></p>
             )}
          </div>
        );
      }
      if (operationType === 'result') {
        return (
          <div className="explanation-stack">
            <p className="explanation-text result">Algorithm complete! LCS Length is: <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>
            {variables.partialLCS !== undefined && (
               <p className="explanation-text result-emphasis">Final LCS String: <VarBadge color="var(--color-success)">{variables.partialLCS || '""'}</VarBadge></p>
            )}
          </div>
        );
      }
      if (operationType === 'cache_hit') {
        return <p className="explanation-text info">Cache Hit: <VarBadge color="var(--color-accent-secondary)">memo[{variables.i}][{variables.j}] = {variables.cachedValue}</VarBadge></p>;
      }
      if (operationType === 'recurse') {
        return <p className="explanation-text warning">Recurse: <VarBadge color="var(--color-warning)">lcs({variables.i}, {variables.j})</VarBadge></p>;
      }
      return null;
    }

    if (step.algorithm === 'edit-distance') {
      if (operationType === 'initialize') {
        return <p className="explanation-text">Initialize Base Case: <VarBadge>dp[{variables.i}][{variables.j}] = {variables.val}</VarBadge></p>;
      }
      if (operationType === 'compare') {
        return <p className="explanation-text">Compare characters: <VarBadge>'{variables.char1}' == '{variables.char2}'</VarBadge></p>;
      }
      if (operationType === 'edit_match') {
        return <p className="explanation-text success">Characters Match! <br/><span className="explanation-subtext">No operation needed. Inherit cost: <VarBadge>{variables.valDiag}</VarBadge></span></p>;
      }
      if (operationType === 'compute') {
        return <p className="explanation-text warning">Mismatch.<br/><span className="explanation-subtext">Evaluating min of REPLACE ({variables.vReplace}), DELETE ({variables.vDelete}), INSERT ({variables.vInsert}).</span></p>;
      }
      if (operationType === 'edit_replace' || operationType === 'edit_delete' || operationType === 'edit_insert') {
        const opName = operationType.split('_')[1]?.toUpperCase();
        return (
          <div className="explanation-stack">
            <p className="explanation-text success">Applying <VarBadge color="var(--color-success)">{opName}</VarBadge> operation. New total cost: <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>
            {variables.transformedStr !== undefined && (
               <p className="explanation-text info">Transformed: <VarBadge color="white">{variables.transformedStr}</VarBadge></p>
            )}
          </div>
        );
      }
      if (operationType === 'result') {
        return <p className="explanation-text result">Edit distance complete! Minimum operations: <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>;
      }
      return null;
    }

    if (step.algorithm === 'fibonacci') {
      const idx = variables.i ?? variables.k;
      if (operationType === 'initialize') {
        return <p className="explanation-text">Initialize base case: <VarBadge>dp[{idx}] = {variables.value}</VarBadge></p>;
      }
      if (operationType === 'compute') {
        return <p className="explanation-text success">Compute current state: <VarBadge color="var(--color-success)">dp[{idx}] = {variables.result}</VarBadge></p>;
      }
      if (operationType === 'cache_hit') {
        return <p className="explanation-text info">Cache Hit: <VarBadge color="var(--color-accent-secondary)">memo[{variables.k}] = {variables.cachedValue}</VarBadge></p>;
      }
      if (operationType === 'recurse') {
        return <p className="explanation-text warning">Recurse: <VarBadge color="var(--color-warning)">fib({variables.k})</VarBadge></p>;
      }
      if (operationType === 'result') {
        return <p className="explanation-text result">Fibonacci complete! Result: <VarBadge color="var(--color-success)">{variables.result}</VarBadge></p>;
      }
    }
    
    return null;
  };

"""
        lines[start_line:end_line] = [new_content + '\n']
        
        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Successfully updated VisualizerPage.tsx")
    else:
        print(f"Could not find markers: {start_line}, {end_line}")

if __name__ == '__main__':
    fix_visualizer_page()
