export const SECTORS = {
  AYURVEDA: 'ayurveda',
  YOGA_NATUROPATHY: 'yoga_naturopathy',
  UNANI: 'unani',
  SIDDHA: 'siddha',
  HOMEOPATHY: 'homeopathy'
};

export const SECTOR_KEYWORDS = {
  [SECTORS.AYURVEDA]: ['ayurveda', 'ayurvedic', 'herbal', 'phytotherapy'],
  [SECTORS.YOGA_NATUROPATHY]:  ['yoga','yogic','naturopathy','naturopathic','wellness therapy'],
  [SECTORS.UNANI]: ['unani', 'yunani'],
  [SECTORS.SIDDHA]: ['siddha','siddha medicine'],
  [SECTORS.HOMEOPATHY]: ['homeopathy','homoeopathy','homeopathic','homoeopathic']
};

export const INVESTMENT_KEYWORDS = [
  // pure funding
  'funding','raises','raised','seed','pre-seed','series','equity','angel','venture','investor','investment',
  // govt / grants / tenders
  'grant','grant-in-aid','scheme','financial assistance','subsidy','fellowship','rfa','rfp','eoi','tender',
  // programs
  'accelerator','incubator','cohort','demo day',
  // misc
  'call for proposals','seed fund','startup india seed fund','sisf','sisfs','credit linked','support program'
];
