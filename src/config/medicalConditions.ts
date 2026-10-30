/**
 * Single source of truth for the user-selectable medical conditions in the
 * profile's "Medical history" section. The `MEDICAL_CONDITION_IDS` as-const
 * array derives the `MedicalConditionId` union used by the profile type, the
 * store and the condition-notes rules — labels and ids can never drift apart.
 */

export const MEDICAL_CONDITION_GROUPS = [
  'metabolic-hormonal',
  'heart-blood',
  'lungs-breathing',
  'cancer',
  'bones-joints-muscles',
  'brain-nerves',
  'mind-sleep',
  'digestive-liver-kidney',
  'allergy-skin-immune',
  'eyes',
  'life-stage-recent-events',
] as const

export type MedicalConditionGroup = (typeof MEDICAL_CONDITION_GROUPS)[number]

/** All condition ids — the single source of the `MedicalConditionId` union. */
export const MEDICAL_CONDITION_IDS = [
  'type-1-diabetes',
  'type-2-diabetes',
  'prediabetes-insulin-resistance',
  'hypothyroidism',
  'hyperthyroidism',
  'pcos-pcod',
  'obesity',
  'high-cholesterol',
  'high-uric-acid-gout',
  'vitamin-d-deficiency',
  'vitamin-b12-deficiency',
  'metabolic-syndrome',
  'high-blood-pressure',
  'low-blood-pressure',
  'coronary-artery-disease',
  'previous-heart-attack',
  'heart-failure',
  'arrhythmia',
  'congenital-heart-condition',
  'previous-stroke',
  'blood-clot-dvt-history',
  'varicose-veins',
  'anaemia',
  'thalassemia-sickle-cell',
  'bleeding-clotting-disorder',
  'pacemaker-implanted-device',
  'asthma',
  'copd',
  'chronic-bronchitis',
  'tuberculosis',
  'sleep-apnoea',
  'allergic-rhinitis-sinusitis',
  'cancer-in-treatment',
  'cancer-in-remission',
  'breast-cancer',
  'prostate-cancer',
  'lung-cancer',
  'colorectal-cancer',
  'oral-cancer',
  'cervical-cancer',
  'blood-cancer',
  'thyroid-cancer',
  'skin-cancer',
  'other-cancer',
  'osteoarthritis',
  'rheumatoid-arthritis',
  'osteoporosis-osteopenia',
  'slipped-herniated-disc',
  'sciatica',
  'cervical-spondylosis',
  'lumbar-spondylosis',
  'scoliosis',
  'ankylosing-spondylitis',
  'fibromyalgia',
  'frozen-shoulder',
  'rotator-cuff-injury',
  'tennis-golfers-elbow',
  'carpal-tunnel-syndrome',
  'acl-ligament-injury',
  'meniscus-injury',
  'previous-fracture',
  'joint-replacement',
  'chronic-tendinitis',
  'joint-hypermobility',
  'plantar-fasciitis',
  'flat-feet',
  'migraine',
  'epilepsy',
  'vertigo-dizziness',
  'peripheral-neuropathy',
  'parkinsons-disease',
  'multiple-sclerosis',
  'previous-head-injury',
  'anxiety-disorder',
  'depression',
  'insomnia',
  'gerd-acidity',
  'ibs',
  'crohns-disease',
  'ulcerative-colitis',
  'celiac-disease',
  'lactose-intolerance',
  'peptic-ulcer',
  'fatty-liver',
  'hepatitis-b-or-c',
  'gallstones',
  'chronic-kidney-disease',
  'kidney-stones',
  'hernia',
  'food-allergy',
  'drug-allergy',
  'dust-pollen-allergy',
  'eczema',
  'psoriasis',
  'lupus',
  'other-autoimmune-condition',
  'glaucoma-retinal-condition',
  'pregnant',
  'postpartum',
  'recent-surgery',
  'currently-injured-rehab',
] as const

export type MedicalConditionId = (typeof MEDICAL_CONDITION_IDS)[number]

export interface MedicalCondition {
  id: MedicalConditionId
  label: string
  group: MedicalConditionGroup
}

