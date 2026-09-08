// src/utils/serviceIcons.ts

import { 
  faWrench, 
  faBolt, 
  faHardHat, 
  faLeaf, 
  faHome, 
  faDroplet,
  faLaptop,
  faPlug,
  faHammer,
  faPaintRoller,
  faTree,
  faWater,
  faTools,
  faLightbulb,
  faScrewdriverWrench,
  faHouseFloodWater,
  faComputer,
  faBroom
} from '@fortawesome/free-solid-svg-icons';

export const serviceIconMap: { [key: string]: any } = {
  'Plumbing Services': faWrench,
  'Electrical Services': faBolt,
  'Building & Construction': faHardHat,
  'Garden Services': faLeaf,
  'Renovation Services': faHome,
  'Irrigation Systems': faDroplet,
  'Computer Repair': faLaptop,
  'Electrical Engineering': faPlug,
  'Painting Services': faPaintRoller,
  'Carpentry': faHammer,
  'Landscaping': faTree,
  'Pool Services': faWater,
  'General Maintenance': faTools,
  'Lighting Installation': faLightbulb,
  'Handyman Services': faScrewdriverWrench,
  'Flood Repair': faHouseFloodWater,
  'IT Support': faComputer,
  'Cleaning Services': faBroom,
};

export const getServiceIcon = (title: string) => {
  return serviceIconMap[title] || faTools;
};
