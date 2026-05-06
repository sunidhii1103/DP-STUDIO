/* ============================================================================
 * DPVis — Algorithm Module Types (Layer 1 Interface)
 * Re-exports the AlgorithmModule interface for use by algorithm implementations.
 * This file lives in src/algorithms/ to keep algorithm layer self-contained.
 * ============================================================================ */

export type {
  AlgorithmModule,
  AlgorithmInput,
  AlgorithmRegistry,
  ApproachModuleMap,
  ValidationResult,
  ComplexityMetadata,
  ExplanationTemplateMap,
  ExplanationTemplate,
  StepContext,
  FibonacciInput,
  KnapsackInput,
  LCSInput,
} from '../types/algorithm.types';
