// Central image exports for the entire application
// This allows you to import images from anywhere using named imports

// Frame images (numbered 1-14)
import Frame1 from '../assets/images/Frame 1.png';
import Frame2 from '../assets/images/Frame 2.png';
import Frame3 from '../assets/images/Frame 3.png';
import Frame4 from '../assets/images/Frame 4.png';
import Frame5 from '../assets/images/Frame 5.png';
import Frame6 from '../assets/images/Frame 6.png';
import Frame7 from '../assets/images/Frame 7.png';
import Frame8 from '../assets/images/Frame 8.png';
import Frame9 from '../assets/images/Frame 9 .png';
import Frame10 from '../assets/images/Frame 10.png';
import Frame11 from '../assets/images/Frame 11.png';
import Frame12 from '../assets/images/Frame 12.png';
import Frame13 from '../assets/images/Frame 13.png';
import Frame14 from '../assets/images/Frame 14.png';

// Named exports for individual images
export {
  Frame1,
  Frame2,
  Frame3,
  Frame4,
  Frame5,
  Frame6,
  Frame7,
  Frame8,
  Frame9,
  Frame10,
  Frame11,
  Frame12,
  Frame13,
  Frame14
};

// Grouped exports for easier access
export const FrameImages = {
  Frame1,
  Frame2,
  Frame3,
  Frame4,
  Frame5,
  Frame6,
  Frame7,
  Frame8,
  Frame9,
  Frame10,
  Frame11,
  Frame12,
  Frame13,
  Frame14
};

// Array of frame images for easy iteration (useful for carousels, galleries, etc.)
export const FrameImageArray = [
  Frame1,
  Frame2,
  Frame3,
  Frame4,
  Frame5,
  Frame6,
  Frame7,
  Frame8,
  Frame9,
  Frame10,
  Frame11,
  Frame12,
  Frame13,
  Frame14
];

// Helper function to get frame by number
export const getFrameByNumber = (number) => {
  if (number < 1 || number > 14) {
    console.warn(`Frame ${number} does not exist. Available frames: 1-14`);
    return null;
  }
  return FrameImageArray[number - 1];
};

// All images as a single object (for backward compatibility or bulk operations)
export const AllImages = {
  ...FrameImages
};

export default AllImages;