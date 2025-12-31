/**
 * Candid Images for Coffee Chat Carousel
 * Located in: public/images/candid/
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DEVELOPER NOTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * HOW TO ADD A NEW CANDID IMAGE:
 * 1. Add the image file to: public/images/candid/
 * 2. Add the path to the candidImages array below
 *    Example: '/images/candid/NEW_IMAGE_NAME.jpg'
 * 3. The carousel will automatically include it in one of the two rows
 *    (images are split evenly between rows)
 * 
 * SUPPORTED FORMATS: .jpg, .jpeg, .png, .JPG, .PNG
 * RECOMMENDED SIZE: ~1200x800px or similar landscape ratio
 * 
 * NOTE: Images are duplicated in the carousel for seamless infinite loop.
 *       Row 1 scrolls left→right, Row 2 scrolls right→left.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const candidImages = [
  '/images/candid/_MG_4599.jpeg',
  '/images/candid/1D7A44E6-7074-4615-813A-9B123A17B9D6_1_201_a.jpeg',
  '/images/candid/24B2ABA2-FBC0-454D-89ED-32C7AD952358.jpg',
  '/images/candid/3F0218FC-6606-4121-87EB-60EA8EFC8094.jpg',
  '/images/candid/B758AF64-C98F-4617-B421-763729E3E8F4.jpg',
  '/images/candid/CE9D3FC7-AA62-4D7F-8724-2E79B5A120D7.jpg',
  '/images/candid/DN1A8295.JPG',
  '/images/candid/DN1A8432.JPG',
  '/images/candid/DSC02111.jpg',
  '/images/candid/DSC02616.JPG',
  '/images/candid/DSC02645.JPG',
  '/images/candid/IMG_0115.JPG',
  '/images/candid/IMG_1623.JPG',
  '/images/candid/IMG_1676.JPG',
  '/images/candid/IMG_1714.JPG',
  '/images/candid/IMG_1724.PNG',
  '/images/candid/IMG_1869.JPG',
  '/images/candid/IMG_1880.JPG',
  '/images/candid/IMG_2647.JPG',
  '/images/candid/IMG_2649.JPG',
  '/images/candid/IMG_2650.JPG',
  '/images/candid/IMG_3531.JPG',
  '/images/candid/IMG_3534.JPG',
  '/images/candid/IMG_4030.JPG',
  '/images/candid/IMG_5248.PNG',
  '/images/candid/IMG_5249.PNG',
  '/images/candid/P1020520.jpeg',
];

// Split images into two rows for the carousel
export const candidImagesRow1 = candidImages.slice(0, Math.ceil(candidImages.length / 2));
export const candidImagesRow2 = candidImages.slice(Math.ceil(candidImages.length / 2));