export const MEDICAL_CONDITIONS = [
  // ------------------------------------------------- Metabolic & hormonal
  { id: 'type-1-diabetes', label: 'Type 1 diabetes', group: 'metabolic-hormonal' },
  { id: 'type-2-diabetes', label: 'Type 2 diabetes', group: 'metabolic-hormonal' },
  { id: 'prediabetes-insulin-resistance', label: 'Prediabetes / insulin resistance', group: 'metabolic-hormonal' },
  { id: 'hypothyroidism', label: 'Hypothyroidism', group: 'metabolic-hormonal' },
  { id: 'hyperthyroidism', label: 'Hyperthyroidism', group: 'metabolic-hormonal' },
  { id: 'pcos-pcod', label: 'PCOS / PCOD', group: 'metabolic-hormonal' },
  { id: 'obesity', label: 'Obesity', group: 'metabolic-hormonal' },
  { id: 'high-cholesterol', label: 'High cholesterol', group: 'metabolic-hormonal' },
  { id: 'high-uric-acid-gout', label: 'High uric acid / gout', group: 'metabolic-hormonal' },
  { id: 'vitamin-d-deficiency', label: 'Vitamin D deficiency', group: 'metabolic-hormonal' },
  { id: 'vitamin-b12-deficiency', label: 'Vitamin B12 deficiency', group: 'metabolic-hormonal' },
  { id: 'metabolic-syndrome', label: 'Metabolic syndrome', group: 'metabolic-hormonal' },
  // --------------------------------------------------------- Heart & blood
  { id: 'high-blood-pressure', label: 'High blood pressure (hypertension)', group: 'heart-blood' },
  { id: 'low-blood-pressure', label: 'Low blood pressure', group: 'heart-blood' },
  { id: 'coronary-artery-disease', label: 'Coronary artery disease', group: 'heart-blood' },
  { id: 'previous-heart-attack', label: 'Previous heart attack', group: 'heart-blood' },
  { id: 'heart-failure', label: 'Heart failure', group: 'heart-blood' },
  { id: 'arrhythmia', label: 'Irregular heartbeat (arrhythmia)', group: 'heart-blood' },
  { id: 'congenital-heart-condition', label: 'Congenital heart condition', group: 'heart-blood' },
  { id: 'previous-stroke', label: 'Previous stroke', group: 'heart-blood' },
  { id: 'blood-clot-dvt-history', label: 'Blood clot / DVT (history)', group: 'heart-blood' },
  { id: 'varicose-veins', label: 'Varicose veins', group: 'heart-blood' },
  { id: 'anaemia', label: 'Anaemia', group: 'heart-blood' },
  { id: 'thalassemia-sickle-cell', label: 'Thalassemia / sickle cell', group: 'heart-blood' },
  { id: 'bleeding-clotting-disorder', label: 'Bleeding or clotting disorder', group: 'heart-blood' },
  { id: 'pacemaker-implanted-device', label: 'Pacemaker or implanted device', group: 'heart-blood' },
  // ----------------------------------------------------- Lungs & breathing
  { id: 'asthma', label: 'Asthma', group: 'lungs-breathing' },
  { id: 'copd', label: 'COPD', group: 'lungs-breathing' },
  { id: 'chronic-bronchitis', label: 'Chronic bronchitis', group: 'lungs-breathing' },
  { id: 'tuberculosis', label: 'Tuberculosis (current or past)', group: 'lungs-breathing' },
  { id: 'sleep-apnoea', label: 'Sleep apnoea', group: 'lungs-breathing' },
  { id: 'allergic-rhinitis-sinusitis', label: 'Allergic rhinitis / sinusitis', group: 'lungs-breathing' },
  // ----------------------------------------------------------------- Cancer
  { id: 'cancer-in-treatment', label: 'Cancer: currently in treatment', group: 'cancer' },
  { id: 'cancer-in-remission', label: 'Cancer: in remission / past history', group: 'cancer' },
  { id: 'breast-cancer', label: 'Breast cancer', group: 'cancer' },
  { id: 'prostate-cancer', label: 'Prostate cancer', group: 'cancer' },
  { id: 'lung-cancer', label: 'Lung cancer', group: 'cancer' },
  { id: 'colorectal-cancer', label: 'Colorectal cancer', group: 'cancer' },
  { id: 'oral-cancer', label: 'Oral cancer', group: 'cancer' },
  { id: 'cervical-cancer', label: 'Cervical cancer', group: 'cancer' },
  { id: 'blood-cancer', label: 'Blood cancer (leukaemia / lymphoma)', group: 'cancer' },
  { id: 'thyroid-cancer', label: 'Thyroid cancer', group: 'cancer' },
  { id: 'skin-cancer', label: 'Skin cancer', group: 'cancer' },
  { id: 'other-cancer', label: 'Other cancer', group: 'cancer' },
  // --------------------------------------------- Bones, joints & muscles
  { id: 'osteoarthritis', label: 'Osteoarthritis', group: 'bones-joints-muscles' },
  { id: 'rheumatoid-arthritis', label: 'Rheumatoid arthritis', group: 'bones-joints-muscles' },
  { id: 'osteoporosis-osteopenia', label: 'Osteoporosis / osteopenia', group: 'bones-joints-muscles' },
  { id: 'slipped-herniated-disc', label: 'Slipped or herniated disc', group: 'bones-joints-muscles' },
  { id: 'sciatica', label: 'Sciatica', group: 'bones-joints-muscles' },
  { id: 'cervical-spondylosis', label: 'Cervical spondylosis', group: 'bones-joints-muscles' },
  { id: 'lumbar-spondylosis', label: 'Lumbar spondylosis', group: 'bones-joints-muscles' },
  { id: 'scoliosis', label: 'Scoliosis', group: 'bones-joints-muscles' },
  { id: 'ankylosing-spondylitis', label: 'Ankylosing spondylitis', group: 'bones-joints-muscles' },
  { id: 'fibromyalgia', label: 'Fibromyalgia', group: 'bones-joints-muscles' },
  { id: 'frozen-shoulder', label: 'Frozen shoulder', group: 'bones-joints-muscles' },
  { id: 'rotator-cuff-injury', label: 'Rotator cuff injury', group: 'bones-joints-muscles' },
  { id: 'tennis-golfers-elbow', label: 'Tennis / golfer’s elbow', group: 'bones-joints-muscles' },
  { id: 'carpal-tunnel-syndrome', label: 'Carpal tunnel syndrome', group: 'bones-joints-muscles' },
  { id: 'acl-ligament-injury', label: 'ACL or ligament injury', group: 'bones-joints-muscles' },
  { id: 'meniscus-injury', label: 'Meniscus injury', group: 'bones-joints-muscles' },
  { id: 'previous-fracture', label: 'Previous fracture', group: 'bones-joints-muscles' },
  { id: 'joint-replacement', label: 'Joint replacement', group: 'bones-joints-muscles' },
  { id: 'chronic-tendinitis', label: 'Chronic tendinitis', group: 'bones-joints-muscles' },
  { id: 'joint-hypermobility', label: 'Joint hypermobility', group: 'bones-joints-muscles' },
  { id: 'plantar-fasciitis', label: 'Plantar fasciitis', group: 'bones-joints-muscles' },
  { id: 'flat-feet', label: 'Flat feet', group: 'bones-joints-muscles' },
  // ------------------------------------------------------- Brain & nerves
  { id: 'migraine', label: 'Migraine', group: 'brain-nerves' },
  { id: 'epilepsy', label: 'Epilepsy', group: 'brain-nerves' },
  { id: 'vertigo-dizziness', label: 'Vertigo / dizziness', group: 'brain-nerves' },
  { id: 'peripheral-neuropathy', label: 'Peripheral neuropathy', group: 'brain-nerves' },
  { id: 'parkinsons-disease', label: 'Parkinson’s disease', group: 'brain-nerves' },
  { id: 'multiple-sclerosis', label: 'Multiple sclerosis', group: 'brain-nerves' },
  { id: 'previous-head-injury', label: 'Previous head injury / concussion', group: 'brain-nerves' },
  // --------------------------------------------------------- Mind & sleep
  { id: 'anxiety-disorder', label: 'Anxiety disorder', group: 'mind-sleep' },
  { id: 'depression', label: 'Depression', group: 'mind-sleep' },
  { id: 'insomnia', label: 'Insomnia', group: 'mind-sleep' },
  // --------------------------------------- Digestive, liver & kidney
  { id: 'gerd-acidity', label: 'GERD / acidity', group: 'digestive-liver-kidney' },
  { id: 'ibs', label: 'IBS', group: 'digestive-liver-kidney' },
  { id: 'crohns-disease', label: 'Crohn’s disease', group: 'digestive-liver-kidney' },
  { id: 'ulcerative-colitis', label: 'Ulcerative colitis', group: 'digestive-liver-kidney' },
  { id: 'celiac-disease', label: 'Celiac disease', group: 'digestive-liver-kidney' },
  { id: 'lactose-intolerance', label: 'Lactose intolerance', group: 'digestive-liver-kidney' },
  { id: 'peptic-ulcer', label: 'Peptic ulcer', group: 'digestive-liver-kidney' },
  { id: 'fatty-liver', label: 'Fatty liver', group: 'digestive-liver-kidney' },
  { id: 'hepatitis-b-or-c', label: 'Hepatitis B or C', group: 'digestive-liver-kidney' },
  { id: 'gallstones', label: 'Gallstones', group: 'digestive-liver-kidney' },
  { id: 'chronic-kidney-disease', label: 'Chronic kidney disease', group: 'digestive-liver-kidney' },
  { id: 'kidney-stones', label: 'Kidney stones', group: 'digestive-liver-kidney' },
  { id: 'hernia', label: 'Hernia', group: 'digestive-liver-kidney' },
  // ------------------------------------------ Allergy, skin & immune
  { id: 'food-allergy', label: 'Food allergy', group: 'allergy-skin-immune' },
  { id: 'drug-allergy', label: 'Drug allergy', group: 'allergy-skin-immune' },
  { id: 'dust-pollen-allergy', label: 'Dust / pollen allergy', group: 'allergy-skin-immune' },
  { id: 'eczema', label: 'Eczema', group: 'allergy-skin-immune' },
  { id: 'psoriasis', label: 'Psoriasis', group: 'allergy-skin-immune' },
  { id: 'lupus', label: 'Lupus', group: 'allergy-skin-immune' },
  { id: 'other-autoimmune-condition', label: 'Other autoimmune condition', group: 'allergy-skin-immune' },
  // ------------------------------------------------------------------ Eyes
  { id: 'glaucoma-retinal-condition', label: 'Glaucoma / retinal condition', group: 'eyes' },
  // --------------------------------------- Life stage & recent events
  { id: 'pregnant', label: 'Pregnant', group: 'life-stage-recent-events' },
  { id: 'postpartum', label: 'Postpartum (within 12 months)', group: 'life-stage-recent-events' },
  { id: 'recent-surgery', label: 'Recent surgery (within 6 months)', group: 'life-stage-recent-events' },
  { id: 'currently-injured-rehab', label: 'Currently injured / in rehab', group: 'life-stage-recent-events' },
] as const satisfies readonly MedicalCondition[]

