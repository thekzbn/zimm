import { LogicalDeduction, StagedHint } from './types';

/**
 * Builds staged hints (1: Nudge, 2: Technique, 3: Exact deduction)
 * from the next logical deduction available for the current board state.
 */
export function createStagedHint(
  deduction: LogicalDeduction,
  currentStage: 1 | 2 | 3 = 1
): StagedHint {
  const { row, col } = deduction.targetCell;
  const rowNum = row + 1;
  const colNum = col + 1;

  if (currentStage === 1) {
    // Stage 1: Nudge / Area of focus
    return {
      stage: 1,
      targetCell: deduction.targetCell,
      message: {
        en: `Focus your attention around Row ${rowNum}, Column ${colNum}. There is an immediate deduction waiting here.`,
        yo: `Pfojú sí agbègbè Ìlà ${rowNum}, Ọ̀wọ́ ${colNum}. Ìgbésẹ̀ kan wà tó ṣe kedere síbẹ̀.`,
      },
    };
  }

  if (currentStage === 2) {
    // Stage 2: Applicable technique
    const techniqueFriendlyName = {
      naked_single: { en: 'Naked Single', yo: 'Àkópọ̀ Nikanṣoṣo' },
      hidden_single: { en: 'Hidden Single', yo: 'Nọ́ḿbà Tó Farapamọ́' },
      pointing_pair: { en: 'Pointing Locked Pair', yo: 'Àbá Títọ́ka' },
      claiming_pair: { en: 'Claiming Locked Pair', yo: 'Àbá Tó Dè Agbègbè' },
      naked_pair: { en: 'Naked Pair', yo: 'Àbá Méjì Tó Dán' },
      hidden_pair: { en: 'Hidden Pair', yo: 'Àbá Méjì Tó Farapamọ́' },
    }[deduction.technique] || { en: 'Logical Deduction', yo: 'Ìgbésẹ̀ Ìṣirò' };

    return {
      stage: 2,
      targetCell: deduction.targetCell,
      techniqueName: techniqueFriendlyName.en,
      message: {
        en: `Try looking for a ${techniqueFriendlyName.en} at Row ${rowNum}, Column ${colNum}. Check candidates carefully.`,
        yo: `Wá ${techniqueFriendlyName.yo} lórí Ìlà ${rowNum}, Ọ̀wọ́ ${colNum}. Ṣàyẹ̀wò àwọn nọ́ḿbà tó ṣeé ṣe dáadáa.`,
      },
    };
  }

  // Stage 3: Exact deduction
  return {
    stage: 3,
    targetCell: deduction.targetCell,
    deducedValue: deduction.value,
    message: {
      en: `Place digit ${deduction.value} into Row ${rowNum}, Column ${colNum}. Reason: ${deduction.explanation.en}`,
      yo: `Fi nọ́ḿbà ${deduction.value} sí Ìlà ${rowNum}, Ọ̀wọ́ ${colNum}. Ìdí: ${deduction.explanation.yo}`,
    },
  };
}