/** Fast id -> condition lookup (labels, group). */
export const MEDICAL_CONDITION_BY_ID: Record<MedicalConditionId, MedicalCondition> = Object.fromEntries(
  MEDICAL_CONDITIONS.map((condition) => [condition.id, condition]),
) as Record<MedicalConditionId, MedicalCondition>

/** Runtime type guard for stored / imported condition ids. */
export function isMedicalConditionId(value: unknown): value is MedicalConditionId {
  return typeof value === 'string' && (MEDICAL_CONDITION_IDS as readonly string[]).includes(value)
}

export const MEDICAL_CONDITION_GROUP_LABELS: Record<MedicalConditionGroup, string> = {
  'metabolic-hormonal': 'Metabolic & hormonal',
  'heart-blood': 'Heart & blood',
  'lungs-breathing': 'Lungs & breathing',
  cancer: 'Cancer',
  'bones-joints-muscles': 'Bones, joints & muscles',
  'brain-nerves': 'Brain & nerves',
  'mind-sleep': 'Mind & sleep',
  'digestive-liver-kidney': 'Digestive, liver & kidney',
  'allergy-skin-immune': 'Allergy, skin & immune',
  eyes: 'Eyes',
  'life-stage-recent-events': 'Life stage & recent events',
}

/** All cancer-related ids (used by the condition-notes rules). */
export const CANCER_CONDITION_IDS: readonly MedicalConditionId[] = MEDICAL_CONDITIONS.filter(
  (condition) => condition.group === 'cancer',
).map((condition) => condition.id)

/** Profile-form constraints introduced with the medical-history section. */
export const PROFILE_NAME_MAX_LENGTH = 40
export const OTHER_CONDITION_LIMITS = {
  maxItems: 10,
  maxLength: 40,
} as const
